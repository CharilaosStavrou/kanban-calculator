import { formatNumber } from '../lib/format.js';

export default function ResultCards({ result }) {
  const cards = [
    {
      label: 'Service level',
      value: `${formatNumber(result.serviceLevel, 1)}%`,
      detail: 'of demand met',
    },
    {
      label: 'Stockout hours',
      value: formatNumber(result.stockoutHours),
      detail: `of ${formatNumber(result.totalHours)} h · ${formatNumber(result.totalUnmet)} units unmet`,
    },
    {
      label: 'Average inventory',
      value: formatNumber(result.averageInventory),
      detail: 'units (simulated)',
    },
    {
      label: 'Max inventory',
      value: formatNumber(result.maxInventory),
      detail: 'units (cards × container)',
    },
  ];

  return (
    <div className="result-cards">
      {cards.map((card) => (
        <div key={card.label} className="result-card">
          <span className="result-label">{card.label}</span>
          <span className="result-value">{card.value}</span>
          <span className="result-detail">{card.detail}</span>
        </div>
      ))}
    </div>
  );
}
