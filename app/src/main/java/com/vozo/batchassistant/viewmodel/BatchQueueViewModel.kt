package com.vozo.batchassistant.viewmodel

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
        log("Added ${newItems.size} videos to queue. Total: ${_uiState.value.videos.size}")
    }

    fun setOutputFolder(uri: Uri) {
        safManager.takePersistablePermissions(uri)
        val folder = safManager.getDocumentTree(uri)
        val folderName = folder?.name ?: "Selected SAF Folder"
        _uiState.update { it.copy(outputFolderUri = uri, outputFolderName = folderName) }
        log("Output directory set to: $folderName")
    }

    fun setTargetLanguage(language: String) {
        _uiState.update { state ->
            state.copy(
                targetLanguage = language,
                videos = state.videos.map { if (it.status == QueueStatus.PENDING) it.copy(targetLanguage = language) else it }
            )
        }
        log("Target language updated to $language")
    }

    fun toggleTestMode(enabled: Boolean) {
        _uiState.update { it.copy(isTestMode = enabled) }
        log("Test Mode ${if (enabled) "ENABLED (Processes 1 video first)" else "DISABLED"}")
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
        log("Processing video [${video.queueOrder}/${_uiState.value.videos.size}]: ${video.filename}")

        // Step 1: Launch Firefox to Vozo Translate
        FloatingHudService.currentVideoName = video.filename
        FloatingHudService.activeStep = WorkflowStep.LAUNCH_PAGE
        launchFirefoxToVozo()
        delay(_uiState.value.stepDelaySeconds * 1000L)

        // Step 2: Upload Video Prompt
        _uiState.update { it.copy(currentStep = WorkflowStep.UPLOAD_FILE) }
        FloatingHudService.activeStep = WorkflowStep.UPLOAD_FILE
        log("Step 2: Upload video ${video.filename} into Vozo.")
        delay(_uiState.value.stepDelaySeconds * 1000L)

        // Step 3: Target Language Selection (Hindi)
        _uiState.update { it.copy(currentStep = WorkflowStep.SELECT_LANGUAGE) }
        FloatingHudService.activeStep = WorkflowStep.SELECT_LANGUAGE
        log("Step 3: Confirm target language: ${video.targetLanguage}")
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
        log("Step 5: Output ready for ${video.filename}. Trigger download in Firefox.")
    }

    /**
     * Strict verification flow: verify file in SAF target directory with non-zero byte check.
     */
    fun verifyAndSaveCurrentOutput() {
        val currentIndex = _uiState.value.currentVideoIndex
        if (currentIndex < 0) return
        val video = _uiState.value.videos[currentIndex]
        val folderUri = _uiState.value.outputFolderUri ?: return

        log("Step 6: Verifying saved file for '${video.filename}' in SAF folder...")

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
                log("VERIFIED & SAVED: ${result.filename} (${result.sizeBytes / 1024} KB). Never skipped or assumed!")

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
                log("FAILURE on ${video.filename}: ${result.error}")
            }
        }
    }

    fun flagCurrentNeedsAttention(reason: String) {
        val currentIndex = _uiState.value.currentVideoIndex
        if (currentIndex < 0) return
        val video = _uiState.value.videos[currentIndex]
        updateVideoStatus(video.id, QueueStatus.NEEDS_ATTENTION, error = reason)
        log("NEEDS ATTENTION for ${video.filename}: $reason")
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
            log("Launched Firefox to $url")
        } catch (e: Exception) {
            // Fallback to default browser if Firefox package isn't installed
            val fallback = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            try {
                getApplication<Application>().startActivity(fallback)
                log("Firefox not found; opened default browser to $url")
            } catch (ex: Exception) {
                log("ERROR: Could not open browser: ${ex.localizedMessage}")
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
        val formatted = "[$time] $message"
        _uiState.update { it.copy(logs = it.logs + formatted) }
    }
}
