package com.vozo.batchassistant.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.net.Uri
import android.os.Build
import android.os.IBinder
import android.view.Gravity
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.widget.Button
import android.widget.TextView
import androidx.core.app.NotificationCompat
import com.vozo.batchassistant.R
import com.vozo.batchassistant.automation.WorkflowStep
import com.vozo.batchassistant.model.QueueStatus

/**
 * Foreground floating assistive overlay (HUD).
 * Stays visible on top of Firefox to guide the user step-by-step
 * through upload, language selection, completion verification, and SAF output saving.
 * Provides fallback manual controls (Continue, Pause, Done, Flag Needs Attention).
 */
class FloatingHudService : Service() {

    companion object {
        private const val CHANNEL_ID = "vozo_floating_hud_channel"
        private const val NOTIFICATION_ID = 1001

        // Current HUD communication bus
        var activeStep: WorkflowStep = WorkflowStep.LAUNCH_PAGE
        var currentVideoName: String = "No video active"
        var currentStatus: QueueStatus = QueueStatus.PENDING

        // Listener for manual action fallbacks
        var onManualContinue: (() -> Unit)? = null
        var onManualPause: (() -> Unit)? = null
        var onManualRetry: (() -> Unit)? = null
        var onFlagNeedsAttention: ((String) -> Unit)? = null

        fun updatePageInspection(hasCompletion: Boolean, progressText: String?, sampleTokens: List<String>) {
            // Updated dynamically by VozoAccessibilityService
        }
    }

    private lateinit var windowManager: WindowManager
    private var floatingView: View? = null
    private lateinit var layoutParams: WindowManager.LayoutParams

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
        createNotificationChannel()
        startForeground(NOTIFICATION_ID, buildForegroundNotification())
        setupFloatingView()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Vozo Floating HUD Assistant",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Keeps the assistive overlay active while using Firefox"
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun buildForegroundNotification(): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Vozo Batch Assistant Active")
            .setContentText("Guiding batch translation in Firefox")
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setOngoing(true)
            .build()
    }

    private fun setupFloatingView() {
        val layoutType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        layoutParams = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
            WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = 32
            y = 120
        }

        floatingView = LayoutInflater.from(this).inflate(R.layout.floating_hud_layout, null)

        val txtVideo = floatingView?.findViewById<TextView>(R.id.hud_video_title)
        val txtStep = floatingView?.findViewById<TextView>(R.id.hud_step_title)
        val txtInstruction = floatingView?.findViewById<TextView>(R.id.hud_instruction)
        val btnContinue = floatingView?.findViewById<Button>(R.id.hud_btn_continue)
        val btnPause = floatingView?.findViewById<Button>(R.id.hud_btn_pause)
        val btnNeedsAttention = floatingView?.findViewById<Button>(R.id.hud_btn_attention)

        txtVideo?.text = currentVideoName
        txtStep?.text = "Step ${activeStep.stepNumber}: ${activeStep.title}"
        txtInstruction?.text = activeStep.instruction

        btnContinue?.setOnClickListener {
            onManualContinue?.invoke()
        }
        btnPause?.setOnClickListener {
            onManualPause?.invoke()
        }
        btnNeedsAttention?.setOnClickListener {
            onFlagNeedsAttention?.invoke("User requested manual inspection")
        }

        // Draggable touch listener
        floatingView?.setOnTouchListener(object : View.OnTouchListener {
            private var initialX = 0
            private var initialY = 0
            private var initialTouchX = 0f
            private var initialTouchY = 0f

            override fun onTouch(v: View?, event: MotionEvent?): Boolean {
                if (event == null) return false
                when (event.action) {
                    MotionEvent.ACTION_DOWN -> {
                        initialX = layoutParams.x
                        initialY = layoutParams.y
                        initialTouchX = event.rawX
                        initialTouchY = event.rawY
                        return true
                    }
                    MotionEvent.ACTION_MOVE -> {
                        layoutParams.x = initialX + (event.rawX - initialTouchX).toInt()
                        layoutParams.y = initialY + (event.rawY - initialTouchY).toInt()
                        floatingView?.let { windowManager.updateViewLayout(it, layoutParams) }
                        return true
                    }
                }
                return false
            }
        })

        floatingView?.let { windowManager.addView(it, layoutParams) }
    }

    override fun onDestroy() {
        super.onDestroy()
        floatingView?.let {
            try {
                windowManager.removeView(it)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
}
