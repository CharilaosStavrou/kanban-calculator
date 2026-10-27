import { useRef } from 'react';

export default function ProjectToolbar({ onLoadSample, onNew, onExport, onImportFile }) {
  const fileInputRef = useRef(null);

  function handleFileChange(event) {
    const [file] = event.target.files;
    // Reset so selecting the same file again still triggers a change.
    event.target.value = '';
    if (file) onImportFile(file);
  }

  return (
    <div className="toolbar">
      <button type="button" className="button button-secondary" onClick={onLoadSample}>
        Load sample
      </button>
      <button type="button" className="button button-secondary" onClick={onNew}>
        New
      </button>
      <button type="button" className="button button-secondary" onClick={onExport}>
        Export JSON
      </button>
      <button type="button" className="button button-secondary" onClick={() => fileInputRef.current.click()}>
        Import JSON
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="visually-hidden"
        tabIndex={-1}
        aria-hidden="true"
        onChange={handleFileChange}
      />
    </div>
  );
}
