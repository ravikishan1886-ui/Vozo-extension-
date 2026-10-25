# Vozo Batch Assistant — Android 15 Setup & Installation Guide

This native Android application automates batch video dubbing on **Vozo.ai** using **Firefox on Android 15** through Jetpack Compose, the Storage Access Framework (SAF), an Accessibility Service, and a floating assistive HUD.

---

## 1. Prerequisites
- **Android Phone**: Running Android 15 (API 35) or Android 14/13.
- **Browser**: Firefox for Android (\`org.mozilla.firefox\`) installed from Google Play.
- **Development Tool**: Android Studio Ladybug (2024.2+) or Hedgehog+ with JDK 17.
- **Computer**: Windows, macOS, or Linux with Android SDK Platform-Tools (\`adb\`).

---

## 2. Opening & Building in Android Studio
1. Download or extract the project zip folder.
2. Open Android Studio and select **File > Open**, then choose this project root folder.
3. Allow Gradle to synchronize dependencies.
4. Connect your phone via USB and enable **USB Debugging**:
   - On phone: **Settings > About Phone > Tap 'Build Number' 7 times**.
   - Go to **Settings > System > Developer Options > USB Debugging > Enable**.
5. Select your phone from the run configuration dropdown and click **Run (Shift + F10)**.

### Alternatively via Terminal:
\`\`\`bash
# Build Debug APK
./gradlew assembleDebug

# Install directly to connected phone
adb install -r app/build/outputs/apk/debug/app-debug.apk
\`\`\`

---

## 3. Required Android 15 Permissions

Because Android 15 strictly isolates background automation, you must grant two permissions once after installation:

### A. Display Over Other Apps (Floating HUD)
1. Open phone **Settings > Apps > Special App Access > Display over other apps**.
2. Select **Vozo Batch Assistant** and toggle **Allow display over other apps** to ON.
3. *Why*: Enables the floating assistive HUD to remain visible on top of Firefox with the current video name and step controls.

### B. Accessibility Service (Page Inspection)
1. Open phone **Settings > Accessibility > Downloaded Apps**.
2. Select **Vozo Assistant Page Inspector**.
3. Toggle to **ON** and approve the prompt.
4. *Why*: Allows the assistant to inspect visible text nodes in Firefox (e.g., detecting "Translating 50%", "Download", "Export Ready") without guessing or relying on blind timers.

---

## 4. How the Workflow Works
1. **Choose Output Folder**: Tap "Choose Folder" in the app. Pick an empty folder (e.g., \`Downloads/VozoHindiOutputs\`) via the Storage Access Framework. The app retains persistable read/write rights.
2. **Add Video Files**: Tap "Add Videos" to select one or multiple source videos.
3. **Set Language**: Default is **Hindi**.
4. **Test Mode (Recommended First)**: Leave "Test: 1 Video" ON to process a single video first and verify your Vozo account login and download location.
5. **Start Queue**: The app launches Firefox directly to \`https://www.vozo.ai/video-translate\`.
6. **Follow Floating HUD**:
   - **Step 1**: Ensure you are signed into Vozo.
   - **Step 2**: Tap Upload. The HUD displays the exact file name to choose.
   - **Step 3**: Confirm Hindi translation language.
   - **Step 4**: Vozo generates dubbing. The app monitors for "Download" or "Export Ready".
   - **Step 5**: Download the video in Firefox.
   - **Step 6**: The app inspects the chosen SAF folder, verifies the file exists and is **non-empty (>0 bytes)**, marks the video **Saved**, and advances to the next item in line.
7. **Manual Override**: If Vozo changes its layout or an element is obscured, the HUD provides instant **Continue**, **Pause**, and **Flag Attention** buttons so you never get stuck.
