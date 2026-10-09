package expo.modules.cpltextselection

import android.view.MotionEvent
import android.view.View
import android.view.ViewConfiguration
import com.facebook.react.views.scroll.ReactHorizontalScrollView
import com.facebook.react.views.scroll.ReactScrollView

// The focus for a text that a finger is on, without the screen moving under the finger.
//
// A text that can be selected takes the focus the first time a finger uses it: when a long press
// starts selecting (Editor.checkField) or when a tap ends (View.onTouchEvent). And React Native's
// scroll view brings whatever takes the focus into sight (ReactScrollView.requestChildFocus), as a
// keyboard moving from one thing to the next needs. The prayer is sewn into texts taller than the
// screen (PrayerFlow), and Android brings one of those into sight by moving it until its top
// reaches the top of the screen, or its end the bottom (ScrollView.
// computeScrollDeltaToGetChildRectOnScreen). So the first long press on each of them, with the
// text starting or ending halfway down the screen, made the screen jump, and the selection, which
// follows the finger from the word pressed, ran on to the text that had come under it.
//
// Here the text is given the focus a moment before Android would give it, with the scroll views
// around it told not to move for it, and only for that moment: Android finds it focused and goes
// on as always. A focus that does not come from a finger (a keyboard, TalkBack) still brings the
// text into sight, and so does everything that asks to be seen without taking the focus: the end
// of the selection being dragged, or what TalkBack is reading.
internal object FocusInPlace {
  // For the end of a tap: where View.onTouchEvent still counts the finger as on the view (inside
  // it, or a touch slop away, View.pointInView), and so gives it the focus
  fun isOn(view: View, event: MotionEvent): Boolean {
    val slop = ViewConfiguration.get(view.context).scaledTouchSlop
    return event.x >= -slop && event.y >= -slop && event.x < view.width + slop && event.y < view.height + slop
  }

  fun give(view: View) {
    if (view.isFocused || !view.isFocusableInTouchMode) return
    val scrollViews =
      generateSequence(view.parent) { it.parent }.filterIsInstance<View>().filter(::isScrollView).toList()
    scrollViews.forEach { scrollsToFocus(it, false) }
    try {
      view.requestFocus()
    } finally {
      // Back to what they always are: React Native's JavaScript has no way of changing it
      scrollViews.forEach { scrollsToFocus(it, true) }
    }
  }

  // React Native's scroll views, the vertical one and the horizontal one. The nested one is only
  // made with a flag that is off (useNestedScrollViewAndroid), and is not public.
  private fun isScrollView(view: View) = view is ReactScrollView || view is ReactHorizontalScrollView

  private fun scrollsToFocus(view: View, scrolls: Boolean) {
    when (view) {
      is ReactScrollView -> view.setScrollsChildToFocus(scrolls)
      is ReactHorizontalScrollView -> view.setScrollsChildToFocus(scrolls)
    }
  }
}
