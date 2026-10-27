import NumericInput from './NumericInput.jsx';
import { editableColumns } from './partColumns.js';
import { partFieldRules } from '../lib/validation.js';

export default function PartRow({ part, onChange, onDelete }) {
  return (
    <tr>
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
