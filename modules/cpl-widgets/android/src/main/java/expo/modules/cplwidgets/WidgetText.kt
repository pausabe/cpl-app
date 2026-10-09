package expo.modules.cplwidgets

import android.content.Context
import android.graphics.Paint
import android.graphics.Typeface
import android.text.Layout
import android.text.StaticLayout
import android.text.TextPaint
import android.text.TextUtils
import android.util.TypedValue
import kotlin.math.max
import kotlin.math.min

// A widget cannot shrink a text to fit as the iPhone does, and the room it gets changes with every
// launcher and phone: two columns are 130 dp on one and 190 on another. So the sizes are worked out
// here, before the launcher draws them, with the same fonts it draws them with: the size of the spec
// when it fits, smaller when it does not, and fewer lines when there is no height for them.

internal class TextStyle(
  val typeface: Typeface,
  // sp
  val size: Float,
  val letterSpacing: Float = 0f,
  val lineSpacing: Float = 1f
)

// The styles of res/values/styles.xml that are measured: a change there is a change here
internal object TextStyles {
  private val SERIF_BOLD = Typeface.create(Typeface.SERIF, Typeface.BOLD)
  private val SANS_MEDIUM = Typeface.create("sans-serif-medium", Typeface.NORMAL)

  val NAME = TextStyle(SERIF_BOLD, 30f, lineSpacing = 0.85f)
  val ON_ACCENT = TextStyle(Typeface.DEFAULT, 12.5f)
  val ON_ACCENT_DAY = TextStyle(Typeface.DEFAULT, 12f)
  val ON_ACCENT_VESPERS = TextStyle(Typeface.DEFAULT_BOLD, 12f)
  val ON_ACCENT_SUBTITLE = TextStyle(Typeface.DEFAULT_BOLD, 11.5f)
  val DATE = TextStyle(Typeface.DEFAULT, 12.5f)
  val TITLE = TextStyle(SERIF_BOLD, 18f, lineSpacing = 0.9f)
  val CELEBRATION_TYPE = TextStyle(Typeface.DEFAULT_BOLD, 10.5f, letterSpacing = 0.07f)
  val CELEBRATION = TextStyle(Typeface.DEFAULT, 13f)
  val META = TextStyle(Typeface.DEFAULT, 12f)
  val TILE = TextStyle(SANS_MEDIUM, 14f)
  val TILE_COMPACT = TextStyle(SANS_MEDIUM, 13f)
  // The tile of the hour now, in bold (WidgetViews.bold)
  val TILE_NOW = TextStyle(Typeface.DEFAULT_BOLD, 14f)
  val TILE_COMPACT_NOW = TextStyle(Typeface.DEFAULT_BOLD, 13f)
  val TILE_SUBTITLE = TextStyle(Typeface.DEFAULT, 10.5f)
  val CAPTION = TextStyle(Typeface.DEFAULT_BOLD, 10.5f, letterSpacing = 0.08f)
  val PHRASE = TextStyle(Typeface.create(Typeface.SERIF, Typeface.ITALIC), 17f, lineSpacing = 0.97f)
  val FOOTER = TextStyle(Typeface.DEFAULT, 11.5f)
}

internal class TextFit(context: Context) {
  private val metrics = context.resources.displayMetrics
  private val paint = TextPaint(Paint.ANTI_ALIAS_FLAG)

  fun dp(value: Float): Float = value * metrics.density

  // A size in sp in px, with the size of letters chosen in the settings
  fun px(style: TextStyle, sp: Float = style.size): Float =
    TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_SP, sp, metrics)

  // The largest size, up to `max` px, at which `text` fits `width` px in `lines` lines
  fun size(text: String, style: TextStyle, max: Float, width: Float, lines: Int = 1): Float {
    use(style, REFERENCE)
    val widest = if (lines > 1) balanced(text) else paint.measureText(text)
    if (widest <= 0f || width <= 0f) return max
    return min(max, REFERENCE * width * MARGIN / widest)
  }

  // How tall `text` is at `size` px in `width` px, in `maxLines` lines at most
  fun height(text: CharSequence?, style: TextStyle, size: Float, width: Float, maxLines: Int): Float {
    if (text.isNullOrEmpty() || maxLines <= 0) return 0f
    return layout(text, style, size, width, maxLines).height.toFloat()
  }

  fun lines(text: CharSequence, style: TextStyle, size: Float, width: Float): Int =
    layout(text, style, size, width, Int.MAX_VALUE).lineCount

  // The most lines of `text`, up to `most`, that fit in `room` px (0 when not even one does)
  fun linesIn(room: Float, text: CharSequence, style: TextStyle, size: Float, width: Float, most: Int): Int =
    (most downTo 1).firstOrNull { height(text, style, size, width, it) <= room } ?: 0

  // As a TextView of the widget lays it out, with «…» at the end. Simple breaks and no hyphens are
  // what StaticLayout does by default, and what CplWidgetText asks of the TextViews.
  private fun layout(text: CharSequence, style: TextStyle, size: Float, width: Float, maxLines: Int): StaticLayout {
    use(style, size)
    return StaticLayout.Builder.obtain(text, 0, text.length, paint, width.toInt().coerceAtLeast(1))
      .setAlignment(Layout.Alignment.ALIGN_NORMAL)
      .setLineSpacing(0f, style.lineSpacing)
      .setIncludePad(true)
      .setMaxLines(maxLines)
      .setEllipsize(TextUtils.TruncateAt.END)
      .build()
  }

  // Of the ways of cutting `text` in two at a space, the longer line of the most even one
  private fun balanced(text: String): Float {
    var best = paint.measureText(text)
    text.forEachIndexed { i, c ->
      if (c == ' ') best = min(best, max(paint.measureText(text, 0, i), paint.measureText(text, i + 1, text.length)))
    }
    return best
  }

  private fun use(style: TextStyle, size: Float) {
    paint.typeface = style.typeface
    paint.textSize = size
    paint.letterSpacing = style.letterSpacing
  }

  private companion object {
    const val REFERENCE = 100f
    // What a launcher draws can be a hair wider than what is measured here
    const val MARGIN = 0.96f
  }
}
