import React from "react";

export default function SavedLocations({ cities, onSelect, onRemove }) {
  if (!cities.length) {
    return <p>Нет сохранённых городов</p>;
  }

  return (
    <div className="saved-locations">
      <h3>Сохранённые города</h3>
      <div className="cities">
      <ul>
        {cities.map((city, index) => (
          <li key={index}
          onClick={() => onSelect(city)}>
            <span >{city}</span>
            <button
              className="remove-btn"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(city);
              }}
            >
              ✖
            </button>
          </li>
        ))}
      </ul>
      </div>
    </div>
  );
}
