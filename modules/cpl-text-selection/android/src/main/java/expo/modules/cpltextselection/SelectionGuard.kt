package expo.modules.cpltextselection

import android.os.Build
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.view.textclassifier.TextClassifier
import android.widget.TextView
import java.util.WeakHashMap

// Two ways in which Android's own code for selected text (android.widget.Editor) closed the app, in
// the texts of the prayer, which can be selected. Both are Android's: they are stopped before
// Android gets there, on the text that is selected, and everything else goes on as before.
//
// 1. A long press inside what is selected starts dragging it (drag and drop), and Android draws the
//    text being dragged in a little view of its own (Editor.getTextThumbnailBuilder: the first 20
//    characters, in a TextView with no padding). When those characters take no room, because they
//    are only line breaks or characters that are not drawn (the soft hyphens of the texts, U+00AD),
//    that view has no width, and for an app built for Android 9 or later View.startDragAndDrop
//    throws «Drag shadow dimensions must be positive» instead of dragging nothing. The prayer is
//    sewn into a single text with empty lines between its paragraphs (PrayerFlow), and a long press
//    on an empty line selects just that line break: a second long press on it closed the app
//    (Google Play, from 8.0.0 to 9.1.2, on Android 10 to 14). Here that long press is taken before
//    Android sees it, but only when the drag would be of nothing: then nothing happens, and what is
//    selected stays selected with its «Copia». Dragging text that can be seen is left to Android.
//
// 2. Android 8, 9 and 10 hand the selection to the text classifier (which suggests actions for an
//    address or a telephone number) without putting its ends in order, and they throw when it was
//    made backwards, from right to left (SelectionActionModeHelper$TextClassificationHelper.init,
//    IllegalArgumentException; Android 11 puts them in order first). On those versions the texts get
//    the classifier that does nothing, which Android itself checks for and skips: the selection and
//    its «Copia» are the same, and nothing is suggested for an address in the prayer.
//
// It also keeps the screen still when a finger gives the text the focus, which made the first long
// press on a text select the wrong words (FocusInPlace).
internal class SelectionGuard : View.OnTouchListener, View.OnLongClickListener {
  // Where the finger went down: Android decides whether a long press is inside the selection with
  // that point, so this does too. Nothing while no finger is down, as in a long press of TalkBack.
  private var downX = Float.NaN
  private var downY = Float.NaN

  // It never takes the touch: it always goes on to the text
  override fun onTouch(view: View, event: MotionEvent): Boolean {
    when (event.actionMasked) {
      MotionEvent.ACTION_DOWN -> {
        downX = event.x
        downY = event.y
      }
      MotionEvent.ACTION_UP -> {
        // The end of a tap, which gives the text the focus right after this (View.onTouchEvent)
        if (FocusInPlace.isOn(view, event)) FocusInPlace.give(view)
        downX = Float.NaN
        downY = Float.NaN
      }
      MotionEvent.ACTION_CANCEL -> {
        downX = Float.NaN
        downY = Float.NaN
      }
    }
    return false
  }

  // true takes the long press, and Android does nothing with it (Editor.performLongClick)
  override fun onLongClick(view: View): Boolean {
    val text = view as? TextView ?: return false
    if (!text.isTextSelectable || downX.isNaN() || downY.isNaN()) return false
    // Android gives it the focus to select, right after this (Editor.checkField)
    FocusInPlace.give(text)
    val start = minOf(text.selectionStart, text.selectionEnd)
    val end = maxOf(text.selectionStart, text.selectionEnd)
    if (start < 0 || start == end) return false
    // Editor.touchPositionIsInSelection
    val pressed = text.getOffsetForPosition(downX, downY)
    if (pressed < start || pressed >= end) return false
    return dragWouldShowNothing(text, start, end)
  }

  companion object {
    // Editor.DRAG_SHADOW_MAX_TEXT_LENGTH
    private const val DRAGGED_CHARACTERS_SHOWN = 20

    private val guarded = WeakHashMap<TextView, SelectionGuard>()

    // Every text that can be selected under this view, the ones already guarded aside. A text
    // that cannot be selected is left alone: giving it the guard would make it take long presses.
    fun guardSelectableTexts(root: View) {
      val pending = ArrayDeque<View>()
      pending.add(root)
      while (true) {
        val view = pending.removeLastOrNull() ?: break
        if (view is TextView) {
          if (view.isTextSelectable && !guarded.containsKey(view)) guard(view)
        } else if (view is ViewGroup) {
          for (i in 0 until view.childCount) view.getChildAt(i)?.let(pending::add)
        }
      }
    }

    private fun guard(text: TextView) {
      val guard = SelectionGuard()
      text.setOnTouchListener(guard)
      // It is long-clickable already, as every text that can be selected: nothing else changes
      text.setOnLongClickListener(guard)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && Build.VERSION.SDK_INT <= Build.VERSION_CODES.Q) {
        text.setTextClassifier(TextClassifier.NO_OP)
      }
      guarded[text] = guard
    }

    // Whether the view Android would draw for dragging this selection has no width or no height:
    // the same text, with the same pieces of style, measured the same way, in a TextView with no
    // padding like Android's (layout text_drag_thumbnail). Android takes a few more characters when
    // the 20th starts a cluster, so this may say «nothing» where Android would show something, never
    // the other way round.
    private fun dragWouldShowNothing(text: TextView, start: Int, end: Int): Boolean {
      val content = text.text ?: return false
      val shown = text.transformationMethod?.getTransformation(content, text) ?: content
      val last = minOf(end, start + DRAGGED_CHARACTERS_SHOWN, shown.length)
      if (last <= start) return false
      val drawn = TextView(text.context)
      drawn.setPadding(0, 0, 0, 0)
      drawn.minWidth = 0
      drawn.minHeight = 0
      drawn.minimumWidth = 0
      drawn.minimumHeight = 0
      drawn.layoutParams = ViewGroup.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT)
      drawn.text = shown.subSequence(start, last)
      val unspecified = View.MeasureSpec.makeMeasureSpec(0, View.MeasureSpec.UNSPECIFIED)
      drawn.measure(unspecified, unspecified)
      return drawn.measuredWidth == 0 || drawn.measuredHeight == 0
    }
  }
}
