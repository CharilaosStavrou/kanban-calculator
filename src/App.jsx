import { useState } from 'react';
import { sampleProject } from './data/sampleData.js';

export default function App() {
  const [project] = useState(sampleProject);

  return (
    <div className="app">
      <h1>Kanban Calculator</h1>
      <p>
        {project.parts.length} part(s), {project.settings.simulationDays} simulation days,{' '}
        {project.settings.workingHoursPerDay} working hours/day.
      </p>
    </div>
  );
}
