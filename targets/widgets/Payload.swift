import Foundation

// What the app leaves for the widgets: the WidgetPayload of src/view-models/widgets.ts, as JSON,
// in the group of apps it shares with this extension. The app writes it for the next 14 days
// every time it is opened; the widgets work out the hour by themselves, from the clock.
//
// The reading is tolerant: a field that is missing or of another type is left out, and so is a
// day or a band that cannot be read, instead of losing the whole payload. Fields it does not know
// are ignored, so a payload of a later version is still read for what this one understands.

enum HourKey: String, CaseIterable {
  case ofici, laudes, tercia, sexta, nona, vespres, completes

  // The names of the home, when the payload does not bring them
  var defaultName: String {
    switch self {
    case .ofici: return "Ofici de lectura"
    case .laudes: return "Laudes"
    case .tercia: return "Tèrcia"
    case .sexta: return "Sexta"
    case .nona: return "Nona"
    case .vespres: return "Vespres"
    case .completes: return "Completes"
    }
  }
}

// From the hour `from` (included) to `to` (not included), local time, the widgets show `hour`:
// with «Ara» when `now`, and with the liturgy of the day before when `yesterday`
struct Band: Decodable, Equatable {
  let from: Int
  let to: Int
  let hour: HourKey
  let now: Bool
  let yesterday: Bool

  init(from: Int, to: Int, hour: HourKey, now: Bool, yesterday: Bool) {
    self.from = from
    self.to = to
    self.hour = hour
    self.now = now
    self.yesterday = yesterday
  }

  private enum CodingKeys: String, CodingKey {
    case from, to, hour, now, yesterday
  }

  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: CodingKeys.self)
    from = try container.decode(Int.self, forKey: .from)
    to = try container.decode(Int.self, forKey: .to)
    let key = try container.decode(String.self, forKey: .hour)
    guard let hour = HourKey(rawValue: key) else {
      throw DecodingError.dataCorruptedError(forKey: .hour, in: container, debugDescription: "Unknown hour \(key)")
    }
    self.hour = hour
    now = container.lenient(Bool.self, .now) ?? true
    yesterday = container.lenient(Bool.self, .yesterday) ?? false
  }
}

struct Celebration: Decodable {
  // «Memòria lliure», «Festa», «Solemnitat»
  let type: String
  let title: String
  // Up to its first comma, where there is little room: «Santa Teresa de Jesús»
  let short: String
  // An optional memorial that is not being celebrated: grey, as on the home
  let muted: Bool

  private enum CodingKeys: String, CodingKey {
    case type, title, short, muted
  }

  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: CodingKeys.self)
    title = try container.decode(String.self, forKey: .title)
    type = container.lenient(String.self, .type) ?? ""
    short = container.lenient(String.self, .short) ?? Celebration.shortened(title)
    muted = container.lenient(Bool.self, .muted) ?? false
  }

  // As shortCelebration of widgets.ts: «Santa Teresa de Jesús, verge i doctora» → «Santa Teresa de Jesús»
  static func shortened(_ title: String) -> String {
    guard let comma = title.range(of: ", "), comma.lowerBound > title.startIndex else { return title }
    return String(title[..<comma.lowerBound])
  }
}

struct Gospel: Decodable {
  // «Evangeli · Lc 11,15-26»
  let caption: String
  let phrase: String
  // Where cpl://mass/<opens> opens the readings
  let opens: String

  private enum CodingKeys: String, CodingKey {
    case caption, phrase, opens
  }

  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: CodingKeys.self)
    phrase = try container.decode(String.self, forKey: .phrase)
    guard !phrase.isEmpty else {
      throw DecodingError.dataCorruptedError(forKey: .phrase, in: container, debugDescription: "No phrase")
    }
    caption = container.lenient(String.self, .caption) ?? "Evangeli"
    opens = container.lenient(String.self, .opens) ?? "Evangeli"
  }
}

// One day as the app wrote it. Only `date` is required: the rest has a fallback or is left out.
struct PayloadDay: Decodable {
  // Local date, YYYY-MM-DD
  let date: String
  let dateText: String?
  let shortDate: String?
  let inlineDate: String?
  let title: String?
  let meta: String?
  let color: String?
  let celebration: Celebration?
  let vespers: String?
  let gospel: Gospel?

  private enum CodingKeys: String, CodingKey {
    case date, dateText, shortDate, inlineDate, title, meta, color, celebration, vespers, gospel
  }

  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: CodingKeys.self)
    date = try container.decode(String.self, forKey: .date)
    dateText = container.lenient(String.self, .dateText)
    shortDate = container.lenient(String.self, .shortDate)
    inlineDate = container.lenient(String.self, .inlineDate)
    title = container.lenient(String.self, .title)
    meta = container.lenient(String.self, .meta)
    color = container.lenient(String.self, .color)
    celebration = container.lenient(Celebration.self, .celebration)
    vespers = container.lenient(String.self, .vespers)
    gospel = container.lenient(Gospel.self, .gospel)
  }
}

struct WidgetPayload: Decodable {
  let version: Int
  let bands: [Band]
  let hourNames: [HourKey: String]
  let days: [PayloadDay]

  private enum CodingKeys: String, CodingKey {
    case version, bands, hourNames, days
  }

  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: CodingKeys.self)
    version = container.lenient(Int.self, .version) ?? 1
    bands = container.lenient(LossyArray<Band>.self, .bands)?.elements ?? []
    let names = container.lenient([String: String].self, .hourNames) ?? [:]
    hourNames = Dictionary(
      names.compactMap { key, name in HourKey(rawValue: key).map { ($0, name) } },
      uniquingKeysWith: { first, _ in first }
    )
    days = container.lenient(LossyArray<PayloadDay>.self, .days)?.elements ?? []
  }

  static func decode(_ data: Data) -> WidgetPayload? {
    try? JSONDecoder().decode(WidgetPayload.self, from: data)
  }
}

// Where the app leaves the payload: UserDefaults of the group «group.<app identifier>», key
// «payload» (modules/cpl-widgets/ios). This extension is «<app identifier>.widgets», so the group
// comes from its own identifier, and the same build works as cpl.cpl and as cpl.cpl.dev.
enum PayloadStore {
  static let key = "payload"

  static var appGroup: String {
    let identifier = Bundle.main.bundleIdentifier ?? "cpl.cpl.widgets"
    let suffix = ".widgets"
    let app = identifier.hasSuffix(suffix) ? String(identifier.dropLast(suffix.count)) : identifier
    return "group." + app
  }

  static func load() -> WidgetPayload? {
    guard let defaults = UserDefaults(suiteName: appGroup) else { return nil }
    if let json = defaults.string(forKey: key), let data = json.data(using: .utf8) {
      return WidgetPayload.decode(data)
    }
    return defaults.data(forKey: key).flatMap(WidgetPayload.decode)
  }
}

// An array that keeps the elements it can read and skips the others
struct LossyArray<Element: Decodable>: Decodable {
  let elements: [Element]

  init(from decoder: Decoder) throws {
    var container = try decoder.unkeyedContainer()
    var elements: [Element] = []
    while !container.isAtEnd {
      if let element = try? container.decode(Element.self) {
        elements.append(element)
      } else if (try? container.decode(Skipped.self)) == nil {
        break
      }
    }
    self.elements = elements
  }

  // Reads any value without looking at it, to move past an element that is not an Element
  private struct Skipped: Decodable {
    init(from decoder: Decoder) throws {}
  }
}

extension KeyedDecodingContainer {
  // The value, or nil when it is missing, null or of another type
  func lenient<T: Decodable>(_ type: T.Type, _ key: Key) -> T? {
    try? decodeIfPresent(type, forKey: key)
  }
}
