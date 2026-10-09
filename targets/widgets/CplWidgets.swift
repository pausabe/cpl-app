import SwiftUI
import WidgetKit

// The widgets of the CPL, in the order of the gallery. The four kinds are the ones of
// modules/cpl-widgets on Android: ara, avui, hores and paraula.
@main
struct CplWidgets: WidgetBundle {
  var body: some Widget {
    AraWidget()
    AvuiWidget()
    HoresWidget()
    ParaulaWidget()
  }
}
