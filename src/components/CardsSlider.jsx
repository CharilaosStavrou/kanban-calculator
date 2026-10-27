import StatusBadge from './StatusBadge.jsx';

// Slider for the number of kanban cards used; changes the part directly so table and chart update live.
export default function CardsSlider({ kanbanCards, recommendedCards, status, onChange }) {
  const maxCards = Math.max(10, recommendedCards * 2, kanbanCards);

  return (
    <div className="cards-slider">
      <label htmlFor="cards-slider-input" className="cards-slider-label">
        Kanban cards used: <strong>{kanbanCards}</strong>
      </label>
      <input
        id="cards-slider-input"
        type="range"
        min="0"
        max={maxCards}
        step="1"
        value={kanbanCards}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <div className="cards-slider-scale">
        <span>0</span>
        <span>{maxCards}</span>
      </div>
      <p className="cards-slider-hint">
        Recommended: {recommendedCards} <StatusBadge status={status} />
      </p>
    </div>
  );
}
