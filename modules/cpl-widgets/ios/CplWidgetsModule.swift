import ExpoModulesCore
import WidgetKit

// What the app's JavaScript says to the widgets (controllers/widgetController): here are the
// words of the days to come. The widgets (targets/widgets) read them from the group of apps they
// share with the app, «group.<app identifier>», which plugins/withWidgets gives to both.
public class CplWidgetsModule: Module {
  // The key the widgets read (PayloadStore in targets/widgets/Payload.swift)
  private static let payloadKey = "payload"

  public func definition() -> ModuleDefinition {
    Name("CplWidgets")

    // The JSON of view-models/widgets.ts as it is, and every widget redrawn with it now. With an
    // identifier whose group the profile does not have (the «CPL 9» of make ios-device), iOS keeps
    // it in the app alone and the widgets go on with the hour and the date.
    Function("setPayload") { (json: String) in
      guard let identifier = Bundle.main.bundleIdentifier,
        let defaults = UserDefaults(suiteName: "group." + identifier)
      else { return }
      defaults.set(json, forKey: Self.payloadKey)
      WidgetCenter.shared.reloadAllTimelines()
    }

    // An iPhone app cannot put a widget on the home screen: it can only explain how
    Function("canPin") { () -> Bool in
      false
    }

    AsyncFunction("pin") { (kind: String) -> Bool in
      false
    }
  }
}
