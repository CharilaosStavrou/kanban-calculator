import { statusLabels } from '../lib/kanbanCalculations.js';

// Status is shown as a text label; color only reinforces it.
export default function StatusBadge({ status }) {
  return <span className={`status-badge status-${status}`}>{statusLabels[status]}</span>;
}
