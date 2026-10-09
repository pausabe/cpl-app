package expo.modules.cplwidgets

import android.app.AlarmManager
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.BroadcastReceiver
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.util.SizeF
import android.widget.RemoteViews
import java.util.Calendar

// The widgets of the home screen: «L’hora d’ara», «Avui», «Les hores» and «La Paraula d’avui».
// They draw what the app left (WidgetStore) at the hour of the clock (WidgetMoment), and change by
// themselves at every change of hour with one alarm, the next one, which every update sets again.
// It is not an exact alarm, which would need a permission: it comes in the ten minutes after the
// hour, or when the phone wakes up if it was asleep. After a restart the system updates every
// widget, and that sets the alarm again; updatePeriodMillis, every half hour, is only a safety net.

internal enum class WidgetKind(val key: String, val provider: Class<out CplWidgetProvider>, val fallback: SizeF) {
  ARA("ara", AraWidget::class.java, SizeF(160f, 170f)),
  AVUI("avui", AvuiWidget::class.java, SizeF(340f, 170f)),
  HORES("hores", HoresWidget::class.java, SizeF(340f, 400f)),
  PARAULA("paraula", ParaulaWidget::class.java, SizeF(340f, 170f));

  companion object {
    fun of(key: String): WidgetKind? = entries.firstOrNull { it.key == key }
  }
}

abstract class CplWidgetProvider : AppWidgetProvider() {
  internal abstract val kind: WidgetKind

  override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
    Widgets.update(context, appWidgetManager, kind, appWidgetIds, WidgetStore.load(context))
    Widgets.schedule(context)
  }

  // Resized, or the phone turned: other sizes
  override fun onAppWidgetOptionsChanged(
    context: Context,
    appWidgetManager: AppWidgetManager,
    appWidgetId: Int,
    newOptions: Bundle
  ) {
    Widgets.update(context, appWidgetManager, kind, intArrayOf(appWidgetId), WidgetStore.load(context))
  }

  // The last one of its kind removed: if it was the last widget of all, no more alarms
  override fun onDisabled(context: Context) {
    Widgets.schedule(context)
  }
}

class AraWidget : CplWidgetProvider() {
  override val kind = WidgetKind.ARA
}

class AvuiWidget : CplWidgetProvider() {
  override val kind = WidgetKind.AVUI
}

class HoresWidget : CplWidgetProvider() {
  override val kind = WidgetKind.HORES
}

class ParaulaWidget : CplWidgetProvider() {
  override val kind = WidgetKind.PARAULA
}

// The alarm of the change of hour, and the clock or the time zone changed: every widget again
class WidgetClock : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    when (intent.action) {
      Widgets.CHANGE_OF_HOUR, Intent.ACTION_TIME_CHANGED, Intent.ACTION_TIMEZONE_CHANGED -> Widgets.updateAll(context)
    }
  }
}

internal object Widgets {
  private const val TAG = "CplWidgets"
  const val CHANGE_OF_HOUR = "expo.modules.cplwidgets.CHANGE_OF_HOUR"
  // The shortest window Android 12 gives an alarm that is not exact
  private const val WINDOW = 10 * 60 * 1000L

  fun updateAll(context: Context) {
    val manager = AppWidgetManager.getInstance(context)
    val payload = WidgetStore.load(context)
    for (kind in WidgetKind.entries) update(context, manager, kind, ids(context, manager, kind), payload)
    schedule(context, payload)
  }

  fun update(context: Context, manager: AppWidgetManager, kind: WidgetKind, ids: IntArray, payload: Payload?) {
    if (ids.isEmpty()) return
    val now = Calendar.getInstance()
    for (id in ids) {
      val sizes = sizes(manager, id, kind)
      val views = try {
        views(context, WidgetMoment.at(context, payload, now), kind, sizes)
      } catch (e: RuntimeException) {
        // Something the app wrote that this version reads wrong: the hour and the date still show
        Log.w(TAG, "${kind.key}: drawn without the words of the app", e)
        views(context, WidgetMoment.at(context, null, now), kind, sizes)
      }
      manager.updateAppWidget(id, views)
    }
  }

  fun schedule(context: Context, payload: Payload? = WidgetStore.load(context)) {
    val alarms = context.getSystemService(AlarmManager::class.java) ?: return
    val manager = AppWidgetManager.getInstance(context)
    val change = changeOfHour(context)
    if (WidgetKind.entries.all { ids(context, manager, it).isEmpty() }) {
      alarms.cancel(change)
      return
    }
    // The same PendingIntent every time: the new alarm replaces the one there was
    alarms.setWindow(AlarmManager.RTC, WidgetMoment.nextChange(payload, Calendar.getInstance()), WINDOW, change)
  }

  private fun ids(context: Context, manager: AppWidgetManager, kind: WidgetKind): IntArray =
    manager.getAppWidgetIds(ComponentName(context, kind.provider))

  private fun changeOfHour(context: Context): PendingIntent {
    val intent = Intent(context, WidgetClock::class.java).setAction(CHANGE_OF_HOUR)
    return PendingIntent.getBroadcast(context, 0, intent, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
  }

  // From Android 12, one layout for each size the launcher gives the widget (upright and on its
  // side), and it shows the one that fits; before, the upright one
  private fun views(context: Context, moment: WidgetMoment, kind: WidgetKind, sizes: List<SizeF>): RemoteViews {
    val builder = WidgetViews(context, moment)
    if (sizes.size == 1 || Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return builder.build(kind, sizes.first())
    return RemoteViews(sizes.associateWith { builder.build(kind, it) })
  }

  // The sizes of a widget in dp: from Android 12, all of them; before, the width upright, which is
  // the smallest, and the height upright, the largest
  private fun sizes(manager: AppWidgetManager, id: Int, kind: WidgetKind): List<SizeF> {
    val options = manager.getAppWidgetOptions(id)
    val sizes = sizesOf(options)
    if (!sizes.isNullOrEmpty()) return sizes.distinct()
    val width = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH)
    val height = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT)
    return listOf(if (width > 0 && height > 0) SizeF(width.toFloat(), height.toFloat()) else kind.fallback)
  }

  private fun sizesOf(options: Bundle): List<SizeF>? = when {
    Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU ->
      options.getParcelableArrayList(AppWidgetManager.OPTION_APPWIDGET_SIZES, SizeF::class.java)
    Build.VERSION.SDK_INT >= Build.VERSION_CODES.S ->
      @Suppress("DEPRECATION")
      options.getParcelableArrayList<SizeF>(AppWidgetManager.OPTION_APPWIDGET_SIZES)
    else -> null
  }
}
