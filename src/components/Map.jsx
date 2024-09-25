import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker } from 'react-leaflet';
import useDataLoader from '../hooks/useDataLoader';
import useLayerManager from '../hooks/useLayerManager';
import 'leaflet/dist/leaflet.css';

const Map = () => {
  const { mountainAreasData, allOsmPeaks, dataLoaded } = useDataLoader();
  const {
    currentHierLevel,
    defaultPolygonStyle,
    onEachFeature,
    filterMountainAreas,
    createMarker,
    filterAndDisplayPeaks
  } = useLayerManager(mountainAreasData, allOsmPeaks);

  const [filteredMountainAreas, setFilteredMountainAreas] = useState(null);
  const [filteredPeaks, setFilteredPeaks] = useState(null);

  useEffect(() => {
    if (dataLoaded && currentHierLevel) {
      setFilteredMountainAreas(filterMountainAreas(currentHierLevel));
      setFilteredPeaks(filterAndDisplayPeaks(currentHierLevel));
    }
  }, [dataLoaded, currentHierLevel, filterMountainAreas, filterAndDisplayPeaks]);

  return (
    <MapContainer center={[45.5, 10.5]} zoom={6} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      {dataLoaded && filteredMountainAreas && (
        <GeoJSON
          data={filteredMountainAreas}
          style={defaultPolygonStyle}
          onEachFeature={onEachFeature}
        />
      )}
      {dataLoaded && filteredPeaks && filteredPeaks.map((peak, index) => (
        <Marker
          key={index}
          position={[peak.geometry.coordinates[1], peak.geometry.coordinates[0]]}
          icon={createMarker(peak, [peak.geometry.coordinates[1], peak.geometry.coordinates[0]]).options.icon}
        />
      ))}
    </MapContainer>
  );
};

export default Map;