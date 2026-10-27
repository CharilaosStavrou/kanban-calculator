import { describe, expect, it } from 'vitest';
import { parseNumber, partFieldRules, settingsRules, validateNumber } from './validation.js';

describe('parseNumber', () => {
  it('parses integers, decimals and comma decimals', () => {
    expect(parseNumber('12')).toBe(12);
    expect(parseNumber(' 2.5 ')).toBe(2.5);
    expect(parseNumber('2,5')).toBe(2.5);
    expect(parseNumber('.5')).toBe(0.5);
  });

  it('returns NaN for non-numeric text', () => {
    expect(parseNumber('')).toBeNaN();
    expect(parseNumber('abc')).toBeNaN();
    expect(parseNumber('1e3')).toBeNaN();
    expect(parseNumber('1.2.3')).toBeNaN();
  });
});

describe('validateNumber', () => {
  it('accepts valid values', () => {
    expect(validateNumber('100', partFieldRules.demandPerDay)).toEqual({ value: 100, error: null });
    expect(validateNumber('0', partFieldRules.replenishmentLeadTime).error).toBeNull();
    expect(validateNumber('100', partFieldRules.safetyFactor).error).toBeNull();
  });

  it('rejects negative numbers', () => {
    expect(validateNumber('-1', partFieldRules.replenishmentLeadTime).error).toBe('Cannot be negative');
  });

  it('requires demand and container size of at least 1', () => {
    expect(validateNumber('0', partFieldRules.demandPerDay).error).toBe('Must be at least 1');
    expect(validateNumber('0', partFieldRules.containerSize).error).toBe('Must be at least 1');
  });

  it('limits variability and safety factor to 0-100', () => {
    expect(validateNumber('101', partFieldRules.demandVariability).error).toBe('Must be at most 100');
    expect(validateNumber('150', partFieldRules.safetyFactor).error).toBe('Must be at most 100');
  });

  it('requires whole numbers where needed', () => {
    expect(validateNumber('2.5', partFieldRules.kanbanCards).error).toBe('Must be a whole number');
    expect(validateNumber('7.5', settingsRules.workingHoursPerDay).error).toBe('Must be a whole number');
  });

  it('reports non-numeric input', () => {
    expect(validateNumber('', partFieldRules.containerSize).error).toBe('Enter a number');
  });
});
