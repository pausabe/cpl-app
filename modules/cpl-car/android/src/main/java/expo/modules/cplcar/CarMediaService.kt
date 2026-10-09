package expo.modules.cplcar

import android.content.Intent
import androidx.media3.common.util.UnstableApi
import androidx.media3.session.DefaultMediaNotificationProvider
import androidx.media3.session.MediaLibraryService
import androidx.media3.session.MediaSession

// The service Android Auto looks for (AndroidManifest.xml), and the one that shows the media
// notification and keeps the app alive while an hour is read with the phone locked
@UnstableApi
class CarMediaService : MediaLibraryService() {
  override fun onCreate() {
    super.onCreate()
    setMediaNotificationProvider(DefaultMediaNotificationProvider.Builder(this).build())
    addSession(CarSession.ensure(this))
  }

  override fun onGetSession(controllerInfo: MediaSession.ControllerInfo): MediaLibrarySession =
    CarSession.ensure(this)

  // The app swiped away: if nothing is being read, there is nothing to keep
  override fun onTaskRemoved(rootIntent: Intent?) {
    val player = CarSession.ensure(this).player
    if (!player.playWhenReady || player.mediaItemCount == 0) {
      stopSelf()
    }
  }

  override fun onDestroy() {
    CarSession.release()
    super.onDestroy()
  }
}
