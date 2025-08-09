import React, { useState, useEffect } from "react";
import SavedLocations from "./components/SavedLocations";
import useDebounce from "./hooks/useDebounce";
import MapView from "./components/MapView";
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
  const [savedCities, setSavedCities] = useState(
    JSON.parse(localStorage.getItem("savedCities")) || []
  );
  const [error, setError] = useState("");

  const debouncedQuery = useDebounce(query, 500);

  const removeCity = (cityToRemove) => {
    const updated = savedCities.filter((city) => city !== cityToRemove);
    setSavedCities(updated);
    localStorage.setItem("savedCities", JSON.stringify(updated));
  };

  // Запрос подсказок от Dadata
  useEffect(() => {
    if (!debouncedQuery) {
      setSuggestions([]);
      return;
    }

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
      .catch(() => setSuggestions([]));
  }, [debouncedQuery]);

  // Получение погоды по названию города
  const fetchWeatherByCity = (city) => {
    if (!city) return;

    fetch(
      `${WEATHER_API_URL}?q=${city}&appid=${WEATHER_API_KEY}&units=metric&lang=ru`
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
      });
  };

  // Получение погоды по геолокации
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setError("Геолокация не поддерживается");
      return;
    }

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
          });
      },
      () => setError("Ошибка получения геолокации")
    );
  };

  // Сохранение города в localStorage
  const saveCity = () => {
    if (weather?.name && !savedCities.includes(weather.name)) {
      const updated = [...savedCities, weather.name];
      setSavedCities(updated);
      localStorage.setItem("savedCities", JSON.stringify(updated));
    }
  };

  return (
    <div className="app">
      <h1>Приложение погоды</h1>

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

        {suggestions.length > 0 && (
          <ul className="suggestions">
            {suggestions.map((s, i) => (
              <li key={i} onClick={() => fetchWeatherByCity(s)}>
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>

      <SavedLocations
        cities={savedCities}
        onSelect={fetchWeatherByCity}
        onRemove={removeCity}
      />

      {error && <p className="error">{error}</p>}

      {weather && (
        <div className="weather-info">
          <h2>{weather.name}</h2>
          <p>Температура: {weather.main.temp}°C</p>
          <p>Влажность: {weather.main.humidity}%</p>
          <p>Ветер: {weather.wind.speed} м/с</p>
          <button onClick={saveCity}>Сохранить город</button>

          <MapView lat={weather.coord.lat} lon={weather.coord.lon} />
        </div>
      )}
    </div>
  );
}

export default App;
