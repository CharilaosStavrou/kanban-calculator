import { describe, expect, it } from 'vitest';
import { sampleProject } from '../data/sampleData.js';
import {
  calculateAverageInventory,
  calculateMaxInventoryDays,
  calculateMaxInventoryUnits,
  calculatePartMetrics,
  calculateRecommendedCards,
  calculateStatus,
  partStatus,
} from './kanbanCalculations.js';

const [bolts, brackets, gaskets, housings] = sampleProject.parts;

describe('calculateRecommendedCards', () => {
  it('rounds up to whole cards for the sample parts', () => {
    expect(calculateRecommendedCards(bolts)).toBe(5); // 400 × 1 × 1.20 / 100 = 4.8
    expect(calculateRecommendedCards(brackets)).toBe(21); // 120 × 3 × 1.15 / 20 = 20.7
    expect(calculateRecommendedCards(gaskets)).toBe(11); // 250 × 2 × 1.10 / 50 = 11
    expect(calculateRecommendedCards(housings)).toBe(25); // 30 × 4 × 1.25 / 6 = 25
  });

  it('does not add a card because of floating-point noise', () => {
    // 100 × 1 × 1.1 / 110 evaluates to 1.0000000000000002 in JavaScript
    expect(calculateRecommendedCards({ ...bolts, demandPerDay: 100, safetyFactor: 10, containerSize: 110 })).toBe(1);
  });

  it('recommends at least one card when the lead time is zero', () => {
    expect(calculateRecommendedCards({ ...bolts, replenishmentLeadTime: 0 })).toBe(1);
  });

  it('recommends zero cards only when there is no demand', () => {
    expect(calculateRecommendedCards({ ...bolts, demandPerDay: 0 })).toBe(0);
  });

  it('recommends one card when a single container covers the lead time', () => {
    expect(calculateRecommendedCards({ ...bolts, containerSize: 100000 })).toBe(1);
  });
});

describe('calculateMaxInventoryUnits', () => {
  it('multiplies cards used by container size', () => {
    expect(calculateMaxInventoryUnits(bolts)).toBe(500);
    expect(calculateMaxInventoryUnits(brackets)).toBe(320);
    expect(calculateMaxInventoryUnits(gaskets)).toBe(800);
    expect(calculateMaxInventoryUnits(housings)).toBe(150);
  });

  it('handles very large containers', () => {
    expect(calculateMaxInventoryUnits({ ...bolts, kanbanCards: 2, containerSize: 100000 })).toBe(200000);
  });
});

describe('calculateMaxInventoryDays', () => {
  it('divides maximum inventory by daily demand', () => {
    expect(calculateMaxInventoryDays(bolts)).toBe(1.25);
    expect(calculateMaxInventoryDays(brackets)).toBeCloseTo(2.667, 3);
    expect(calculateMaxInventoryDays(gaskets)).toBe(3.2);
    expect(calculateMaxInventoryDays(housings)).toBe(5);
  });

  it('is zero when no cards are used', () => {
    expect(calculateMaxInventoryDays({ ...bolts, kanbanCards: 0 })).toBe(0);
  });
});

describe('calculateAverageInventory', () => {
  it('subtracts lead-time demand and half a container from maximum inventory', () => {
    expect(calculateAverageInventory(bolts)).toBe(50); // 500 − 400 × 1 − 100 / 2
    expect(calculateAverageInventory(gaskets)).toBe(275); // 800 − 250 × 2 − 50 / 2
    expect(calculateAverageInventory(housings)).toBe(27); // 150 − 30 × 4 − 6 / 2
  });

  it('never goes below zero', () => {
    expect(calculateAverageInventory(brackets)).toBe(0); // 320 − 120 × 3 − 20 / 2 < 0
    expect(calculateAverageInventory({ ...bolts, kanbanCards: 0 })).toBe(0);
  });

  it('only subtracts half a container when the lead time is zero', () => {
    expect(calculateAverageInventory({ ...bolts, replenishmentLeadTime: 0 })).toBe(450); // 500 − 50
  });
});

describe('calculateStatus', () => {
  it('flags too few cards below the recommendation', () => {
    expect(calculateStatus(4, 5)).toBe(partStatus.tooFew);
  });

  it('accepts up to two cards above the recommendation', () => {
    expect(calculateStatus(5, 5)).toBe(partStatus.ok);
    expect(calculateStatus(7, 5)).toBe(partStatus.ok);
  });

  it('flags excess inventory beyond two extra cards', () => {
    expect(calculateStatus(8, 5)).toBe(partStatus.excess);
  });

  it('treats zero cards as OK when zero are recommended', () => {
    expect(calculateStatus(0, 0)).toBe(partStatus.ok);
  });
});

describe('calculatePartMetrics', () => {
  it('gives one too-few, one excess and two OK parts for the sample data', () => {
    const statuses = sampleProject.parts.map((part) => calculatePartMetrics(part).status);
    expect(statuses).toEqual([partStatus.ok, partStatus.tooFew, partStatus.excess, partStatus.ok]);
  });

  it('returns every calculated value for a part', () => {
    expect(calculatePartMetrics(bolts)).toEqual({
      recommendedCards: 5,
      maxInventoryUnits: 500,
      maxInventoryDays: 1.25,
      averageInventory: 50,
      status: partStatus.ok,
    });
  });
});
