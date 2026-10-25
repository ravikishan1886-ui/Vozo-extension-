package com.vozo.batchassistant.model

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
