import { useState, useCallback, useMemo } from 'react';
import L from 'leaflet';

const useLayerManager = (mountainAreasData, allOsmPeaks) => {
  const [currentHierLevel, setCurrentHierLevel] = useState("4");

  const defaultPolygonStyle = useMemo(() => ({
    color: "#ff7800",
    weight: 2,
    opacity: 1,
    fillColor: "#ffcc66",
    fillOpacity: 0.65
  }), []);

  const onEachFeature = useCallback((feature, layer) => {
    const popupContent = `
      <b>${feature.properties.MapName}</b><br>
      <a href="${feature.properties.wiki_url_it}" target="_blank">Wikipedia (IT)</a><br>
      <a href="${feature.properties.wiki_url_en}" target="_blank">Wikipedia (EN)</a>
    `;
    layer.bindPopup(popupContent);
  }, []);

  const filterMountainAreas = useCallback((selectedValue) => {
    setCurrentHierLevel(selectedValue);
    return mountainAreasData?.features.filter(feature => 
      String(feature.properties.Hier_lvl).trim() === selectedValue
    ) || [];
  }, [mountainAreasData]);

  const createMarker = useCallback((feature, latlng) => {
    const marker = L.marker(latlng);
    const name = feature.properties.name || "Unnamed Peak";
    const elevation = feature.properties.elevation || "Unknown";
    const popupContent = `<b>Name:</b> ${name}<br><b>Elevation:</b> ${elevation} m<br><b>MapName:</b> ${feature.properties.MapName}`;

    marker.bindPopup(popupContent)
      .bindTooltip(name, {
        permanent: true,
        direction: 'top',
        offset: [-15, -3],
        className: 'dark-tooltip'
      });

    return marker;
  }, []);

  const filterAndDisplayPeaks = useCallback((hierLvl, mapName = null) => {
    if (!allOsmPeaks) return [];
    
    let filteredPeaks;

    if (mapName) {
      filteredPeaks = allOsmPeaks.filter(feature => 
        feature.properties.MapName.trim().toLowerCase() === mapName.toLowerCase()
      );
    } else {
      filteredPeaks = hierLvl === "all" 
        ? allOsmPeaks.filter(feature => feature.properties.Hier_lvl === "4")
        : allOsmPeaks.filter(feature => String(feature.properties.Hier_lvl).trim() === hierLvl);
    }

    return filteredPeaks;
  }, [allOsmPeaks]);

  return {
    currentHierLevel,
    defaultPolygonStyle,
    onEachFeature,
    filterMountainAreas,
    createMarker,
    filterAndDisplayPeaks
  };
};

export default useLayerManager;