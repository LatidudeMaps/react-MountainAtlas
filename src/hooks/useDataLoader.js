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

  return { mountainAreasData, allOsmPeaks, dataLoaded };
};

export default useDataLoader;