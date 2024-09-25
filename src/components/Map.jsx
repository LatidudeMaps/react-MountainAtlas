import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import * as turf from '@turf/turf';
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/lib/assets/MarkerCluster.css';
import 'react-leaflet-cluster/lib/assets/MarkerCluster.Default.css';

const HierarchyControl = React.memo(({ hierarchyLevels, currentLevel, onChange }) => {
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
});

const LoadingOverlay = () => (
  <div className="loading-overlay">
    <div className="loading-spinner"></div>
  </div>
);

const CustomGeoJSONLayer = ({ data, style, onEachFeature }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!data) return;

    const layer = L.geoJSON(data, {
      style,
      onEachFeature
    });

    layer.addTo(map);

    return () => {
      map.removeLayer(layer);
    };
  }, [map, data, style, onEachFeature]);

  return null;
};

const Map = () => {
  const [mountainAreas, setMountainAreas] = useState(null);
  const [osmPeaks, setOsmPeaks] = useState(null);
  const [currentHierLevel, setCurrentHierLevel] = useState("4");
  const [isLoading, setIsLoading] = useState(true);
  const [simplifiedAreas, setSimplifiedAreas] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mountainAreasResponse, osmPeaksResponse] = await Promise.all([
          fetch("https://raw.githubusercontent.com/latidudemaps/MountainAtlas/main/data/MountainAreas.geojson"),
          fetch("https://raw.githubusercontent.com/latidudemaps/MountainAtlas/main/data/OSM_peaks_GMBA.geojson")
        ]);
        const mountainAreasData = await mountainAreasResponse.json();
        const osmPeaksData = await osmPeaksResponse.json();
        
        // Pre-process the data
        const processedOsmPeaks = osmPeaksData.features.reduce((acc, peak) => {
          const hierLevel = String(peak.properties.Hier_lvl);
          if (!acc[hierLevel]) {
            acc[hierLevel] = [];
          }
          acc[hierLevel].push(peak);
          return acc;
        }, {});

        setMountainAreas(mountainAreasData);
        setOsmPeaks(processedOsmPeaks);

        // Simplify the mountain areas for different zoom levels
        const simplified = {};
        [0.01, 0.005, 0.001].forEach(tolerance => {
          simplified[tolerance] = turf.simplify(mountainAreasData, { tolerance, highQuality: false });
        });
        setSimplifiedAreas(simplified);

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredAreas = useMemo(() => {
    if (!mountainAreas) return null;
    return {
      type: "FeatureCollection",
      features: mountainAreas.features.filter(feature => 
        String(feature.properties.Hier_lvl) === currentHierLevel
      )
    };
  }, [mountainAreas, currentHierLevel]);

  const filteredPeaks = useMemo(() => {
    if (!osmPeaks) return null;
    return osmPeaks[currentHierLevel] || [];
  }, [osmPeaks, currentHierLevel]);

  const hierarchyLevels = useMemo(() => {
    if (!mountainAreas) return [];
    return [...new Set(mountainAreas.features.map(f => f.properties.Hier_lvl))].sort();
  }, [mountainAreas]);

  const createClusterCustomIcon = useCallback((cluster) => {
    return L.divIcon({
      html: `<span>${cluster.getChildCount()}</span>`,
      className: 'custom-marker-cluster',
      iconSize: L.point(40, 40, true),
    });
  }, []);

  const areaStyle = useCallback(() => ({
    color: "#ff7800",
    weight: 2,
    opacity: 1,
    fillColor: "#ffcc66",
    fillOpacity: 0.65
  }), []);

  const onEachFeature = useCallback((feature, layer) => {
    layer.bindPopup(`<strong>${feature.properties.MapName}</strong>`);
  }, []);

  const handleHierLevelChange = useCallback((newLevel) => {
    setIsLoading(true);
    setTimeout(() => {
      setCurrentHierLevel(newLevel);
      setIsLoading(false);
    }, 0);
  }, []);

  return (
    <>
      <MapContainer center={[45.5, 10.5]} zoom={6} style={{ height: '100vh', width: '100%' }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        {simplifiedAreas && (
          <CustomGeoJSONLayer 
            data={simplifiedAreas[0.01]}
            style={areaStyle}
            onEachFeature={onEachFeature}
          />
        )}
        {filteredPeaks && (
          <MarkerClusterGroup 
            chunkedLoading
            iconCreateFunction={createClusterCustomIcon}
          >
            {filteredPeaks.map((peak, index) => (
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
          onChange={handleHierLevelChange}
        />
      </MapContainer>
      {isLoading && <LoadingOverlay />}
    </>
  );
};

export default Map;