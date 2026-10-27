// Kanban loop sizing. Pure functions; all inputs come from a part object (see partModel.js).

// Tolerance used before rounding up, so floating-point noise such as
// 1.0000000000000002 does not add a whole extra card.
const roundingTolerance = 1e-9;

export const partStatus = {
  tooFew: 'tooFew',
  excess: 'excess',
  ok: 'ok',
};

export const statusLabels = {
  [partStatus.tooFew]: 'Too few cards',
  [partStatus.excess]: 'Excess inventory',
  [partStatus.ok]: 'OK',
};

// Cards above the recommendation that are still considered OK.
export const excessCardMargin = 2;

// Recommended cards = (demand per day × lead time × (1 + safety factor / 100)) ÷ container size,
// rounded up: enough containers to cover demand during replenishment plus a safety margin.
// At least 1 whenever demand is above 0, because a kanban loop always needs one container.
export function calculateRecommendedCards(part) {
  const { demandPerDay, replenishmentLeadTime, safetyFactor, containerSize } = part;
  if (demandPerDay <= 0) return 0;
  const rawCards = (demandPerDay * replenishmentLeadTime * (1 + safetyFactor / 100)) / containerSize;
  return Math.max(1, Math.ceil(rawCards - roundingTolerance));
}

// Maximum inventory (units) = cards used × container size: every card attached to a full container.
export function calculateMaxInventoryUnits(part) {
  return part.kanbanCards * part.containerSize;
}

// Maximum inventory (days) = maximum inventory ÷ demand per day: how long a full supermarket lasts.
export function calculateMaxInventoryDays(part) {
  return calculateMaxInventoryUnits(part) / part.demandPerDay;
}

// Average expected inventory (units) ≈ maximum inventory − (demand per day × lead time) ÷ 2,
// never below 0. Approximation: on average half of the lead-time demand is out for replenishment.
export function calculateAverageInventory(part) {
  const pipelineHalf = (part.demandPerDay * part.replenishmentLeadTime) / 2;
  return Math.max(0, calculateMaxInventoryUnits(part) - pipelineHalf);
}

// Status: too few if cards used < recommended, excess if cards used > recommended + 2, otherwise OK.
export function calculateStatus(kanbanCards, recommendedCards) {
  if (kanbanCards < recommendedCards) return partStatus.tooFew;
  if (kanbanCards > recommendedCards + excessCardMargin) return partStatus.excess;
  return partStatus.ok;
}

// All calculated values for one part, used by the parts table.
export function calculatePartMetrics(part) {
  const recommendedCards = calculateRecommendedCards(part);
  return {
    recommendedCards,
    maxInventoryUnits: calculateMaxInventoryUnits(part),
    maxInventoryDays: calculateMaxInventoryDays(part),
    averageInventory: calculateAverageInventory(part),
    status: calculateStatus(part.kanbanCards, recommendedCards),
  };
}
