import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const HierarchyControl = ({ hierarchyLevels, currentLevel, onChange }) => {
  const map = useMap();

  return (
    <div className="leaflet-top leaflet-right">
      <div className="leaflet-control leaflet-bar">
        <select value={currentLevel} onChange={(e) => onChange(e.target.value)}>
          {hierarchyLevels.map(level => (
            <option key={level} value={level}>Hier Level: {level}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

const Map = () => {
  const [mountainAreas, setMountainAreas] = useState(null);
  const [currentHierLevel, setCurrentHierLevel] = useState("4");

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

  const filteredAreas = useMemo(() => {
    if (!mountainAreas) return null;
    return {
      ...mountainAreas,
      features: mountainAreas.features.filter(feature => 
        String(feature.properties.Hier_lvl) === currentHierLevel
      )
    };
  }, [mountainAreas, currentHierLevel]);

  const hierarchyLevels = useMemo(() => {
    if (!mountainAreas) return [];
    return [...new Set(mountainAreas.features.map(f => f.properties.Hier_lvl))].sort();
  }, [mountainAreas]);

  return (
    <MapContainer center={[45.5, 10.5]} zoom={6} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      {filteredAreas && (
        <GeoJSON 
          key={currentHierLevel}
          data={filteredAreas} 
          style={() => ({
            color: "#ff7800",
            weight: 2,
            opacity: 1,
            fillColor: "#ffcc66",
            fillOpacity: 0.65
          })}
        />
      )}
      <HierarchyControl 
        hierarchyLevels={hierarchyLevels}
        currentLevel={currentHierLevel}
        onChange={setCurrentHierLevel}
      />
    </MapContainer>
  );
};

export default Map;