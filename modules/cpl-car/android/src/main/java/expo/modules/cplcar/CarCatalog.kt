package expo.modules.cplcar

import android.content.Context
import android.net.Uri
import android.os.Bundle
import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import org.json.JSONObject

// What the car can choose: the hours of today whose words the app has ready (it writes this list
// every time it opens, see src/controllers/carController.ts), and «Continua escoltant» with the hour
// left halfway. It is kept on the phone, so that Android Auto can show it with the app closed.
object CarCatalog {
  const val ROOT = "root"
  // The one tab of the car: the hours of today. A car shows the children of the root as tabs, and
  // only folders there.
  const val TODAY = "today"
  const val CONTINUE = "continue"
  // Shown when the app has not prepared today yet: it opens an empty folder
  const val OPEN_THE_APP = "open-the-app"
  private const val PREFERENCES = "cpl-car"
  private const val CATALOG = "catalog"
  private const val CAR_USED = "car-used"

  data class Entry(val id: String, val title: String, val subtitle: String)

  data class Catalog(val day: String?, val items: List<Entry>, val current: Entry?)

  fun save(context: Context, json: String) {
    preferences(context).edit().putString(CATALOG, json).apply()
  }

  fun load(context: Context): Catalog {
    val json = preferences(context).getString(CATALOG, null) ?: return Catalog(null, emptyList(), null)
    return try {
      val root = JSONObject(json)
      val items = root.optJSONArray("items")
      val entries = (0 until (items?.length() ?: 0)).mapNotNull { i -> entry(items!!.optJSONObject(i)) }
      Catalog(root.optString("day").ifEmpty { null }, entries, entry(root.optJSONObject("current")))
    } catch (e: Exception) {
      Catalog(null, emptyList(), null)
    }
  }

  private fun entry(json: JSONObject?): Entry? {
    if (json == null) return null
    val id = json.optString("id")
    if (id.isEmpty()) return null
    return Entry(id, json.optString("title"), json.optString("subtitle"))
  }

  // Android Auto has opened the app at least once on this phone: from then on, the app prepares the
  // hours of the day every time it opens
  fun markCarUsed(context: Context) {
    preferences(context).edit().putBoolean(CAR_USED, true).apply()
  }

  fun carUsed(context: Context): Boolean = preferences(context).getBoolean(CAR_USED, false)

  private fun preferences(context: Context) =
    context.applicationContext.getSharedPreferences(PREFERENCES, Context.MODE_PRIVATE)

  // --- As the car sees them -----------------------------------------------------------------------

  fun root(): MediaItem = folder(ROOT, "CPL")

  // The root: «Avui», or, if the app has not prepared today yet, a folder that says what to do
  fun children(context: Context, parentId: String, today: String): List<MediaItem> {
    val hours = hours(context, today)
    return when (parentId) {
      ROOT ->
        if (hours.isEmpty()) listOf(folder(OPEN_THE_APP, "Obre l'app CPL al mòbil", "Hi prepara les hores d'avui"))
        else listOf(folder(TODAY, "Avui"))
      TODAY -> hours
      else -> emptyList()
    }
  }

  private fun hours(context: Context, today: String): List<MediaItem> {
    val catalog = load(context)
    val items = mutableListOf<MediaItem>()
    catalog.current?.let { items.add(playable(context, CONTINUE, it.title, it.subtitle)) }
    if (catalog.day == today) {
      catalog.items.forEach { items.add(playable(context, it.id, it.title, it.subtitle)) }
    }
    return items
  }

  fun item(context: Context, today: String, id: String): MediaItem? =
    when (id) {
      ROOT -> root()
      TODAY -> folder(TODAY, "Avui")
      else -> hours(context, today).firstOrNull { it.mediaId == id }
    }

  private fun artwork(context: Context): Uri =
    Uri.parse("android.resource://${context.packageName}/mipmap/ic_launcher")

  private fun playable(context: Context, id: String, title: String, subtitle: String): MediaItem =
    MediaItem.Builder()
      .setMediaId(id)
      .setMediaMetadata(
        MediaMetadata.Builder()
          .setTitle(title)
          .setDisplayTitle(title)
          .setSubtitle(subtitle)
          .setArtist(subtitle)
          .setArtworkUri(artwork(context))
          .setIsBrowsable(false)
          .setIsPlayable(true)
          .setMediaType(MediaMetadata.MEDIA_TYPE_PODCAST_EPISODE)
          .build()
      )
      .build()

  // As a list, not as a grid of pictures: the hours are words
  private fun listStyle(): Bundle = Bundle().apply {
    putInt("android.media.browse.CONTENT_STYLE_BROWSABLE_HINT", 1)
    putInt("android.media.browse.CONTENT_STYLE_PLAYABLE_HINT", 1)
  }

  private fun folder(id: String, title: String, subtitle: String? = null): MediaItem =
    MediaItem.Builder()
      .setMediaId(id)
      .setMediaMetadata(
        MediaMetadata.Builder()
          .setTitle(title)
          .setSubtitle(subtitle)
          .setIsBrowsable(true)
          .setIsPlayable(false)
          .setMediaType(MediaMetadata.MEDIA_TYPE_FOLDER_MIXED)
          .setExtras(listStyle())
          .build()
      )
      .build()
}
