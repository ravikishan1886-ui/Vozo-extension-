package com.vozo.batchassistant.automation

/**
 * Step-by-step guided workflow phases for Vozo.ai:
 * Step 1: Open Vozo translate page in Firefox
 * Step 2: Select/upload current queued video via SAF
 * Step 3: Configure target language to Hindi
 * Step 4: Initiate translation & monitor progress
 * Step 5: Detect completion & download translated export
 * Step 6: Verify output file in SAF output folder
 */
enum class WorkflowStep(
    val stepNumber: Int,
    val title: String,
    val instruction: String,
    val hint: String
) {
    LAUNCH_PAGE(
        1,
        "Open Vozo Translate",
        "Opening https://www.vozo.ai/video-translate in Firefox.",
        "Ensure you are logged into your Vozo account in Firefox."
    ),
    UPLOAD_FILE(
        2,
        "Upload Video",
        "Tap the upload box on Vozo and select the highlighted video.",
        "The Floating HUD displays the current file name to choose."
    ),
    SELECT_LANGUAGE(
        3,
        "Select Hindi Language",
        "Choose 'Hindi' as the target translation language on Vozo.",
        "Accessibility Service can assist in locating the language dropdown."
    ),
    WAIT_PROCESSING(
        4,
        "Processing Translation",
        "Monitoring Vozo page for completion indicators.",
        "Waiting for 'Download' or 'Export Ready'. Never finishes solely on video render."
    ),
    DOWNLOAD_EXPORT(
        5,
        "Download Translated File",
        "Trigger the download/export to save into your chosen output folder.",
        "Ensure Firefox saves into the authorized SAF folder."
    ),
    VERIFY_OUTPUT(
        6,
        "Verify Output File",
        "Checking that output file exists and has non-zero byte size.",
        "Advances to next queue item automatically upon verification."
    )
}
