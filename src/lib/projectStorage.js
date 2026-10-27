// Saving, loading and validating projects ({ settings, parts }).
// Storage is passed in so the functions can be tested without a browser.

import { checkNumber, partFieldRules, settingsRules } from './validation.js';

export const storageKey = 'kanban-calculator-project';

function validateNumberFields(source, rules, context) {
  for (const [key, rule] of Object.entries(rules)) {
    const error = checkNumber(source[key], rule);
    if (error) return `${context}: "${key}" is invalid (${error.toLowerCase()}).`;
  }
  return null;
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Checks that data has the shape of a project with valid values.
// Returns { project, error }: a clean copy of the project, or an error message.
export function validateProject(data) {
  if (!isPlainObject(data)) return { project: null, error: 'The file does not contain a project object.' };
  if (!isPlainObject(data.settings)) return { project: null, error: 'The project has no "settings" object.' };
  if (!Array.isArray(data.parts)) return { project: null, error: 'The project has no "parts" list.' };

  const settingsError = validateNumberFields(data.settings, settingsRules, 'Settings');
  if (settingsError) return { project: null, error: settingsError };

  const seenIds = new Set();
  for (const [index, part] of data.parts.entries()) {
    const context = `Part ${index + 1}`;
    if (!isPlainObject(part)) return { project: null, error: `${context} is not an object.` };
    if (typeof part.id !== 'string' || part.id === '') return { project: null, error: `${context} has no id.` };
    if (seenIds.has(part.id)) return { project: null, error: `${context} has a duplicate id "${part.id}".` };
    if (typeof part.name !== 'string') return { project: null, error: `${context} has no name.` };
    const partError = validateNumberFields(part, partFieldRules, `${context} (${part.name})`);
    if (partError) return { project: null, error: partError };
    seenIds.add(part.id);
  }

  // Copy only known fields so unexpected extra data is not carried along.
  const project = {
    settings: {
      workingHoursPerDay: data.settings.workingHoursPerDay,
      simulationDays: data.settings.simulationDays,
    },
    parts: data.parts.map((part) => ({
      id: part.id,
      name: part.name,
      ...Object.fromEntries(Object.keys(partFieldRules).map((key) => [key, part[key]])),
    })),
  };
  return { project, error: null };
}

// Parses JSON text (e.g. an imported file) into a validated project.
export function parseProjectJson(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return { project: null, error: 'The file is not valid JSON.' };
  }
  return validateProject(data);
}

export function serializeProject(project) {
  return JSON.stringify(project, null, 2);
}

// Returns the saved project, or null if nothing valid is saved or storage is unavailable.
export function loadSavedProject(storage) {
  try {
    const text = storage?.getItem(storageKey);
    return text ? parseProjectJson(text).project : null;
  } catch {
    return null;
  }
}

// Saves the project; returns false if storage is unavailable (e.g. private mode or full).
export function saveProject(storage, project) {
  try {
    storage.setItem(storageKey, serializeProject(project));
    return true;
  } catch {
    return false;
  }
}

// window.localStorage can throw on access when site data is blocked.
export function getBrowserStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
