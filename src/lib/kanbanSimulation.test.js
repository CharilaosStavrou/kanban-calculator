import { describe, expect, it } from 'vitest';
import { sampleProject } from '../data/sampleData.js';
import { calculateRecommendedCards } from './kanbanCalculations.js';
import {
  createSeededRandom,
  findStockoutPeriods,
  sampleStandardNormal,
  simulateSupermarket,
} from './kanbanSimulation.js';

const { settings, parts } = sampleProject;
const [bolts, brackets] = parts;

function withRecommendedCards(part) {
  return { ...part, kanbanCards: calculateRecommendedCards(part) };
}

describe('createSeededRandom', () => {
  it('is reproducible for the same seed and differs between seeds', () => {
    const first = createSeededRandom(42);
    const second = createSeededRandom(42);
    const other = createSeededRandom(43);
    const firstValues = [first(), first(), first()];
    expect([second(), second(), second()]).toEqual(firstValues);
    expect(other()).not.toBe(firstValues[0]);
  });

  it('returns values in [0, 1)', () => {
    const random = createSeededRandom(7);
    for (let index = 0; index < 1000; index += 1) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('sampleStandardNormal', () => {
  it('has mean close to 0 and standard deviation close to 1', () => {
    const random = createSeededRandom(1);
    const samples = Array.from({ length: 20000 }, () => sampleStandardNormal(random));
    const mean = samples.reduce((sum, value) => sum + value, 0) / samples.length;
    const variance = samples.reduce((sum, value) => sum + (value - mean) ** 2, 0) / samples.length;
    expect(mean).toBeCloseTo(0, 1);
    expect(Math.sqrt(variance)).toBeCloseTo(1, 1);
  });
});

describe('simulateSupermarket', () => {
  it('reaches 100% service level with zero variability and the recommended cards', () => {
    for (const part of parts) {
      const result = simulateSupermarket(withRecommendedCards({ ...part, demandVariability: 0 }), settings);
      expect(result.serviceLevel).toBe(100);
      expect(result.stockoutHours).toBe(0);
    }
  });

  it('reaches 100% service level with zero lead time and one card', () => {
    const noLeadTime = withRecommendedCards({ ...bolts, demandVariability: 0, replenishmentLeadTime: 0 });
    expect(noLeadTime.kanbanCards).toBe(1);
    expect(simulateSupermarket(noLeadTime, settings).serviceLevel).toBe(100);
  });

  it('can stock out briefly with a 0% safety factor when cards exactly cover lead-time demand', () => {
    // 10 cards × 50 units = 500 units = 2 days of demand. The first container is emptied after
    // 1.6 hours and returns 16 hours later, but the stock runs out after 16 hours: the formula
    // leaves no margin for the container in use, which is what the safety factor covers.
    const noSafety = withRecommendedCards({ ...parts[2], demandVariability: 0, safetyFactor: 0 });
    expect(noSafety.kanbanCards).toBe(10);
    const result = simulateSupermarket(noSafety, settings);
    expect(result.serviceLevel).toBeLessThan(100);
    expect(result.serviceLevel).toBeGreaterThan(90);
  });

  it('meets exactly the planned demand when variability is zero', () => {
    const result = simulateSupermarket({ ...bolts, demandVariability: 0 }, settings);
    expect(result.totalDemand).toBeCloseTo(bolts.demandPerDay * settings.simulationDays, 6);
  });

  it('runs simulationDays × workingHoursPerDay steps and starts full', () => {
    const result = simulateSupermarket(bolts, settings);
    expect(result.totalHours).toBe(160);
    expect(result.inventory).toHaveLength(161);
    expect(result.inventory[0]).toBe(bolts.kanbanCards * bolts.containerSize);
    expect(result.leadTimeHours).toBe(8);
  });

  it('records stockouts when there are too few cards', () => {
    const result = simulateSupermarket({ ...brackets, demandVariability: 0 }, settings);
    expect(result.serviceLevel).toBeLessThan(100);
    expect(result.stockoutHours).toBeGreaterThan(0);
    expect(result.totalUnmet).toBeGreaterThan(0);
  });

  it('meets no demand at all with zero cards', () => {
    const result = simulateSupermarket({ ...bolts, kanbanCards: 0 }, settings);
    expect(result.serviceLevel).toBe(0);
    expect(result.stockoutHours).toBe(result.totalHours);
    expect(result.averageInventory).toBe(0);
  });

  it('keeps inventory between 0 and the maximum and demand non-negative', () => {
    const result = simulateSupermarket({ ...bolts, demandVariability: 100 }, settings, 3);
    for (const level of result.inventory) {
      expect(level).toBeGreaterThanOrEqual(-1e-9);
      expect(level).toBeLessThanOrEqual(result.maxInventory + 1e-9);
    }
    expect(result.unmetByHour.every((unmet) => unmet >= 0)).toBe(true);
  });

  it('is reproducible for a seed and changes with a different seed', () => {
    const first = simulateSupermarket(brackets, settings, 5);
    expect(simulateSupermarket(brackets, settings, 5)).toEqual(first);
    expect(simulateSupermarket(brackets, settings, 6).totalDemand).not.toBe(first.totalDemand);
  });
});

describe('findStockoutPeriods', () => {
  it('merges consecutive stockout hours into periods', () => {
    expect(findStockoutPeriods([0, 2, 1, 0, 0, 3, 0, 1])).toEqual([
      { startHour: 1, endHour: 3 },
      { startHour: 5, endHour: 6 },
      { startHour: 7, endHour: 8 },
    ]);
  });

  it('returns no periods without stockouts', () => {
    expect(findStockoutPeriods([0, 0, 0])).toEqual([]);
  });
});
