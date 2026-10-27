// Data model for the kanban calculator.
// A project is { settings, parts }. Everything here is plain data with no UI concerns.

export const defaultSettings = {
  workingHoursPerDay: 8,
  simulationDays: 20,
};

export const defaultPartValues = {
  name: 'New part',
  demandPerDay: 100, // units/day
  demandVariability: 10, // % standard deviation of demand
  containerSize: 25, // units/container
  replenishmentLeadTime: 2, // days
  safetyFactor: 10, // %
  kanbanCards: 9, // cards actually in the loop
};

let idCounter = 0;

export function createPartId() {
  idCounter += 1;
  return `part-${Date.now().toString(36)}-${idCounter}`;
}

export function createPart(overrides = {}) {
  return { id: createPartId(), ...defaultPartValues, ...overrides };
}

export function createEmptyProject() {
  return { settings: { ...defaultSettings }, parts: [createPart()] };
}
