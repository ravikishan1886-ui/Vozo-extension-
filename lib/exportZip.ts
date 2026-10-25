import JSZip from 'jszip';
import { ANDROID_PROJECT_FILES } from './androidProjectFiles';

export async function exportAndroidProjectZip(): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder('VozoBatchAssistant');

  if (!folder) {
    throw new Error('Failed to create project folder inside zip');
  }

  for (const file of ANDROID_PROJECT_FILES) {
    // Add file into the folder hierarchy
    folder.file(file.path, file.content);
  }

  // Generate blob
  const content = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  });

  // Trigger browser download
  const url = URL.createObjectURL(content);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'VozoBatchAssistant-Android15.zip';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
