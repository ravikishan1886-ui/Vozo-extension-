# Vozo Batch Assistant — Native Android 15 App & Interactive Companion

Automate batch video translation on Vozo.ai using Firefox for Android 15 through a native Kotlin & Jetpack Compose app featuring Storage Access Framework (SAF) integration, an Accessibility Service with a floating assistive HUD, deterministic completion verification, and an in-browser companion preview with full source code export.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed during interactive clarification and govern the implementation:

- **Confirmed Decision 1 (Automation Style)**: **Hybrid Accessibility Service with Floating Assistive Overlay HUD**. On Android 15, system file pickers and cross-origin browser canvases block raw blind background touches. The app pairs heuristic accessibility node matching with an interactive floating overlay HUD that provides seamless, persistent step-by-step guidance and reliable fallback controls (Continue, Pause, Retry, Step).
- **Confirmed Decision 2 (Environment Delivery)**: **Complete Android Project Source with In-Browser Interactive Preview & Zip Export**. The web environment hosts a full-fidelity interactive simulator and inspector allowing testing of queuing, SAF states, step transitions, and node inspection, alongside full production-ready Android files (`MainActivity.kt`, `VozoAccessibilityService.kt`, `FloatingHudService.kt`, `BatchQueueViewModel.kt`, `AndroidManifest.xml`, `build.gradle.kts`, `settings.gradle.kts`) and one-click ZIP packaging for direct compilation in Android Studio / phone installation.
- **Confirmed Decision 3 (Completion Detection)**: **Inspect Visible Page Text with User Confirmation Fallback**. Translation completion checks for real DOM/accessibility text tokens (e.g., "Download", "Export Ready", "Completed") without ever assuming completion simply because a video player rendered. If ambiguous, the system halts with "Needs Attention" and requests explicit user verification.

---

### 1. Overview & Core Concept

- **What It Does**: Vozo Batch Assistant enables content creators to queue multiple video files from Android storage, sequentially upload them to Vozo.ai via Firefox, configure target language translation (Hindi), detect processing completion, and verify exported files in a selected output folder.
- **Target Audience / Persona**: Video creators and localization specialists automating high-volume video dubbing on mobile devices without paid cloud automation infrastructure.
- **Key Value**: Replaces tedious manual repeating of multi-minute dubbing steps with an intelligent, fault-tolerant queue that tracks progress, guards against silent failures, respects Android 15 sandbox boundaries, and gives the user full control via floating HUD overrides.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Queue Setup & Directory Authorization**: User selects one or multiple local video files via Android's Storage Access Framework (`ACTION_OPEN_DOCUMENT`) and grants persistent folder permission for output saving (`ACTION_OPEN_DOCUMENT_TREE`).
2. **Workflow Activation**: User selects translation language (Hindi default), configures retry/delay thresholds, toggles Test Mode (single video test), and taps "Start Queue".
3. **Floating HUD & Firefox Launch**: The app requests the `SYSTEM_ALERT_WINDOW` permission and launches Firefox directly to `https://www.vozo.ai/video-translate`. A compact, draggable floating HUD appears with the current video name, step instructions, and manual fallback buttons.
4. **Step-by-Step Translation Assistance**:
   - Step 1: Upload trigger (prompts user or taps file upload input).
   - Step 2: Language selection (Hindi target dubbing).
   - Step 3: Generation & Completion detection (monitors page text for "Download", "Completed", or flags "Needs Attention").
   - Step 4: Download & Output Verification (verifies downloaded file in chosen SAF output folder with non-zero byte size check).
   - Step 5: Advance to next queued video or halt on failure.
5. **Detailed Activity Log & Controls**: Real-time log entries with timestamps, error reporting, queue reordering, and a global "Stop All" emergency halt.

#### Visual Identity & Theme
- **Aesthetic Direction**: High-utility developer & creator console, engineered with clean slate neutrals, tactile segmented controls, and high-contrast typography designed for thumb navigation and mobile split-screen / overlay readability.
- **Color Palette**:
  - Dominant Neutral Canvas: `#0F172A` (Slate 900) dark background with `#1E293B` (Slate 800) container surfaces.
  - Accent Budget: `#3B82F6` (Electric Blue) for primary queue actions and active indicators; `#10B981` (Emerald) for verified outputs.
  - Warning/Attention: `#F59E0B` (Amber) for Needs Attention state; `#EF4444` (Rose) for failed steps.
- **Typography & Hierarchy**:
  - Headings: `Plus Jakarta Sans`, SemiBold, balanced tracking.
  - Body & UI: `DM Sans` / clean system sans, high legibility.
  - Timers, byte sizes, and activity logs: `JetBrains Mono` / tabular numerals (`tabular-nums`) to eliminate layout jump.
- **Component Styling**:
  - Compact data rows with clear status indicators (Pending, Uploading, Translating, Output Ready, Saved, Failed, Needs Attention).
  - Floating HUD mock preview and responsive mobile drawer.
  - Zero static pill boxes: status information rendered as unboxed text with subtle typographic separators (`·`).

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Floating HUD vs. Full Blind Automation**
  - *Chosen Approach*: Implement a foreground Floating HUD Service alongside the AccessibilityService.
  - *Why*: Android 15 prohibits AccessibilityServices from dispatching gestures inside privileged system pickers and secure browser sandboxes without explicit foreground user presence. The Floating HUD ensures zero deadlock by offering 1-tap "Continue" / "Pick Video" / "Verify" buttons on top of Firefox.
  - *Alternatives Considered*: Pure background accessibility script (fails silently on file picker dialogs).
- **Decision 2: Storage Access Framework (SAF) vs. Legacy File Paths**
  - *Chosen Approach*: Full Android SAF URI management with `takePersistableUriPermission`.
  - *Why*: Android 15 completely restricts raw filesystem paths (`/sdcard/...`). SAF is the only reliable way to read user media and write/verify downloaded videos across scoped storage.
- **Decision 3: Complete Native Android Project + Interactive Web Runner**
  - *Chosen Approach*: Deliver the complete native Android codebase (Kotlin, Jetpack Compose, Gradle, Manifest, Accessibility and HUD Services) and provide a web-based interactive companion that simulates the full phone experience and provides direct ZIP file download.
  - *Why*: Enables immediate testing and validation in this AI Studio environment while giving the user direct access to deploy the code to Android Studio or their Android 15 phone.

---

### 4. Technical Architecture & Data Strategy (Technical Reference)

```
┌────────────────────────────────────────────────────────────────────────┐
│                   VOZO BATCH ASSISTANT ARCHITECTURE                   │
└────────────────────────────────────────────────────────────────────────┘

  [ Android 15 System ]               [ App Core / ViewModel ]
           │                                    │
    SAF File Picker ──(URIs + Meta)────────────►│ VideoQueueManager
  (Open Document / Tree)                        │  - Queue State (Pending..Saved)
           │                                    │  - Test Mode (1-video limit)
           ▼                                    │  - Config (Delays, Retries)
  [ Firefox for Android ]                       ▼
  https://vozo.ai/translate          [ Floating HUD & Overlay ]
           │                         - Draggable Window (SYSTEM_ALERT)
           ▼                         - Current Step Indicator
  [ VozoAccessibilityService ]       - Manual Fallback [Continue][Pause]
  - Window State Detection                      │
  - Text Node Inspection                        ▼
    ("Export", "Ready", "Download")  [ Output Verifier (SAF) ]
           │                         - Queries Output Tree Document
           └────────────────────────►- Checks Non-Empty Bytes (>0)
                                     - Advances Queue or flags NeedsAttention
```

#### Android Native Project Files Provided:
1. `app/src/main/java/com/vozo/batchassistant/MainActivity.kt`: Jetpack Compose UI (Queue, Controls, Status, Logs, SAF Launchers).
2. `app/src/main/java/com/vozo/batchassistant/service/VozoAccessibilityService.kt`: Accessibility node inspection, Firefox package filtering, event listener.
3. `app/src/main/java/com/vozo/batchassistant/service/FloatingHudService.kt`: Draggable system overlay with persistent status and override buttons.
4. `app/src/main/java/com/vozo/batchassistant/model/VideoItem.kt` & `QueueState.kt`: Reactive queue models with timestamps and error states.
5. `app/src/main/AndroidManifest.xml`: Declarations for SAF, AccessibilityService with metadata, and `SYSTEM_ALERT_WINDOW`.
6. `app/src/main/res/xml/accessibility_service_config.xml`: Target package (`org.mozilla.firefox`), feedback types, and flag configs.
7. `build.gradle.kts` & `settings.gradle.kts`: Android Gradle plugin 8.5+, Kotlin 2.0+, Jetpack Compose BOM.
8. Full installation and build instructions (`README.md` & step-by-step guide).

#### Web Companion & Simulator:
- A responsive Next.js application that provides:
  - Complete live interactive simulation of the queue and floating HUD workflow.
  - Step-by-step Firefox + Vozo translation walkthrough.
  - Source code explorer with syntax highlighting for all Android Kotlin, Gradle, and XML files.
  - One-click ZIP generation (`JSZip`) to download the complete ready-to-build Android Studio project.
