package expo.modules.cplcar

import android.os.Handler
import android.os.Looper
import androidx.media3.common.AudioAttributes
import androidx.media3.common.DeviceInfo
import androidx.media3.common.FlagSet
import androidx.media3.common.ForwardingPlayer
import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import androidx.media3.common.Metadata
import androidx.media3.common.PlaybackException
import androidx.media3.common.PlaybackParameters
import androidx.media3.common.Player
import androidx.media3.common.SimpleBasePlayer
import androidx.media3.common.Timeline
import androidx.media3.common.TrackSelectionParameters
import androidx.media3.common.Tracks
import androidx.media3.common.VideoSize
import androidx.media3.common.text.Cue
import androidx.media3.common.text.CueGroup
import androidx.media3.common.util.UnstableApi
import com.google.common.util.concurrent.Futures
import com.google.common.util.concurrent.ListenableFuture
import java.util.IdentityHashMap

// What the lock screen, the notification and Android Auto say of the hour being read: the part
// («Salm 50. Oració de penediment»), the hour and the CPL icon (its bytes, or where the app has it)
data class NowPlaying(val title: String, val artist: String, val artwork: ByteArray?, val artworkUri: android.net.Uri?)

// What the car, the notification and the buttons of a steering wheel ask the app to do
interface CarRequests {
  // The part before, the next part
  fun skip(next: Boolean)

  // An hour of the catalog, or null to go on with the one there was
  fun play(mediaId: String?)
}

// The player of the app (expo-audio's ExoPlayer), as the session shows it: with the part being said
// as its title, and with «previous» and «next» (⏮ ⏭) that jump from part to part instead of the
// «10 seconds» arrows. Asked to play another hour (from the car), it tells the app instead of
// putting something else into the ExoPlayer: the app makes the hour and plays it there.
@UnstableApi
class AppPlayer(
  player: Player,
  private val requests: CarRequests
) : ForwardingPlayer(player) {
  private val handler = Handler(applicationLooper)
  private val listeners = IdentityHashMap<Player.Listener, Player.Listener>()
  private var nowPlaying: NowPlaying? = null

  private val skipCommands = Player.Commands.Builder()
    .addAll(
      Player.COMMAND_SEEK_TO_PREVIOUS,
      Player.COMMAND_SEEK_TO_NEXT,
      Player.COMMAND_SEEK_TO_PREVIOUS_MEDIA_ITEM,
      Player.COMMAND_SEEK_TO_NEXT_MEDIA_ITEM
    )
    .build()

  override fun getAvailableCommands(): Player.Commands =
    super.getAvailableCommands().buildUpon().addAll(skipCommands).build()

  override fun isCommandAvailable(command: Int): Boolean =
    skipCommands.contains(command) || super.isCommandAvailable(command)

  override fun hasNextMediaItem(): Boolean = true

  override fun hasPreviousMediaItem(): Boolean = true

  override fun seekToNext() = requests.skip(true)

  override fun seekToNextMediaItem() = requests.skip(true)

  override fun seekToPrevious() = requests.skip(false)

  override fun seekToPreviousMediaItem() = requests.skip(false)

  override fun setMediaItem(mediaItem: MediaItem) = requests.play(mediaItem.mediaId)

  override fun setMediaItem(mediaItem: MediaItem, resetPosition: Boolean) = requests.play(mediaItem.mediaId)

  override fun setMediaItem(mediaItem: MediaItem, startPositionMs: Long) = requests.play(mediaItem.mediaId)

  override fun setMediaItems(mediaItems: MutableList<MediaItem>) = requests.play(mediaItems.firstOrNull()?.mediaId)

  override fun setMediaItems(mediaItems: MutableList<MediaItem>, resetPosition: Boolean) =
    requests.play(mediaItems.firstOrNull()?.mediaId)

  override fun setMediaItems(mediaItems: MutableList<MediaItem>, startIndex: Int, startPositionMs: Long) =
    requests.play(mediaItems.getOrNull(startIndex)?.mediaId ?: mediaItems.firstOrNull()?.mediaId)

  override fun addMediaItems(mediaItems: MutableList<MediaItem>) = requests.play(mediaItems.firstOrNull()?.mediaId)

  override fun getMediaMetadata(): MediaMetadata {
    val now = nowPlaying ?: return super.getMediaMetadata()
    return super.getMediaMetadata()
      .buildUpon()
      .setTitle(now.title)
      .setDisplayTitle(now.title)
      .setArtist(now.artist)
      .setAlbumTitle("CPL")
      .setArtworkData(now.artwork, MediaMetadata.PICTURE_TYPE_FRONT_COVER)
      .setArtworkUri(now.artworkUri)
      .build()
  }

  fun update(now: NowPlaying) {
    if (Looper.myLooper() != applicationLooper) {
      handler.post { update(now) }
      return
    }
    val before = mediaMetadata
    nowPlaying = now
    val after = mediaMetadata
    if (before == after) return
    val events = Player.Events(FlagSet.Builder().add(Player.EVENT_MEDIA_METADATA_CHANGED).build())
    val current = synchronized(listeners) { listeners.keys.toList() }
    current.forEach { it.onMediaMetadataChanged(after) }
    current.forEach { it.onEvents(this, events) }
  }

  override fun addListener(listener: Player.Listener) {
    val forwarding = synchronized(listeners) { listeners.getOrPut(listener) { Forwarding(listener) } }
    super.addListener(forwarding)
  }

  override fun removeListener(listener: Player.Listener) {
    val forwarding = synchronized(listeners) { listeners.remove(listener) }
    super.removeListener(forwarding ?: listener)
  }

  // Every event of the ExoPlayer passed on, one by one: Kotlin's «by» does not pass on the default
  // methods of a Java interface, and the session never heard that it was playing (9 October 2026).
  // The metadata is ours; the commands, with ⏮ ⏭; the player, this one.
  @Suppress("DEPRECATION", "OVERRIDE_DEPRECATION")
  private inner class Forwarding(private val listener: Player.Listener) : Player.Listener {
    override fun onEvents(player: Player, events: Player.Events) = listener.onEvents(this@AppPlayer, events)
    override fun onTimelineChanged(timeline: Timeline, reason: Int) = listener.onTimelineChanged(timeline, reason)
    override fun onMediaItemTransition(mediaItem: MediaItem?, reason: Int) =
      listener.onMediaItemTransition(mediaItem, reason)
    override fun onTracksChanged(tracks: Tracks) = listener.onTracksChanged(tracks)
    override fun onMediaMetadataChanged(mediaMetadata: MediaMetadata) =
      listener.onMediaMetadataChanged(this@AppPlayer.mediaMetadata)
    override fun onPlaylistMetadataChanged(mediaMetadata: MediaMetadata) =
      listener.onPlaylistMetadataChanged(mediaMetadata)
    override fun onIsLoadingChanged(isLoading: Boolean) = listener.onIsLoadingChanged(isLoading)
    override fun onLoadingChanged(isLoading: Boolean) = listener.onLoadingChanged(isLoading)
    override fun onAvailableCommandsChanged(availableCommands: Player.Commands) =
      listener.onAvailableCommandsChanged(this@AppPlayer.availableCommands)
    override fun onTrackSelectionParametersChanged(parameters: TrackSelectionParameters) =
      listener.onTrackSelectionParametersChanged(parameters)
    override fun onPlayerStateChanged(playWhenReady: Boolean, playbackState: Int) =
      listener.onPlayerStateChanged(playWhenReady, playbackState)
    override fun onPlaybackStateChanged(playbackState: Int) = listener.onPlaybackStateChanged(playbackState)
    override fun onPlayWhenReadyChanged(playWhenReady: Boolean, reason: Int) =
      listener.onPlayWhenReadyChanged(playWhenReady, reason)
    override fun onPlaybackSuppressionReasonChanged(reason: Int) = listener.onPlaybackSuppressionReasonChanged(reason)
    override fun onIsPlayingChanged(isPlaying: Boolean) = listener.onIsPlayingChanged(isPlaying)
    override fun onRepeatModeChanged(repeatMode: Int) = listener.onRepeatModeChanged(repeatMode)
    override fun onShuffleModeEnabledChanged(enabled: Boolean) = listener.onShuffleModeEnabledChanged(enabled)
    override fun onPlayerError(error: PlaybackException) = listener.onPlayerError(error)
    override fun onPlayerErrorChanged(error: PlaybackException?) = listener.onPlayerErrorChanged(error)
    override fun onPositionDiscontinuity(reason: Int) = listener.onPositionDiscontinuity(reason)
    override fun onPositionDiscontinuity(
      oldPosition: Player.PositionInfo,
      newPosition: Player.PositionInfo,
      reason: Int
    ) = listener.onPositionDiscontinuity(oldPosition, newPosition, reason)
    override fun onPlaybackParametersChanged(parameters: PlaybackParameters) =
      listener.onPlaybackParametersChanged(parameters)
    override fun onSeekBackIncrementChanged(ms: Long) = listener.onSeekBackIncrementChanged(ms)
    override fun onSeekForwardIncrementChanged(ms: Long) = listener.onSeekForwardIncrementChanged(ms)
    override fun onMaxSeekToPreviousPositionChanged(ms: Long) = listener.onMaxSeekToPreviousPositionChanged(ms)
    override fun onAudioSessionIdChanged(id: Int) = listener.onAudioSessionIdChanged(id)
    override fun onAudioAttributesChanged(attributes: AudioAttributes) = listener.onAudioAttributesChanged(attributes)
    override fun onVolumeChanged(volume: Float) = listener.onVolumeChanged(volume)
    override fun onSkipSilenceEnabledChanged(enabled: Boolean) = listener.onSkipSilenceEnabledChanged(enabled)
    override fun onDeviceInfoChanged(info: DeviceInfo) = listener.onDeviceInfoChanged(info)
    override fun onDeviceVolumeChanged(volume: Int, muted: Boolean) = listener.onDeviceVolumeChanged(volume, muted)
    override fun onVideoSizeChanged(size: VideoSize) = listener.onVideoSizeChanged(size)
    override fun onSurfaceSizeChanged(width: Int, height: Int) = listener.onSurfaceSizeChanged(width, height)
    override fun onRenderedFirstFrame() = listener.onRenderedFirstFrame()
    override fun onCues(cues: MutableList<Cue>) = listener.onCues(cues)
    override fun onCues(cueGroup: CueGroup) = listener.onCues(cueGroup)
    override fun onMetadata(metadata: Metadata) = listener.onMetadata(metadata)
  }
}

// The player of the session while the app has none: when Android Auto opens with the app closed.
// It plays nothing; whatever the car asks for goes to the app, which wakes up and plays it with its own.
@UnstableApi
class WaitingPlayer(
  looper: Looper,
  private val requests: CarRequests
) : SimpleBasePlayer(looper) {
  private var asked: List<MediaItem> = emptyList()

  override fun getState(): State {
    val state = State.Builder()
      .setAvailableCommands(
        Player.Commands.Builder()
          .addAll(
            Player.COMMAND_PLAY_PAUSE,
            Player.COMMAND_PREPARE,
            Player.COMMAND_STOP,
            Player.COMMAND_SET_MEDIA_ITEM,
            Player.COMMAND_CHANGE_MEDIA_ITEMS,
            Player.COMMAND_GET_CURRENT_MEDIA_ITEM,
            Player.COMMAND_GET_TIMELINE,
            Player.COMMAND_GET_METADATA
          )
          .build()
      )
      .setPlaybackState(if (asked.isEmpty()) Player.STATE_IDLE else Player.STATE_BUFFERING)
      .setPlayWhenReady(asked.isNotEmpty(), Player.PLAY_WHEN_READY_CHANGE_REASON_USER_REQUEST)
    if (asked.isNotEmpty()) {
      state.setPlaylist(asked.map { MediaItemData.Builder(it.mediaId).setMediaItem(it).build() })
    }
    return state.build()
  }

  override fun handleSetMediaItems(
    mediaItems: MutableList<MediaItem>,
    startIndex: Int,
    startPositionMs: Long
  ): ListenableFuture<*> {
    asked = mediaItems.toList()
    requests.play(mediaItems.getOrNull(startIndex)?.mediaId ?: mediaItems.firstOrNull()?.mediaId)
    return Futures.immediateVoidFuture()
  }

  override fun handleSetPlayWhenReady(playWhenReady: Boolean): ListenableFuture<*> {
    if (playWhenReady && asked.isEmpty()) requests.play(null)
    return Futures.immediateVoidFuture()
  }

  override fun handlePrepare(): ListenableFuture<*> = Futures.immediateVoidFuture()

  override fun handleStop(): ListenableFuture<*> {
    asked = emptyList()
    return Futures.immediateVoidFuture()
  }

  override fun handleRelease(): ListenableFuture<*> = Futures.immediateVoidFuture()
}
