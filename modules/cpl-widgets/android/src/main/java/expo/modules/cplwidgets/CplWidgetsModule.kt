package expo.modules.cplwidgets

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// What the app's JavaScript says to the widgets of the home screen (controllers/widgetController):
// the words of the days to come, and «put this widget on the home screen».
class CplWidgetsModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw IllegalStateException("no React context")

  override fun definition() = ModuleDefinition {
    Name("CplWidgets")

    // The WidgetPayload of src/view-models/widgets.ts, as JSON. Every widget redraws with it now.
    Function("setPayload") { json: String ->
      WidgetStore.save(context, json)
      Widgets.updateAll(context)
    }

    // Whether the launcher can place a widget when the app asks it to (from Android 8, and only
    // the launchers that support it)
    Function("canPin") {
      Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && AppWidgetManager.getInstance(context).isRequestPinAppWidgetSupported
    }

    // ara, avui, hores or paraula. The launcher asks the person where to put it: true when the
    // request has reached the launcher, not when the widget is on the home screen.
    AsyncFunction("pin") { kind: String ->
      val widget = WidgetKind.of(kind)
      if (widget == null || Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return@AsyncFunction false
      val manager = AppWidgetManager.getInstance(context)
      manager.isRequestPinAppWidgetSupported &&
        manager.requestPinAppWidget(ComponentName(context, widget.provider), null, null)
    }
  }
}
