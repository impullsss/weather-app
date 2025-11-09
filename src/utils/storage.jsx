const KEY = 'saved_locations_v1';

export function getLocations() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveLocation(loc) {
  const arr = getLocations();
  if (!arr.includes(loc)) arr.push(loc);
  localStorage.setItem(KEY, JSON.stringify(arr));
}

export function removeLocation(loc) {
  const arr = getLocations().filter(x => x !== loc);
  localStorage.setItem(KEY, JSON.stringify(arr));
}

// ====== settings ======
const SETTINGS_KEY = 'weather_settings_v1';
const DEFAULT_SETTINGS = {
  showHumidity: true,
  showFeelsLike: true,
  showSunset: false,
};

export function getSettings() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function setSettings(patch) {
  const current = getSettings();
  const next = { ...current, ...patch };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  return next;
}
