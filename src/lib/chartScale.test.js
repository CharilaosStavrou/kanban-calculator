import { describe, expect, it } from 'vitest';
import { createTicks, niceStep } from './chartScale.js';

describe('niceStep', () => {
  it('rounds up to 1, 2 or 5 times a power of ten', () => {
    expect(niceStep(0.7)).toBe(1);
    expect(niceStep(1.5)).toBe(2);
    expect(niceStep(37)).toBe(50);
    expect(niceStep(80)).toBe(100);
  });

  it('falls back to 1 for non-positive steps', () => {
    expect(niceStep(0)).toBe(1);
  });
});

describe('createTicks', () => {
  it('covers the maximum value with nice steps', () => {
    expect(createTicks(500, 5)).toEqual([0, 100, 200, 300, 400, 500]);
    expect(createTicks(320, 5)).toEqual([0, 100, 200, 300, 400]);
  });

  it('returns at least two ticks for a zero maximum', () => {
    expect(createTicks(0, 5)).toEqual([0, 1]);
  });
});
