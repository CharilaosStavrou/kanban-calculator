// Sample project used as the initial state and for "Load sample".
// Four parts with varied demand and lead times: brackets have too few cards,
// gaskets have excess cards, bolts and housings are OK.

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
    {
      id: 'sample-brackets',
      name: 'Steel brackets',
      demandPerDay: 120,
      demandVariability: 20,
      containerSize: 20,
      replenishmentLeadTime: 3,
      safetyFactor: 15,
      kanbanCards: 16,
    },
    {
      id: 'sample-gaskets',
      name: 'Rubber gaskets',
      demandPerDay: 250,
      demandVariability: 10,
      containerSize: 50,
      replenishmentLeadTime: 2,
      safetyFactor: 10,
      kanbanCards: 16,
    },
    {
      id: 'sample-housings',
      name: 'Aluminium housings',
      demandPerDay: 30,
      demandVariability: 25,
      containerSize: 6,
      replenishmentLeadTime: 4,
      safetyFactor: 25,
      kanbanCards: 25,
    },
  ],
};
