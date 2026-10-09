package expo.modules.cplcar

import android.content.Context
import android.net.Uri
import androidx.media3.common.util.UnstableApi
import expo.modules.audio.AudioPlayer
import expo.modules.kotlin.functions.Queues
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File

// What the app's JavaScript says to the media session (src/services/audio/carAudio.ts): which player
// reads the hour and what it is saying, what the car can choose, and that it is listening. And what
// the session says back: the part before or the next one, an hour chosen in the car, a car connected.
@UnstableApi
class CplCarModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw IllegalStateException("no React context")

  private var artworkUri: String? = null
  private var artwork: ByteArray? = null

  override fun definition() = ModuleDefinition {
    Name("CplCar")

    Events("onCarCommand", "onCarPlay", "onCarConnected")

    OnCreate {
      CarSession.module = this@CplCarModule
    }

    OnDestroy {
      if (CarSession.module === this@CplCarModule) {
        CarSession.module = null
        CarSession.setReady(false)
      }
    }

    // The JavaScript listens: what the car asked while it was starting comes now
    Function("ready") {
      CarSession.setReady(true)
    }

    AsyncFunction("attach") { player: AudioPlayer, title: String, artist: String, artworkFile: String? ->
      CarSession.attach(context, player.ref, nowPlaying(title, artist, artworkFile))
    }.runOnQueue(Queues.MAIN)

    AsyncFunction("update") { title: String, artist: String, artworkFile: String? ->
      CarSession.update(nowPlaying(title, artist, artworkFile))
    }.runOnQueue(Queues.MAIN)

    AsyncFunction("detach") {
      CarSession.detach(context)
    }.runOnQueue(Queues.MAIN)

    AsyncFunction("setCatalog") { json: String ->
      CarCatalog.save(context, json)
      CarSession.catalogChanged()
    }.runOnQueue(Queues.MAIN)

    Function("carWasUsed") {
      CarCatalog.carUsed(context)
    }
  }

  fun send(name: String, body: Map<String, Any?>) {
    sendEvent(name, body)
  }

  // Without the icon's file (the app woken up by the car has not got it yet), the app's own icon,
  // which the car can load by itself
  private fun nowPlaying(title: String, artist: String, artworkFile: String?) = NowPlaying(
    title,
    artist,
    artworkOf(artworkFile),
    Uri.parse("android.resource://${context.packageName}/mipmap/ic_launcher")
  )

  // The CPL icon the app keeps as a file, read once
  private fun artworkOf(file: String?): ByteArray? {
    if (file == null) return null
    if (file == artworkUri) return artwork
    artworkUri = file
    artwork = try {
      val path = Uri.parse(file).path ?: file
      File(path).readBytes()
    } catch (e: Exception) {
      null
    }
    return artwork
  }
}
