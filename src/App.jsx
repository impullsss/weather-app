import React, { useState, useEffect } from "react";
import LocationsChips from "./components/LocationsChips";
import useDebounce from "./hooks/useDebounce";
import MapView from "./components/MapView";
import Settings from "./components/Settings";
import {
  getLocations,
  saveLocation,
  removeLocation as removeLoc,
  getSettings,
  setSettings as persistSettings,
} from "./utils/storage";
import "./index.scss";

const WEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_KEY;
const DADATA_API_KEY = import.meta.env.VITE_DADATA_KEY;

const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";
const DADATA_URL =
  "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address";

function App() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [weather, setWeather] = useState(null);
  const [savedCities, setSavedCities] = useState(getLocations());
  const [error, setError] = useState("");

  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [loadingWeather, setLoadingWeather] = useState(false);

  // страница: 'weather' | 'settings'
  const [page, setPage] = useState("weather");

  // настройки отображения
  const [settings, setSettings] = useState(getSettings());
  const updateSettings = (patch) => {
    const next = persistSettings(patch);
    setSettings(next);
  };

  const debouncedQuery = useDebounce(query, 500);

  const removeCity = (cityToRemove) => {
    removeLoc(cityToRemove);
    setSavedCities(getLocations());
  };

  // Запрос подсказок от Dadata
  useEffect(() => {
    if (!debouncedQuery) {
      setSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    fetch(DADATA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Token ${DADATA_API_KEY}`,
      },
      body: JSON.stringify({ query: debouncedQuery, count: 5 }),
    })
      .then((res) => res.json())
      .then((data) => {
        const cities = data.suggestions
          ?.map((s) => s.data.city || s.data.settlement)
          .filter(Boolean);
        setSuggestions([...new Set(cities)]);
      })
      .catch(() => setSuggestions([]))
      .finally(() => setLoadingSuggestions(false));
  }, [debouncedQuery]);

  // Получение погоды по названию города
  const fetchWeatherByCity = (city) => {
    if (!city) return;

    setLoadingWeather(true);
    fetch(
      `${WEATHER_API_URL}?q=${encodeURIComponent(
        city
      )}&appid=${WEATHER_API_KEY}&units=metric&lang=ru`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.cod === 200) {
          setWeather(data);
          setError("");
        } else {
          setWeather(null);
          setError("Не удалось получить данные о погоде");
        }
      })
      .catch(() => {
        setWeather(null);
        setError("Ошибка запроса");
      })
      .finally(() => setLoadingWeather(false));
  };

  // Получение погоды по геолокации
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setError("Геолокация не поддерживается");
      return;
    }

    setLoadingWeather(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetch(
          `${WEATHER_API_URL}?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric&lang=ru`
        )
          .then((res) => res.json())
          .then((data) => {
            if (data.cod === 200) {
              setWeather(data);
              setError("");
            } else {
              setError("Не удалось определить местоположение");
            }
          })
          .finally(() => setLoadingWeather(false));
      },
      () => {
        setError("Ошибка получения геолокации");
        setLoadingWeather(false);
      }
    );
  };

  // Сохранение города в localStorage
  const handleSaveCity = () => {
    if (weather?.name && !savedCities.includes(weather.name)) {
      saveLocation(weather.name);
      setSavedCities(getLocations());
    }
  };

  const formatSunset = (w) => {
    if (!w?.sys?.sunset) return "";
    const tz = w.timezone || 0; // смещение в секундах
    const localSec = w.sys.sunset + tz;
    const d = new Date(localSec * 1000);
    return d.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="app">
      <h1>Приложение погоды</h1>

      {/* Навигация между страницами */}
      <div className="tabs" style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => setPage("weather")}
          className={page === "weather" ? "active" : ""}
        >
          Погода
        </button>
        <button
          onClick={() => setPage("settings")}
          className={page === "settings" ? "active" : ""}
          style={{ marginLeft: 8 }}
        >
          Настройки
        </button>
      </div>

      {page === "settings" ? (
        <Settings settings={settings} onChange={updateSettings} />
      ) : (
        <>
          <div className="controls">
            <input
              type="text"
              placeholder="Введите город"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button onClick={() => fetchWeatherByCity(query)}>
              Получить погоду
            </button>
            <button onClick={getUserLocation}>Моё местоположение</button>

            {loadingSuggestions && <p>Загрузка подсказок...</p>}
            {suggestions.length > 0 && !loadingSuggestions && (
              <ul className="suggestions">
                {suggestions.map((s, i) => (
                  <li key={i} onClick={() => fetchWeatherByCity(s)}>
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <LocationsChips
            cities={savedCities}
            onSelect={fetchWeatherByCity}
            onRemove={removeCity}
          />

          {error && <p className="error">{error}</p>}

          {loadingWeather && <p>Загрузка погоды...</p>}
          {weather && !loadingWeather && (
            <div className="weather-info">
              <h2>{weather.name}</h2>
              <p>Температура: {Math.round(weather.main.temp)}°C</p>

              {settings.showFeelsLike && (
                <p>Ощущается как: {Math.round(weather.main.feels_like)}°C</p>
              )}

              {settings.showHumidity && (
                <p>Влажность: {weather.main.humidity}%</p>
              )}

              <p>Ветер: {weather.wind.speed} м/с</p>

              {settings.showSunset && (
                <p>Закат: {formatSunset(weather)}</p>
              )}

              <button onClick={handleSaveCity}>Сохранить город</button>

              <MapView lat={weather.coord.lat} lon={weather.coord.lon} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
