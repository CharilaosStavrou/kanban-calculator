// Sample project used for "Load sample" and as the initial state.
// Will be expanded to four realistic parts in Phase 6.

export const sampleProject = {
  settings: {
    workingHoursPerDay: 8,
    simulationDays: 20,
  },
  parts: [
    {
      id: 'sample-bolts',
      name: 'M8 bolts',
      demandPerDay: 400,
      demandVariability: 15,
      containerSize: 100,
      replenishmentLeadTime: 1,
      safetyFactor: 20,
      kanbanCards: 5,
    },
  ],
};
