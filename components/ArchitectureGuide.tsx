'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertCircle, 
  Terminal, 
  Copy, 
  Check, 
  HelpCircle, 
  ExternalLink,
  Layers,
  Smartphone,
  FolderLock,
  Eye,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export function ArchitectureGuide() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Overview */}
      <div className="border border-slate-800 bg-slate-900/60 rounded-2xl p-6 sm:p-8 space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">
          Android 15 Automation & Technical Feasibility Architecture
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          Automating cross-app web workflows on modern Android requires respecting Android 15&apos;s strict isolation boundaries. Below is a factual engineering breakdown of what Android APIs can natively execute, where system sandboxes restrict background gestures, and why the hybrid Floating HUD is the optimal production pattern.
        </p>
      </div>

      {/* Side-by-side Feasibility Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fully Supported on Android 15 */}
        <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>100% Technically Supported on Android 15</span>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="border-l-2 border-emerald-500 pl-3 space-y-1">
              <div className="font-semibold text-white">Storage Access Framework (SAF)</div>
              <p className="text-slate-400">
                Persistent URI access via <code className="text-emerald-300">takePersistableUriPermission</code>. Allows reading queue videos and verifying output folder contents without dangerous legacy filesystem permissions.
              </p>
            </div>

            <div className="border-l-2 border-emerald-500 pl-3 space-y-1">
              <div className="font-semibold text-white">Firefox Package Query & Accessibility Tree</div>
              <p className="text-slate-400">
                Android 15 <code className="text-emerald-300">&lt;queries&gt;</code> element safely binds to <code className="text-emerald-300">org.mozilla.firefox</code>. The AccessibilityService receives window and content change events and inspects text nodes for completion indicators.
              </p>
            </div>

            <div className="border-l-2 border-emerald-500 pl-3 space-y-1">
              <div className="font-semibold text-white">Floating Assistive Overlay HUD</div>
              <p className="text-emerald-300 font-mono text-[11px]">android.permission.SYSTEM_ALERT_WINDOW</p>
              <p className="text-slate-400">
                A draggable foreground window that stays visible over Firefox, presenting the active queued video name, current workflow step, and manual fallback buttons.
              </p>
            </div>

            <div className="border-l-2 border-emerald-500 pl-3 space-y-1">
              <div className="font-semibold text-white">Non-Empty Byte Verification</div>
              <p className="text-slate-400">
                Direct stream inspection ensuring target output files are strictly <code className="text-emerald-300">&gt; 0 bytes</code> before marking them Saved.
              </p>
            </div>
          </div>
        </div>

        {/* System Boundaries & Webpage Dependencies */}
        <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <AlertCircle className="w-5 h-5" />
            <span>Android 15 Restrictions & External Dependencies</span>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="border-l-2 border-amber-500 pl-3 space-y-1">
              <div className="font-semibold text-white">System File Picker Sandbox</div>
              <p className="text-slate-400">
                Android 15 blocks background AccessibilityServices from dispatching blind tap gestures inside system-privileged document picker dialogs. <em>Solution:</em> Floating HUD presents the exact video filename for instantaneous 1-tap user confirmation.
              </p>
            </div>

            <div className="border-l-2 border-amber-500 pl-3 space-y-1">
              <div className="font-semibold text-white">Vozo.ai Cloud Processing Time & Auth</div>
              <p className="text-slate-400">
                Translation speed depends entirely on Vozo.ai server queues and user subscription tiers. The app cannot bypass CAPTCHAs, logins, or paid credit limitations.
              </p>
            </div>

            <div className="border-l-2 border-amber-500 pl-3 space-y-1">
              <div className="font-semibold text-white">No Pure Timer Completion</div>
              <p className="text-slate-400">
                Video duration does not correlate linearly with dubbing time. Relying on timers leads to corrupt or truncated files. The app checks for real &quot;Download&quot; or &quot;Export&quot; page tokens and prompts &quot;Needs Attention&quot; on ambiguity.
              </p>
            </div>

            <div className="border-l-2 border-amber-500 pl-3 space-y-1">
              <div className="font-semibold text-white">Firefox Download Location Routing</div>
              <p className="text-slate-400">
                Firefox must be configured to download into the chosen SAF output directory, or the user can tap export to save directly to the target folder.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Step-by-Step Installation & Build Instructions */}
      <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-semibold text-white">
              Phone Build & Installation Commands (ADB & Android Studio)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">API 35 (Android 15)</span>
        </div>

        {/* Command 1: Open in Android Studio */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-200">
            1. Open in Android Studio or Compile via Gradle
          </div>
          <div className="relative bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-300">
            <pre className="overflow-x-auto">
              <code>{`# Navigate to project directory
cd VozoBatchAssistant

# Compile Debug APK
./gradlew assembleDebug`}</code>
            </pre>
            <button
              onClick={() => copyText('./gradlew assembleDebug', 1)}
              className="absolute right-3 top-3 p-1 text-slate-500 hover:text-white"
            >
              {copiedIndex === 1 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Command 2: Install via ADB */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-200">
            2. Install to Connected Android 15 Phone
          </div>
          <div className="relative bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-300">
            <pre className="overflow-x-auto">
              <code>{`# Verify device is authorized
adb devices

# Install APK to device
adb install -r app/build/outputs/apk/debug/app-debug.apk`}</code>
            </pre>
            <button
              onClick={() => copyText('adb install -r app/build/outputs/apk/debug/app-debug.apk', 2)}
              className="absolute right-3 top-3 p-1 text-slate-500 hover:text-white"
            >
              {copiedIndex === 2 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Step 3: Android 15 Settings Checklist */}
        <div className="space-y-3 pt-2">
          <div className="text-xs font-semibold text-slate-200">
            3. One-Time Android 15 Permission Checklist
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="border border-slate-800 bg-slate-950/60 rounded-lg p-4 space-y-2">
              <div className="font-semibold text-blue-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                <span>Display Over Other Apps</span>
              </div>
              <p className="text-slate-400">
                Go to <strong>Settings &gt; Apps &gt; Special App Access &gt; Display over other apps</strong>. Find <strong>Vozo Batch Assistant</strong> and toggle ON.
              </p>
              <div className="text-[11px] font-mono text-slate-500">
                android.permission.SYSTEM_ALERT_WINDOW
              </div>
            </div>

            <div className="border border-slate-800 bg-slate-950/60 rounded-lg p-4 space-y-2">
              <div className="font-semibold text-blue-400 flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                <span>Accessibility Page Inspector</span>
              </div>
              <p className="text-slate-400">
                Go to <strong>Settings &gt; Accessibility &gt; Downloaded Apps</strong>. Find <strong>Vozo Assistant Page Inspector</strong> and toggle ON.
              </p>
              <div className="text-[11px] font-mono text-slate-500">
                android.permission.BIND_ACCESSIBILITY_SERVICE
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
