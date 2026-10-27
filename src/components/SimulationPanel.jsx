import { useMemo } from 'react';
import CardsSlider from './CardsSlider.jsx';
import InventoryChart from './InventoryChart.jsx';
import ResultCards from './ResultCards.jsx';
import { calculatePartMetrics } from '../lib/kanbanCalculations.js';
import { simulateSupermarket } from '../lib/kanbanSimulation.js';

export default function SimulationPanel({ part, settings, seed, onRerun, onCardsChange }) {
  const result = useMemo(() => simulateSupermarket(part, settings, seed), [part, settings, seed]);
  const { recommendedCards, status } = calculatePartMetrics(part);

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Supermarket simulation: {part.name}</h2>
          <p className="panel-caption">
            {settings.simulationDays} days × {settings.workingHoursPerDay} h, hourly steps · lead time{' '}
            {result.leadTimeHours} h · seed {seed}
          </p>
        </div>
        <button type="button" className="button button-secondary" onClick={onRerun}>
          Re-run
        </button>
      </div>
      <div className="simulation-layout">
        <InventoryChart
          result={result}
          workingHoursPerDay={settings.workingHoursPerDay}
          simulationDays={settings.simulationDays}
        />
        <aside className="simulation-sidebar">
          <CardsSlider
            kanbanCards={part.kanbanCards}
            recommendedCards={recommendedCards}
            status={status}
            onChange={(value) => onCardsChange(part.id, value)}
          />
          <ResultCards result={result} />
        </aside>
      </div>
    </section>
  );
}
