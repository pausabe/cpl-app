import SwiftUI
import WidgetKit

// 2. «Avui»: the card of the day with its colour on the left, which opens the home, and the hour
// of now on the right, which opens its prayer.
struct AvuiWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "avui", provider: HourProvider()) { entry in
      AvuiView(entry: entry)
    }
    .configurationDisplayName("Avui")
    .description("El dia i l’hora d’ara.")
    .supportedFamilies([.systemMedium])
    .contentMarginsDisabled()
  }
}

struct AvuiView: View {
  let entry: HourEntry

  var body: some View {
    HStack(spacing: 10) {
      Link(destination: WidgetLink.today) {
        DayBlock(day: entry.day)
          .padding(.top, 4)
          .frame(maxHeight: .infinity, alignment: .top)
      }
      .accessibilityLabel(Spoken.day(entry.day))
      Link(destination: WidgetLink.hour(entry.hour, day: entry.day.date)) {
        NowTile(entry: entry)
      }
      .frame(width: 146)
      .accessibilityLabel(Spoken.hour(entry, entry.hour))
    }
    .padding(EdgeInsets(top: 12, leading: 16, bottom: 12, trailing: 12))
    .containerBackground(Palette.liturgicalColor(entry.day.color).tint, for: .widget)
    .widgetURL(WidgetLink.today)
  }
}

// The «Ara» tile of the home: teal, the icon and «ARA» at the top, the name of the hour at the
// bottom and, at Vespres, the title of the first Vespers under it
private struct NowTile: View {
  let entry: HourEntry
  @Environment(\.widgetRenderingMode) private var renderingMode

  private var nameSize: CGFloat {
    switch entry.hour {
    case .ofici: return 19
    case .completes: return 21
    default: return 23
    }
  }

  var body: some View {
    let hour = entry.hour
    VStack(alignment: .leading, spacing: 0) {
      HStack(alignment: .top) {
        HourIcon(hour: hour, size: 28)
          .widgetAccentable()
        Spacer(minLength: 4)
        if entry.band.now {
          NowLabel()
        }
      }
      Spacer(minLength: 4)
      Text(entry.name(hour))
        .font(Typeface.serif(nameSize))
        .textLineHeight(1.05, of: nameSize)
        .lineLimit(hour == .ofici ? 2 : 1)
        .minimumScaleFactor(0.8)
        .layoutPriority(1)
        .widgetAccentable()
      if hour == .vespres, let vespers = entry.day.vespers {
        Text(vespers)
          .font(.system(size: 11.5, weight: .semibold))
          .lineLimit(1)
          .padding(.top, 3)
      }
    }
    .foregroundStyle(Palette.onAccent)
    .padding(12)
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    .background(fill, in: RoundedRectangle(cornerRadius: 15, style: .continuous))
  }

  // On a tinted or clear home screen everything is drawn in one tone: a solid tile would hide
  // the white name on it, so there it is only a veil
  private var fill: AnyShapeStyle {
    renderingMode == .fullColor ? AnyShapeStyle(Palette.accentFill) : AnyShapeStyle(Color.white.opacity(0.18))
  }
}
