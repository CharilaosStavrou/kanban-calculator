import { useState } from 'react';
import Header from './components/Header.jsx';
import PartsTable from './components/PartsTable.jsx';
import { sampleProject } from './data/sampleData.js';
import { createPart } from './lib/partModel.js';

export default function App() {
  const [project, setProject] = useState(sampleProject);

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
    setProject((current) => ({ ...current, parts: [...current.parts, createPart()] }));
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
          onPartChange={handlePartChange}
          onAddPart={handleAddPart}
          onDeletePart={handleDeletePart}
        />
      </main>
    </div>
  );
}
