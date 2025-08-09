const KEY = 'saved_locations_v1'
export function getSaved() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}
export function saveLocation(loc) {
  const arr = getSaved()
  if (!arr.find(x => x === loc)) arr.push(loc)
  localStorage.setItem(KEY, JSON.stringify(arr))
}
export function removeLocation(loc) {
  const arr = getSaved().filter(x => x !== loc)
  localStorage.setItem(KEY, JSON.stringify(arr))
}
