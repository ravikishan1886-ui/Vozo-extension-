'use client';

import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Trash2, 
  FolderPlus, 
  Video, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FolderCheck,
  ShieldCheck,
  FileCheck2,
  SlidersHorizontal
} from 'lucide-react';
import { VideoItem, QueueStatus, ActivityLog } from '@/lib/types';

interface QueueManagerProps {
  videos: VideoItem[];
  outputFolder: string;
  setOutputFolder: (folder: string) => void;
  isRunning: boolean;
  isPaused: boolean;
  isTestMode: boolean;
  setIsTestMode: (val: boolean) => void;
  targetLanguage: string;
  setTargetLanguage: (lang: string) => void;
  currentVideoIndex: number;
  logs: ActivityLog[];
  onStartQueue: () => void;
  onPauseQueue: () => void;
  onResumeQueue: () => void;
  onStopAll: () => void;
  onRetryFailed: () => void;
  onClearQueue: () => void;
  onAddSampleVideos: () => void;
  onAddCustomVideo: (name: string, sizeBytes: number) => void;
  onRemoveVideo: (id: string) => void;
  onMoveVideo: (id: string, direction: 'up' | 'down') => void;
}

export function QueueManager({
  videos,
  outputFolder,
  setOutputFolder,
  isRunning,
  isPaused,
  isTestMode,
  setIsTestMode,
  targetLanguage,
  setTargetLanguage,
  currentVideoIndex,
  logs,
  onStartQueue,
  onPauseQueue,
  onResumeQueue,
  onStopAll,
  onRetryFailed,
  onClearQueue,
  onAddSampleVideos,
  onAddCustomVideo,
  onRemoveVideo,
  onMoveVideo,
}: QueueManagerProps) {
  const [customName, setCustomName] = useState('');
  const [customSizeMb, setCustomSizeMb] = useState('24.5');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState(outputFolder);

  const savedCount = videos.filter(v => v.status === 'Saved').length;
  const failedCount = videos.filter(v => v.status === 'Failed' || v.status === 'Needs Attention').length;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    const size = Math.max(1, Math.round((parseFloat(customSizeMb) || 10) * 1024 * 1024));
    const filename = customName.endsWith('.mp4') || customName.endsWith('.mov') || customName.endsWith('.mkv')
      ? customName
      : `${customName}.mp4`;
    onAddCustomVideo(filename, size);
    setCustomName('');
    setShowAddModal(false);
  };

  const handleFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      setOutputFolder(newFolderName.trim());
      setShowFolderModal(false);
    }
  };

  const getStatusColor = (status: QueueStatus) => {
    switch (status) {
      case 'Saved':
        return 'text-emerald-400';
      case 'Uploading':
      case 'Translating':
        return 'text-blue-400';
      case 'Output Ready':
        return 'text-violet-400';
      case 'Needs Attention':
        return 'text-amber-400';
      case 'Failed':
        return 'text-rose-400';
      case 'Pending':
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: SAF Output Folder & Scoped Storage Auth */}
      <div className="border border-slate-800 bg-slate-900/70 rounded-xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <FolderCheck className="w-4 h-4 text-emerald-400" />
              <span>Storage Access Framework (SAF) Destination Tree</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Persistable Read/Write Granted
              </span>
            </div>
            <div className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <span className="font-mono text-xs text-blue-300 break-all">{outputFolder}</span>
            </div>
          </div>
          <button
            onClick={() => {
              setNewFolderName(outputFolder);
              setShowFolderModal(true);
            }}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-750 transition-colors whitespace-nowrap shrink-0"
          >
            Change Output Folder
          </button>
        </div>
      </div>

      {/* Control Strip & Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1: Total Queue */}
        <div className="border border-slate-800 bg-slate-900/50 rounded-xl p-4">
          <div className="text-xs text-slate-400">Total in Queue</div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums mt-1">
            {videos.length} <span className="text-xs font-normal text-slate-500">videos</span>
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Target: <span className="text-blue-400 font-medium">{targetLanguage}</span>
          </div>
        </div>

        {/* Metric 2: Verified Saved */}
        <div className="border border-slate-800 bg-slate-900/50 rounded-xl p-4">
          <div className="text-xs text-slate-400">Verified & Saved</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums mt-1">
            {savedCount} <span className="text-xs font-normal text-slate-500">/ {videos.length}</span>
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Checked: <span className="text-emerald-400 font-medium">Non-empty file verification</span>
          </div>
        </div>

        {/* Metric 3: Active Status */}
        <div className="border border-slate-800 bg-slate-900/50 rounded-xl p-4">
          <div className="text-xs text-slate-400">Execution State</div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums mt-1 flex items-center gap-2">
            {isRunning ? (
              isPaused ? (
                <span className="text-amber-400 text-lg">Paused</span>
              ) : (
                <span className="text-blue-400 text-lg">Processing</span>
              )
            ) : (
              <span className="text-slate-400 text-lg">Idle</span>
            )}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Mode: <span className="text-slate-300 font-medium">{isTestMode ? '1-Video Test' : 'Continuous Batch'}</span>
          </div>
        </div>

        {/* Metric 4: Attention & Failed */}
        <div className="border border-slate-800 bg-slate-900/50 rounded-xl p-4">
          <div className="text-xs text-slate-400">Requires Attention / Failed</div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums mt-1">
            <span className={failedCount > 0 ? 'text-amber-400' : 'text-slate-400'}>{failedCount}</span>
          </div>
          <div className="text-xs text-slate-500 mt-2">
            {failedCount > 0 ? (
              <button onClick={onRetryFailed} className="text-amber-400 hover:underline">
                Reset to Pending & Retry
              </button>
            ) : (
              <span className="text-slate-500">No unresolved errors</span>
            )}
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border border-slate-800 bg-slate-900/60 rounded-xl">
        <div className="flex flex-wrap items-center gap-2.5">
          {!isRunning ? (
            <button
              onClick={onStartQueue}
              disabled={videos.length === 0}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 disabled:opacity-40 transition-colors shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Start Queue
            </button>
          ) : isPaused ? (
            <button
              onClick={onResumeQueue}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 transition-colors shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Resume Queue
            </button>
          ) : (
            <button
              onClick={onPauseQueue}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-500 transition-colors shadow-sm"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              Pause
            </button>
          )}

          {isRunning && (
            <button
              onClick={onStopAll}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-500 transition-colors"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              Stop All
            </button>
          )}

          <button
            onClick={onRetryFailed}
            disabled={failedCount === 0}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-750 disabled:opacity-40 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Retry Failed
          </button>

          <button
            onClick={onClearQueue}
            disabled={videos.length === 0 || isRunning}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-750 disabled:opacity-40 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Queue
          </button>
        </div>

        {/* Configuration Toggles */}
        <div className="flex items-center gap-3">
          {/* Test Mode Switch */}
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
            <input
              type="checkbox"
              checked={isTestMode}
              onChange={(e) => setIsTestMode(e.target.checked)}
              className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
            />
            <span>Test Mode (1 video first)</span>
          </label>

          <span className="text-slate-700">|</span>

          {/* Add Videos Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onAddSampleVideos}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-400 bg-blue-950/40 border border-blue-900/50 rounded-lg hover:bg-blue-900/40 transition-colors"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              Add Sample Batch
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-750 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Video
            </button>
          </div>
        </div>
      </div>

      {/* Main Video Queue List */}
      <div className="border border-slate-800 bg-slate-900/40 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">
            Sequential Processing Queue
          </h2>
          <span className="text-xs text-slate-500">
            One video at a time · Strict output verification
          </span>
        </div>

        {videos.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 mx-auto">
              <Video className="w-6 h-6" />
            </div>
            <div className="text-sm font-medium text-slate-200">Video queue is empty</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Add video files through Storage Access Framework or load the sample batch to test Hindi translation automation.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={onAddSampleVideos}
                className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors"
              >
                Load Sample Hindi Dub Batch
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-750 transition-colors"
              >
                Add Custom Video
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {videos.map((video, idx) => {
              const isCurrent = currentVideoIndex === idx && isRunning;
              const formattedMb = (video.sizeBytes / (1024 * 1024)).toFixed(1);

              return (
                <div
                  key={video.id}
                  className={`p-4 transition-colors ${
                    isCurrent ? 'bg-blue-950/20 border-l-2 border-l-blue-500' : 'hover:bg-slate-850/30'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-500">#{video.queueOrder}</span>
                        <span className="text-sm font-medium text-white truncate">{video.filename}</span>
                        {isCurrent && (
                          <span className="text-[11px] font-mono text-blue-400 animate-pulse">
                            ACTIVE
                          </span>
                        )}
                      </div>

                      {/* Unboxed Metadata Line */}
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-mono tabular-nums">
                        <span>{formattedMb} MB</span>
                        <span aria-hidden="true">·</span>
                        <span>Target: {video.targetLanguage}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-500 truncate max-w-[200px]" title={video.uri}>
                          SAF: {video.uri.replace('content://', '')}
                        </span>
                      </div>

                      {/* Error or Attention Note */}
                      {video.errorMessage && (
                        <div className="text-xs text-amber-300 flex items-center gap-1.5 pt-1">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>{video.errorMessage}</span>
                        </div>
                      )}

                      {/* Saved Verification details */}
                      {video.status === 'Saved' && video.savedFilename && (
                        <div className="text-xs text-emerald-400 flex items-center gap-1.5 pt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            Verified in SAF: {video.savedFilename} ({((video.savedSizeBytes || 0) / (1024 * 1024)).toFixed(1)} MB)
                          </span>
                        </div>
                      )}

                      {/* In-progress bar */}
                      {(video.status === 'Uploading' || video.status === 'Translating') && (
                        <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                          <div
                            className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${video.progressPercent}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <div className="text-right">
                        <span className={`text-xs font-semibold ${getStatusColor(video.status)}`}>
                          {video.status}
                        </span>
                        {video.status === 'Translating' && (
                          <div className="text-[10px] font-mono text-slate-400">
                            {video.progressPercent}% Dubbing
                          </div>
                        )}
                      </div>

                      {/* Reorder and Delete controls (when idle) */}
                      {!isRunning && (
                        <div className="flex items-center gap-1 border-l border-slate-800 pl-3">
                          <button
                            onClick={() => onMoveVideo(video.id, 'up')}
                            disabled={idx === 0}
                            className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-20"
                            title="Move Up"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => onMoveVideo(video.id, 'down')}
                            disabled={idx === videos.length - 1}
                            className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-20"
                            title="Move Down"
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => onRemoveVideo(video.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors ml-1"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Real-time Activity Log */}
      <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Activity Log & Output Auditing</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            {logs.length} events logged
          </span>
        </div>
        <div className="mt-3 font-mono text-xs space-y-1.5 max-h-48 overflow-y-auto pr-2">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 text-slate-400">
              <span className="text-slate-600 shrink-0">{log.timestamp}</span>
              <span
                className={
                  log.level === 'error'
                    ? 'text-rose-400 font-semibold'
                    : log.level === 'warn'
                    ? 'text-amber-400'
                    : log.level === 'success'
                    ? 'text-emerald-400'
                    : 'text-slate-300'
                }
              >
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Add Custom Video Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-semibold text-white">Add Video to Queue (SAF Simulation)</h3>
            <p className="text-xs text-slate-400">
              On Android 15, videos are picked via <code className="text-blue-400">ACTION_OPEN_DOCUMENT</code> without exposing root filesystem paths.
            </p>
            <form onSubmit={handleCustomSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Video Filename</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. course_lecture_04.mp4"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">File Size (MB)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  required
                  value={customSizeMb}
                  onChange={(e) => setCustomSizeMb(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500"
                >
                  Add Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Folder Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-semibold text-white">Choose SAF Output Folder</h3>
            <p className="text-xs text-slate-400">
              Simulates Android&apos;s <code className="text-blue-400">ACTION_OPEN_DOCUMENT_TREE</code>. The assistant requires persistent directory access to write and audit translated output files.
            </p>
            <form onSubmit={handleFolderSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Folder URI / Path</label>
                <input
                  type="text"
                  required
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono text-xs"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFolderModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500"
                >
                  Save Permission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
