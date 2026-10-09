import SwiftUI
import WidgetKit

// What the four widgets share: the fonts, where a touch goes, what VoiceOver says, and the two
// pieces that are in more than one widget (the day of «Avui» and «Les hores», and the «Ara» label).

enum Typeface {
  // The fonts of the app (src/assets/fonts), registered in Info.plist by their file name and
  // used by their PostScript name. Fixed sizes, as the system font of the widgets: their room
  // does not grow with the text size.
  static func serif(_ size: CGFloat) -> Font { .custom("Literata-SemiBold", fixedSize: size) }
  static func italic(_ size: CGFloat) -> Font { .custom("Literata-Italic", fixedSize: size) }
}

extension View {
  // The height of a line as a multiple of the size of the font, as the line-height of the
  // mockups. Literata's own is 1.485, loose for a name in two lines; before iOS 26 it stays so.
  @ViewBuilder
  func textLineHeight(_ multiple: CGFloat, of size: CGFloat) -> some View {
    if #available(iOS 26.0, *) {
      lineHeight(.exact(points: multiple * size))
    } else {
      self
    }
  }
}

// The links of src/view-models/widgets.ts, which the app opens (scheme cpl)
enum WidgetLink {
  // The home, as when the app is opened
  static let today = URL(string: "cpl://today")!

  // That hour of that day, without passing through the home
  static func hour(_ hour: HourKey, day: String) -> URL {
    link("hour", hour.rawValue, day: day)
  }

  // The readings of the Mass of that day, at <opens>
  static func mass(_ opens: String, day: String) -> URL {
    link("mass", opens, day: day)
  }

  private static func link(_ kind: String, _ target: String, day: String) -> URL {
    var components = URLComponents()
    components.scheme = "cpl"
    components.host = kind
    components.path = "/" + target
    components.queryItems = [URLQueryItem(name: "day", value: day)]
    return components.url ?? today
  }
}

// What VoiceOver says of each place that can be touched
enum Spoken {
  // «Laudes, ara»; «Ofici de lectura» between 2 and 6 h, when it is not the hour
  static func hour(_ entry: HourEntry, _ hour: HourKey) -> String {
    let name = entry.name(hour)
    return entry.band.now && entry.hour == hour ? "\(name), ara" : name
  }

  // «Divendres, 9 d’octubre. Setmana XXVII de durant l'any. Memòria lliure Sants Dionís, …»
  static func day(_ day: DayContent) -> String {
    var parts = [day.dateText, day.title]
    if let celebration = day.celebration {
      parts.append([celebration.type, celebration.title].filter { !$0.isEmpty }.joined(separator: " "))
    }
    return parts.filter { !$0.isEmpty }.joined(separator: ". ")
  }

  static func gospel(_ gospel: Gospel) -> String {
    "Evangeli d’avui: \(gospel.phrase)"
  }
}

extension HourEntry {
  // The line under the hour where there is little room: the title of the first Vespers at
  // Vespres, the celebration when it is kept, or else the day in its season
  var subtitle: (text: String, isVespers: Bool)? {
    if hour == .vespres, let vespers = day.vespers { return (vespers, true) }
    if let celebration = day.celebration, !celebration.muted, !celebration.short.isEmpty {
      return (celebration.short, false)
    }
    return day.title.isEmpty ? nil : (day.title, false)
  }
}

// «ARA», next to the icon of the hour, when it is the hour
struct NowLabel: View {
  var body: some View {
    Text("Ara")
      .font(.system(size: 11, weight: .bold))
      .tracking(0.9)
      .textCase(.uppercase)
      .opacity(0.82)
      .lineLimit(1)
  }
}

// The day, as the card at the top of the home: the date, the day in its season and the
// celebration, grey when it is an optional memorial not being kept. Without a celebration, the
// year and the week of the psalter, at the bottom when there is room.
struct DayBlock: View {
  let day: DayContent

  var body: some View {
    let accent = Palette.liturgicalColor(day.color).accent
    VStack(alignment: .leading, spacing: 0) {
      Text(day.dateText)
        .font(.system(size: 12.5))
        .foregroundStyle(Palette.text2)
        .lineLimit(1)
      if !day.title.isEmpty {
        Text(day.title)
          .font(Typeface.serif(18))
          .textLineHeight(1.18, of: 18)
          .foregroundStyle(Palette.text)
          .lineLimit(2)
          .padding(.top, 3)
          .layoutPriority(1)
      }
      if let celebration = day.celebration {
        Rectangle()
          .fill(Palette.text.opacity(0.14))
          .frame(height: 1)
          .padding(.top, 8)
          .padding(.bottom, 6)
        if !celebration.type.isEmpty {
          Text(celebration.type)
            .font(.system(size: 10.5, weight: .bold))
            .tracking(0.7)
            .textCase(.uppercase)
            .foregroundStyle(celebration.muted ? Palette.text3 : accent)
            .lineLimit(1)
        }
        Text(celebration.title)
          .font(.system(size: 13))
          .foregroundStyle(celebration.muted ? Palette.text3 : Palette.text)
          .lineLimit(2)
          .padding(.top, 1)
        Spacer(minLength: 0)
      } else if !day.meta.isEmpty {
        Spacer(minLength: 4)
        Text(day.meta)
          .font(.system(size: 12))
          .foregroundStyle(Palette.text2)
          .lineLimit(1)
      } else {
        Spacer(minLength: 0)
      }
    }
    .frame(maxWidth: .infinity, alignment: .leading)
  }
}
