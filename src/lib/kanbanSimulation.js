// Supermarket simulation for one kanban loop. Pure functions, deterministic for a given seed.

// Tolerance for floating-point comparisons on (fractional) unit quantities.
const tolerance = 1e-9;

// Mulberry32: a small, fast seeded pseudo-random generator returning numbers in [0, 1).
export function createSeededRandom(seed) {
  let state = seed >>> 0;
  return function random() {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

// Standard normal sample (mean 0, standard deviation 1) using the Box-Muller transform.
export function sampleStandardNormal(random) {
  const u1 = 1 - random(); // in (0, 1], avoids log(0)
  const u2 = random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// Simulates the supermarket hour by hour for simulationDays × workingHoursPerDay steps.
// - Start: every kanban card is attached to a full container in the supermarket.
// - Each hour: full containers whose lead time has elapsed arrive, then customer demand
//   (normal distribution, never negative) is taken from the supermarket.
// - When a container is emptied, its card goes back to production and the full container
//   returns after the replenishment lead time (converted to working hours, rounded).
// - Demand that cannot be met is recorded as unmet units (a stockout).
export function simulateSupermarket(part, settings, seed = 1) {
  const { workingHoursPerDay, simulationDays } = settings;
  const { demandPerDay, demandVariability, containerSize, replenishmentLeadTime, kanbanCards } = part;

  const totalHours = simulationDays * workingHoursPerDay;
  const leadTimeHours = Math.round(replenishmentLeadTime * workingHoursPerDay);
  const meanHourlyDemand = demandPerDay / workingHoursPerDay;
  const hourlyStandardDeviation = (meanHourlyDemand * demandVariability) / 100;
  const random = createSeededRandom(seed);

  let onHand = kanbanCards * containerSize;
  let consumedFromOpenContainer = 0;
  const returnHours = []; // hour at which each card in production returns with a full container
  const inventory = [onHand]; // inventory[0] = start, inventory[h + 1] = end of hour h
  const unmetByHour = [];
  let totalDemand = 0;
  let totalUnmet = 0;

  for (let hour = 0; hour < totalHours; hour += 1) {
    while (returnHours.length > 0 && returnHours[0] <= hour) {
      returnHours.shift();
      onHand += containerSize;
    }

    const demand = Math.max(0, meanHourlyDemand + hourlyStandardDeviation * sampleStandardNormal(random));
    const served = Math.min(demand, onHand);
    onHand -= served;
    consumedFromOpenContainer += served;

    // Each emptied container sends its card back to production.
    while (consumedFromOpenContainer >= containerSize - tolerance) {
      consumedFromOpenContainer -= containerSize;
      returnHours.push(hour + leadTimeHours);
    }

    const unmet = demand - served;
    totalDemand += demand;
    totalUnmet += unmet;
    unmetByHour.push(unmet);
    inventory.push(onHand);
  }

  const endOfHourInventory = inventory.slice(1);
  const averageInventory =
    totalHours > 0 ? endOfHourInventory.reduce((sum, value) => sum + value, 0) / totalHours : 0;

  return {
    inventory,
    unmetByHour,
    totalHours,
    leadTimeHours,
    totalDemand,
    totalUnmet,
    stockoutHours: unmetByHour.filter((unmet) => unmet > tolerance).length,
    serviceLevel: totalDemand > 0 ? (1 - totalUnmet / totalDemand) * 100 : 100,
    averageInventory,
    maxInventory: kanbanCards * containerSize,
  };
}

// Groups consecutive stockout hours into periods { startHour, endHour } (end exclusive), for shading.
export function findStockoutPeriods(unmetByHour) {
  const periods = [];
  unmetByHour.forEach((unmet, hour) => {
    if (unmet <= tolerance) return;
    const lastPeriod = periods[periods.length - 1];
    if (lastPeriod && lastPeriod.endHour === hour) lastPeriod.endHour = hour + 1;
    else periods.push({ startHour: hour, endHour: hour + 1 });
  });
  return periods;
}
