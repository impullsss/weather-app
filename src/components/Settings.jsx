import React from "react";
export default function Settings({ settings, onChange }) {
  const handleToggle = (key) => (e) => {
    onChange({ [key]: e.target.checked });
  };

  return (
    <div className="settings-page">
      <h2>Настройки отображения</h2>
      <div className="settings-list">
        <label className="setting-item">
          <input
            type="checkbox"
            checked={settings.showFeelsLike}
            onChange={handleToggle("showFeelsLike")}
          />
          <p>Показывать температуру «ощущается как»</p>
        </label>

        <label className="setting-item">
          <input
            type="checkbox"
            checked={settings.showHumidity}
            onChange={handleToggle("showHumidity")}
          />
          <p>Показывать влажность</p>
        </label>

        <label className="setting-item">
          <input
            type="checkbox"
            checked={settings.showSunset}
            onChange={handleToggle("showSunset")}
          />
          <p>Показывать время заката</p>
        </label>
      </div>
    </div>
  );
}