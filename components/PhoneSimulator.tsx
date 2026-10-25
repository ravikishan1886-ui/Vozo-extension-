'use client';

import React, { useState } from 'react';
import { 
  Globe, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Pause, 
  ArrowRight, 
  Eye, 
  FileText,
  Volume2,
  Download,
  UploadCloud,
  ChevronDown,
  Layers,
  Info
} from 'lucide-react';
import { VideoItem, WorkflowStepId, WORKFLOW_STEPS } from '@/lib/types';

interface PhoneSimulatorProps {
  currentVideo: VideoItem | null;
  currentStep: WorkflowStepId;
  isRunning: boolean;
  isPaused: boolean;
  outputFolder: string;
  onManualContinue: () => void;
  onManualPause: () => void;
  onFlagAttention: (reason: string) => void;
  onSimulateDownloadComplete: () => void;
  onSimulateCorruptDownload: () => void;
  onSimulatePageCompleted: () => void;
}

export function PhoneSimulator({
  currentVideo,
  currentStep,
  isRunning,
  isPaused,
  outputFolder,
  onManualContinue,
  onManualPause,
  onFlagAttention,
  onSimulateDownloadComplete,
  onSimulateCorruptDownload,
  onSimulatePageCompleted
}: PhoneSimulatorProps) {
  // HUD draggable position simulation
  const [hudPos, setHudPos] = useState({ x: 16, y: 80 });
  const [hudExpanded, setHudExpanded] = useState(true);

  const stepInfo = WORKFLOW_STEPS[currentStep];

  const handleOpenVozoExternal = () => {
    window.open('https://www.vozo.ai/video-translate', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Android 15 Phone Viewport Simulation (5 cols) */}
      <div className="lg:col-span-5 flex justify-center">
        <div className="w-[360px] h-[720px] bg-slate-950 rounded-[44px] border-4 border-slate-700 shadow-2xl relative overflow-hidden flex flex-col ring-1 ring-slate-800">
          {/* Hardware Punch-Hole Camera */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-black rounded-full z-50 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
          </div>

          {/* Android 15 Status Bar */}
          <div className="h-8 bg-slate-950 px-6 pt-1.5 flex items-center justify-between text-[11px] font-mono text-slate-400 z-40 select-none">
            <span>09:41</span>
            <div className="flex items-center gap-1.5 text-[10px]">
              <span>5G</span>
              <span>100%</span>
            </div>
          </div>

          {/* Firefox Browser Bar */}
          <div className="bg-slate-900 border-b border-slate-800 px-3 py-2 flex items-center gap-2 z-40">
            <div className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-[10px]">
              FF
            </div>
            <div className="flex-1 bg-slate-950 border border-slate-800 rounded-full px-3 py-1 flex items-center justify-between text-xs text-slate-300">
              <span className="truncate">https://www.vozo.ai/video-translate</span>
              <Globe className="w-3 h-3 text-slate-500 shrink-0 ml-1" />
            </div>
            <button
              onClick={handleOpenVozoExternal}
              title="Open real Vozo.ai in Firefox"
              className="text-slate-400 hover:text-white p-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Vozo Webpage Simulated Viewport */}
          <div className="flex-1 bg-slate-900/90 overflow-y-auto p-4 space-y-4 text-slate-200 text-xs relative select-none">
            {/* Vozo Web Brand Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="font-bold text-sm text-white tracking-tight flex items-center gap-1.5">
                <span className="text-blue-500 font-extrabold text-base">VOZO</span>
                <span>Video Dubbing</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-medium">Logged in</span>
            </div>

            {/* Vozo Upload Box */}
            <div
              className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
                currentStep === 2
                  ? 'border-blue-500 bg-blue-950/30'
                  : 'border-slate-800 bg-slate-950/40'
              }`}
            >
              <UploadCloud className="w-8 h-8 text-blue-400 mx-auto mb-1.5" />
              {currentVideo ? (
                <div>
                  <div className="font-medium text-white truncate">{currentVideo.filename}</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {(currentVideo.sizeBytes / (1024 * 1024)).toFixed(1)} MB · Ready for Dubbing
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-slate-300 font-medium">Tap to Upload Video</div>
                  <div className="text-[10px] text-slate-500">MP4, MOV, MKV up to 500MB</div>
                </div>
              )}
            </div>

            {/* Language Selection */}
            <div
              className={`p-3 rounded-xl border transition-colors ${
                currentStep === 3
                  ? 'border-blue-500 bg-blue-950/20'
                  : 'border-slate-800 bg-slate-950/30'
              }`}
            >
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Target Dubbing Language
              </label>
              <div className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white">
                <span className="font-semibold text-blue-400">Hindi (हिन्दी)</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>

            {/* Translation Progress or Player */}
            {currentStep >= 4 && (
              <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/40 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Processing Status</span>
                  <span className="text-blue-400 font-mono font-medium">
                    {currentStep === 4 ? 'Translating speech · 64%' : 'Finished'}
                  </span>
                </div>

                {currentStep === 4 ? (
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className="bg-blue-500 h-2 rounded-full w-2/3 animate-pulse" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="h-24 bg-black rounded-lg flex items-center justify-center text-slate-500 relative overflow-hidden border border-slate-800">
                      <Play className="w-8 h-8 text-slate-400" />
                      <div className="absolute bottom-1 left-2 text-[10px] text-slate-400 font-mono">
                        Preview: [Hindi Dubbed Audio Track]
                      </div>
                    </div>

                    <button
                      onClick={onSimulateDownloadComplete}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Video (Hindi Export)
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* FLOATING ASSISTIVE HUD OVERLAY (SYSTEM_ALERT_WINDOW) */}
          <div
            style={{ top: `${hudPos.y}px`, left: `${hudPos.x}px` }}
            className="absolute z-50 w-[328px] bg-slate-900/95 border border-blue-500/50 rounded-2xl p-3 shadow-2xl backdrop-blur-md transition-all select-none ring-1 ring-blue-500/30"
          >
            {/* Header with Drag Handle & Status */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                <span className="text-xs font-bold text-blue-400 tracking-tight">Vozo Batch HUD</span>
                <span className="text-[10px] text-slate-500">Android 15</span>
              </div>
              <button
                onClick={() => setHudExpanded(!hudExpanded)}
                className="text-[10px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800"
              >
                {hudExpanded ? 'Collapse' : 'Expand'}
              </button>
            </div>

            {hudExpanded && (
              <div className="pt-2 space-y-2">
                {/* Active File Name */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 truncate max-w-[200px]" title={currentVideo?.filename || 'No video'}>
                    {currentVideo ? currentVideo.filename : 'Waiting for queue start...'}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                    {currentVideo ? currentVideo.status : 'Idle'}
                  </span>
                </div>

                {/* Current Guided Step */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2 space-y-1">
                  <div className="text-[11px] font-semibold text-amber-400">
                    Step {stepInfo.step}: {stepInfo.title}
                  </div>
                  <div className="text-[10px] text-slate-300 leading-snug">
                    {stepInfo.instruction}
                  </div>
                </div>

                {/* Floating Manual Fallback Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={onManualContinue}
                    disabled={!isRunning}
                    className="flex-1 py-1.5 text-[11px] font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 disabled:opacity-40 transition-colors shadow-sm"
                  >
                    Continue
                  </button>
                  <button
                    onClick={onManualPause}
                    disabled={!isRunning}
                    className="px-2.5 py-1.5 text-[11px] font-medium text-slate-300 bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-40 transition-colors"
                  >
                    {isPaused ? 'Resume' : 'Pause'}
                  </button>
                  <button
                    onClick={() => onFlagAttention('User triggered manual inspection')}
                    disabled={!isRunning}
                    className="px-2.5 py-1.5 text-[11px] font-medium text-amber-300 bg-amber-950/40 border border-amber-900/60 rounded-lg hover:bg-amber-900/40 disabled:opacity-40 transition-colors"
                  >
                    Flag
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Android Navigation Bar */}
          <div className="h-6 bg-slate-950 flex items-center justify-center z-40">
            <div className="w-28 h-1 bg-slate-700 rounded-full" />
          </div>
        </div>
      </div>

      {/* Right Column: Workflow Inspector & Simulation Triggers (7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        {/* Step Walkthrough Cards */}
        <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white">Cross-App Guided Workflow State</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">Step {currentStep} of 6</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.values(WORKFLOW_STEPS).map((item) => {
              const isActive = currentStep === item.step && isRunning;
              const isPast = currentStep > item.step;

              return (
                <div
                  key={item.step}
                  className={`p-3 rounded-lg border transition-all ${
                    isActive
                      ? 'border-blue-500 bg-blue-950/30'
                      : isPast
                      ? 'border-emerald-800/50 bg-emerald-950/10'
                      : 'border-slate-800/80 bg-slate-950/40 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-300">
                      {item.step}. {item.title}
                    </span>
                    {isPast && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    {isActive && <span className="text-[10px] font-mono text-blue-400">CURRENT</span>}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">{item.instruction}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Real-time Accessibility Node Inspector */}
        <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-semibold text-slate-200">
                VozoAccessibilityService · Live Node Inspection (Firefox)
              </h4>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">
              Target: org.mozilla.firefox
            </span>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-400 space-y-1">
            <div className="text-slate-500">{'// AccessibilityNodeInfo stream filtered by package'}</div>
            <div>[NODE] rootInActiveWindow: &lt;android.webkit.WebView / GeckoView&gt;</div>
            <div className="text-blue-300">
              [TEXT] &quot;VOZO Video Dubbing&quot; · &quot;Target: Hindi&quot; · {currentStep >= 5 ? '"Download Video (Hindi Export)"' : '"Translating speech..."'}
            </div>
            <div className="text-emerald-400">
              [DETECTION] Completion tokens: {currentStep >= 5 ? 'DETECTED ("Download", "Export")' : 'PENDING'}
            </div>
          </div>
        </div>

        {/* Diagnostic & Edge-Case Testing Triggers */}
        <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-400" />
            <h4 className="text-xs font-semibold text-slate-200">
              Interactive Test Triggers (Simulate Android & Vozo Scenarios)
            </h4>
          </div>
          <p className="text-xs text-slate-400">
            Test how the assistant gracefully handles edge cases on Android 15 without blind assumptions:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={onSimulatePageCompleted}
              disabled={!isRunning}
              className="p-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg text-left disabled:opacity-40 transition-colors"
            >
              <div className="text-xs font-semibold text-white">Detect Ready</div>
              <div className="text-[11px] text-slate-400 mt-1">
                Simulates Vozo page rendering &quot;Download Video&quot; token
              </div>
            </button>

            <button
              onClick={onSimulateCorruptDownload}
              disabled={!isRunning}
              className="p-3 bg-amber-950/30 hover:bg-amber-900/40 border border-amber-900/60 rounded-lg text-left disabled:opacity-40 transition-colors"
            >
              <div className="text-xs font-semibold text-amber-300">Simulate 0-Byte Error</div>
              <div className="text-[11px] text-slate-400 mt-1">
                Flags &quot;Needs Attention&quot; on corrupt or empty output
              </div>
            </button>

            <button
              onClick={onSimulateDownloadComplete}
              disabled={!isRunning}
              className="p-3 bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-900/60 rounded-lg text-left disabled:opacity-40 transition-colors"
            >
              <div className="text-xs font-semibold text-emerald-300">Verify & Save SAF</div>
              <div className="text-[11px] text-slate-400 mt-1">
                Audits non-empty byte stream and marks item Saved
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
