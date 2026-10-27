// Validation for the numeric text inputs. Pure functions, no UI concerns.

// Allowed range per editable field. `integer` means only whole numbers are accepted.
export const partFieldRules = {
  demandPerDay: { min: 1 },
  demandVariability: { min: 0, max: 100 },
  containerSize: { min: 1, integer: true },
  replenishmentLeadTime: { min: 0 },
  safetyFactor: { min: 0, max: 100 },
  kanbanCards: { min: 0, integer: true },
};

export const settingsRules = {
  workingHoursPerDay: { min: 1, max: 24, integer: true },
  simulationDays: { min: 1, max: 365, integer: true },
};

const numberPattern = /^-?(\d+\.?\d*|\.\d+)$/;

// Parses user text into a number. Accepts a comma as decimal separator. Returns NaN if invalid.
export function parseNumber(text) {
  const normalized = String(text).trim().replace(',', '.');
  return numberPattern.test(normalized) ? Number(normalized) : NaN;
}

// Returns { value, error }. `error` is null when the text is valid for the rule.
export function validateNumber(text, rule) {
  const value = parseNumber(text);
  if (Number.isNaN(value)) return { value, error: 'Enter a number' };
  if (value < 0) return { value, error: 'Cannot be negative' };
  if (rule.integer && !Number.isInteger(value)) return { value, error: 'Must be a whole number' };
  if (rule.min !== undefined && value < rule.min) return { value, error: `Must be at least ${rule.min}` };
  if (rule.max !== undefined && value > rule.max) return { value, error: `Must be at most ${rule.max}` };
  return { value, error: null };
}
