#if DEBUG
import SwiftUI
import WidgetKit

// Xcode previews of the widgets, with real days of the database (Barcelona, October 2026) read
// through the same decoding as the payload of the app, and a day without the payload. Debug only.
enum PreviewDays {
  static let payload = WidgetPayload.decode(Data(json.utf8))

  // The widget at that time of that day of October 2026
  static func at(_ day: Int, _ hour: Int, _ minute: Int = 0, payload: WidgetPayload? = payload) -> HourEntry {
    let calendar = HourTimeline.calendar
    let date = calendar.date(from: DateComponents(year: 2026, month: 10, day: day, hour: hour, minute: minute))!
    return HourTimeline.entry(at: date, payload: payload, calendar: calendar)
  }

  private static let json = """
    {
      "version": 1,
      "writtenAt": "2026-10-09T06:00:00.000Z",
      "hourNames": {
        "ofici": "Ofici de lectura", "laudes": "Laudes", "tercia": "Tèrcia", "sexta": "Sexta",
        "nona": "Nona", "vespres": "Vespres", "completes": "Completes"
      },
      "days": [
        {
          "date": "2026-10-09", "dateText": "Divendres, 9 d’octubre", "shortDate": "Divendres 9 oct.",
          "inlineDate": "dv. 9", "title": "Setmana XXVII de durant l'any",
          "meta": "Any A · Setmana III del salteri", "color": "V",
          "celebration": {
            "type": "Memòria lliure", "title": "Sants Dionís, bisbe, i companys, màrtirs",
            "short": "Sants Dionís", "muted": true
          },
          "vespers": null,
          "gospel": {
            "caption": "Evangeli · Lc 11,15-26",
            "phrase": "Si jo trec els dimonis pel poder de Déu, és que el Regne de Déu ja és aquí amb vosaltres",
            "opens": "Evangeli"
          }
        },
        {
          "date": "2026-10-10", "dateText": "Dissabte, 10 d’octubre", "shortDate": "Dissabte 10 oct.",
          "inlineDate": "ds. 10", "title": "Setmana XXVII de durant l'any",
          "meta": "Any A · Setmana III del salteri", "color": "V",
          "celebration": {
            "type": "Memòria lliure", "title": "Sant Tomàs de Villanueva, bisbe",
            "short": "Sant Tomàs de Villanueva", "muted": true
          },
          "vespers": "Primeres vespres de diumenge",
          "gospel": {
            "caption": "Evangeli · Lc 11,27-28",
            "phrase": "Sortoses les entranyes que us van dur. Més aviat sortosos els qui escolten la paraula de Déu",
            "opens": "Evangeli"
          }
        },
        {
          "date": "2026-10-11", "dateText": "Diumenge, 11 d’octubre", "shortDate": "Diumenge 11 oct.",
          "inlineDate": "dg. 11", "title": "Setmana XXVIII de durant l'any",
          "meta": "Any A · Setmana IV del salteri", "color": "V", "celebration": null, "vespers": null,
          "gospel": {
            "caption": "Evangeli · Mt 22,1-14", "phrase": "Convideu a la festa tothom que trobeu",
            "opens": "Evangeli"
          }
        },
        {
          "date": "2026-10-15", "dateText": "Dijous, 15 d’octubre", "shortDate": "Dijous 15 oct.",
          "inlineDate": "dj. 15", "title": "Setmana XXVIII de durant l'any",
          "meta": "Any A · Setmana IV del salteri", "color": "B",
          "celebration": {
            "type": "Festa", "title": "Santa Teresa de Jesús, verge i doctora de l’Església",
            "short": "Santa Teresa de Jesús", "muted": false
          },
          "vespers": null,
          "gospel": {
            "caption": "Evangeli · Mt 11,25-30", "phrase": "Soc benèvol i humil de cor", "opens": "Evangeli"
          }
        },
        {
          "date": "2026-10-17", "dateText": "Dissabte, 17 d’octubre", "shortDate": "Dissabte 17 oct.",
          "inlineDate": "ds. 17", "title": "Setmana XXVIII de durant l'any",
          "meta": "Any A · Setmana IV del salteri", "color": "R",
          "celebration": {
            "type": "Memòria obligatòria", "title": "Sant Ignasi d’Antioquia, bisbe i màrtir",
            "short": "Sant Ignasi d’Antioquia", "muted": false
          },
          "vespers": "Primeres vespres de diumenge",
          "gospel": {
            "caption": "Evangeli · Lc 12,8-12",
            "phrase": "A l’hora de parlar, l’Esperit Sant us ensenyarà el que cal dir",
            "opens": "Evangeli"
          }
        }
      ]
    }
    """
}

#Preview("L’hora d’ara", as: .systemSmall) {
  AraWidget()
} timeline: {
  PreviewDays.at(9, 7, 42)
  PreviewDays.at(10, 4, 30)
  PreviewDays.at(10, 19, 30)
  PreviewDays.at(11, 1, 12)
  PreviewDays.at(15, 10, 5)
  PreviewDays.at(30, 16, 45, payload: nil)
}

#Preview("Bloqueig, en línia", as: .accessoryInline) {
  AraWidget()
} timeline: {
  PreviewDays.at(9, 7, 42)
  PreviewDays.at(10, 4, 30)
}

#Preview("Bloqueig, rodó", as: .accessoryCircular) {
  AraWidget()
} timeline: {
  PreviewDays.at(9, 7, 42)
  PreviewDays.at(10, 4, 30)
}

#Preview("Bloqueig, rectangular", as: .accessoryRectangular) {
  AraWidget()
} timeline: {
  PreviewDays.at(9, 7, 42)
  PreviewDays.at(17, 19, 30)
  PreviewDays.at(30, 13, 20, payload: nil)
}

#Preview("Avui", as: .systemMedium) {
  AvuiWidget()
} timeline: {
  PreviewDays.at(9, 7, 42)
  PreviewDays.at(10, 4, 30)
  PreviewDays.at(11, 13, 20)
  PreviewDays.at(17, 19, 30)
  PreviewDays.at(30, 16, 45, payload: nil)
}

#Preview("Les hores", as: .systemLarge) {
  HoresWidget()
} timeline: {
  PreviewDays.at(9, 7, 42)
  PreviewDays.at(10, 19, 30)
  PreviewDays.at(11, 1, 12)
  PreviewDays.at(15, 10, 5)
  PreviewDays.at(30, 4, 30, payload: nil)
}

#Preview("La Paraula d’avui", as: .systemMedium) {
  ParaulaWidget()
} timeline: {
  PreviewDays.at(9, 7, 42)
  PreviewDays.at(11, 13, 20)
  PreviewDays.at(15, 10, 5)
  PreviewDays.at(30, 16, 45, payload: nil)
}
#endif
