import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import useDataLoader from '../hooks/useDataLoader';
import useLayerManager from '../hooks/useLayerManager';
import Controls from './Controls';
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/lib/assets/MarkerCluster.css';
import 'react-leaflet-cluster/lib/assets/MarkerCluster.Default.css';

const MapContent = ({ mountainAreasData, allOsmPeaks, dataLoaded }) => {
  const map = useMap();
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
  const [hierLevels, setHierLevels] = useState([]);

  useEffect(() => {
    if (dataLoaded && mountainAreasData) {
      const levels = [...new Set(mountainAreasData.features.map(f => f.properties.Hier_lvl))].sort((a, b) => a - b);
      setHierLevels(levels);
      const initialLevel = "4";
      setFilteredMountainAreas(filterMountainAreas(initialLevel));
      setFilteredPeaks(filterAndDisplayPeaks(initialLevel));
    }
  }, [dataLoaded, mountainAreasData, filterMountainAreas, filterAndDisplayPeaks]);

  const handleHierLevelChange = useCallback((newLevel) => {
    setFilteredMountainAreas(filterMountainAreas(newLevel));
    setFilteredPeaks(filterAndDisplayPeaks(newLevel));
  }, [filterMountainAreas, filterAndDisplayPeaks]);

  const memoizedGeoJSON = useMemo(() => {
    if (!filteredMountainAreas) return null;
    return (
      <GeoJSON
        data={filteredMountainAreas}
        style={defaultPolygonStyle}
        onEachFeature={onEachFeature}
      />
    );
  }, [filteredMountainAreas, defaultPolygonStyle, onEachFeature]);

  const memoizedMarkers = useMemo(() => {
    if (!filteredPeaks) return null;
    return filteredPeaks.map((peak, index) => (
      <L.Marker
        key={index}
        position={[peak.geometry.coordinates[1], peak.geometry.coordinates[0]]}
        icon={createMarker(peak, [peak.geometry.coordinates[1], peak.geometry.coordinates[0]]).options.icon}
      />
    ));
  }, [filteredPeaks, createMarker]);

  return (
    <>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      {memoizedGeoJSON}
      <MarkerClusterGroup chunkedLoading>
        {memoizedMarkers}
      </MarkerClusterGroup>
      <Controls
        hierLevels={hierLevels}
        currentHierLevel={currentHierLevel}
        onHierLevelChange={handleHierLevelChange}
      />
    </>
  );
};

const Map = () => {
  const { mountainAreasData, allOsmPeaks, dataLoaded } = useDataLoader();

  return (
    <MapContainer center={[45.5, 10.5]} zoom={6} style={{ height: '100vh', width: '100%' }}>
      <MapContent
        mountainAreasData={mountainAreasData}
        allOsmPeaks={allOsmPeaks}
        dataLoaded={dataLoaded}
      />
    </MapContainer>
  );
};

export default Map;