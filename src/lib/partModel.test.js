import { describe, expect, it } from 'vitest';
import { createEmptyProject, createPart, defaultSettings } from './partModel.js';

describe('partModel', () => {
  it('creates parts with unique ids and default values', () => {
    const first = createPart();
    const second = createPart({ name: 'Brackets' });
    expect(first.id).not.toBe(second.id);
    expect(second.name).toBe('Brackets');
    expect(second.containerSize).toBe(first.containerSize);
  });

  it('creates an empty project with default settings and one part', () => {
    const project = createEmptyProject();
    expect(project.settings).toEqual(defaultSettings);
    expect(project.parts).toHaveLength(1);
  });
});
