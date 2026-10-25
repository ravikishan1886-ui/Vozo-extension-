package com.vozo.batchassistant.automation

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
        var name = "video_${System.currentTimeMillis()}.mp4"
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
