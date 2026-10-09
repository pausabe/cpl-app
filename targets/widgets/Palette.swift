import SwiftUI

// The app's colours (src/theme/colors.ts), light and dark, the ones the widgets use. A Jest test
// reads the 0xRRGGBB literals of this file and compares them with colors.ts: when a colour of the
// app changes, it changes here too, with the same name.
enum Palette {
  static let homeBackground = Tone(light: 0xE7F2F1, dark: 0x0E1413)
  static let surface = Tone(light: 0xFFFFFF, dark: 0x18201F)
  static let border = Tone(light: 0xD3E3E1, dark: 0x2A3534)
  static let text = Tone(light: 0x182322, dark: 0xE6ECEB)
  static let text2 = Tone(light: 0x475756, dark: 0xB3C0BE)
  static let text3 = Tone(light: 0x5A6B6A, dark: 0x93A3A1)
  static let accentFill = Tone(light: 0x007B80, dark: 0x1F7F7B)
  static let onAccent = Tone(light: 0xFFFFFF, dark: 0xFFFFFF)
  static let accentText = Tone(light: 0x00696D, dark: 0x7FD1CC)
  static let rubric = Tone(light: 0xB3261E, dark: 0xF28B82)

  // The colour of the day (Days.Color): the soft tint behind the day card, and the accent of its
  // label. Red, green, purple and white, which is ivory with dark gold.
  static let liturgical: [String: (tint: Tone, accent: Tone)] = [
    "R": (tint: Tone(light: 0xF8E7E5, dark: 0x2A1917), accent: Tone(light: 0xB3261E, dark: 0xF28B82)),
    "V": (tint: Tone(light: 0xDDEEDA, dark: 0x16241A), accent: Tone(light: 0x2E6B30, dark: 0x8CC98F)),
    "M": (tint: Tone(light: 0xEFE8F4, dark: 0x221B2B), accent: Tone(light: 0x6A3D9A, dark: 0xC9A7EB)),
    "B": (tint: Tone(light: 0xF7F1E3, dark: 0x26221A), accent: Tone(light: 0x7A5F14, dark: 0xE3C877)),
  ]

  // Green, the colour of most of the year, when the day is not known
  static func liturgicalColor(_ code: String?) -> (tint: Tone, accent: Tone) {
    liturgical[code ?? ""] ?? liturgical["V"]!
  }
}

// A colour in its light and dark versions, resolved by the colour scheme the widget is drawn in
struct Tone: ShapeStyle {
  let light: UInt32
  let dark: UInt32

  func resolve(in environment: EnvironmentValues) -> Color {
    let rgb = environment.colorScheme == .dark ? dark : light
    return Color(
      .sRGB,
      red: Double((rgb >> 16) & 0xFF) / 255,
      green: Double((rgb >> 8) & 0xFF) / 255,
      blue: Double(rgb & 0xFF) / 255
    )
  }
}
