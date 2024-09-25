import React from 'react';
import { useMap } from 'react-leaflet';

const Controls = ({ hierLevels, currentHierLevel, onHierLevelChange }) => {
  const map = useMap();

  return (
    <div className="leaflet-top leaflet-right">
      <div className="leaflet-control leaflet-bar">
        <div className="control-section filter-control-section">
          <div className="control-group">
            <label htmlFor="hier-lvl-slider">
              GMBA Hierarchy Level: <span id="hier-lvl-value">{currentHierLevel}</span>
            </label>
            <input
              type="range"
              id="hier-lvl-slider"
              className="custom-slider"
              min={Math.min(...hierLevels)}
              max={Math.max(...hierLevels)}
              value={currentHierLevel}
              onChange={(e) => onHierLevelChange(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Controls;