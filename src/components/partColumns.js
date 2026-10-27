// Editable numeric columns of the parts table, in display order.
export const editableColumns = [
  { key: 'demandPerDay', label: 'Demand', unit: 'units/day' },
  { key: 'demandVariability', label: 'Variability', unit: '% std dev' },
  { key: 'containerSize', label: 'Container size', unit: 'units' },
  { key: 'replenishmentLeadTime', label: 'Lead time', unit: 'days' },
  { key: 'safetyFactor', label: 'Safety factor', unit: '%' },
  { key: 'kanbanCards', label: 'Kanban cards used', unit: 'cards' },
];

// Calculated (read-only) columns. `key` refers to a value from calculatePartMetrics.
export const calculatedColumns = [
  { key: 'recommendedCards', label: 'Recommended', unit: 'cards', fractionDigits: 0 },
  { key: 'maxInventoryUnits', label: 'Max inventory', unit: 'units', fractionDigits: 0 },
  { key: 'maxInventoryDays', label: 'Max inventory', unit: 'days', fractionDigits: 2 },
  {
    key: 'averageInventory',
    label: 'Avg inventory',
    unit: 'units',
    fractionDigits: 0,
    tooltip:
      'Approximation: max inventory − (demand per day × lead time) ÷ 2, never below 0. ' +
      'Assumes on average half of the lead-time demand is out for replenishment.',
  },
];
