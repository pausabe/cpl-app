import SwiftUI
import WidgetKit

// 4. «La Paraula d’avui»: the phrase of the Gospel of the day, the one of the Mass block of the
// home, in the italic of the app and with its reference in red. A touch opens the Gospel.
struct ParaulaWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "paraula", provider: HourProvider()) { entry in
      ParaulaView(entry: entry)
    }
    .configurationDisplayName("La Paraula d’avui")
    .description("La frase de l’Evangeli del dia.")
    .supportedFamilies([.systemMedium])
    .contentMarginsDisabled()
  }
}

struct ParaulaView: View {
  let entry: HourEntry

  private static let withoutGospel = "Obre la CPL per veure l’Evangeli d’avui."

  // The longer the phrase, the smaller, so that it fits in four lines. Counted as JavaScript and
  // Kotlin count it, so that the three platforms cut at the same phrases.
  private static func size(_ phrase: String) -> CGFloat {
    let length = phrase.utf16.count
    return length < 50 ? 20 : length < 95 ? 17 : 15
  }

  var body: some View {
    let gospel = entry.day.gospel
    let size = gospel.map { Self.size($0.phrase) } ?? 20
    VStack(alignment: .leading, spacing: 0) {
      Text(verbatim: gospel?.caption ?? "Evangeli")
        .font(.system(size: 10.5, weight: .bold))
        .tracking(0.8)
        .textCase(.uppercase)
        .foregroundStyle(Palette.rubric)
        .lineLimit(1)
      Text(verbatim: gospel.map { "«\($0.phrase)»" } ?? Self.withoutGospel)
        .font(Typeface.italic(size))
        .textLineHeight(1.32, of: size)
        .foregroundStyle(gospel == nil ? Palette.text2 : Palette.text)
        .lineLimit(4)
        .minimumScaleFactor(0.85)
        .padding(.top, 7)
        .layoutPriority(1)
      Spacer(minLength: 6)
      HStack(alignment: .firstTextBaseline, spacing: 8) {
        Text(verbatim: entry.day.dateText)
          .lineLimit(1)
        Spacer(minLength: 0)
        Text(verbatim: "CPL")
      }
      .font(.system(size: 11.5))
      .foregroundStyle(Palette.text3)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    .padding(.vertical, 15)
    .padding(.horizontal, 18)
    .accessibilityElement(children: .ignore)
    .accessibilityLabel(gospel.map(Spoken.gospel) ?? Self.withoutGospel)
    .containerBackground(Palette.surface, for: .widget)
    .widgetURL(gospel.map { WidgetLink.mass($0.opens, day: entry.day.date) } ?? WidgetLink.today)
  }
}
