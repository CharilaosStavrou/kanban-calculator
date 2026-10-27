import PartRow from './PartRow.jsx';
import { calculatedColumns, editableColumns } from './partColumns.js';

export default function PartsTable({ parts, onPartChange, onAddPart, onDeletePart }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Parts</h2>
        <button type="button" className="button" onClick={onAddPart}>
          + Add part
        </button>
      </div>
      <div className="table-wrapper">
        <table className="parts-table">
          <thead>
            <tr>
              <th>Part</th>
              {editableColumns.map((column) => (
                <th key={column.key}>
                  {column.label}
                  <span className="unit">{column.unit}</span>
                </th>
              ))}
              {calculatedColumns.map((column, index) => (
                <th
                  key={column.key}
                  className={`calculated-cell${index === 0 ? ' group-start' : ''}`}
                  title={column.tooltip}
                >
                  {column.label}
                  {column.tooltip && <span className="info-marker" aria-hidden="true"> ⓘ</span>}
                  <span className="unit">{column.unit}</span>
                </th>
              ))}
              <th>Status</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {parts.map((part) => (
              <PartRow key={part.id} part={part} onChange={onPartChange} onDelete={onDeletePart} />
            ))}
          </tbody>
        </table>
        {parts.length === 0 && <p className="empty-state">No parts yet. Click “Add part” to start.</p>}
      </div>
    </section>
  );
}
