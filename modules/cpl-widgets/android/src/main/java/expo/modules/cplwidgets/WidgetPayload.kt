package expo.modules.cplwidgets

import android.content.Context
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject

// What the app leaves for the widgets (WidgetPayload in src/view-models/widgets.ts): the bands of
// the hours and the words of the next two weeks, one JSON string in the preferences «cpl_widgets».
// The widgets read it by themselves, with the app closed. What they do not understand they leave
// out: a newer app may write more than this version knows, and the rest must still show.

internal val HOURS = listOf("ofici", "laudes", "tercia", "sexta", "nona", "vespres", "completes")

// From the hour `from` (included) to `to` (not included), local time, the widgets show `hour`:
// «Ara» when `now`, and the liturgy of the day before when `yesterday`
internal data class Band(val from: Int, val to: Int, val hour: String, val now: Boolean, val yesterday: Boolean)

internal data class Celebration(val type: String, val title: String, val short: String, val muted: Boolean)

internal data class Gospel(val caption: String, val phrase: String, val opens: String)

internal data class Day(
  // YYYY-MM-DD
  val date: String,
  // «Divendres, 9 d’octubre»; empty when the app did not write it
  val dateText: String,
  // «Divendres 9 oct.»
  val shortDate: String,
  // «Setmana XXVII de durant l'any»; null for the days the app has not written
  val title: String?,
  // «Any A · Setmana III del salteri»
  val meta: String?,
  // R, V, M or B
  val color: String,
  val celebration: Celebration?,
  // The title of the first Vespers, under «Vespres»
  val vespers: String?,
  val gospel: Gospel?
)

internal class Payload(val bands: List<Band>, val hourNames: Map<String, String>, val days: List<Day>)

internal object WidgetStore {
  private const val PREFERENCES = "cpl_widgets"
  private const val PAYLOAD = "payload"
  private val COLORS = setOf("R", "V", "M", "B")
  private val ISO_DATE = Regex("""\d{4}-\d{2}-\d{2}""")

  // The bands of widgetBands() in widgets.ts, for when the app has written none: Completes until 2 h
  // (of the day before), the Office of Readings without «Ara» until 6 h, and then the hours of the home
  val BANDS = listOf(
    Band(0, 2, "completes", now = true, yesterday = true),
    Band(2, 6, "ofici", now = false, yesterday = false),
    Band(6, 9, "laudes", now = true, yesterday = false),
    Band(9, 12, "tercia", now = true, yesterday = false),
    Band(12, 15, "sexta", now = true, yesterday = false),
    Band(15, 18, "nona", now = true, yesterday = false),
    Band(18, 24, "vespres", now = true, yesterday = false)
  )

  fun save(context: Context, json: String) {
    preferences(context).edit().putString(PAYLOAD, json).apply()
  }

  fun load(context: Context): Payload? = parse(preferences(context).getString(PAYLOAD, null))

  fun parse(json: String?): Payload? {
    if (json.isNullOrEmpty()) return null
    return try {
      val root = JSONObject(json)
      Payload(bands(root.optJSONArray("bands")), hourNames(root.optJSONObject("hourNames")), days(root.optJSONArray("days")))
    } catch (e: JSONException) {
      null
    }
  }

  // All of them or none: bands with an hour this version does not know, or with holes, would leave
  // some hour of the day without a widget
  private fun bands(json: JSONArray?): List<Band> {
    if (json == null || json.length() == 0) return BANDS
    val bands = objects(json).map { band ->
      Band(
        band.optInt("from", -1),
        band.optInt("to", -1),
        band.optString("hour"),
        band.optBoolean("now", true),
        band.optBoolean("yesterday", false)
      )
    }
    val valid = bands.all { it.hour in HOURS && it.from in 0..23 && it.to in (it.from + 1)..24 } &&
      (0..23).all { hour -> bands.any { hour >= it.from && hour < it.to } }
    return if (valid) bands else BANDS
  }

  private fun hourNames(json: JSONObject?): Map<String, String> {
    if (json == null) return emptyMap()
    return HOURS.mapNotNull { hour -> json.text(hour)?.let { hour to it } }.toMap()
  }

  private fun days(json: JSONArray?): List<Day> {
    if (json == null) return emptyList()
    return objects(json).mapNotNull(::day)
  }

  private fun day(json: JSONObject): Day? {
    val date = json.text("date")?.takeIf { ISO_DATE.matches(it) } ?: return null
    return Day(
      date = date,
      dateText = json.text("dateText") ?: "",
      shortDate = json.text("shortDate") ?: "",
      title = json.text("title"),
      meta = json.text("meta"),
      color = json.text("color")?.takeIf { it in COLORS } ?: "V",
      celebration = json.optJSONObject("celebration")?.let { celebration ->
        val title = celebration.text("title") ?: return@let null
        Celebration(
          celebration.text("type") ?: "",
          title,
          celebration.text("short") ?: title,
          celebration.optBoolean("muted", false)
        )
      },
      vespers = json.text("vespers"),
      gospel = json.optJSONObject("gospel")?.let { gospel ->
        val phrase = gospel.text("phrase") ?: return@let null
        Gospel(gospel.text("caption") ?: "", phrase, gospel.text("opens") ?: "Evangeli")
      }
    )
  }

  private fun objects(json: JSONArray): List<JSONObject> = (0 until json.length()).mapNotNull { json.optJSONObject(it) }

  // optString gives "null" for a null and "" for what is missing: both are nothing here
  private fun JSONObject.text(name: String): String? =
    if (isNull(name)) null else optString(name).takeIf { it.isNotEmpty() }

  private fun preferences(context: Context) =
    context.applicationContext.getSharedPreferences(PREFERENCES, Context.MODE_PRIVATE)
}
