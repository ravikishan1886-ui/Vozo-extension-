package com.vozo.batchassistant.ui

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
                            Uri.parse("package:$packageName")
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
                text = "Queue (${state.videos.count { it.status == QueueStatus.SAVED }}/${state.videos.size} Saved)",
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
                    "${video.formattedSize} · Hindi · Order #${video.queueOrder}",
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
