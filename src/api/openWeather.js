import axios from 'axios'
const KEY = import.meta.env.VITE_OPENWEATHER_KEY
const BASE = 'https://api.openweathermap.org/data/2.5/weather'

export async function getWeatherByCity(city) {
  const res = await axios.get(BASE, {
    params: { q: city, units: 'metric', lang: 'ru', appid: KEY }
  })
  return res.data
}

export async function getWeatherByCoords(lat, lon) {
  const res = await axios.get(BASE, {
    params: { lat, lon, units: 'metric', lang: 'ru', appid: KEY }
  })
  return res.data
}
