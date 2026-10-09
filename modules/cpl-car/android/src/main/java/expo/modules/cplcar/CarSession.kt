package expo.modules.cplcar

import android.content.Context
import android.content.Intent
import android.os.Handler
import android.os.Looper
import android.util.Log
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import androidx.media3.session.LibraryResult
import androidx.media3.session.MediaLibraryService
import androidx.media3.session.MediaLibraryService.MediaLibrarySession
import androidx.media3.session.MediaSession
import com.facebook.react.ReactApplication
import com.google.common.collect.ImmutableList
import com.google.common.util.concurrent.Futures
import com.google.common.util.concurrent.ListenableFuture
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

// The one media session of the app: what Android Auto, the lock screen, the notification and the
// buttons of headphones and steering wheels talk to (CarMediaService keeps it alive). While the app
// reads an hour aloud, its player is behind it (AppPlayer); before that, a player that only waits
// (WaitingPlayer). What the car asks for goes to the app's JavaScript (CplCarModule), which is woken
// up if the app was closed.
@UnstableApi
object CarSession : CarRequests {
  private const val TAG = "CplCar"
  private val main = Handler(Looper.getMainLooper())
  private var session: MediaLibrarySession? = null
  private var appPlayer: AppPlayer? = null
  private var context: Context? = null

  // The module, while the app's JavaScript is there; and whether it is listening yet
  var module: CplCarModule? = null
  private var ready = false
  private val pending = mutableListOf<Pair<String, Map<String, Any?>>>()

  // The controllers of the car: Android Auto on the phone, and the media centre of a car with Android
  private val CARS = setOf(
    "com.google.android.projection.gearhead",
    "com.android.car.media",
    "com.google.android.carassistant"
  )

  fun ensure(context: Context): MediaLibrarySession {
    session?.let { return it }
    this.context = context.applicationContext
    val built = MediaLibrarySession.Builder(context.applicationContext, WaitingPlayer(Looper.getMainLooper(), this), Callback)
      .setId("cpl")
      .build()
    session = built
    return built
  }

  fun release() {
    session?.release()
    session = null
    appPlayer = null
  }

  // --- The app's player ----------------------------------------------------------------------------

  fun attach(context: Context, player: Player, now: NowPlaying) {
    Log.d(TAG, "attach: ${now.title}")
    val session = ensure(context)
    val current = appPlayer
    if (current == null || session.player !== current) {
      val wrapped = AppPlayer(player, this)
      appPlayer = wrapped
      session.player = wrapped
    }
    appPlayer?.update(now)
    // The service shows the notification and keeps the app alive while it plays
    try {
      context.startService(Intent(context, CarMediaService::class.java))
    } catch (e: Exception) {
      // In the background Android may not let it start: the session still works
    }
  }

  fun update(now: NowPlaying) {
    appPlayer?.update(now)
  }

  fun detach(context: Context) {
    val session = session ?: return
    appPlayer = null
    session.player = WaitingPlayer(Looper.getMainLooper(), this)
  }

  // --- What the car shows ----------------------------------------------------------------------------

  fun catalogChanged() {
    session?.notifyChildrenChanged(CarCatalog.ROOT, Int.MAX_VALUE, null)
    session?.notifyChildrenChanged(CarCatalog.TODAY, Int.MAX_VALUE, null)
  }

  private fun today(): String = SimpleDateFormat("yyyy-MM-dd", Locale.ROOT).format(Date())

  private object Callback : MediaLibrarySession.Callback {
    override fun onConnect(session: MediaSession, controller: MediaSession.ControllerInfo): MediaSession.ConnectionResult {
      val context = CarSession.context
      Log.d(TAG, "connected: ${controller.packageName}")
      if (context != null && controller.packageName in CARS) {
        CarCatalog.markCarUsed(context)
        emit("onCarConnected", emptyMap(), wake = false)
      }
      return MediaSession.ConnectionResult.AcceptedResultBuilder(session).build()
    }

    override fun onGetLibraryRoot(
      session: MediaLibrarySession,
      browser: MediaSession.ControllerInfo,
      params: MediaLibraryService.LibraryParams?
    ): ListenableFuture<LibraryResult<MediaItem>> = Futures.immediateFuture(LibraryResult.ofItem(CarCatalog.root(), params))


    override fun onGetChildren(
      session: MediaLibrarySession,
      browser: MediaSession.ControllerInfo,
      parentId: String,
      page: Int,
      pageSize: Int,
      params: MediaLibraryService.LibraryParams?
    ): ListenableFuture<LibraryResult<ImmutableList<MediaItem>>> {
      val context = CarSession.context ?: return Futures.immediateFuture(LibraryResult.ofItemList(ImmutableList.of(), params))
      val items = CarCatalog.children(context, parentId, today())
      Log.d(TAG, "children of $parentId for ${browser.packageName}: ${items.map { it.mediaId }}")
      return Futures.immediateFuture(LibraryResult.ofItemList(ImmutableList.copyOf(items), params))
    }

    override fun onGetItem(
      session: MediaLibrarySession,
      browser: MediaSession.ControllerInfo,
      mediaId: String
    ): ListenableFuture<LibraryResult<MediaItem>> {
      val context = CarSession.context
      val item = context?.let { CarCatalog.item(it, today(), mediaId) }
      return Futures.immediateFuture(
        if (item != null) LibraryResult.ofItem(item, null) else LibraryResult.ofError(LibraryResult.RESULT_ERROR_BAD_VALUE)
      )
    }

    // The items of the car come back as they are: the player passes them on to the app
    override fun onAddMediaItems(
      mediaSession: MediaSession,
      controller: MediaSession.ControllerInfo,
      mediaItems: MutableList<MediaItem>
    ): ListenableFuture<MutableList<MediaItem>> = Futures.immediateFuture(mediaItems)

    // «Play» with nothing chosen (the car starting, a button): the hour left halfway
    override fun onPlaybackResumption(
      mediaSession: MediaSession,
      controller: MediaSession.ControllerInfo,
      isForPlayback: Boolean
    ): ListenableFuture<MediaSession.MediaItemsWithStartPosition> {
      val context = CarSession.context
      val item = context?.let { CarCatalog.item(it, today(), CarCatalog.CONTINUE) }
        ?: return Futures.immediateFailedFuture(UnsupportedOperationException("nothing to resume"))
      return Futures.immediateFuture(MediaSession.MediaItemsWithStartPosition(listOf(item), 0, 0))
    }
  }

  // --- To the app ------------------------------------------------------------------------------------

  override fun skip(next: Boolean) {
    emit("onCarCommand", mapOf("type" to if (next) "next" else "previous"), wake = false)
  }

  override fun play(mediaId: String?) {
    Log.d(TAG, "play: $mediaId")
    if (mediaId == CarCatalog.OPEN_THE_APP || mediaId == CarCatalog.ROOT || mediaId == CarCatalog.TODAY) return
    emit("onCarPlay", mapOf("id" to (mediaId ?: CarCatalog.CONTINUE)), wake = true)
  }

  fun setReady(isReady: Boolean) {
    ready = isReady
    if (!isReady) return
    val queued = pending.toList()
    pending.clear()
    queued.forEach { (name, body) -> module?.send(name, body) }
  }

  private fun emit(name: String, body: Map<String, Any?>, wake: Boolean) {
    main.post {
      val module = module
      if (module != null && ready) {
        module.send(name, body)
        return@post
      }
      // Only the last one of each kind: the car is not a queue
      pending.removeAll { it.first == name }
      pending.add(name to body)
      if (wake && module == null) wakeTheApp()
    }
  }

  // The app was closed (Android Auto opened it): its JavaScript starts without a screen, and asks
  // for what is pending as soon as it listens (CplCarModule.ready)
  private fun wakeTheApp() {
    val application = context as? ReactApplication ?: (context?.applicationContext as? ReactApplication) ?: return
    try {
      application.reactHost?.start()
    } catch (e: Exception) {
      // Nothing to do: the car will say that nothing plays
    }
  }
}
