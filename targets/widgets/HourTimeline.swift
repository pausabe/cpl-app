import WidgetKit

// Which hour and which day the widgets show at each moment, and the timeline that changes them
// by themselves at every band boundary (0, 2, 6, 9, 12, 15 and 18 h) with the app closed.

// The day being shown: the one the app wrote, or, when there is none (the app has not been
// opened for two weeks, or never), the date written here in Catalan with no name of the day
struct DayContent {
  // Local date, YYYY-MM-DD: the `day` of the links
  let date: String
  // «Divendres, 9 d’octubre»
  let dateText: String
  // «Divendres 9 oct.»
  let shortDate: String
  // «dv. 9»
  let inlineDate: String
  // «Setmana XXVII de durant l'any»; empty when the app did not write the day
  let title: String
  // «Any A · Setmana III del salteri»
  let meta: String
  // R, V, M or B
  let color: String
  let celebration: Celebration?
  // The title of the first Vespers, under «Vespres»: «Tots Sants»
  let vespers: String?
  let gospel: Gospel?

  init(date: Date, calendar: Calendar, written: PayloadDay?) {
    let iso = CatalanDate.iso(date, calendar)
    self.date = written?.date ?? iso
    dateText = written?.dateText.nonEmpty ?? CatalanDate.long(date, calendar)
    shortDate = written?.shortDate.nonEmpty ?? CatalanDate.short(date, calendar)
    inlineDate = written?.inlineDate.nonEmpty ?? CatalanDate.inline(date, calendar)
    title = written?.title ?? ""
    meta = written?.meta ?? ""
    color = written?.color ?? "V"
    celebration = written?.celebration
    vespers = written?.vespers.nonEmpty
    gospel = written?.gospel
  }
}

struct HourEntry: TimelineEntry {
  let date: Date
  let band: Band
  let day: DayContent
  let hourNames: [HourKey: String]

  var hour: HourKey { band.hour }

  func name(_ hour: HourKey) -> String {
    hourNames[hour].nonEmpty ?? hour.defaultName
  }
}

enum HourTimeline {
  // The bands of widgets.ts (widgetBands), for when there is no payload or its bands are not
  // usable: Completes of the day before until 2 h, the Office of Readings without «Ara» until 6 h,
  // and the hours of the home after that
  static let defaultBands = [
    Band(from: 0, to: 2, hour: .completes, now: true, yesterday: true),
    Band(from: 2, to: 6, hour: .ofici, now: false, yesterday: false),
    Band(from: 6, to: 9, hour: .laudes, now: true, yesterday: false),
    Band(from: 9, to: 12, hour: .tercia, now: true, yesterday: false),
    Band(from: 12, to: 15, hour: .sexta, now: true, yesterday: false),
    Band(from: 15, to: 18, hour: .nona, now: true, yesterday: false),
    Band(from: 18, to: 24, hour: .vespres, now: true, yesterday: false),
  ]

  // At least this far ahead, also when the payload ends sooner or there is none
  static let minimumHorizon: TimeInterval = 48 * 60 * 60

  // Local time in the Gregorian calendar, whatever calendar the phone is set to: the dates of the
  // payload are Gregorian
  static var calendar: Calendar {
    var calendar = Calendar(identifier: .gregorian)
    calendar.timeZone = .current
    return calendar
  }

  // The payload's bands when they cover every hour of the day, the built-in ones otherwise
  static func usableBands(_ payload: WidgetPayload?) -> [Band] {
    guard let bands = payload?.bands, !bands.isEmpty else { return defaultBands }
    let complete = (0..<24).allSatisfy { hour in bands.contains { hour >= $0.from && hour < $0.to } }
    return complete ? bands : defaultBands
  }

  static func entry(at date: Date, payload: WidgetPayload?, calendar: Calendar = HourTimeline.calendar) -> HourEntry {
    let bands = usableBands(payload)
    let hour = calendar.component(.hour, from: date)
    let band = bands.first { hour >= $0.from && hour < $0.to } ?? defaultBands[0]
    let today = calendar.startOfDay(for: date)
    let shown = band.yesterday ? calendar.date(byAdding: .day, value: -1, to: today) ?? today : today
    let iso = CatalanDate.iso(shown, calendar)
    let written = payload?.days.first { $0.date == iso }
    return HourEntry(
      date: date,
      band: band,
      day: DayContent(date: shown, calendar: calendar, written: written),
      hourNames: payload?.hourNames ?? [:]
    )
  }

  // One entry now and one at every band boundary after it, until the last day of the payload has
  // been shown (its Completes of the next night included), and for 48 h at least. The boundary at
  // the end is included: the last entry is already what comes after, while WidgetKit asks again.
  static func entries(from now: Date, payload: WidgetPayload?, calendar: Calendar = HourTimeline.calendar) -> [HourEntry] {
    let bands = usableBands(payload)
    var horizon = now.addingTimeInterval(minimumHorizon)
    if let last = payload?.days.compactMap({ CatalanDate.parse($0.date, calendar) }).max(),
      let end = calendar.date(byAdding: .day, value: 1, to: last)
    {
      let lastNight = bands.filter(\.yesterday).map(\.to).max() ?? 0
      horizon = max(horizon, end.addingTimeInterval(TimeInterval(lastNight) * 60 * 60))
    }

    var boundaries: Set<Date> = []
    var day = calendar.startOfDay(for: now)
    while day < horizon {
      for band in bands {
        // On the night the clocks go forward, 2 h does not exist: the band starts at 3 h
        if let start = calendar.date(bySettingHour: band.from, minute: 0, second: 0, of: day),
          start > now, start <= horizon
        {
          boundaries.insert(start)
        }
      }
      guard let next = calendar.date(byAdding: .day, value: 1, to: day) else { break }
      day = next
    }
    return ([now] + boundaries.sorted()).map { entry(at: $0, payload: payload, calendar: calendar) }
  }
}

// The same timeline for the four widgets
struct HourProvider: TimelineProvider {
  func placeholder(in context: Context) -> HourEntry {
    HourTimeline.entry(at: Date(), payload: nil)
  }

  func getSnapshot(in context: Context, completion: @escaping (HourEntry) -> Void) {
    completion(HourTimeline.entry(at: Date(), payload: PayloadStore.load()))
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<HourEntry>) -> Void) {
    let entries = HourTimeline.entries(from: Date(), payload: PayloadStore.load())
    completion(Timeline(entries: entries, policy: .atEnd))
  }
}

// The dates in Catalan, as the app writes them (view-models/catalanText and widgets.ts), for the
// days the payload does not have
enum CatalanDate {
  private static let weekdays = ["Diumenge", "Dilluns", "Dimarts", "Dimecres", "Dijous", "Divendres", "Dissabte"]
  private static let shortWeekdays = ["dg.", "dl.", "dt.", "dc.", "dj.", "dv.", "ds."]
  private static let months = [
    "gener", "febrer", "març", "abril", "maig", "juny",
    "juliol", "agost", "setembre", "octubre", "novembre", "desembre",
  ]
  // «oct.», but «març», «maig» and «juny» are whole
  private static let shortMonths = [
    "gen.", "febr.", "març", "abr.", "maig", "juny", "jul.", "ag.", "set.", "oct.", "nov.", "des.",
  ]

  private struct Parts {
    let year: Int
    let month: Int
    let day: Int
    let weekday: Int
  }

  private static func parts(_ date: Date, _ calendar: Calendar) -> Parts {
    let components = calendar.dateComponents([.year, .month, .day, .weekday], from: date)
    return Parts(
      year: components.year ?? 2000,
      month: (components.month ?? 1) - 1,
      day: components.day ?? 1,
      weekday: (components.weekday ?? 1) - 1
    )
  }

  // 2026-10-09
  static func iso(_ date: Date, _ calendar: Calendar) -> String {
    let p = parts(date, calendar)
    return String(format: "%04d-%02d-%02d", p.year, p.month + 1, p.day)
  }

  // The local midnight of YYYY-MM-DD
  static func parse(_ iso: String, _ calendar: Calendar) -> Date? {
    let numbers = iso.split(separator: "-").compactMap { Int($0) }
    guard numbers.count == 3 else { return nil }
    return calendar.date(from: DateComponents(year: numbers[0], month: numbers[1], day: numbers[2]))
  }

  // «Divendres, 9 d’octubre», «Dilluns, 21 de setembre»: the preposition elides before a vowel
  static func long(_ date: Date, _ calendar: Calendar) -> String {
    let p = parts(date, calendar)
    let month = months[p.month]
    let of = "aeiouàèéíòóú".contains(month.prefix(1)) ? "d’" : "de "
    return "\(weekdays[p.weekday]), \(p.day) \(of)\(month)"
  }

  // «Divendres 9 oct.»
  static func short(_ date: Date, _ calendar: Calendar) -> String {
    let p = parts(date, calendar)
    return "\(weekdays[p.weekday]) \(p.day) \(shortMonths[p.month])"
  }

  // «dv. 9»
  static func inline(_ date: Date, _ calendar: Calendar) -> String {
    let p = parts(date, calendar)
    return "\(shortWeekdays[p.weekday]) \(p.day)"
  }
}

extension Optional where Wrapped == String {
  // The text, or nil when there is none or it is empty
  var nonEmpty: String? {
    switch self {
    case .some(let text) where !text.isEmpty: return text
    default: return nil
    }
  }
}
