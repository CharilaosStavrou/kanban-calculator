import NumericInput from './NumericInput.jsx';
import StatusBadge from './StatusBadge.jsx';
import { calculatedColumns, editableColumns } from './partColumns.js';
import { calculatePartMetrics } from '../lib/kanbanCalculations.js';
import { formatNumber } from '../lib/format.js';
import { partFieldRules } from '../lib/validation.js';

export default function PartRow({ part, isSelected, onSelect, onChange, onDelete }) {
  const metrics = calculatePartMetrics(part);

  // Clicking or tabbing into any cell selects the part for the simulation.
  return (
    <tr
      className={isSelected ? 'row-selected' : ''}
      aria-selected={isSelected}
      onClick={() => onSelect(part.id)}
      onFocus={() => onSelect(part.id)}
    >
      <td>
        <input
          type="text"
          className="name-input"
          aria-label="Part name"
          value={part.name}
          onChange={(event) => onChange(part.id, 'name', event.target.value)}
        />
      </td>
      {editableColumns.map((column) => (
        <td key={column.key}>
          <NumericInput
            label={`${column.label} for ${part.name}`}
            value={part[column.key]}
            rule={partFieldRules[column.key]}
            onCommit={(value) => onChange(part.id, column.key, value)}
          />
        </td>
      ))}
      {calculatedColumns.map((column, index) => (
        <td key={column.key} className={`calculated-cell${index === 0 ? ' group-start' : ''}`}>
          {formatNumber(metrics[column.key], column.fractionDigits)}
        </td>
      ))}
      <td>
        <StatusBadge status={metrics.status} />
      </td>
      <td>
        <button
          type="button"
          className="button-icon"
          aria-label={`Delete ${part.name}`}
          title="Delete part"
          onClick={() => onDelete(part.id)}
        >
          ×
        </button>
      </td>
    </tr>
  );
}
