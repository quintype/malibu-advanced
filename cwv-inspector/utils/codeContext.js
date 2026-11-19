/**
 * Extracts surrounding lines from file content around a flagged line.
 * Returns an object with the lines array and the target line number.
 * 
 * @param {string} content Full text content of the file.
 * @param {number} targetLine 1-based target line number.
 * @param {number} [context=3] Number of surrounding lines before and after.
 * @returns {{ lines: Array<{ lineNumber: number, text: string, isTarget: boolean }>, targetLine: number }|null}
 */
export function extractCodeContext(content, targetLine, context = 3) {
  if (!content || !targetLine || typeof targetLine !== 'number' || isNaN(targetLine)) {
    return null;
  }
  const lines = content.split('\n');
  if (lines.length === 0) return null;

  const idx = Math.max(0, Math.min(lines.length - 1, targetLine - 1)); // 0-based
  const start = Math.max(0, idx - context);
  const end = Math.min(lines.length - 1, idx + context);

  return {
    lines: lines.slice(start, end + 1).map((text, i) => {
      const lineNum = start + i + 1;
      return {
        lineNumber: lineNum,
        text,
        isTarget: lineNum === targetLine
      };
    }),
    targetLine
  };
}

