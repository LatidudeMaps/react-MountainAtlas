import { useState, useEffect } from 'react';

const useDataLoader = () => {
  const [mountainAreasData, setMountainAreasData] = useState(null);
  const [allOsmPeaks, setAllOsmPeaks] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [mountainAreas, osmPeaks] = await Promise.all([
          fetch("https://raw.githubusercontent.com/latidudemaps/MountainAtlas/main/data/MountainAreas.geojson").then(res => res.json()),
          fetch("https://raw.githubusercontent.com/latidudemaps/MountainAtlas/main/data/OSM_peaks_GMBA.geojson").then(res => res.json())
        ]);

        setMountainAreasData(mountainAreas);
        setAllOsmPeaks(osmPeaks.features);
        setDataLoaded(true);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  const getUniqueHierLevels = () => {
    if (!mountainAreasData) return [];
    return [...new Set(mountainAreasData.features.map(feature => feature.properties?.Hier_lvl))].sort((a, b) => a - b);
  };

  return { mountainAreasData, allOsmPeaks, dataLoaded, getUniqueHierLevels };
};

export default useDataLoader;