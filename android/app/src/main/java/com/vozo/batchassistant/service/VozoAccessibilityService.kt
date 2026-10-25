package com.vozo.batchassistant.service

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.GestureDescription
import android.graphics.Path
import android.graphics.Rect
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

/**
 * Android 15 AccessibilityService for Firefox + Vozo.ai interaction.
 *
 * TECHNICAL LIMITATIONS ON ANDROID 15:
 * 1. Security constraints prevent dispatching gestures inside privileged system file pickers.
 * 2. Firefox GeckoView renders web DOM into an accessibility virtual hierarchy.
 *    Dynamic AJAX or canvas elements require Firefox accessibility to be enabled.
 * 3. Never bypasses CAPTCHA, login, or subscription paywalls.
 * 4. Never marks completion merely because a video player element rendered.
 */
class VozoAccessibilityService : AccessibilityService() {

    companion object {
        private const val TAG = "VozoAccessibility"
        var instance: VozoAccessibilityService? = null
            private set

        // Keywords indicating completion
        private val COMPLETION_KEYWORDS = listOf(
            "Download", "Download Video", "Export", "Export Video", "Ready to download", "Translation completed"
        )

        // Keywords indicating in-progress translation
        private val PROGRESS_KEYWORDS = listOf(
            "Translating", "Processing", "Generating dubbing", "In progress", "%"
        )
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = this
        Log.i(TAG, "Vozo Accessibility Service connected on Android 15")
    }

    override fun onDestroy() {
        super.onDestroy()
        instance = null
        Log.i(TAG, "Vozo Accessibility Service disconnected")
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return

        val packageName = event.packageName?.toString() ?: ""
        if (!packageName.contains("firefox", ignoreCase = true) &&
            !packageName.contains("fenix", ignoreCase = true)) {
            return
        }

        val rootNode = rootInActiveWindow ?: return

        when (event.eventType) {
            AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED,
            AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED -> {
                inspectVozoPage(rootNode)
            }
        }
    }

    override fun onInterrupt() {
        Log.w(TAG, "Accessibility service interrupted")
    }

    /**
     * Inspects active window hierarchy in Firefox for Vozo tokens.
     */
    private fun inspectVozoPage(root: AccessibilityNodeInfo) {
        val detectedTexts = mutableListOf<String>()
        collectAllTextNodes(root, detectedTexts)

        // Check for completion signals
        val hasCompletion = detectedTexts.any { text ->
            COMPLETION_KEYWORDS.any { keyword -> text.contains(keyword, ignoreCase = true) }
        }

        // Check for progress percentage
        val progressText = detectedTexts.firstOrNull { text ->
            PROGRESS_KEYWORDS.any { keyword -> text.contains(keyword, ignoreCase = true) }
        }

        // Send inspection findings to FloatingHudService & ViewModel
        FloatingHudService.updatePageInspection(
            hasCompletion = hasCompletion,
            progressText = progressText,
            sampleTokens = detectedTexts.take(8)
        )
    }

    private fun collectAllTextNodes(node: AccessibilityNodeInfo?, list: MutableList<String>) {
        if (node == null) return
        val text = node.text?.toString()?.trim()
        val desc = node.contentDescription?.toString()?.trim()

        if (!text.isNullOrEmpty()) list.add(text)
        if (!desc.isNullOrEmpty() && desc != text) list.add(desc)

        for (i in 0 until node.childCount) {
            collectAllTextNodes(node.getChild(i), list)
        }
    }

    /**
     * Dispatches a tap gesture if permitted on user-authorized coordinates.
     */
    fun performTapAt(x: Float, y: Float, onComplete: (() -> Unit)? = null): Boolean {
        val path = Path().apply { moveTo(x, y) }
        val stroke = GestureDescription.StrokeDescription(path, 0, 80)
        val gesture = GestureDescription.Builder().addStroke(stroke).build()

        return dispatchGesture(gesture, object : GestureResultCallback() {
            override fun onCompleted(gestureDescription: GestureDescription?) {
                onComplete?.invoke()
            }
            override fun onCancelled(gestureDescription: GestureDescription?) {
                Log.w(TAG, "Gesture cancelled by system (possibly privileged window)")
            }
        }, null)
    }
}
