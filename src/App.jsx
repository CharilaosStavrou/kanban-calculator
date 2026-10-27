import { useState } from 'react';
import Header from './components/Header.jsx';
import PartsTable from './components/PartsTable.jsx';
import SimulationPanel from './components/SimulationPanel.jsx';
import { sampleProject } from './data/sampleData.js';
import { createPart } from './lib/partModel.js';

export default function App() {
  const [project, setProject] = useState(sampleProject);
  const [selectedPartId, setSelectedPartId] = useState(sampleProject.parts[0]?.id ?? null);
  const [seed, setSeed] = useState(1);

  // Fall back to the first part if the selected one was deleted.
  const selectedPart = project.parts.find((part) => part.id === selectedPartId) ?? project.parts[0];

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
      <Header settings={project.settings} onSettingChange={handleSettingChange} />
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
