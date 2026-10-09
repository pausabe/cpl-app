package expo.modules.cplwidgets

import android.content.Context
import java.util.Calendar
import java.util.Locale

// What a widget shows at a moment: the hour of its band (bandAt in widgets.ts) and the day of that
// hour, which from midnight to 2 h is still the day before, the day of those Completes. Without the
// words of that day (the app not opened for two weeks, or never), the date alone.
internal class WidgetMoment(
  val band: Band,
  // The day of the hour, YYYY-MM-DD: where the touches open
  val dayDate: String,
  val day: Day,
  private val names: Map<String, String>,
  private val context: Context
) {
  val hour: String get() = band.hour

  fun name(hour: String): String = names[hour] ?: context.getString(defaultName(hour))

  companion object {
    fun at(context: Context, payload: Payload?, now: Calendar): WidgetMoment {
      val bands = payload?.bands ?: WidgetStore.BANDS
      val clock = now.get(Calendar.HOUR_OF_DAY)
      val band = bands.firstOrNull { clock >= it.from && clock < it.to } ?: bands.first()
      val date = now.clone() as Calendar
      if (band.yesterday) date.add(Calendar.DAY_OF_MONTH, -1)
      val dayDate = isoDate(date)
      val dates = CatalanDates(context)
      val written = payload?.days?.firstOrNull { it.date == dayDate }
      val day = written?.copy(
        dateText = written.dateText.ifEmpty { dates.long(date) },
        shortDate = written.shortDate.ifEmpty { dates.short(date) }
      ) ?: Day(dayDate, dates.long(date), dates.short(date), null, null, "V", null, null, null)
      return WidgetMoment(band, dayDate, day, payload?.hourNames ?: emptyMap(), context)
    }

    // When the widgets have to change by themselves: the start of the next band, in local time.
    // On the day the clocks go forward, 2 h does not exist and Calendar gives 3 h, which is right.
    fun nextChange(payload: Payload?, now: Calendar): Long {
      val starts = (payload?.bands ?: WidgetStore.BANDS).map { it.from }.toSortedSet()
      for (days in 0..1) {
        for (hour in starts) {
          val change = (now.clone() as Calendar).apply {
            add(Calendar.DAY_OF_MONTH, days)
            set(Calendar.HOUR_OF_DAY, hour)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
          }
          if (change.timeInMillis > now.timeInMillis) return change.timeInMillis
        }
      }
      return now.timeInMillis + 60 * 60 * 1000L
    }

    fun isoDate(date: Calendar): String = String.format(
      Locale.ROOT,
      "%04d-%02d-%02d",
      date.get(Calendar.YEAR),
      date.get(Calendar.MONTH) + 1,
      date.get(Calendar.DAY_OF_MONTH)
    )

    private fun defaultName(hour: String): Int = when (hour) {
      "ofici" -> R.string.cw_hour_ofici
      "laudes" -> R.string.cw_hour_laudes
      "tercia" -> R.string.cw_hour_tercia
      "sexta" -> R.string.cw_hour_sexta
      "nona" -> R.string.cw_hour_nona
      "vespres" -> R.string.cw_hour_vespres
      else -> R.string.cw_hour_completes
    }
  }
}

// The dates the app writes (dateText of the day card and shortDate in widgets.ts), for the days it
// has not written: «Divendres, 9 d’octubre» and «Divendres 9 oct.»
internal class CatalanDates(context: Context) {
  private val weekdays = context.resources.getStringArray(R.array.cw_weekdays)
  private val months = context.resources.getStringArray(R.array.cw_months)
  private val shortMonths = context.resources.getStringArray(R.array.cw_short_months)

  fun long(date: Calendar): String {
    val month = months[date.get(Calendar.MONTH)]
    // «d’octubre», «d’abril», «d’agost», but «de gener»
    val of = if (month.first() in "aeiou") "d’" else "de "
    return "${weekday(date)}, ${date.get(Calendar.DAY_OF_MONTH)} $of$month"
  }

  fun short(date: Calendar): String =
    "${weekday(date)} ${date.get(Calendar.DAY_OF_MONTH)} ${shortMonths[date.get(Calendar.MONTH)]}"

  private fun weekday(date: Calendar) = weekdays[date.get(Calendar.DAY_OF_WEEK) - Calendar.SUNDAY]
}
