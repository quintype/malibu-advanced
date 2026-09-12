import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

/**
 * Recursively scans a directory for files matching the configured extensions,
 * respecting the exclude list.
 * 
 * @param {string} dirPath The directory to scan.
 * @param {string} rootPath The root directory (for calculating relative paths).
 * @returns {Array<{filePath: string, relativePath: string, content: string, ext: string}>}
 */
export function scanFiles(dirPath, rootPath = dirPath) {
  let results = [];
  const list = fs.readdirSync(dirPath);

  for (const file of list) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat && stat.isDirectory()) {
      if (config.excludeDirs.includes(file)) {
        continue;
      }
      results = results.concat(scanFiles(fullPath, rootPath));
    } else {
      const ext = path.extname(file).toLowerCase();
      if (config.extensions.includes(ext)) {
        const relativePath = path.relative(rootPath, fullPath);
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          results.push({
            filePath: fullPath,
            relativePath,
            content,
            ext
          });
        } catch (err) {
          // Skip files that cannot be read
        }
      }
    }
  }

  return results;
}
