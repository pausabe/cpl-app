import SwiftUI
import WidgetKit

// 1. «L’hora d’ara»: the «Ara» tile of the home, out of the app. The name of the hour, big, with
// its sun; under it the day and what is celebrated. A touch opens that prayer. The same kind
// gives the three widgets of the lock screen, which iOS paints in one tone over the wallpaper.
struct AraWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "ara", provider: HourProvider()) { entry in
      AraView(entry: entry)
    }
    .configurationDisplayName("L’hora d’ara")
    .description("L’hora que toca resar. Un toc i s’obre.")
    .supportedFamilies([.systemSmall, .accessoryInline, .accessoryCircular, .accessoryRectangular])
    .contentMarginsDisabled()
  }
}

struct AraView: View {
  let entry: HourEntry
  @Environment(\.widgetFamily) private var family

  var body: some View {
    switch family {
    case .accessoryInline:
      AraInline(entry: entry)
    case .accessoryCircular:
      AraCircular(entry: entry)
    case .accessoryRectangular:
      AraRectangular(entry: entry)
    default:
      AraSmall(entry: entry)
    }
  }
}

// Always the teal of the «Ara» tile, never the colour of the day (Pau, 9-10-2026)
private struct AraSmall: View {
  let entry: HourEntry

  // The longer names, smaller, so that they fit as the others
  private var nameSize: CGFloat {
    switch entry.hour {
    case .ofici: return 22
    case .completes: return 25
    case .vespres: return 28
    default: return 30
    }
  }

  var body: some View {
    let hour = entry.hour
    VStack(alignment: .leading, spacing: 0) {
      HStack(alignment: .top) {
        HourIcon(hour: hour, size: 30)
          .widgetAccentable()
        Spacer(minLength: 4)
        if entry.band.now {
          NowLabel()
        }
      }
      Spacer(minLength: 4)
      // The name always whole; what is under it loses lines when there is no room for them (the
      // smaller iPhones, and the looser lines of Literata before iOS 26)
      ViewThatFits(in: .vertical) {
        details(subtitleLines: 2)
        details(subtitleLines: 1)
        details(subtitleLines: 0)
      }
    }
    .foregroundStyle(Palette.onAccent)
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    .padding(15)
    .accessibilityElement(children: .ignore)
    .accessibilityLabel(Spoken.hour(entry, hour))
    .containerBackground(Palette.accentFill, for: .widget)
    .widgetURL(WidgetLink.hour(hour, day: entry.day.date))
  }

  private func details(subtitleLines: Int) -> some View {
    VStack(alignment: .leading, spacing: 0) {
      Text(entry.name(entry.hour))
        .font(Typeface.serif(nameSize))
        .textLineHeight(1.05, of: nameSize)
        .lineLimit(entry.hour == .ofici ? 2 : 1)
        .minimumScaleFactor(0.75)
        .fixedSize(horizontal: false, vertical: true)
        .widgetAccentable()
      Text(entry.day.shortDate)
        .font(.system(size: 12.5))
        .opacity(0.92)
        .lineLimit(1)
        .padding(.top, 6)
      if subtitleLines > 0, let subtitle = entry.subtitle {
        Text(subtitle.text)
          .font(.system(size: 12, weight: subtitle.isVespers ? .semibold : .regular))
          .opacity(subtitle.isVespers ? 1 : 0.78)
          .lineLimit(subtitleLines)
          .fixedSize(horizontal: false, vertical: true)
          .padding(.top, 2)
      }
    }
  }
}

// Over the clock: «dv. 9 · Laudes», with the icon. An inline widget only draws text and images,
// so the icon goes as an image of the shape.
private struct AraInline: View {
  let entry: HourEntry
  @Environment(\.displayScale) private var displayScale

  var body: some View {
    let text = "\(entry.day.inlineDate) · \(entry.name(entry.hour))"
    Group {
      if let icon = icon() {
        Label {
          Text(verbatim: text)
        } icon: {
          Image(uiImage: icon).renderingMode(.template)
        }
      } else {
        Text(verbatim: text)
      }
    }
    .accessibilityLabel(Spoken.hour(entry, entry.hour))
    .containerBackground(for: .widget) { Color.clear }
    .widgetURL(WidgetLink.hour(entry.hour, day: entry.day.date))
  }

  private func icon() -> UIImage? {
    let renderer = ImageRenderer(content: HourIcon(hour: entry.hour, size: 16).foregroundStyle(.black))
    renderer.scale = displayScale
    return renderer.uiImage
  }
}

// The icon over «Ara», or over «Ofici» when it is the Office of Readings of the night
private struct AraCircular: View {
  let entry: HourEntry

  var body: some View {
    let label = entry.band.now ? "Ara" : entry.hour == .ofici ? "Ofici" : entry.name(entry.hour)
    ZStack {
      AccessoryWidgetBackground()
      VStack(spacing: 2) {
        HourIcon(hour: entry.hour, size: 28)
        Text(verbatim: label)
          .font(.system(size: 10.5, weight: .bold))
          .lineLimit(1)
          .minimumScaleFactor(0.8)
      }
    }
    .widgetAccentable()
    .accessibilityElement(children: .ignore)
    .accessibilityLabel(Spoken.hour(entry, entry.hour))
    .containerBackground(for: .widget) { Color.clear }
    .widgetURL(WidgetLink.hour(entry.hour, day: entry.day.date))
  }
}

// The hour, what is celebrated and the week of the psalter. Without the payload, the date.
private struct AraRectangular: View {
  let entry: HourEntry

  var body: some View {
    let second = entry.subtitle?.text ?? entry.day.shortDate
    ZStack {
      AccessoryWidgetBackground()
      VStack(alignment: .leading, spacing: 0) {
        HStack(spacing: 5) {
          HourIcon(hour: entry.hour, size: 16)
          Text(verbatim: entry.name(entry.hour))
            .font(.system(size: 15, weight: .bold))
            .lineLimit(1)
        }
        Text(verbatim: second)
          .font(.system(size: 12.5))
          .lineLimit(1)
        if !entry.day.meta.isEmpty {
          Text(verbatim: entry.day.meta)
            .font(.system(size: 12.5))
            .lineLimit(1)
        }
      }
      .frame(maxWidth: .infinity, alignment: .leading)
      .padding(.horizontal, 9)
      .padding(.vertical, 6)
    }
    .widgetAccentable()
    .accessibilityElement(children: .ignore)
    .accessibilityLabel(Spoken.hour(entry, entry.hour))
    .containerBackground(for: .widget) { Color.clear }
    .widgetURL(WidgetLink.hour(entry.hour, day: entry.day.date))
  }
}
