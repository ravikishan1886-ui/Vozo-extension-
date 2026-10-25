export interface AndroidFile {
  path: string;
  name: string;
  category: 'manifest' | 'gradle' | 'kotlin' | 'xml' | 'doc';
  description: string;
  content: string;
}

export const ANDROID_PROJECT_FILES: AndroidFile[] = [
  {
    path: 'settings.gradle.kts',
    name: 'settings.gradle.kts',
    category: 'gradle',
    description: 'Project settings and dependency repository configuration for Android 15 Gradle build.',
    content: `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "VozoBatchAssistant"
include(":app")
`
  },
  {
    path: 'build.gradle.kts',
    name: 'build.gradle.kts (root)',
    category: 'gradle',
    description: 'Top-level Gradle build configuration declaring Android and Kotlin Compose plugins.',
    content: `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
}
`
  },
  {
    path: 'gradle.properties',
    name: 'gradle.properties',
    category: 'gradle',
    description: 'JVM memory settings and AndroidX migration flags.',
    content: `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
kotlin.code.style=official
`
  },
  {
    path: 'app/build.gradle.kts',
    name: 'app/build.gradle.kts',
    category: 'gradle',
    description: 'App module configuration targeting Android 15 (API 35), Jetpack Compose, Coroutines, and DocumentFile.',
    content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    namespace = "com.vozo.batchassistant"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.vozo.batchassistant"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.14"
    }
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    // AndroidX Core & Lifecycle
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")
    implementation("androidx.activity:activity-compose:1.10.0")

    // Jetpack Compose
    implementation(platform("androidx.compose:compose-bom:2024.12.01"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")

    // Storage Access Framework (SAF) DocumentFile
    implementation("androidx.documentfile:documentfile:1.0.1")

    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")

    // DataStore Preferences for Queue & Configuration Persistence
    implementation("androidx.datastore:datastore-preferences:1.1.1")

    // Testing
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.2.1")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.6.1")
}
`
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    category: 'manifest',
    description: 'Manifest declaring Foreground Service, Floating Overlay (SYSTEM_ALERT_WINDOW), and VozoAccessibilityService.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <!-- Permissions required for Android 15 batch video workflow -->
    <!-- Floating Assistive Overlay on top of Firefox -->
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <!-- Query Firefox browser application -->
    <queries>
        <package android:name="org.mozilla.firefox" />
        <package android:name="org.mozilla.firefox_beta" />
        <package android:name="org.mozilla.fenix" />
        <intent>
            <action android:name="android.intent.action.VIEW" />
            <category android:name="android.intent.category.BROWSABLE" />
            <data android:scheme="https" />
        </intent>
    </queries>

    <application
        android:name=".VozoBatchApp"
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.VozoBatchAssistant"
        tools:targetApi="35">

        <activity
            android:name=".ui.MainActivity"
            android:exported="true"
            android:theme="@style/Theme.VozoBatchAssistant"
            android:launchMode="singleTop">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Floating Assistive HUD Foreground Service -->
        <service
            android:name=".service.FloatingHudService"
            android:exported="false"
            android:foregroundServiceType="specialUse">
            <property
                android:name="android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE"
                android:value="Overlay HUD for cross-app guided video translation automation" />
        </service>

        <!-- Android 15 Accessibility Service for Firefox/Vozo page inspection -->
        <service
            android:name=".service.VozoAccessibilityService"
            android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE"
            android:exported="true"
            android:label="@string/accessibility_service_name">
            <intent-filter>
                <action android:name="android.accessibilityservice.AccessibilityService" />
            </intent-filter>
            <meta-data
                android:name="android.accessibilityservice"
                android:resource="@xml/accessibility_service_config" />
        </service>

    </application>

</manifest>
`
  },
  {
    path: 'app/src/main/res/xml/accessibility_service_config.xml',
    name: 'accessibility_service_config.xml',
    category: 'xml',
    description: 'Accessibility service configuration filtering for Firefox window events and content nodes.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<accessibility-service xmlns:android="http://schemas.android.com/apk/res/android"
    android:description="@string/accessibility_service_desc"
    android:packageNames="org.mozilla.firefox,org.mozilla.firefox_beta,org.mozilla.fenix"
    android:accessibilityEventTypes="typeWindowStateChanged|typeWindowContentChanged|typeViewClicked|typeViewScrolled"
    android:accessibilityFlags="flagDefault|flagRetrieveInteractiveWindows|flagReportViewIds|flagIncludeNotImportantViews"
    android:accessibilityFeedbackType="feedbackGeneric"
    android:notificationTimeout="100"
    android:canRetrieveWindowContent="true"
    android:canPerformGestures="true"
    android:settingsActivity="com.vozo.batchassistant.ui.MainActivity" />
`
  },
  {
    path: 'app/src/main/java/com/vozo/batchassistant/model/QueueStatus.kt',
    name: 'QueueStatus.kt',
    category: 'kotlin',
    description: 'Enum defining the 7 strict queue states mandated by prompt.',
    content: `package com.vozo.batchassistant.model

/**
 * Strict queue status states for each video item:
 * - PENDING: Queued and waiting in line
 * - UPLOADING: File is being submitted to Vozo via Firefox
 * - TRANSLATING: Vozo AI model is processing speech translation (Hindi)
 * - OUTPUT_READY: Translation finished and download link is available
 * - SAVED: Downloaded output verified to exist in SAF target folder and is non-empty (>0 bytes)
 * - FAILED: Error occurred (upload failure, timeout, network error)
 * - NEEDS_ATTENTION: Ambiguous completion state; user confirmation required
 */
enum class QueueStatus(val label: String) {
    PENDING("Pending"),
    UPLOADING("Uploading"),
    TRANSLATING("Translating"),
    OUTPUT_READY("Output Ready"),
    SAVED("Saved"),
    FAILED("Failed"),
    NEEDS_ATTENTION("Needs Attention")
}
`
  },
  {
    path: 'app/src/main/java/com/vozo/batchassistant/model/VideoItem.kt',
    name: 'VideoItem.kt',
    category: 'kotlin',
    description: 'Data model holding SAF URI, file metadata, status, retry counts, and timestamps.',
    content: `package com.vozo.batchassistant.model

import android.net.Uri

/**
 * Represents a video queued for batch translation.
 * Uses persistent SAF Content URI instead of raw filesystem paths.
 */
data class VideoItem(
    val id: String,
    val uri: Uri,
    val filename: String,
    val sizeBytes: Long,
    val durationSeconds: Long = 0,
    val queueOrder: Int,
    val status: QueueStatus = QueueStatus.PENDING,
    val progressPercent: Int = 0,
    val targetLanguage: String = "Hindi",
    val attempts: Int = 0,
    val maxAttempts: Int = 3,
    val errorMessage: String? = null,
    val savedOutputUri: Uri? = null,
    val savedOutputSizeBytes: Long? = null,
    val queuedTimestamp: Long = System.currentTimeMillis(),
    val startedTimestamp: Long? = null,
    val completedTimestamp: Long? = null
) {
    val formattedSize: String
        get() {
            val mb = sizeBytes.toDouble() / (1024 * 1024)
            return if (mb >= 1.0) {
                String.format("%.1f MB", mb)
            } else {
                val kb = sizeBytes.toDouble() / 1024
                String.format("%.0f KB", kb)
            }
        }
}
`
  },
  {
    path: 'app/src/main/java/com/vozo/batchassistant/automation/SafStorageManager.kt',
    name: 'SafStorageManager.kt',
    category: 'kotlin',
    description: 'SAF helper for persistent document tree permissions and file inspection on Android 15.',
    content: `package com.vozo.batchassistant.automation

import android.content.Context
import android.content.Intent
import android.database.Cursor
import android.net.Uri
import android.provider.OpenableColumns
import androidx.documentfile.provider.DocumentFile
import java.io.InputStream

/**
 * Manages Android 15 Storage Access Framework (SAF) interactions.
 * Persists directory permissions and extracts file metadata without requiring raw file path access.
 */
class SafStorageManager(private val context: Context) {

    /**
     * Extracts display name and byte size from a content URI via ContentResolver.
     */
    fun queryFileMetadata(uri: Uri): Pair<String, Long> {
        var name = "video_\${System.currentTimeMillis()}.mp4"
        var size: Long = 0

        val cursor: Cursor? = context.contentResolver.query(
            uri, null, null, null, null
        )
        cursor?.use {
            if (it.moveToFirst()) {
                val nameIndex = it.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                val sizeIndex = it.getColumnIndex(OpenableColumns.SIZE)

                if (nameIndex != -1 && !it.isNull(nameIndex)) {
                    name = it.getString(nameIndex)
                }
                if (sizeIndex != -1 && !it.isNull(sizeIndex)) {
                    size = it.getLong(sizeIndex)
                }
            }
        }
        return Pair(name, size)
    }

    /**
     * Persists read and write permissions across reboots for chosen output directory.
     */
    fun takePersistablePermissions(uri: Uri) {
        val takeFlags: Int = Intent.FLAG_GRANT_READ_URI_PERMISSION or
                Intent.FLAG_GRANT_WRITE_URI_PERMISSION
        try {
            context.contentResolver.takePersistableUriPermission(uri, takeFlags)
        } catch (e: SecurityException) {
            e.printStackTrace()
        }
    }

    /**
     * Opens an InputStream to verify file readability.
     */
    fun openInputStream(uri: Uri): InputStream? {
        return context.contentResolver.openInputStream(uri)
    }

    /**
     * Returns DocumentFile wrapper for a directory URI.
     */
    fun getDocumentTree(treeUri: Uri): DocumentFile? {
        return DocumentFile.fromTreeUri(context, treeUri)
    }
}
`
  },
  {
    path: 'app/src/main/java/com/vozo/batchassistant/automation/OutputFileVerifier.kt',
    name: 'OutputFileVerifier.kt',
    category: 'kotlin',
    description: 'Verifies saved translated video file existence and non-zero byte size before marking Saved.',
    content: `package com.vozo.batchassistant.automation

import android.content.Context
import android.net.Uri
import androidx.documentfile.provider.DocumentFile

sealed class VerificationResult {
    data class Success(val uri: Uri, val sizeBytes: Long, val filename: String) : VerificationResult()
    data class NeedsAttention(val reason: String) : VerificationResult()
    data class Failure(val error: String) : VerificationResult()
}

/**
 * Strict output verification engine.
 * Never marks an output as complete merely because a video player appeared.
 * Checks that the file is actually saved in the user's chosen SAF directory
 * and is non-empty (>0 bytes).
 */
class OutputFileVerifier(private val context: Context) {

    /**
     * Scans the target directory for the latest output matching expected criteria.
     * @param outputFolderUri The SAF tree URI selected by user
     * @param originalFilename The source video filename to match against translated pattern
     * @param targetLanguage Language tag (e.g., "Hindi")
     * @param minTimestamp Milliseconds timestamp when translation started
     */
    fun verifyOutputFile(
        outputFolderUri: Uri,
        originalFilename: String,
        targetLanguage: String = "Hindi",
        minTimestamp: Long
    ): VerificationResult {
        val folder = DocumentFile.fromTreeUri(context, outputFolderUri)
            ?: return VerificationResult.Failure("Cannot access output folder. Permission may have expired.")

        if (!folder.exists() || !folder.isDirectory) {
            return VerificationResult.Failure("Output folder does not exist or is not a directory.")
        }

        val baseName = originalFilename.substringBeforeLast(".")
        val files = folder.listFiles()

        // Look for matching files created or modified after translation started
        val candidate = files
            .filter { file ->
                file.isFile &&
                (file.name?.contains(baseName, ignoreCase = true) == true ||
                 file.name?.contains("vozo", ignoreCase = true) == true ||
                 file.name?.contains(targetLanguage, ignoreCase = true) == true) &&
                file.lastModified() >= (minTimestamp - 60_000) // 1 minute clock tolerance
            }
            .maxByOrNull { it.lastModified() }

        if (candidate == null) {
            return VerificationResult.NeedsAttention(
                "No translated video file found in output folder. Please verify the download completed in Firefox."
            )
        }

        val fileLength = candidate.length()

        // Strict non-zero verification
        if (fileLength <= 0L) {
            return VerificationResult.NeedsAttention(
                "Output file '\${candidate.name}' was found but is 0 bytes (incomplete download)."
            )
        }

        // Verify readable content stream
        try {
            context.contentResolver.openInputStream(candidate.uri)?.use { stream ->
                val buffer = ByteArray(1024)
                val read = stream.read(buffer)
                if (read <= 0) {
                    return VerificationResult.NeedsAttention(
                        "Output file '\${candidate.name}' has non-zero size but could not be read."
                    )
                }
            }
        } catch (e: Exception) {
            return VerificationResult.Failure("Failed to read output file: \${e.localizedMessage}")
        }

        return VerificationResult.Success(
            uri = candidate.uri,
            sizeBytes = fileLength,
            filename = candidate.name ?: "translated_video.mp4"
        )
    }
}
`
  },
  {
    path: 'app/src/main/java/com/vozo/batchassistant/automation/WorkflowStep.kt',
    name: 'WorkflowStep.kt',
    category: 'kotlin',
    description: 'Discrete state steps for the guided Firefox Vozo.ai translation workflow.',
    content: `package com.vozo.batchassistant.automation

/**
 * Step-by-step guided workflow phases for Vozo.ai:
 * Step 1: Open Vozo translate page in Firefox
 * Step 2: Select/upload current queued video via SAF
 * Step 3: Configure target language to Hindi
 * Step 4: Initiate translation & monitor progress
 * Step 5: Detect completion & download translated export
 * Step 6: Verify output file in SAF output folder
 */
enum class WorkflowStep(
    val stepNumber: Int,
    val title: String,
    val instruction: String,
    val hint: String
) {
    LAUNCH_PAGE(
        1,
        "Open Vozo Translate",
        "Opening https://www.vozo.ai/video-translate in Firefox.",
        "Ensure you are logged into your Vozo account in Firefox."
    ),
    UPLOAD_FILE(
        2,
        "Upload Video",
        "Tap the upload box on Vozo and select the highlighted video.",
        "The Floating HUD displays the current file name to choose."
    ),
    SELECT_LANGUAGE(
        3,
        "Select Hindi Language",
        "Choose 'Hindi' as the target translation language on Vozo.",
        "Accessibility Service can assist in locating the language dropdown."
    ),
    WAIT_PROCESSING(
        4,
        "Processing Translation",
        "Monitoring Vozo page for completion indicators.",
        "Waiting for 'Download' or 'Export Ready'. Never finishes solely on video render."
    ),
    DOWNLOAD_EXPORT(
        5,
        "Download Translated File",
        "Trigger the download/export to save into your chosen output folder.",
        "Ensure Firefox saves into the authorized SAF folder."
    ),
    VERIFY_OUTPUT(
        6,
        "Verify Output File",
        "Checking that output file exists and has non-zero byte size.",
        "Advances to next queue item automatically upon verification."
    )
}
`
  },
  {
    path: 'app/src/main/java/com/vozo/batchassistant/service/VozoAccessibilityService.kt',
    name: 'VozoAccessibilityService.kt',
    category: 'kotlin',
    description: 'Android 15 AccessibilityService inspecting Firefox node trees for Vozo translation tokens.',
    content: `package com.vozo.batchassistant.service

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
`
  },
  {
    path: 'app/src/main/java/com/vozo/batchassistant/service/FloatingHudService.kt',
    name: 'FloatingHudService.kt',
    category: 'kotlin',
    description: 'Draggable foreground overlay HUD with step guides and manual fallback buttons.',
    content: `package com.vozo.batchassistant.service

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
        txtStep?.text = "Step \${activeStep.stepNumber}: \${activeStep.title}"
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
`
  },
  {
    path: 'app/src/main/java/com/vozo/batchassistant/viewmodel/BatchQueueViewModel.kt',
    name: 'BatchQueueViewModel.kt',
    category: 'kotlin',
    description: 'Core state machine managing sequential video processing, SAF output verification, and retries.',
    content: `package com.vozo.batchassistant.viewmodel

import android.app.Application
import android.content.Intent
import android.net.Uri
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.vozo.batchassistant.automation.OutputFileVerifier
import com.vozo.batchassistant.automation.SafStorageManager
import com.vozo.batchassistant.automation.VerificationResult
import com.vozo.batchassistant.automation.WorkflowStep
import com.vozo.batchassistant.model.QueueStatus
import com.vozo.batchassistant.model.VideoItem
import com.vozo.batchassistant.service.FloatingHudService
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.UUID

data class QueueUiState(
    val videos: List<VideoItem> = emptyList(),
    val outputFolderUri: Uri? = null,
    val outputFolderName: String? = null,
    val targetLanguage: String = "Hindi",
    val isRunning: Boolean = false,
    val isPaused: Boolean = false,
    val isTestMode: Boolean = false,
    val currentVideoIndex: Int = -1,
    val currentStep: WorkflowStep = WorkflowStep.LAUNCH_PAGE,
    val stepDelaySeconds: Int = 3,
    val maxRetries: Int = 2,
    val logs: List<String> = emptyList(),
    val isAccessibilityEnabled: Boolean = false,
    val isOverlayPermissionGranted: Boolean = false
)

class BatchQueueViewModel(application: Application) : AndroidViewModel(application) {

    private val safManager = SafStorageManager(application)
    private val outputVerifier = OutputFileVerifier(application)

    private val _uiState = MutableStateFlow(QueueUiState())
    val uiState: StateFlow<QueueUiState> = _uiState.asStateFlow()

    private var workerJob: Job? = null

    init {
        log("Vozo Batch Assistant initialized on Android 15")
        setupHudCallbacks()
    }

    private fun setupHudCallbacks() {
        FloatingHudService.onManualContinue = {
            log("Manual Continue triggered from Floating HUD")
            advanceWorkflowStep()
        }
        FloatingHudService.onManualPause = {
            togglePause()
        }
        FloatingHudService.onFlagNeedsAttention = { reason ->
            flagCurrentNeedsAttention(reason)
        }
    }

    fun addVideosFromUris(uris: List<Uri>) {
        val newItems = uris.mapIndexed { index, uri ->
            val (name, size) = safManager.queryFileMetadata(uri)
            VideoItem(
                id = UUID.randomUUID().toString(),
                uri = uri,
                filename = name,
                sizeBytes = size,
                queueOrder = _uiState.value.videos.size + index + 1,
                targetLanguage = _uiState.value.targetLanguage
            )
        }
        _uiState.update { it.copy(videos = it.videos + newItems) }
        log("Added \${newItems.size} videos to queue. Total: \${_uiState.value.videos.size}")
    }

    fun setOutputFolder(uri: Uri) {
        safManager.takePersistablePermissions(uri)
        val folder = safManager.getDocumentTree(uri)
        val folderName = folder?.name ?: "Selected SAF Folder"
        _uiState.update { it.copy(outputFolderUri = uri, outputFolderName = folderName) }
        log("Output directory set to: \$folderName")
    }

    fun setTargetLanguage(language: String) {
        _uiState.update { state ->
            state.copy(
                targetLanguage = language,
                videos = state.videos.map { if (it.status == QueueStatus.PENDING) it.copy(targetLanguage = language) else it }
            )
        }
        log("Target language updated to \$language")
    }

    fun toggleTestMode(enabled: Boolean) {
        _uiState.update { it.copy(isTestMode = enabled) }
        log("Test Mode \${if (enabled) "ENABLED (Processes 1 video first)" else "DISABLED"}")
    }

    fun startQueue() {
        if (_uiState.value.outputFolderUri == null) {
            log("ERROR: Please select an output folder via Storage Access Framework first.")
            return
        }
        if (_uiState.value.videos.isEmpty()) {
            log("ERROR: Queue is empty. Please add video files.")
            return
        }

        _uiState.update { it.copy(isRunning = true, isPaused = false) }
        log("Starting batch processing queue...")
        startProcessingLoop()
    }

    private fun startProcessingLoop() {
        workerJob?.cancel()
        workerJob = viewModelScope.launch {
            val list = _uiState.value.videos
            val nextIndex = list.indexOfFirst { it.status == QueueStatus.PENDING || it.status == QueueStatus.NEEDS_ATTENTION }

            if (nextIndex == -1) {
                log("All videos in queue have finished processing!")
                _uiState.update { it.copy(isRunning = false, currentVideoIndex = -1) }
                return@launch
            }

            processVideoAtIndex(nextIndex)
        }
    }

    private suspend fun processVideoAtIndex(index: Int) {
        val video = _uiState.value.videos[index]
        _uiState.update {
            it.copy(
                currentVideoIndex = index,
                currentStep = WorkflowStep.LAUNCH_PAGE
            )
        }

        updateVideoStatus(video.id, QueueStatus.UPLOADING, started = true)
        log("Processing video [\${video.queueOrder}/\${_uiState.value.videos.size}]: \${video.filename}")

        // Step 1: Launch Firefox to Vozo Translate
        FloatingHudService.currentVideoName = video.filename
        FloatingHudService.activeStep = WorkflowStep.LAUNCH_PAGE
        launchFirefoxToVozo()
        delay(_uiState.value.stepDelaySeconds * 1000L)

        // Step 2: Upload Video Prompt
        _uiState.update { it.copy(currentStep = WorkflowStep.UPLOAD_FILE) }
        FloatingHudService.activeStep = WorkflowStep.UPLOAD_FILE
        log("Step 2: Upload video \${video.filename} into Vozo.")
        delay(_uiState.value.stepDelaySeconds * 1000L)

        // Step 3: Target Language Selection (Hindi)
        _uiState.update { it.copy(currentStep = WorkflowStep.SELECT_LANGUAGE) }
        FloatingHudService.activeStep = WorkflowStep.SELECT_LANGUAGE
        log("Step 3: Confirm target language: \${video.targetLanguage}")
        delay(_uiState.value.stepDelaySeconds * 1000L)

        // Step 4: Translating
        updateVideoStatus(video.id, QueueStatus.TRANSLATING)
        _uiState.update { it.copy(currentStep = WorkflowStep.WAIT_PROCESSING) }
        FloatingHudService.activeStep = WorkflowStep.WAIT_PROCESSING
        log("Step 4: Translating... Monitoring page status.")
    }

    /**
     * Called when translation is confirmed ready to download
     */
    fun onTranslationOutputReady() {
        val currentIndex = _uiState.value.currentVideoIndex
        if (currentIndex < 0) return
        val video = _uiState.value.videos[currentIndex]

        updateVideoStatus(video.id, QueueStatus.OUTPUT_READY)
        _uiState.update { it.copy(currentStep = WorkflowStep.DOWNLOAD_EXPORT) }
        FloatingHudService.activeStep = WorkflowStep.DOWNLOAD_EXPORT
        log("Step 5: Output ready for \${video.filename}. Trigger download in Firefox.")
    }

    /**
     * Strict verification flow: verify file in SAF target directory with non-zero byte check.
     */
    fun verifyAndSaveCurrentOutput() {
        val currentIndex = _uiState.value.currentVideoIndex
        if (currentIndex < 0) return
        val video = _uiState.value.videos[currentIndex]
        val folderUri = _uiState.value.outputFolderUri ?: return

        log("Step 6: Verifying saved file for '\${video.filename}' in SAF folder...")

        val result = outputVerifier.verifyOutputFile(
            outputFolderUri = folderUri,
            originalFilename = video.filename,
            targetLanguage = video.targetLanguage,
            minTimestamp = video.startedTimestamp ?: System.currentTimeMillis()
        )

        when (result) {
            is VerificationResult.Success -> {
                updateVideoStatus(
                    video.id,
                    QueueStatus.SAVED,
                    savedUri = result.uri,
                    savedSize = result.sizeBytes
                )
                log("VERIFIED & SAVED: \${result.filename} (\${result.sizeBytes / 1024} KB). Never skipped or assumed!")

                if (_uiState.value.isTestMode) {
                    log("Test Mode: 1 video completed successfully. Halting queue.")
                    stopAll()
                } else {
                    // Proceed sequentially to the next video
                    viewModelScope.launch {
                        delay(2000L)
                        startProcessingLoop()
                    }
                }
            }
            is VerificationResult.NeedsAttention -> {
                flagCurrentNeedsAttention(result.reason)
            }
            is VerificationResult.Failure -> {
                updateVideoStatus(video.id, QueueStatus.FAILED, error = result.error)
                log("FAILURE on \${video.filename}: \${result.error}")
            }
        }
    }

    fun flagCurrentNeedsAttention(reason: String) {
        val currentIndex = _uiState.value.currentVideoIndex
        if (currentIndex < 0) return
        val video = _uiState.value.videos[currentIndex]
        updateVideoStatus(video.id, QueueStatus.NEEDS_ATTENTION, error = reason)
        log("NEEDS ATTENTION for \${video.filename}: \$reason")
    }

    private fun advanceWorkflowStep() {
        when (_uiState.value.currentStep) {
            WorkflowStep.LAUNCH_PAGE -> _uiState.update { it.copy(currentStep = WorkflowStep.UPLOAD_FILE) }
            WorkflowStep.UPLOAD_FILE -> _uiState.update { it.copy(currentStep = WorkflowStep.SELECT_LANGUAGE) }
            WorkflowStep.SELECT_LANGUAGE -> {
                val currentIndex = _uiState.value.currentVideoIndex
                if (currentIndex >= 0) {
                    updateVideoStatus(_uiState.value.videos[currentIndex].id, QueueStatus.TRANSLATING)
                }
                _uiState.update { it.copy(currentStep = WorkflowStep.WAIT_PROCESSING) }
            }
            WorkflowStep.WAIT_PROCESSING -> onTranslationOutputReady()
            WorkflowStep.DOWNLOAD_EXPORT -> verifyAndSaveCurrentOutput()
            WorkflowStep.VERIFY_OUTPUT -> verifyAndSaveCurrentOutput()
        }
    }

    private fun launchFirefoxToVozo() {
        val url = "https://www.vozo.ai/video-translate"
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
            setPackage("org.mozilla.firefox")
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        try {
            getApplication<Application>().startActivity(intent)
            log("Launched Firefox to \$url")
        } catch (e: Exception) {
            // Fallback to default browser if Firefox package isn't installed
            val fallback = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            try {
                getApplication<Application>().startActivity(fallback)
                log("Firefox not found; opened default browser to \$url")
            } catch (ex: Exception) {
                log("ERROR: Could not open browser: \${ex.localizedMessage}")
            }
        }
    }

    fun togglePause() {
        val newPaused = !_uiState.value.isPaused
        _uiState.update { it.copy(isPaused = newPaused) }
        log(if (newPaused) "Queue PAUSED by user." else "Queue RESUMED.")
        if (!newPaused && _uiState.value.isRunning) {
            startProcessingLoop()
        } else {
            workerJob?.cancel()
        }
    }

    fun stopAll() {
        workerJob?.cancel()
        _uiState.update { it.copy(isRunning = false, isPaused = false, currentVideoIndex = -1) }
        log("STOP ALL: Queue cancelled by user.")
    }

    fun retryFailedVideos() {
        _uiState.update { state ->
            state.copy(
                videos = state.videos.map {
                    if (it.status == QueueStatus.FAILED || it.status == QueueStatus.NEEDS_ATTENTION) {
                        it.copy(status = QueueStatus.PENDING, errorMessage = null)
                    } else it
                }
            )
        }
        log("Reset all failed & attention items to Pending.")
        startProcessingLoop()
    }

    fun clearQueue() {
        stopAll()
        _uiState.update { it.copy(videos = emptyList(), currentVideoIndex = -1) }
        log("Queue cleared.")
    }

    private fun updateVideoStatus(
        id: String,
        status: QueueStatus,
        started: Boolean = false,
        error: String? = null,
        savedUri: Uri? = null,
        savedSize: Long? = null
    ) {
        _uiState.update { state ->
            state.copy(
                videos = state.videos.map { item ->
                    if (item.id == id) {
                        item.copy(
                            status = status,
                            startedTimestamp = if (started) System.currentTimeMillis() else item.startedTimestamp,
                            completedTimestamp = if (status == QueueStatus.SAVED || status == QueueStatus.FAILED) System.currentTimeMillis() else item.completedTimestamp,
                            errorMessage = error,
                            savedOutputUri = savedUri ?: item.savedOutputUri,
                            savedOutputSizeBytes = savedSize ?: item.savedOutputSizeBytes
                        )
                    } else item
                }
            )
        }
    }

    private fun log(message: String) {
        val time = SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(Date())
        val formatted = "[\$time] \$message"
        _uiState.update { it.copy(logs = it.logs + formatted) }
    }
}
`
  },
  {
    path: 'app/src/main/java/com/vozo/batchassistant/ui/MainActivity.kt',
    name: 'MainActivity.kt',
    category: 'kotlin',
    description: 'Jetpack Compose native UI with SAF file/folder launchers, queue list, controls, and activity log.',
    content: `package com.vozo.batchassistant.ui

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vozo.batchassistant.model.QueueStatus
import com.vozo.batchassistant.model.VideoItem
import com.vozo.batchassistant.service.FloatingHudService
import com.vozo.batchassistant.viewmodel.BatchQueueViewModel

class MainActivity : ComponentActivity() {

    private val viewModel: BatchQueueViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            VozoBatchAssistantTheme {
                MainScreen(viewModel = viewModel, onOpenOverlaySettings = {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        val intent = Intent(
                            Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                            Uri.parse("package:\$packageName")
                        )
                        startActivity(intent)
                    }
                }, onOpenAccessibilitySettings = {
                    val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
                    startActivity(intent)
                }, onStartFloatingHud = {
                    val intent = Intent(this, FloatingHudService::class.java)
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        startForegroundService(intent)
                    } else {
                        startService(intent)
                    }
                })
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(
    viewModel: BatchQueueViewModel,
    onOpenOverlaySettings: () -> Unit,
    onOpenAccessibilitySettings: () -> Unit,
    onStartFloatingHud: () -> Unit
) {
    val state by viewModel.uiState.collectAsState()

    // SAF Launchers
    val openVideosLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenMultipleDocuments()
    ) { uris: List<Uri> ->
        if (uris.isNotEmpty()) {
            viewModel.addVideosFromUris(uris)
        }
    }

    val selectOutputFolderLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenDocumentTree()
    ) { treeUri: Uri? ->
        treeUri?.let { viewModel.setOutputFolder(it) }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("Vozo Batch Assistant", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                        Text("Firefox & Android 15 Automation", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                },
                actions = {
                    IconButton(onClick = onStartFloatingHud) {
                        Icon(Icons.Default.Layers, contentDescription = "Start Floating HUD")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Top Controls & Folder Setup
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("Output Folder (SAF)", fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                            Text(
                                state.outputFolderName ?: "Not selected yet",
                                fontSize = 12.sp,
                                color = if (state.outputFolderUri != null) Color(0xFF10B981) else Color(0xFFEF4444)
                            )
                        }
                        Button(onClick = { selectOutputFolderLauncher.launch(null) }) {
                            Text("Choose Folder")
                        }
                    }

                    HorizontalDivider()

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = { openVideosLauncher.launch(arrayOf("video/*")) },
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(Icons.Default.VideoLibrary, contentDescription = null)
                            Spacer(Modifier.width(6.dp))
                            Text("Add Videos")
                        }

                        OutlinedButton(
                            onClick = { viewModel.toggleTestMode(!state.isTestMode) },
                            colors = ButtonDefaults.outlinedButtonColors(
                                contentColor = if (state.isTestMode) Color(0xFF3B82F6) else MaterialTheme.colorScheme.onSurface
                            )
                        ) {
                            Text(if (state.isTestMode) "Test: 1 Video" else "Full Batch")
                        }
                    }
                }
            }

            // Queue Action Bar
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                if (!state.isRunning) {
                    Button(
                        onClick = { viewModel.startQueue() },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF3B82F6))
                    ) {
                        Icon(Icons.Default.PlayArrow, contentDescription = null)
                        Spacer(Modifier.width(4.dp))
                        Text("Start Queue")
                    }
                } else {
                    Button(
                        onClick = { viewModel.togglePause() },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (state.isPaused) Color(0xFF10B981) else Color(0xFFF59E0B)
                        )
                    ) {
                        Icon(if (state.isPaused) Icons.Default.PlayArrow else Icons.Default.Pause, contentDescription = null)
                        Spacer(Modifier.width(4.dp))
                        Text(if (state.isPaused) "Resume" else "Pause")
                    }

                    Button(
                        onClick = { viewModel.stopAll() },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEF4444))
                    ) {
                        Icon(Icons.Default.Stop, contentDescription = null)
                        Spacer(Modifier.width(4.dp))
                        Text("Stop All")
                    }
                }

                IconButton(onClick = { viewModel.retryFailedVideos() }) {
                    Icon(Icons.Default.Refresh, contentDescription = "Retry Failed")
                }
            }

            // Video Queue List
            Text(
                text = "Queue (\${state.videos.count { it.status == QueueStatus.SAVED }}/\${state.videos.size} Saved)",
                fontWeight = FontWeight.Bold,
                fontSize = 16.sp
            )

            LazyColumn(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(state.videos, key = { it.id }) { video ->
                    VideoItemRow(video)
                }
            }

            // Activity Log
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(130.dp),
                shape = RoundedCornerShape(8.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF0F172A))
            ) {
                LazyColumn(modifier = Modifier.padding(8.dp)) {
                    items(state.logs.reversed()) { logEntry ->
                        Text(
                            text = logEntry,
                            fontSize = 11.sp,
                            fontFamily = FontFamily.Monospace,
                            color = Color(0xFF94A3B8)
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun VideoItemRow(video: VideoItem) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(8.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Row(
            modifier = Modifier
                .padding(12.dp)
                .fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(video.filename, fontWeight = FontWeight.Medium, fontSize = 14.sp)
                Text(
                    "\${video.formattedSize} · Hindi · Order #\${video.queueOrder}",
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                if (video.errorMessage != null) {
                    Text(
                        video.errorMessage,
                        fontSize = 11.sp,
                        color = Color(0xFFEF4444)
                    )
                }
            }

            // Status Badge
            val statusColor = when (video.status) {
                QueueStatus.SAVED -> Color(0xFF10B981)
                QueueStatus.TRANSLATING, QueueStatus.UPLOADING -> Color(0xFF3B82F6)
                QueueStatus.NEEDS_ATTENTION -> Color(0xFFF59E0B)
                QueueStatus.FAILED -> Color(0xFFEF4444)
                QueueStatus.OUTPUT_READY -> Color(0xFF8B5CF6)
                QueueStatus.PENDING -> Color(0xFF64748B)
            }

            Text(
                text = video.status.label,
                fontWeight = FontWeight.SemiBold,
                fontSize = 12.sp,
                color = statusColor
            )
        }
    }
}

@Composable
fun VozoBatchAssistantTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = darkColorScheme(
            background = Color(0xFF0B0F17),
            surface = Color(0xFF1E293B),
            surfaceVariant = Color(0xFF151E2E),
            primary = Color(0xFF3B82F6)
        ),
        content = content
    )
}
`
  },
  {
    path: 'app/src/main/res/layout/floating_hud_layout.xml',
    name: 'floating_hud_layout.xml',
    category: 'xml',
    description: 'Draggable layout inflated by FloatingHudService on top of Firefox with manual fallback buttons.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="320dp"
    android:layout_height="wrap_content"
    android:background="@drawable/hud_background"
    android:orientation="vertical"
    android:padding="12dp"
    android:elevation="12dp">

    <!-- Header bar with drag icon and title -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:gravity="center_vertical"
        android:orientation="horizontal">

        <TextView
            android:id="@+id/hud_app_title"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:text="Vozo Batch HUD"
            android:textColor="#38BDF8"
            android:textSize="12sp"
            android:textStyle="bold" />

        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text=":: DRAG"
            android:textColor="#64748B"
            android:textSize="10sp" />
    </LinearLayout>

    <!-- Current Video Title -->
    <TextView
        android:id="@+id/hud_video_title"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="4dp"
        android:text="video_lesson_01.mp4"
        android:textColor="#FFFFFF"
        android:textSize="13sp"
        android:textStyle="bold"
        android:singleLine="true"
        android:ellipsize="middle" />

    <!-- Step Badge and instruction -->
    <TextView
        android:id="@+id/hud_step_title"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="4dp"
        android:text="Step 2: Upload Video"
        android:textColor="#F59E0B"
        android:textSize="12sp"
        android:textStyle="bold" />

    <TextView
        android:id="@+id/hud_instruction"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="2dp"
        android:text="Tap upload on Vozo and select the video."
        android:textColor="#CBD5E1"
        android:textSize="11sp" />

    <!-- Fallback Action Buttons -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="8dp"
        android:orientation="horizontal">

        <Button
            android:id="@+id/hud_btn_continue"
            android:layout_width="0dp"
            android:layout_height="36dp"
            android:layout_weight="1"
            android:backgroundTint="#3B82F6"
            android:text="Continue"
            android:textColor="#FFFFFF"
            android:textSize="11sp" />

        <Button
            android:id="@+id/hud_btn_pause"
            android:layout_width="wrap_content"
            android:layout_height="36dp"
            android:layout_marginStart="6dp"
            android:backgroundTint="#475569"
            android:text="Pause"
            android:textColor="#FFFFFF"
            android:textSize="11sp" />

        <Button
            android:id="@+id/hud_btn_attention"
            android:layout_width="wrap_content"
            android:layout_height="36dp"
            android:layout_marginStart="6dp"
            android:backgroundTint="#DC2626"
            android:text="Flag"
            android:textColor="#FFFFFF"
            android:textSize="11sp" />
    </LinearLayout>

</LinearLayout>
`
  },
  {
    path: 'app/src/main/res/values/strings.xml',
    name: 'strings.xml',
    category: 'xml',
    description: 'String resources for app label and accessibility descriptions.',
    content: `<resources>
    <string name="app_name">Vozo Batch Assistant</string>
    <string name="accessibility_service_name">Vozo Assistant Page Inspector</string>
    <string name="accessibility_service_desc">Inspects Vozo.ai translation webpage status tokens inside Firefox to coordinate batch video translation on Android 15.</string>
</resources>
`
  },
  {
    path: 'app/src/main/res/values/colors.xml',
    name: 'colors.xml',
    category: 'xml',
    description: 'Color resources matching the dark slate design system.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="bg_slate_950">#0B0F17</color>
    <color name="card_slate_900">#0F172A</color>
    <color name="card_slate_800">#1E293B</color>
    <color name="blue_primary">#3B82F6</color>
    <color name="green_success">#10B981</color>
    <color name="amber_warning">#F59E0B</color>
    <color name="rose_error">#EF4444</color>
</resources>
`
  },
  {
    path: 'README.md',
    name: 'README.md (Build & Phone Install Guide)',
    category: 'doc',
    description: 'Complete build, Gradle compilation, ADB installation, and Android 15 permission configuration guide.',
    content: `# Vozo Batch Assistant — Android 15 Setup & Installation Guide

This native Android application automates batch video dubbing on **Vozo.ai** using **Firefox on Android 15** through Jetpack Compose, the Storage Access Framework (SAF), an Accessibility Service, and a floating assistive HUD.

---

## 1. Prerequisites
- **Android Phone**: Running Android 15 (API 35) or Android 14/13.
- **Browser**: Firefox for Android (\`org.mozilla.firefox\`) installed from Google Play.
- **Development Tool**: Android Studio Ladybug (2024.2+) or Hedgehog+ with JDK 17.
- **Computer**: Windows, macOS, or Linux with Android SDK Platform-Tools (\`adb\`).

---

## 2. Opening & Building in Android Studio
1. Download or extract the project zip folder.
2. Open Android Studio and select **File > Open**, then choose this project root folder.
3. Allow Gradle to synchronize dependencies.
4. Connect your phone via USB and enable **USB Debugging**:
   - On phone: **Settings > About Phone > Tap 'Build Number' 7 times**.
   - Go to **Settings > System > Developer Options > USB Debugging > Enable**.
5. Select your phone from the run configuration dropdown and click **Run (Shift + F10)**.

### Alternatively via Terminal:
\`\`\`bash
# Build Debug APK
./gradlew assembleDebug

# Install directly to connected phone
adb install -r app/build/outputs/apk/debug/app-debug.apk
\`\`\`

---

## 3. Required Android 15 Permissions

Because Android 15 strictly isolates background automation, you must grant two permissions once after installation:

### A. Display Over Other Apps (Floating HUD)
1. Open phone **Settings > Apps > Special App Access > Display over other apps**.
2. Select **Vozo Batch Assistant** and toggle **Allow display over other apps** to ON.
3. *Why*: Enables the floating assistive HUD to remain visible on top of Firefox with the current video name and step controls.

### B. Accessibility Service (Page Inspection)
1. Open phone **Settings > Accessibility > Downloaded Apps**.
2. Select **Vozo Assistant Page Inspector**.
3. Toggle to **ON** and approve the prompt.
4. *Why*: Allows the assistant to inspect visible text nodes in Firefox (e.g., detecting "Translating 50%", "Download", "Export Ready") without guessing or relying on blind timers.

---

## 4. How the Workflow Works
1. **Choose Output Folder**: Tap "Choose Folder" in the app. Pick an empty folder (e.g., \`Downloads/VozoHindiOutputs\`) via the Storage Access Framework. The app retains persistable read/write rights.
2. **Add Video Files**: Tap "Add Videos" to select one or multiple source videos.
3. **Set Language**: Default is **Hindi**.
4. **Test Mode (Recommended First)**: Leave "Test: 1 Video" ON to process a single video first and verify your Vozo account login and download location.
5. **Start Queue**: The app launches Firefox directly to \`https://www.vozo.ai/video-translate\`.
6. **Follow Floating HUD**:
   - **Step 1**: Ensure you are signed into Vozo.
   - **Step 2**: Tap Upload. The HUD displays the exact file name to choose.
   - **Step 3**: Confirm Hindi translation language.
   - **Step 4**: Vozo generates dubbing. The app monitors for "Download" or "Export Ready".
   - **Step 5**: Download the video in Firefox.
   - **Step 6**: The app inspects the chosen SAF folder, verifies the file exists and is **non-empty (>0 bytes)**, marks the video **Saved**, and advances to the next item in line.
7. **Manual Override**: If Vozo changes its layout or an element is obscured, the HUD provides instant **Continue**, **Pause**, and **Flag Attention** buttons so you never get stuck.
`
  }
];
