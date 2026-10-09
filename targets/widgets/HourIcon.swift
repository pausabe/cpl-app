import SwiftUI

// The icons of the hours, drawn from the same SVG paths as src/components/HourIcon.tsx (viewBox
// 0 0 24 24, round caps and joins): an arc with the sun at each place of the day, rising at
// Laudes, at the top at Sexta, setting at Vespres. Completes is the moon and the Office of
// Readings, the book. They take the colour of the foreground style.
struct HourIcon: View {
  let hour: HourKey
  let size: CGFloat

  private static let book = SVGPath.parse(
    "M12 7.5C10.4 5.9 8 5 3 5v13c5 0 7.4.9 9 2.5 1.6-1.6 4-2.5 9-2.5V5c-5 0-7.4.9-9 2.5zM12 7.5V20"
  )
  private static let moon = SVGPath.parse("M19.5 14.2A7.5 7.5 0 1 1 9.8 4.5a6 6 0 0 0 9.7 9.7z")
  private static let arc = SVGPath.parse("M3 19a9 9 0 0 1 18 0")
  private static let horizon = SVGPath.parse("M1.5 19h21")

  private static let sun: [HourKey: CGPoint] = [
    .laudes: CGPoint(x: 3.6, y: 16.2),
    .tercia: CGPoint(x: 5.6, y: 12.6),
    .sexta: CGPoint(x: 12, y: 10),
    .nona: CGPoint(x: 18.4, y: 12.6),
    .vespres: CGPoint(x: 20.4, y: 16.2),
  ]

  var body: some View {
    let scale = size / 24
    ZStack {
      switch hour {
      case .ofici:
        IconShape(path: Self.book).stroke(style: line(1.7 * scale))
      case .completes:
        IconShape(path: Self.moon).stroke(style: line(1.7 * scale))
      default:
        IconShape(path: Self.arc).stroke(style: line(1.6 * scale, dash: [1.6 * scale, 2.4 * scale]))
        IconShape(path: Self.horizon).stroke(style: line(1.6 * scale))
        let center = Self.sun[hour] ?? CGPoint(x: 12, y: 10)
        IconShape(path: Path(ellipseIn: CGRect(x: center.x - 2.4, y: center.y - 2.4, width: 4.8, height: 4.8))).fill()
      }
    }
    .frame(width: size, height: size)
    .accessibilityHidden(true)
  }

  private func line(_ width: CGFloat, dash: [CGFloat] = []) -> StrokeStyle {
    StrokeStyle(lineWidth: width, lineCap: .round, lineJoin: .round, dash: dash)
  }
}

// A path of the 24 × 24 box of the icons, scaled to the frame it is given
private struct IconShape: Shape {
  let path: Path

  func path(in rect: CGRect) -> Path {
    let scale = min(rect.width, rect.height) / 24
    return path.applying(CGAffineTransform(translationX: rect.minX, y: rect.minY).scaledBy(x: scale, y: scale))
  }
}

// The few SVG path commands the icons use (M L H V C A Z, absolute and relative), so that the
// paths here are written exactly as in HourIcon.tsx. Arcs are turned into Bézier curves as the
// SVG specification says (appendix F.6), without the rotation of the ellipse, which they do not use.
enum SVGPath {
  private enum Token {
    case command(Character)
    case number(CGFloat)
  }

  static func parse(_ d: String) -> Path {
    let tokens = tokenize(d)
    var path = Path()
    var index = 0
    var command: Character = "M"
    var current = CGPoint.zero
    var start = CGPoint.zero

    func take(_ count: Int) -> [CGFloat]? {
      guard index + count <= tokens.count else { return nil }
      var values: [CGFloat] = []
      for token in tokens[index..<index + count] {
        guard case .number(let value) = token else { return nil }
        values.append(value)
      }
      index += count
      return values
    }

    while index < tokens.count {
      if case .command(let letter) = tokens[index] {
        command = letter
        index += 1
        if letter == "z" || letter == "Z" {
          path.closeSubpath()
          current = start
          continue
        }
      }
      let relative = command.isLowercase
      let origin = relative ? current : .zero
      func point(_ x: CGFloat, _ y: CGFloat) -> CGPoint { CGPoint(x: origin.x + x, y: origin.y + y) }

      switch command.uppercased() {
      case "M":
        guard let v = take(2) else { return path }
        current = point(v[0], v[1])
        start = current
        path.move(to: current)
        // Pairs after a moveto are lines
        command = relative ? "l" : "L"
      case "L":
        guard let v = take(2) else { return path }
        current = point(v[0], v[1])
        path.addLine(to: current)
      case "H":
        guard let v = take(1) else { return path }
        current = CGPoint(x: (relative ? current.x : 0) + v[0], y: current.y)
        path.addLine(to: current)
      case "V":
        guard let v = take(1) else { return path }
        current = CGPoint(x: current.x, y: (relative ? current.y : 0) + v[0])
        path.addLine(to: current)
      case "C":
        guard let v = take(6) else { return path }
        let end = point(v[4], v[5])
        path.addCurve(to: end, control1: point(v[0], v[1]), control2: point(v[2], v[3]))
        current = end
      case "A":
        guard let v = take(7) else { return path }
        let end = point(v[5], v[6])
        addArc(&path, from: current, to: end, rx: v[0], ry: v[1], large: v[3] != 0, sweep: v[4] != 0)
        current = end
      default:
        return path
      }
    }
    return path
  }

  private static func tokenize(_ d: String) -> [Token] {
    var tokens: [Token] = []
    var number = ""
    func flush() {
      if let value = Double(number) { tokens.append(.number(CGFloat(value))) }
      number = ""
    }
    for character in d {
      if character.isLetter && character != "e" && character != "E" {
        flush()
        tokens.append(.command(character))
      } else if character == "-" || character == "+" {
        // A sign starts a number, except in an exponent
        if number.last != "e" && number.last != "E" { flush() }
        number.append(character)
      } else if character == "." {
        // «7.4.9» is 7.4 and .9
        if number.contains(".") { flush() }
        number.append(character)
      } else if character.isNumber || character == "e" || character == "E" {
        number.append(character)
      } else {
        flush()
      }
    }
    flush()
    return tokens
  }

  private static func addArc(
    _ path: inout Path, from p1: CGPoint, to p2: CGPoint, rx: CGFloat, ry: CGFloat, large: Bool, sweep: Bool
  ) {
    guard p1 != p2 else { return }
    var rx = abs(rx)
    var ry = abs(ry)
    guard rx > 0, ry > 0 else {
      path.addLine(to: p2)
      return
    }
    let dx = (p1.x - p2.x) / 2
    let dy = (p1.y - p2.y) / 2
    // Radii too small for the two points are scaled up until they reach
    let lambda = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry)
    if lambda > 1 {
      rx *= lambda.squareRoot()
      ry *= lambda.squareRoot()
    }
    let numerator = rx * rx * ry * ry - rx * rx * dy * dy - ry * ry * dx * dx
    let denominator = rx * rx * dy * dy + ry * ry * dx * dx
    let coefficient = (large == sweep ? -1 : 1) * max(0, numerator / denominator).squareRoot()
    let cx = coefficient * rx * dy / ry
    let cy = -coefficient * ry * dx / rx
    let center = CGPoint(x: cx + (p1.x + p2.x) / 2, y: cy + (p1.y + p2.y) / 2)

    let startAngle = atan2((dy - cy) / ry, (dx - cx) / rx)
    var delta = atan2((-dy - cy) / ry, (-dx - cx) / rx) - startAngle
    if sweep && delta < 0 {
      delta += 2 * .pi
    } else if !sweep && delta > 0 {
      delta -= 2 * .pi
    }

    // A cubic for every quarter of a turn or less
    let segments = max(1, Int((abs(delta) / (.pi / 2)).rounded(.up)))
    let step = delta / CGFloat(segments)
    let k = 4 / 3 * tan(step / 4)
    var angle = startAngle
    for _ in 0..<segments {
      let next = angle + step
      let from = CGPoint(x: center.x + rx * cos(angle), y: center.y + ry * sin(angle))
      let to = CGPoint(x: center.x + rx * cos(next), y: center.y + ry * sin(next))
      path.addCurve(
        to: to,
        control1: CGPoint(x: from.x - k * rx * sin(angle), y: from.y + k * ry * cos(angle)),
        control2: CGPoint(x: to.x + k * rx * sin(next), y: to.y - k * ry * cos(next))
      )
      angle = next
    }
  }
}
