package com.vozo.batchassistant.model

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
