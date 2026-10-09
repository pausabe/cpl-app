package expo.modules.cpltextselection

import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.UIManager
import com.facebook.react.bridge.UIManagerListener
import com.facebook.react.common.annotations.UnstableReactNativeAPI
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.common.UIManagerType
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.lang.ref.WeakReference

// Puts SelectionGuard on every text that can be selected, as soon as it is on the screen. The texts
// are React Native's (ReactTextView) and it does not let anybody in when it makes one, so after each
// batch of changes its renderer puts on the screen the views are looked over, and the selectable
// texts not seen before get the guard. That includes the sheets: what a Modal shows lives in a
// window of its own, but React Native's placeholder for it (ReactModalHostView) answers for its
// children, so they are found from the screen's window too.
//
// The JavaScript does not call it: the module starts with the app, like every Expo module.
@OptIn(UnstableReactNativeAPI::class)
class CplTextSelectionModule : Module() {
  private var uiManager: UIManager? = null
  private var listener: MountListener? = null

  override fun definition() = ModuleDefinition {
    Name("CplTextSelection")

    OnCreate {
      listen()
    }

    // In case the renderer was not there yet when the module was made
    OnActivityEntersForeground {
      listen()
    }

    OnDestroy {
      stopListening()
    }
  }

  @Synchronized
  private fun listen() {
    if (uiManager != null) return
    val context = appContext.reactContext as? ReactContext ?: return
    if (!context.hasActiveReactInstance()) return
    val manager = UIManagerHelper.getUIManager(context, UIManagerType.FABRIC) ?: return
    val mounted = MountListener(context)
    manager.addUIManagerEventListener(mounted)
    uiManager = manager
    listener = mounted
  }

  @Synchronized
  private fun stopListening() {
    listener?.let { uiManager?.removeUIManagerEventListener(it) }
    uiManager = null
    listener = null
  }
}

// It holds the app's context loosely: a batch that comes after the app has gone finds nothing to
// look at, and leaves.
@OptIn(UnstableReactNativeAPI::class)
private class MountListener(context: ReactContext) : UIManagerListener {
  private val context = WeakReference(context)

  // On the UI thread, right after the views of a batch are made, changed or put in their place
  override fun didMountItems(uiManager: UIManager) {
    val screen = context.get()?.currentActivity?.window?.peekDecorView() ?: return
    SelectionGuard.guardSelectableTexts(screen)
  }

  override fun willDispatchViewUpdates(uiManager: UIManager) = Unit

  override fun willMountItems(uiManager: UIManager) = Unit

  override fun didDispatchMountItems(uiManager: UIManager) = Unit

  override fun didScheduleMountItems(uiManager: UIManager) = Unit
}
