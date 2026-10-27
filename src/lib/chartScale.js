// Helpers for readable chart axes.

// Rounds a raw step up to a "nice" value: 1, 2 or 5 × a power of ten.
export function niceStep(rawStep) {
  if (rawStep <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const normalized = rawStep / magnitude;
  const niceNormalized = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return niceNormalized * magnitude;
}

// Tick values from 0 up to at least maxValue, using about targetCount intervals.
export function createTicks(maxValue, targetCount) {
  const step = niceStep(maxValue / targetCount);
  const ticks = [];
  for (let value = 0; value < maxValue + step - 1e-9; value += step) ticks.push(value);
  return ticks.length > 1 ? ticks : [0, step];
}
