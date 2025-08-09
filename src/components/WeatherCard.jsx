export default function WeatherCard({ weather }) {
  if (!weather) return <div className="card">Нет данных</div>
  const { main, wind, weather: w, name } = weather
  return (
    <div className="card">
      <div>
        <h2>{name}</h2>
        <div style={{fontSize:32}}>{Math.round(main.temp)}°C</div>
        <div className="muted">{w[0].description}</div>
      </div>
      <div>
        <div>Влажность: {main.humidity}%</div>
        <div>Ветер: {wind.speed} м/с</div>
      </div>
    </div>
  )
}
