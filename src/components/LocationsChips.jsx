import React from "react";

export default function LocationsChips({ cities, onSelect, onRemove }) {
  if (!cities.length) {
    return <p>Нет сохранённых городов</p>;
  }

  return (
    <div className="locations-chips">
      {cities.map((city, index) => (
        <div
          key={index}
          className="chip"
          onClick={() => onSelect(city)}
        >
          {city}
          <button
            className="remove-btn"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(city);
            }}
          >
            ✖
          </button>
        </div>
      ))}
    </div>
  );
}
