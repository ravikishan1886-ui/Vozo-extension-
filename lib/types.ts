export type QueueStatus =
  | 'Pending'
  | 'Uploading'
  | 'Translating'
  | 'Output Ready'
  | 'Saved'
  | 'Failed'
  | 'Needs Attention';

export interface VideoItem {
  id: string;
  filename: string;
  uri: string;
  sizeBytes: number;
  durationSeconds: number;
  queueOrder: number;
  status: QueueStatus;
  progressPercent: number;
  targetLanguage: string;
  errorMessage?: string;
  savedFilename?: string;
  savedSizeBytes?: number;
  savedTimestamp?: number;
  startedTimestamp?: number;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error';
  message: string;
}

export type WorkflowStepId = 1 | 2 | 3 | 4 | 5 | 6;

export interface WorkflowStepInfo {
  step: WorkflowStepId;
  title: string;
  instruction: string;
  detail: string;
}

export const WORKFLOW_STEPS: Record<WorkflowStepId, WorkflowStepInfo> = {
  1: {
    step: 1,
    title: 'Open Vozo Translate in Firefox',
    instruction: 'Launching https://www.vozo.ai/video-translate in Firefox.',
    detail: 'Ensure your Vozo.ai account is authenticated and has dubbing credits available.'
  },
  2: {
    step: 2,
    title: 'Upload Queued Video File',
    instruction: 'Upload file to Vozo web interface using Storage Access Framework.',
    detail: 'The Floating HUD highlights the active file name so you never select the wrong video.'
  },
  3: {
    step: 3,
    title: 'Select Target Language: Hindi',
    instruction: 'Configure translation parameters to target language Hindi.',
    detail: 'Accessibility Service detects language selection inputs on Vozo.ai.'
  },
  4: {
    step: 4,
    title: 'Processing Translation on Vozo',
    instruction: 'Waiting for Vozo cloud models to finish speech translation and dubbing.',
    detail: 'Monitors real page text tokens. Never marks complete merely because a video player rendered.'
  },
  5: {
    step: 5,
    title: 'Download Translated Export',
    instruction: 'Trigger video export and download into the authorized SAF folder.',
    detail: 'Firefox initiates file download directly into the chosen SAF directory tree.'
  },
  6: {
    step: 6,
    title: 'SAF Output Verification',
    instruction: 'Verifying that downloaded file exists and is strictly non-empty (>0 bytes).',
    detail: 'Checks document tree for matching filename and non-zero byte size before advancing queue.'
  }
};
