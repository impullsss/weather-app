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
