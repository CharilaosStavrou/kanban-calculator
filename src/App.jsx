import { useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import PartsTable from './components/PartsTable.jsx';
import ProjectToolbar from './components/ProjectToolbar.jsx';
import SimulationPanel from './components/SimulationPanel.jsx';
import { sampleProject } from './data/sampleData.js';
import { downloadTextFile } from './lib/fileDownload.js';
import { createEmptyProject, createPart } from './lib/partModel.js';
import {
  getBrowserStorage,
  loadSavedProject,
  parseProjectJson,
  saveProject,
  serializeProject,
} from './lib/projectStorage.js';

const storage = getBrowserStorage();

export default function App() {
  const [project, setProject] = useState(() => loadSavedProject(storage) ?? sampleProject);
  const [selectedPartId, setSelectedPartId] = useState(null);
  const [seed, setSeed] = useState(1);
  const [importError, setImportError] = useState(null);

  // Auto-save on every change; saveProject ignores unavailable storage.
  useEffect(() => {
    saveProject(storage, project);
  }, [project]);

  // Fall back to the first part if nothing is selected or the selected part was deleted.
  const selectedPart = project.parts.find((part) => part.id === selectedPartId) ?? project.parts[0];

  function replaceProject(nextProject, description) {
    if (!window.confirm(`Replace the current data with ${description}? Your current parts will be lost unless you export them first.`)) return;
    setProject(nextProject);
    setSelectedPartId(null);
    setImportError(null);
  }

  async function handleImportFile(file) {
    const { project: importedProject, error } = parseProjectJson(await file.text());
    if (error) {
      setImportError(`Could not import "${file.name}": ${error} Your current data was kept.`);
      return;
    }
    replaceProject(importedProject, `the contents of "${file.name}"`);
  }

  function handleExport() {
    const date = new Date().toISOString().slice(0, 10);
    downloadTextFile(`kanban-project-${date}.json`, serializeProject(project));
  }

  function handleSettingChange(key, value) {
    setProject((current) => ({ ...current, settings: { ...current.settings, [key]: value } }));
  }

  function handlePartChange(partId, key, value) {
    setProject((current) => ({
      ...current,
      parts: current.parts.map((part) => (part.id === partId ? { ...part, [key]: value } : part)),
    }));
  }

  function handleAddPart() {
    const newPart = createPart();
    setProject((current) => ({ ...current, parts: [...current.parts, newPart] }));
    setSelectedPartId(newPart.id);
  }

  function handleDeletePart(partId) {
    setProject((current) => ({ ...current, parts: current.parts.filter((part) => part.id !== partId) }));
  }

  return (
    <div className="app">
      <Header settings={project.settings} onSettingChange={handleSettingChange}>
        <ProjectToolbar
          onLoadSample={() => replaceProject(sampleProject, 'the sample data')}
          onNew={() => replaceProject(createEmptyProject(), 'a new, empty project')}
          onExport={handleExport}
          onImportFile={handleImportFile}
        />
      </Header>
      {importError && (
        <div className="error-banner" role="alert">
          <span>{importError}</span>
          <button type="button" className="button-icon" aria-label="Dismiss error" onClick={() => setImportError(null)}>
            ×
          </button>
        </div>
      )}
      <main>
        <PartsTable
          parts={project.parts}
          selectedPartId={selectedPart?.id}
          onSelectPart={setSelectedPartId}
          onPartChange={handlePartChange}
          onAddPart={handleAddPart}
          onDeletePart={handleDeletePart}
        />
        {selectedPart && (
          <SimulationPanel
            part={selectedPart}
            settings={project.settings}
            seed={seed}
            onRerun={() => setSeed((current) => current + 1)}
            onCardsChange={(partId, value) => handlePartChange(partId, 'kanbanCards', value)}
          />
        )}
      </main>
    </div>
  );
}
