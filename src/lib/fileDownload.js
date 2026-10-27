// Starts a browser download of text content (used for JSON export).
export function downloadTextFile(fileName, text, mimeType = 'application/json') {
  const url = URL.createObjectURL(new Blob([text], { type: mimeType }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
