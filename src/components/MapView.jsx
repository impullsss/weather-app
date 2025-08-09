import React, { useEffect, useRef } from "react";

export default function MapView({ lat, lon }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!lat || !lon || !window.ymaps) return;

  window.ymaps.ready(() => {
    if (mapRef.current.innerHTML) {
      mapRef.current.innerHTML = "";
    }
    const map = new window.ymaps.Map(mapRef.current, {
      center: [lat, lon],
      zoom: 10,
    });
    const placemark = new window.ymaps.Placemark([lat, lon]);
    map.geoObjects.add(placemark);
  });
}, [lat, lon]);

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: "300px", marginTop: "1rem" }}
    />
  );
}
