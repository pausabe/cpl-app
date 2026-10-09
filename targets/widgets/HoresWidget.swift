import SwiftUI
import WidgetKit

// 3. «Les hores»: the home in small, the card of the day and the seven hours in three rows, the
// one of now filled. Each hour opens its prayer, for whoever prays more than one a day.
struct HoresWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "hores", provider: HourProvider()) { entry in
      HoresView(entry: entry)
    }
    .configurationDisplayName("Les hores")
    .description("Les set hores del dia. Cada una s’obre amb un toc.")
    .supportedFamilies([.systemLarge])
    .contentMarginsDisabled()
  }
}

struct HoresView: View {
  let entry: HourEntry
  @Environment(\.widgetRenderingMode) private var renderingMode

  var body: some View {
    VStack(spacing: 10) {
      Link(destination: WidgetLink.today) {
        DayBlock(day: entry.day)
          .padding(.vertical, 13)
          .padding(.horizontal, 15)
          .background(cardFill, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
      }
      .fixedSize(horizontal: false, vertical: true)
      .accessibilityLabel(Spoken.day(entry.day))
      // The rows of the home: the Office and Laudes, the three little hours, Vespers and Compline
      VStack(spacing: 7) {
        row([.ofici, .laudes])
        row([.tercia, .sexta, .nona], compact: true)
        row([.vespres, .completes])
      }
      .frame(maxHeight: .infinity)
    }
    .padding(12)
    .containerBackground(Palette.homeBackground, for: .widget)
    .widgetURL(WidgetLink.today)
  }

  private func row(_ hours: [HourKey], compact: Bool = false) -> some View {
    HStack(spacing: 7) {
      ForEach(hours, id: \.self) { hour in
        HourTile(entry: entry, hour: hour, compact: compact)
      }
    }
    .frame(maxHeight: .infinity)
  }

  private var cardFill: AnyShapeStyle {
    renderingMode == .fullColor
      ? AnyShapeStyle(Palette.liturgicalColor(entry.day.color).tint) : AnyShapeStyle(Color.white.opacity(0.08))
  }
}

// An hour of the home: its icon and its name, and under «Vespres» the title of the first Vespers.
// The middle row is compact, centred. The hour of now is filled, without the word «Ara».
private struct HourTile: View {
  let entry: HourEntry
  let hour: HourKey
  let compact: Bool
  @Environment(\.widgetRenderingMode) private var renderingMode

  var body: some View {
    let isNow = entry.band.now && entry.hour == hour
    Link(destination: WidgetLink.hour(hour, day: entry.day.date)) {
      HStack(spacing: compact ? 6 : 8) {
        HourIcon(hour: hour, size: compact ? 19 : 22)
          .foregroundStyle(isNow ? Palette.onAccent : Palette.accentText)
          .widgetAccentable()
        VStack(alignment: .leading, spacing: 0) {
          Text(entry.name(hour))
            .font(.system(size: compact ? 13 : 14, weight: isNow ? .bold : .medium))
            .foregroundStyle(isNow ? Palette.onAccent : Palette.text)
            .lineLimit(1)
            .minimumScaleFactor(0.8)
          if hour == .vespres, let vespers = entry.day.vespers {
            Text(vespers)
              .font(.system(size: 10.5))
              .foregroundStyle(isNow ? Palette.onAccent : Palette.rubric)
              .lineLimit(1)
          }
        }
      }
      .padding(.horizontal, compact ? 6 : 10)
      .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: compact ? .center : .leading)
      .background(fill(isNow), in: shape)
      .overlay(shape.strokeBorder(border(isNow), lineWidth: 1))
    }
    .accessibilityLabel(Spoken.hour(entry, hour))
  }

  private var shape: RoundedRectangle {
    RoundedRectangle(cornerRadius: 13, style: .continuous)
  }

  // On a tinted or clear home screen everything is drawn in one tone: solid tiles would hide the
  // names on them, so there they are veils, the one of now a little stronger
  private func fill(_ isNow: Bool) -> AnyShapeStyle {
    if renderingMode != .fullColor { return AnyShapeStyle(Color.white.opacity(isNow ? 0.3 : 0.08)) }
    return isNow ? AnyShapeStyle(Palette.accentFill) : AnyShapeStyle(Palette.surface)
  }

  private func border(_ isNow: Bool) -> AnyShapeStyle {
    if renderingMode != .fullColor { return AnyShapeStyle(Color.white.opacity(isNow ? 0 : 0.2)) }
    return isNow ? AnyShapeStyle(Palette.accentFill) : AnyShapeStyle(Palette.border)
  }
}
