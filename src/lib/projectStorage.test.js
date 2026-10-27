import { describe, expect, it } from 'vitest';
import { sampleProject } from '../data/sampleData.js';
import {
  loadSavedProject,
  parseProjectJson,
  saveProject,
  serializeProject,
  storageKey,
  validateProject,
} from './projectStorage.js';

function createMemoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => (values.has(key) ? values.get(key) : null),
    setItem: (key, value) => values.set(key, value),
  };
}

const throwingStorage = {
  getItem: () => {
    throw new Error('blocked');
  },
  setItem: () => {
    throw new Error('quota exceeded');
  },
};

describe('validateProject', () => {
  it('accepts the sample project', () => {
    expect(validateProject(sampleProject)).toEqual({ project: sampleProject, error: null });
  });

  it('accepts a project without parts', () => {
    expect(validateProject({ ...sampleProject, parts: [] }).error).toBeNull();
  });

  it('drops unknown fields', () => {
    const withExtra = { ...sampleProject, extra: 1, parts: [{ ...sampleProject.parts[0], color: 'red' }] };
    const { project } = validateProject(withExtra);
    expect(project).not.toHaveProperty('extra');
    expect(project.parts[0]).not.toHaveProperty('color');
  });

  it('rejects data that is not a project', () => {
    expect(validateProject(null).error).toMatch(/project object/);
    expect(validateProject([]).error).toMatch(/project object/);
    expect(validateProject({ parts: [] }).error).toMatch(/settings/);
    expect(validateProject({ settings: sampleProject.settings }).error).toMatch(/parts/);
  });

  it('rejects invalid settings', () => {
    const data = { ...sampleProject, settings: { ...sampleProject.settings, workingHoursPerDay: 30 } };
    expect(validateProject(data).error).toBe('Settings: "workingHoursPerDay" is invalid (must be at most 24).');
  });

  it('rejects invalid part values with the part named in the message', () => {
    const parts = [{ ...sampleProject.parts[0], containerSize: -5 }];
    expect(validateProject({ ...sampleProject, parts }).error).toBe(
      'Part 1 (M8 bolts): "containerSize" is invalid (cannot be negative).',
    );
  });

  it('rejects numbers stored as text, missing ids and duplicate ids', () => {
    const [bolts] = sampleProject.parts;
    expect(validateProject({ ...sampleProject, parts: [{ ...bolts, demandPerDay: '400' }] }).error).toMatch(/demandPerDay/);
    expect(validateProject({ ...sampleProject, parts: [{ ...bolts, id: '' }] }).error).toBe('Part 1 has no id.');
    expect(validateProject({ ...sampleProject, parts: [bolts, bolts] }).error).toMatch(/duplicate id/);
  });
});

describe('parseProjectJson', () => {
  it('round-trips a serialized project', () => {
    expect(parseProjectJson(serializeProject(sampleProject)).project).toEqual(sampleProject);
  });

  it('reports invalid JSON', () => {
    expect(parseProjectJson('{ not json').error).toBe('The file is not valid JSON.');
  });
});

describe('saveProject and loadSavedProject', () => {
  it('saves and loads a project', () => {
    const storage = createMemoryStorage();
    expect(saveProject(storage, sampleProject)).toBe(true);
    expect(loadSavedProject(storage)).toEqual(sampleProject);
  });

  it('returns null when nothing or something invalid is saved', () => {
    const storage = createMemoryStorage();
    expect(loadSavedProject(storage)).toBeNull();
    storage.setItem(storageKey, '{"broken":');
    expect(loadSavedProject(storage)).toBeNull();
  });

  it('does not throw when storage is unavailable', () => {
    expect(saveProject(throwingStorage, sampleProject)).toBe(false);
    expect(loadSavedProject(throwingStorage)).toBeNull();
    expect(loadSavedProject(null)).toBeNull();
  });
});
