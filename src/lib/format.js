// Number formatting for display. Uses en-US grouping so the UI matches the English README.
export function formatNumber(value, maximumFractionDigits = 0) {
  return value.toLocaleString('en-US', { maximumFractionDigits });
}
