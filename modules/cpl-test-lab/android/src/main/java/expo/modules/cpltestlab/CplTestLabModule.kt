package expo.modules.cpltestlab

import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// Whether the app runs on a phone of Google's test lab, where Google Play tries every version it is
// given (the pre-launch report): a robot that touches everything and writes anything in the boxes.
// Google marks those phones with a setting of the system, which says "true" only there. The app's
// JavaScript asks it in src/services/googlePlayRobot.ts.
class CplTestLabModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("CplTestLab")

    Function("isTestLab") {
      val resolver = appContext.reactContext?.contentResolver
      resolver != null && Settings.System.getString(resolver, "firebase.test.lab") == "true"
    }
  }
}
