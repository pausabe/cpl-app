package expo.modules.cplwidgets

import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.Typeface
import android.net.Uri
import android.os.Build
import android.text.SpannableString
import android.text.Spanned
import android.text.style.StyleSpan
import android.text.style.TypefaceSpan
import android.util.SizeF
import android.util.TypedValue
import android.view.View
import android.widget.RemoteViews
import java.util.Locale
import kotlin.math.max

// What each widget shows at a moment, for one size in dp. Everything that can change is set here,
// every time; the layouts hold the rest, and a sample day for the list of widgets.
//
// Colours: those of the layouts and their drawables come from the resources, light or dark as the
// launcher draws. Those chosen here (textColor) too from Android 12; before, they are resolved in
// this process, which follows the system as well but keeps them until the next update if the mode
// changes in between. The white of the teal is the same in both.
internal class WidgetViews(private val context: Context, private val moment: WidgetMoment) {
  private val fit = TextFit(context)
  private val packageName = context.packageName
  private val white = context.getColor(R.color.cw_on_accent)

  fun build(kind: WidgetKind, size: SizeF): RemoteViews = when (kind) {
    WidgetKind.ARA -> ara(size)
    // Four rows tall, «Avui» has room for all the hours
    WidgetKind.AVUI -> if (size.width >= HORES_WIDTH && size.height >= AVUI_AS_HORES) hores(size) else avui(size)
    WidgetKind.HORES -> hores(size)
    WidgetKind.PARAULA -> paraula(size)
  }

  // --- L'hora d'ara: the hour, big, on the teal, and under it the date and the day ----------------

  private fun ara(size: SizeF): RemoteViews {
    val views = RemoteViews(packageName, R.layout.cw_ara)
    val day = moment.day
    val hour = moment.hour
    val width = fit.dp(size.width - 30f)
    views.setImageViewResource(R.id.cw_icon, icon(hour))
    views.setViewVisibility(R.id.cw_now, visible(moment.band.now))
    // Under the padding and the icon
    var room = fit.dp(size.height - 30f - 30f)
    room -= name(views, R.id.cw_name, hour, width) { ARA_NAME[it] ?: 30f }
    views.setTextViewText(R.id.cw_short_date, day.shortDate)
    room -= fit.dp(6f) + fit.height(day.shortDate, TextStyles.ON_ACCENT, fit.px(TextStyles.ON_ACCENT), width, 1)
    // At Vespers, the first Vespers of a feast; else the celebration of the day if it is kept, or the day
    val vespers = day.vespers.takeIf { hour == "vespres" }
    val what = vespers ?: day.celebration?.takeUnless { it.muted }?.short ?: day.title
    val (shown, hidden) = if (vespers != null) R.id.cw_what_vespers to R.id.cw_what else R.id.cw_what to R.id.cw_what_vespers
    val style = if (vespers != null) TextStyles.ON_ACCENT_VESPERS else TextStyles.ON_ACCENT_DAY
    val lines = what?.let { fit.linesIn(room - fit.dp(2f), it, style, fit.px(style), width, 2) } ?: 0
    views.setViewVisibility(hidden, View.GONE)
    show(views, shown, what.takeIf { lines > 0 })
    if (lines > 0) views.setInt(shown, "setMaxLines", lines)
    opens(views, android.R.id.background, hourLink(hour), hourLabel(hour, moment.band.now))
    return views
  }

  // --- Avui: the day on its colour, and the hour now on a teal tile --------------------------------

  private fun avui(size: SizeF): RemoteViews {
    val views = RemoteViews(packageName, R.layout.cw_avui)
    views.setInt(android.R.id.background, "setBackgroundResource", dayBackground(moment.day.color))
    // The two columns share what the paddings and the gap leave, as 55 and 45 (cw_avui.xml)
    val columns = size.width - 16f - 12f - 10f
    day(views, fit.dp(columns * 0.55f), fit.dp(size.height - 24f - 4f))
    opens(views, R.id.cw_day, TODAY, dayLabel())

    val hour = moment.hour
    val width = fit.dp(columns * 0.45f - 24f)
    views.setImageViewResource(R.id.cw_icon, icon(hour))
    views.setViewVisibility(R.id.cw_now, visible(moment.band.now))
    var room = fit.dp(size.height - 24f - 24f - 28f)
    room -= name(views, R.id.cw_name, hour, width) { AVUI_NAME[it] ?: 23f }
    val vespers = moment.day.vespers.takeIf { hour == "vespres" }
    val style = TextStyles.ON_ACCENT_SUBTITLE
    show(views, R.id.cw_vespers, vespers.takeIf { fit.dp(3f) + fit.height(it, style, fit.px(style), width, 1) <= room })
    opens(views, R.id.cw_now_tile, hourLink(hour), hourLabel(hour, moment.band.now))
    return views
  }

  // --- Les hores: the card of the day and the seven hours, in three rows ---------------------------

  private fun hores(size: SizeF): RemoteViews {
    val views = RemoteViews(packageName, R.layout.cw_hores)
    views.setInt(R.id.cw_card, "setBackgroundResource", cardBackground(moment.day.color))
    val width = size.width - 24f
    // The card gives up lines before the rows of the hours get lower than MIN_ROW
    val card = day(views, fit.dp(width - 30f), fit.dp(size.height - 24f - 26f - 10f - 14f - 3 * MIN_ROW))
    opens(views, R.id.cw_card, TODAY, dayLabel())
    val row = fit.dp((size.height - 24f - 26f - 10f - 14f) / 3f) - card / 3f

    // What is left for the names next to the icons, in the rows of two and in the one of three
    val wide = fit.dp((width - 7f) / 2f - 20f - 22f - 8f)
    val narrow = fit.dp((width - 14f) / 3f - 12f - 19f - 6f)
    val now = moment.hour.takeIf { moment.band.now }
    val wideSize = labelSize(TILES.filter { !it.compact }, now, wide, TextStyles.TILE, TextStyles.TILE_NOW)
    val narrowSize = labelSize(TILES.filter { it.compact }, now, narrow, TextStyles.TILE_COMPACT, TextStyles.TILE_COMPACT_NOW)
    for (tile in TILES) {
      val isNow = tile.hour == now
      val name = moment.name(tile.hour)
      views.setImageViewResource(tile.icon, icon(tile.hour))
      views.setTextViewText(tile.label, if (isNow) bold(name) else name)
      views.setTextViewTextSize(tile.label, TypedValue.COMPLEX_UNIT_PX, if (tile.compact) narrowSize else wideSize)
      if (isNow) {
        views.setInt(tile.tile, "setBackgroundResource", R.drawable.cw_tile_now)
        views.setInt(tile.icon, "setColorFilter", white)
        views.setTextColor(tile.label, white)
      }
      opens(views, tile.tile, hourLink(tile.hour), hourLabel(tile.hour, isNow))
    }

    // Under «Vespres», the first Vespers of a feast, when the tile is tall enough for two lines
    val vespers = moment.day.vespers
    val label = fit.height(moment.name("vespres"), TextStyles.TILE, wideSize, wide, 1)
    val subtitle = TextStyles.TILE_SUBTITLE
    show(views, R.id.cw_tile_vespres_subtitle, vespers.takeIf { label + fit.height(it, subtitle, fit.px(subtitle), wide, 1) <= row - fit.dp(4f) })
    if (now == "vespres") views.setTextColor(R.id.cw_tile_vespres_subtitle, white)
    return views
  }

  // One size for all the names of a row, so that they look alike: the largest at which all of them
  // fit, and never much smaller than the spec (then they end in «…»)
  private fun labelSize(tiles: List<Tile>, now: String?, width: Float, style: TextStyle, nowStyle: TextStyle): Float {
    val most = fit.px(style)
    val sizes = tiles.map { tile ->
      val name = moment.name(tile.hour)
      fit.size(name, if (tile.hour == now) nowStyle else style, most, width)
    }
    return max(sizes.minOrNull() ?: most, most * 0.8f)
  }

  // --- La Paraula d'avui: the phrase of the Gospel of the day ---------------------------------------

  private fun paraula(size: SizeF): RemoteViews {
    val views = RemoteViews(packageName, R.layout.cw_paraula)
    val day = moment.day
    val gospel = day.gospel
    val width = fit.dp(size.width - 36f)
    val caption = (gospel?.caption?.ifEmpty { null } ?: context.getString(R.string.cw_gospel)).uppercase(CATALAN)
    val phrase = gospel?.let { "«${it.phrase}»" } ?: context.getString(R.string.cw_gospel_missing)
    views.setTextViewText(R.id.cw_caption, caption)
    views.setTextViewText(R.id.cw_phrase, phrase)
    views.setTextViewText(R.id.cw_footer_date, day.dateText)
    textColor(views, R.id.cw_phrase, if (gospel != null) R.color.cw_text else R.color.cw_text2)

    // The size by its length, as on the iPhone (shorter, bigger), and smaller only when the whole
    // phrase does not fit in the lines there is room for
    val room = fit.dp(size.height - 30f - 7f - 4f) -
      fit.height(caption, TextStyles.CAPTION, fit.px(TextStyles.CAPTION), width, 1) -
      fit.height(day.dateText, TextStyles.FOOTER, fit.px(TextStyles.FOOTER), width, 1)
    val length = gospel?.phrase?.length ?: phrase.length
    val spec = when {
      length < 50 -> 20f
      length < 95 -> 17f
      else -> 15f
    }
    val style = TextStyles.PHRASE
    val sizes = PHRASE_SIZES.filter { it <= spec }.map { fit.px(style, it) }
    val whole = sizes.firstOrNull { size ->
      fit.lines(phrase, style, size, width) <= fit.linesIn(room, phrase, style, size, width, 4)
    }
    val chosen = whole ?: sizes.last()
    views.setTextViewTextSize(R.id.cw_phrase, TypedValue.COMPLEX_UNIT_PX, chosen)
    views.setInt(R.id.cw_phrase, "setMaxLines", max(1, fit.linesIn(room, phrase, style, chosen, width, 4)))

    val link = gospel?.let { Link("cpl://mass/${Uri.encode(it.opens)}?day=${moment.dayDate}", MASS) } ?: TODAY
    opens(views, android.R.id.background, link, gospel?.let { context.getString(R.string.cw_gospel_label, it.phrase) } ?: phrase)
    return views
  }

  // --- The day, as on the card of the home -----------------------------------------------------------

  // With little height, the celebration and then the title lose lines, and the year and the week of
  // the psalter go. Gives the height it takes.
  private fun day(views: RemoteViews, width: Float, height: Float): Float {
    val day = moment.day
    views.setTextViewText(R.id.cw_date, day.dateText)
    show(views, R.id.cw_title, day.title)
    val date = fit.height(day.dateText, TextStyles.DATE, fit.px(TextStyles.DATE), width, 1)
    val title = { lines: Int ->
      if (day.title == null) 0f else fit.dp(3f) + fit.height(day.title, TextStyles.TITLE, fit.px(TextStyles.TITLE), width, lines)
    }
    val celebration = day.celebration
    if (celebration == null) {
      views.setViewVisibility(R.id.cw_celebration, View.GONE)
      val titleLines = if (date + title(2) <= height) 2 else 1
      val meta = day.meta?.let { fit.dp(4f) + fit.height(it, TextStyles.META, fit.px(TextStyles.META), width, 1) }
      val withMeta = meta != null && date + title(titleLines) + meta <= height
      views.setInt(R.id.cw_title, "setMaxLines", titleLines)
      show(views, R.id.cw_meta, day.meta.takeIf { withMeta })
      return date + title(titleLines) + (if (withMeta) meta ?: 0f else 0f)
    }

    val type = celebration.type.uppercase(CATALAN)
    show(views, R.id.cw_celebration_type, type.ifEmpty { null })
    views.setTextViewText(R.id.cw_celebration_title, celebration.title)
    // A memorial that is not being kept is grey, as on the home
    textColor(views, R.id.cw_celebration_type, if (celebration.muted) R.color.cw_text3 else accent(day.color))
    textColor(views, R.id.cw_celebration_title, if (celebration.muted) R.color.cw_text3 else R.color.cw_text)
    views.setViewVisibility(R.id.cw_meta, View.GONE)
    // The hairline with its margins, and the type
    val head = fit.dp(15f) + fit.height(type, TextStyles.CELEBRATION_TYPE, fit.px(TextStyles.CELEBRATION_TYPE), width, 1)
    val named = { lines: Int ->
      if (lines <= 0) 0f else fit.dp(1f) + fit.height(celebration.title, TextStyles.CELEBRATION, fit.px(TextStyles.CELEBRATION), width, lines)
    }
    val taken = { choice: Pair<Int, Int> ->
      date + title(choice.first) + (if (choice.second < 0) 0f else head + named(choice.second))
    }
    // Lines of the title and of the celebration; -1, the celebration left out
    val choice = CELEBRATION_LINES.firstOrNull { taken(it) <= height } ?: CELEBRATION_LINES.last()
    views.setInt(R.id.cw_title, "setMaxLines", choice.first)
    views.setViewVisibility(R.id.cw_celebration, visible(choice.second >= 0))
    views.setViewVisibility(R.id.cw_celebration_title, visible(choice.second > 0))
    if (choice.second > 0) views.setInt(R.id.cw_celebration_title, "setMaxLines", choice.second)
    return taken(choice)
  }

  // --- Pieces --------------------------------------------------------------------------------------

  // The name of the hour on the teal, as big as the spec and the width allow; the Office of Readings
  // in two lines. Gives the height it takes.
  private fun name(views: RemoteViews, id: Int, hour: String, width: Float, spec: (String) -> Float): Float {
    val name = moment.name(hour)
    val lines = if (hour == "ofici") 2 else 1
    val size = fit.size(name, TextStyles.NAME, fit.px(TextStyles.NAME, spec(hour)), width, lines)
    views.setTextViewText(id, name)
    views.setTextViewTextSize(id, TypedValue.COMPLEX_UNIT_PX, size)
    views.setInt(id, "setMaxLines", lines)
    return fit.height(name, TextStyles.NAME, size, width, lines)
  }

  // A touch opens the app there (the links of widgets.ts, which the app's scheme «cpl» receives)
  private fun opens(views: RemoteViews, id: Int, link: Link, label: String) {
    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(link.uri))
      .setPackage(packageName)
      .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    val flags = PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
    views.setOnClickPendingIntent(id, PendingIntent.getActivity(context, link.request, intent, flags))
    views.setContentDescription(id, label)
  }

  private fun hourLink(hour: String) = Link("cpl://hour/$hour?day=${moment.dayDate}", HOUR + HOURS.indexOf(hour))

  // «Laudes, ara», or just «Ofici de lectura»
  private fun hourLabel(hour: String, now: Boolean): String {
    val name = moment.name(hour)
    return if (now) context.getString(R.string.cw_hour_now, name) else name
  }

  // «Divendres, 9 d’octubre. Setmana XXVII de durant l'any. Memòria lliure Sants Dionís, …»
  private fun dayLabel(): String {
    val day = moment.day
    val celebration = day.celebration?.let { "${it.type} ${it.title}".trim() }
    return listOfNotNull(day.dateText, day.title, celebration).joinToString(". ")
  }

  // A colour that is not the same in dark mode (see the top of the file). From Android 12 the
  // launcher resolves the resource every time it draws.
  private fun textColor(views: RemoteViews, id: Int, color: Int) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      views.setColor(id, "setTextColor", color)
    } else {
      views.setTextColor(id, context.getColor(color))
    }
  }

  private fun show(views: RemoteViews, id: Int, text: CharSequence?) {
    views.setViewVisibility(id, visible(text != null))
    if (text != null) views.setTextViewText(id, text)
  }

  // The name of the tile of the hour now: bold, from the regular sans and not from the medium one of
  // the other tiles, which would make it heavier than bold
  private fun bold(text: String) = SpannableString(text).apply {
    setSpan(TypefaceSpan("sans-serif"), 0, length, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
    setSpan(StyleSpan(Typeface.BOLD), 0, length, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
  }

  private class Link(val uri: String, val request: Int)

  private class Tile(val hour: String, val tile: Int, val icon: Int, val label: Int, val compact: Boolean = false)

  private companion object {
    // «Avui» becomes «Les hores» from this height in dp: between three rows (about 340 dp on a phone
    // upright) and four (about 450)
    const val AVUI_AS_HORES = 340f
    const val HORES_WIDTH = 250f
    // The lowest a row of hours gets before the card of the day gives up lines, in dp
    const val MIN_ROW = 36f

    // Request codes of the touches: one for each place they open
    const val TODAY_REQUEST = 1
    const val MASS = 2
    const val HOUR = 10
    val TODAY = Link("cpl://today", TODAY_REQUEST)

    val CATALAN: Locale = Locale.forLanguageTag("ca")

    // The sizes of the names on the teal in sp, where they are not 30 (L'hora d'ara) or 23 (Avui)
    val ARA_NAME = mapOf("ofici" to 22f, "completes" to 25f, "vespres" to 28f)
    val AVUI_NAME = mapOf("ofici" to 19f, "completes" to 21f)
    val PHRASE_SIZES = listOf(20f, 17f, 15f, 13f)
    val CELEBRATION_LINES = listOf(2 to 2, 2 to 1, 1 to 1, 1 to 0, 1 to -1)

    val TILES = listOf(
      Tile("ofici", R.id.cw_tile_ofici, R.id.cw_tile_ofici_icon, R.id.cw_tile_ofici_label),
      Tile("laudes", R.id.cw_tile_laudes, R.id.cw_tile_laudes_icon, R.id.cw_tile_laudes_label),
      Tile("tercia", R.id.cw_tile_tercia, R.id.cw_tile_tercia_icon, R.id.cw_tile_tercia_label, compact = true),
      Tile("sexta", R.id.cw_tile_sexta, R.id.cw_tile_sexta_icon, R.id.cw_tile_sexta_label, compact = true),
      Tile("nona", R.id.cw_tile_nona, R.id.cw_tile_nona_icon, R.id.cw_tile_nona_label, compact = true),
      Tile("vespres", R.id.cw_tile_vespres, R.id.cw_tile_vespres_icon, R.id.cw_tile_vespres_label),
      Tile("completes", R.id.cw_tile_completes, R.id.cw_tile_completes_icon, R.id.cw_tile_completes_label)
    )

    fun visible(shown: Boolean) = if (shown) View.VISIBLE else View.GONE

    fun icon(hour: String) = when (hour) {
      "ofici" -> R.drawable.cw_hour_ofici
      "laudes" -> R.drawable.cw_hour_laudes
      "tercia" -> R.drawable.cw_hour_tercia
      "sexta" -> R.drawable.cw_hour_sexta
      "nona" -> R.drawable.cw_hour_nona
      "vespres" -> R.drawable.cw_hour_vespres
      else -> R.drawable.cw_hour_completes
    }

    fun dayBackground(color: String) = when (color) {
      "R" -> R.drawable.cw_widget_day_r
      "M" -> R.drawable.cw_widget_day_m
      "B" -> R.drawable.cw_widget_day_b
      else -> R.drawable.cw_widget_day_v
    }

    fun cardBackground(color: String) = when (color) {
      "R" -> R.drawable.cw_card_day_r
      "M" -> R.drawable.cw_card_day_m
      "B" -> R.drawable.cw_card_day_b
      else -> R.drawable.cw_card_day_v
    }

    fun accent(color: String) = when (color) {
      "R" -> R.color.cw_accent_r
      "M" -> R.color.cw_accent_m
      "B" -> R.color.cw_accent_b
      else -> R.color.cw_accent_v
    }
  }
}
