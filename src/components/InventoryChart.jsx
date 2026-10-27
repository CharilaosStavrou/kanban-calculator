import { createTicks } from '../lib/chartScale.js';
import { findStockoutPeriods } from '../lib/kanbanSimulation.js';
import { formatNumber } from '../lib/format.js';

const width = 760;
const height = 300;
const margin = { top: 16, right: 16, bottom: 44, left: 56 };
const plotWidth = width - margin.left - margin.right;
const plotHeight = height - margin.top - margin.bottom;

// Inventory level over time (one point per hour) with stockout hours shaded red.
export default function InventoryChart({ result, workingHoursPerDay, simulationDays }) {
  const { inventory, unmetByHour, totalHours, maxInventory } = result;
  const yTicks = createTicks(Math.max(maxInventory, 1), 5);
  const yMax = yTicks[yTicks.length - 1];
  const dayTicks = createTicks(simulationDays, 10).filter((day) => day <= simulationDays);

  const xForHour = (hour) => margin.left + (hour / Math.max(totalHours, 1)) * plotWidth;
  const yForUnits = (units) => margin.top + plotHeight - (units / yMax) * plotHeight;

  const linePath = inventory
    .map((units, hour) => `${hour === 0 ? 'M' : 'L'}${xForHour(hour).toFixed(1)},${yForUnits(units).toFixed(1)}`)
    .join(' ');
  const stockoutPeriods = findStockoutPeriods(unmetByHour);

  return (
    <figure className="inventory-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Inventory level over time">
        {stockoutPeriods.map((period) => (
          <rect
            key={period.startHour}
            className="chart-stockout"
            x={xForHour(period.startHour)}
            y={margin.top}
            width={xForHour(period.endHour) - xForHour(period.startHour)}
            height={plotHeight}
          />
        ))}

        {yTicks.map((tick) => (
          <g key={`y-${tick}`}>
            <line className="chart-grid" x1={margin.left} x2={width - margin.right} y1={yForUnits(tick)} y2={yForUnits(tick)} />
            <text className="chart-tick" x={margin.left - 8} y={yForUnits(tick)} textAnchor="end" dominantBaseline="middle">
              {formatNumber(tick)}
            </text>
          </g>
        ))}

        {dayTicks.map((day) => (
          <text
            key={`x-${day}`}
            className="chart-tick"
            x={xForHour(day * workingHoursPerDay)}
            y={margin.top + plotHeight + 18}
            textAnchor="middle"
          >
            {day}
          </text>
        ))}

        <line className="chart-axis" x1={margin.left} x2={margin.left} y1={margin.top} y2={margin.top + plotHeight} />
        <line
          className="chart-axis"
          x1={margin.left}
          x2={width - margin.right}
          y1={margin.top + plotHeight}
          y2={margin.top + plotHeight}
        />
        <path className="chart-line" d={linePath} />

        <text className="chart-label" x={margin.left + plotWidth / 2} y={height - 6} textAnchor="middle">
          Working days
        </text>
        <text
          className="chart-label"
          transform={`translate(14 ${margin.top + plotHeight / 2}) rotate(-90)`}
          textAnchor="middle"
        >
          Inventory (units)
        </text>
      </svg>
      <figcaption className="chart-legend">
        <span className="legend-item">
          <span className="legend-line" /> Inventory in supermarket
        </span>
        <span className="legend-item">
          <span className="legend-stockout" /> Stockout (demand not met)
        </span>
      </figcaption>
    </figure>
  );
}
