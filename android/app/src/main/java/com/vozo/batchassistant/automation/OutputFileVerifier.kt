package com.vozo.batchassistant.automation

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
                "Output file '${candidate.name}' was found but is 0 bytes (incomplete download)."
            )
        }

        // Verify readable content stream
        try {
            context.contentResolver.openInputStream(candidate.uri)?.use { stream ->
                val buffer = ByteArray(1024)
                val read = stream.read(buffer)
                if (read <= 0) {
                    return VerificationResult.NeedsAttention(
                        "Output file '${candidate.name}' has non-zero size but could not be read."
                    )
                }
            }
        } catch (e: Exception) {
            return VerificationResult.Failure("Failed to read output file: ${e.localizedMessage}")
        }

        return VerificationResult.Success(
            uri = candidate.uri,
            sizeBytes = fileLength,
            filename = candidate.name ?: "translated_video.mp4"
        )
    }
}
