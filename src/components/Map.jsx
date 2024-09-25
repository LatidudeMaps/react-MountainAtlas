import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const Map = () => {
  const [mountainAreas, setMountainAreas] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://raw.githubusercontent.com/latidudemaps/MountainAtlas/main/data/MountainAreas.geojson");
        const data = await response.json();
        setMountainAreas(data);
      } catch (error) {
        console.error("Error fetching mountain areas:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <MapContainer center={[45.5, 10.5]} zoom={6} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      {mountainAreas && (
        <GeoJSON 
          data={mountainAreas} 
          style={() => ({
            color: "#ff7800",
            weight: 2,
            opacity: 1,
            fillColor: "#ffcc66",
            fillOpacity: 0.65
          })}
        />
      )}
    </MapContainer>
  );
};

export default Map;