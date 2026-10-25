import fs from 'fs';
import path from 'path';

// Read content from lib/androidProjectFiles.ts or define directly
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

async function run() {
  const tsContent = fs.readFileSync(path.join(root, 'lib/androidProjectFiles.ts'), 'utf-8');
  
  // Extract files using regex or dynamic extraction
  const matches = [...tsContent.matchAll(/path:\s*['"]([^'"]+)['"][\s\S]*?content:\s*`([\s\S]*?)`\s*}/g)];
  
  console.log(`Found ${matches.length} Android files to materialize on disk.`);
  for (const match of matches) {
    const relPath = match[1];
    let fileContent = match[2];
    
    // unescape template string backticks if any
    fileContent = fileContent.replace(/\\\$/g, '$');
    
    const targetPath = path.join(root, 'android', relPath);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, fileContent, 'utf-8');
    console.log(`Created: android/${relPath}`);
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
