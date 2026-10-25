'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Header } from '@/components/Header';
import { QueueManager } from '@/components/QueueManager';
import { PhoneSimulator } from '@/components/PhoneSimulator';
import { CodeInspector } from '@/components/CodeInspector';
import { ArchitectureGuide } from '@/components/ArchitectureGuide';
import { VideoItem, QueueStatus, ActivityLog, WorkflowStepId } from '@/lib/types';
import { exportAndroidProjectZip } from '@/lib/exportZip';

const INITIAL_VIDEOS: VideoItem[] = [
  {
    id: 'vid-01',
    filename: 'ai_marketing_course_lesson_01.mp4',
    uri: 'content://com.android.providers.media.documents/document/video%3A1042',
    sizeBytes: 48 * 1024 * 1024,
    durationSeconds: 142,
    queueOrder: 1,
    status: 'Pending',
    progressPercent: 0,
    targetLanguage: 'Hindi'
  },
  {
    id: 'vid-02',
    filename: 'product_walkthrough_hindi_dub.mp4',
    uri: 'content://com.android.providers.media.documents/document/video%3A1043',
    sizeBytes: 29 * 1024 * 1024,
    durationSeconds: 88,
    queueOrder: 2,
    status: 'Pending',
    progressPercent: 0,
    targetLanguage: 'Hindi'
  },
  {
    id: 'vid-03',
    filename: 'customer_interview_bangalore_talk.mp4',
    uri: 'content://com.android.providers.media.documents/document/video%3A1044',
    sizeBytes: 94 * 1024 * 1024,
    durationSeconds: 310,
    queueOrder: 3,
    status: 'Pending',
    progressPercent: 0,
    targetLanguage: 'Hindi'
  }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<'queue' | 'phone' | 'code' | 'guide'>('queue');
  const [videos, setVideos] = useState<VideoItem[]>(INITIAL_VIDEOS);
  const [outputFolder, setOutputFolder] = useState<string>(
    'content://com.android.externalstorage.documents/tree/primary%3ADownload%2FVozoHindi_Output'
  );
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isTestMode, setIsTestMode] = useState<boolean>(true);
  const [targetLanguage, setTargetLanguage] = useState<string>('Hindi');
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(-1);
  const [currentStep, setCurrentStep] = useState<WorkflowStepId>(1);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const [logs, setLogs] = useState<ActivityLog[]>([
    {
      id: 'log-0',
      timestamp: '09:00:00',
      level: 'info',
      message: 'Vozo Batch Assistant initialized. Android 15 & Jetpack Compose runtime ready.'
    },
    {
      id: 'log-1',
      timestamp: '09:00:01',
      level: 'info',
      message: 'SAF output directory authorized with persistable read/write permissions.'
    }
  ]);

  const addLog = (message: string, level: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    setLogs((prev) => [
      {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toLocaleTimeString(),
        level,
        message
      },
      ...prev.slice(0, 99)
    ]);
  };

  // SAF non-empty verification
  const verifyAndSaveOutput = React.useCallback(() => {
    if (currentVideoIndex < 0 || currentVideoIndex >= videos.length) return;
    const currentVideo = videos[currentVideoIndex];

    const translatedName = currentVideo.filename.replace(/\.mp4$/i, `_${targetLanguage}_dubbed.mp4`);
    const translatedSize = Math.round(currentVideo.sizeBytes * 0.98);

    // Strict non-zero byte verification
    if (translatedSize <= 0) {
      addLog(`VERIFICATION FAILED: Output file is 0 bytes for ${currentVideo.filename}. Needs Attention!`, 'warn');
      setVideos((prev) =>
        prev.map((v, i) =>
          i === currentVideoIndex
            ? { ...v, status: 'Needs Attention', errorMessage: 'Output file is 0 bytes (corrupt download)' }
            : v
        )
      );
      setIsRunning(false);
      return;
    }

    addLog(
      `VERIFIED & SAVED: ${translatedName} (${(translatedSize / (1024 * 1024)).toFixed(1)} MB) verified in SAF target folder.`,
      'success'
    );

    setVideos((prev) =>
      prev.map((v, i) =>
        i === currentVideoIndex
          ? {
              ...v,
              status: 'Saved',
              progressPercent: 100,
              savedFilename: translatedName,
              savedSizeBytes: translatedSize,
              savedTimestamp: Date.now()
            }
          : v
      )
    );

    // Check if Test Mode is active
    if (isTestMode) {
      addLog('Test Mode active: Single video tested and verified. Stopping queue as configured.', 'info');
      setIsRunning(false);
      setCurrentVideoIndex(-1);
      setCurrentStep(1);
      confetti({ particleCount: 50, spread: 60 });
      return;
    }

    // Advance to next video
    const nextIdx = videos.findIndex((v, i) => i > currentVideoIndex && v.status === 'Pending');
    if (nextIdx !== -1) {
      addLog(`Proceeding sequentially to next video in queue (#${videos[nextIdx].queueOrder}): ${videos[nextIdx].filename}`);
      setCurrentVideoIndex(nextIdx);
      setCurrentStep(1);
    } else {
      addLog('All videos in queue successfully dubbed, verified, and saved!', 'success');
      setIsRunning(false);
      setCurrentVideoIndex(-1);
      setCurrentStep(1);
      confetti({ particleCount: 90, spread: 80 });
    }
  }, [currentVideoIndex, videos, targetLanguage, isTestMode]);

  // Automated Sequential Processing Loop
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isRunning || isPaused || currentVideoIndex < 0 || currentVideoIndex >= videos.length) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const currentVideo = videos[currentVideoIndex];
    if (!currentVideo) return;

    // Sequential step machine
    timerRef.current = setInterval(() => {
      setCurrentStep((prevStep) => {
        if (prevStep === 1) {
          // Launch Firefox
          addLog(`Step 1: Firefox launched to https://www.vozo.ai/video-translate for ${currentVideo.filename}`);
          setVideos((prev) =>
            prev.map((v, i) =>
              i === currentVideoIndex ? { ...v, status: 'Uploading', startedTimestamp: Date.now() } : v
            )
          );
          return 2;
        }

        if (prevStep === 2) {
          // Upload file
          addLog(`Step 2: Uploading ${currentVideo.filename} via Storage Access Framework.`);
          return 3;
        }

        if (prevStep === 3) {
          // Language selection
          addLog(`Step 3: Target dubbing language set to ${currentVideo.targetLanguage}.`);
          setVideos((prev) =>
            prev.map((v, i) =>
              i === currentVideoIndex ? { ...v, status: 'Translating', progressPercent: 15 } : v
            )
          );
          return 4;
        }

        if (prevStep === 4) {
          // In-progress translation ticks
          setVideos((prev) => {
            const cur = prev[currentVideoIndex];
            if (!cur) return prev;
            const newPct = Math.min(95, cur.progressPercent + 25);
            return prev.map((v, i) => (i === currentVideoIndex ? { ...v, progressPercent: newPct } : v));
          });

          // Wait until 95% then advance to Output Ready
          const cur = videos[currentVideoIndex];
          if (cur && cur.progressPercent >= 90) {
            addLog(`Step 4: Vozo translation finished for ${currentVideo.filename}. Page shows "Download".`, 'success');
            setVideos((prev) =>
              prev.map((v, i) => (i === currentVideoIndex ? { ...v, status: 'Output Ready', progressPercent: 100 } : v))
            );
            return 5;
          }
          return 4;
        }

        if (prevStep === 5) {
          // Output ready -> prompt download in Firefox
          addLog(`Step 5: Output ready. Triggering Firefox download into SAF folder.`);
          return 6;
        }

        if (prevStep === 6) {
          // SAF non-empty verification
          verifyAndSaveOutput();
          return 1;
        }

        return prevStep;
      });
    }, 2400);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isPaused, currentVideoIndex, videos, verifyAndSaveOutput]);

  const handleStartQueue = () => {
    const nextIdx = videos.findIndex((v) => v.status === 'Pending' || v.status === 'Needs Attention');
    if (nextIdx === -1) {
      addLog('All videos are already processed. Reset or add videos to start.', 'warn');
      return;
    }

    addLog(`Starting queue execution from video #${videos[nextIdx].queueOrder}...`);
    setCurrentVideoIndex(nextIdx);
    setCurrentStep(1);
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePauseQueue = () => {
    setIsPaused(true);
    addLog('Queue paused by user.', 'warn');
  };

  const handleResumeQueue = () => {
    setIsPaused(false);
    addLog('Queue resumed.', 'info');
  };

  const handleStopAll = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentVideoIndex(-1);
    setCurrentStep(1);
    addLog('STOP ALL triggered: Queue execution stopped.', 'error');
  };

  const handleRetryFailed = () => {
    setVideos((prev) =>
      prev.map((v) =>
        v.status === 'Failed' || v.status === 'Needs Attention'
          ? { ...v, status: 'Pending', errorMessage: undefined, progressPercent: 0 }
          : v
      )
    );
    addLog('Failed and attention items reset to Pending.', 'info');
  };

  const handleClearQueue = () => {
    handleStopAll();
    setVideos([]);
    addLog('Queue cleared.', 'info');
  };

  const handleAddSampleVideos = () => {
    setVideos(INITIAL_VIDEOS);
    addLog('Sample Hindi translation batch loaded into queue.', 'info');
  };

  const handleAddCustomVideo = (filename: string, sizeBytes: number) => {
    const newItem: VideoItem = {
      id: `vid-${Date.now()}`,
      filename,
      uri: `content://com.android.providers.media.documents/document/video%3A${Date.now()}`,
      sizeBytes,
      durationSeconds: 120,
      queueOrder: videos.length + 1,
      status: 'Pending',
      progressPercent: 0,
      targetLanguage
    };
    setVideos((prev) => [...prev, newItem]);
    addLog(`Added ${filename} (${(sizeBytes / (1024 * 1024)).toFixed(1)} MB) to queue.`);
  };

  const handleRemoveVideo = (id: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== id).map((v, i) => ({ ...v, queueOrder: i + 1 })));
    addLog(`Removed video from queue.`);
  };

  const handleMoveVideo = (id: string, direction: 'up' | 'down') => {
    setVideos((prev) => {
      const idx = prev.findIndex((v) => v.id === id);
      if (idx === -1) return prev;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(idx, 1);
      copy.splice(targetIdx, 0, item);
      return copy.map((v, i) => ({ ...v, queueOrder: i + 1 }));
    });
  };

  // Manual fallback buttons on Floating HUD & Simulator
  const handleManualContinue = () => {
    addLog(`Manual Continue triggered on Step ${currentStep}. Advancing...`, 'info');
    if (currentStep === 6) {
      verifyAndSaveOutput();
    } else {
      setCurrentStep((prev) => (Math.min(6, prev + 1) as WorkflowStepId));
    }
  };

  const handleFlagAttention = (reason: string) => {
    if (currentVideoIndex >= 0 && currentVideoIndex < videos.length) {
      const cur = videos[currentVideoIndex];
      setVideos((prev) =>
        prev.map((v, i) => (i === currentVideoIndex ? { ...v, status: 'Needs Attention', errorMessage: reason } : v))
      );
      addLog(`NEEDS ATTENTION flagged for ${cur.filename}: ${reason}`, 'warn');
      setIsRunning(false);
    }
  };

  const handleSimulatePageCompleted = () => {
    addLog('Test Trigger: Vozo page finished dubbing. "Download" token detected by accessibility service.', 'success');
    setCurrentStep(5);
    if (currentVideoIndex >= 0) {
      setVideos((prev) =>
        prev.map((v, i) => (i === currentVideoIndex ? { ...v, status: 'Output Ready', progressPercent: 100 } : v))
      );
    }
  };

  const handleSimulateCorruptDownload = () => {
    addLog('Test Trigger: Simulated 0-byte downloaded file detected. Flagging Needs Attention.', 'error');
    if (currentVideoIndex >= 0) {
      const cur = videos[currentVideoIndex];
      setVideos((prev) =>
        prev.map((v, i) =>
          i === currentVideoIndex
            ? { ...v, status: 'Needs Attention', errorMessage: 'Output file is 0 bytes (corrupt download)' }
            : v
        )
      );
      setIsRunning(false);
    }
  };

  const handleExportZip = async () => {
    setIsExporting(true);
    try {
      await exportAndroidProjectZip();
      addLog('Complete Android 15 Jetpack Compose project exported as ZIP archive!', 'success');
      confetti({ particleCount: 70, spread: 70 });
    } catch (err) {
      addLog(`Failed to package ZIP: ${err instanceof Error ? err.message : String(err)}`, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const currentVideo = currentVideoIndex >= 0 ? videos[currentVideoIndex] : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExportZip={handleExportZip}
        isExporting={isExporting}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'queue' && (
          <QueueManager
            videos={videos}
            outputFolder={outputFolder}
            setOutputFolder={setOutputFolder}
            isRunning={isRunning}
            isPaused={isPaused}
            isTestMode={isTestMode}
            setIsTestMode={setIsTestMode}
            targetLanguage={targetLanguage}
            setTargetLanguage={setTargetLanguage}
            currentVideoIndex={currentVideoIndex}
            logs={logs}
            onStartQueue={handleStartQueue}
            onPauseQueue={handlePauseQueue}
            onResumeQueue={handleResumeQueue}
            onStopAll={handleStopAll}
            onRetryFailed={handleRetryFailed}
            onClearQueue={handleClearQueue}
            onAddSampleVideos={handleAddSampleVideos}
            onAddCustomVideo={handleAddCustomVideo}
            onRemoveVideo={handleRemoveVideo}
            onMoveVideo={handleMoveVideo}
          />
        )}

        {activeTab === 'phone' && (
          <PhoneSimulator
            currentVideo={currentVideo}
            currentStep={currentStep}
            isRunning={isRunning}
            isPaused={isPaused}
            outputFolder={outputFolder}
            onManualContinue={handleManualContinue}
            onManualPause={isPaused ? handleResumeQueue : handlePauseQueue}
            onFlagAttention={handleFlagAttention}
            onSimulateDownloadComplete={verifyAndSaveOutput}
            onSimulateCorruptDownload={handleSimulateCorruptDownload}
            onSimulatePageCompleted={handleSimulatePageCompleted}
          />
        )}

        {activeTab === 'code' && <CodeInspector />}

        {activeTab === 'guide' && <ArchitectureGuide />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl mx-auto w-full">
        <div>
          Vozo Batch Assistant · Native Kotlin & Jetpack Compose for Android 15 (API 35)
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>Firefox Package: org.mozilla.firefox</span>
          <span aria-hidden="true">·</span>
          <span>Storage Access Framework Scoped Storage</span>
        </div>
      </footer>
    </div>
  );
}
