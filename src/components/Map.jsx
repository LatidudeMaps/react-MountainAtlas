import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/lib/assets/MarkerCluster.css';
import 'react-leaflet-cluster/lib/assets/MarkerCluster.Default.css';

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
  const [osmPeaks, setOsmPeaks] = useState(null);
  const [currentHierLevel, setCurrentHierLevel] = useState("4");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mountainAreasResponse, osmPeaksResponse] = await Promise.all([
          fetch("https://raw.githubusercontent.com/latidudemaps/MountainAtlas/main/data/MountainAreas.geojson"),
          fetch("https://raw.githubusercontent.com/latidudemaps/MountainAtlas/main/data/OSM_peaks_GMBA.geojson")
        ]);
        const mountainAreasData = await mountainAreasResponse.json();
        const osmPeaksData = await osmPeaksResponse.json();
        setMountainAreas(mountainAreasData);
        setOsmPeaks(osmPeaksData);
      } catch (error) {
        console.error("Error fetching data:", error);
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

  const filteredPeaks = useMemo(() => {
    if (!osmPeaks) return null;
    return {
      ...osmPeaks,
      features: osmPeaks.features.filter(feature => 
        String(feature.properties.Hier_lvl) === currentHierLevel
      )
    };
  }, [osmPeaks, currentHierLevel]);

  const hierarchyLevels = useMemo(() => {
    if (!mountainAreas) return [];
    return [...new Set(mountainAreas.features.map(f => f.properties.Hier_lvl))].sort();
  }, [mountainAreas]);

  const createClusterCustomIcon = function (cluster) {
    return L.divIcon({
      html: `<span>${cluster.getChildCount()}</span>`,
      className: 'custom-marker-cluster',
      iconSize: L.point(40, 40, true),
    });
  };

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
      {filteredPeaks && (
        <MarkerClusterGroup 
          chunkedLoading
          iconCreateFunction={createClusterCustomIcon}
        >
          {filteredPeaks.features.map((peak, index) => (
            <Marker 
              key={index} 
              position={[peak.geometry.coordinates[1], peak.geometry.coordinates[0]]}
            >
              <Popup>
                <strong>{peak.properties.name || "Unnamed Peak"}</strong><br />
                Elevation: {peak.properties.elevation || "Unknown"} m<br />
                MapName: {peak.properties.MapName}
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
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