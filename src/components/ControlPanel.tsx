import React from 'react';
import { ColorScheme, colorSchemes } from '../types/ColorScheme';

interface ControlPanelProps {
  maxIterations: number;
  onMaxIterationsChange: (value: number) => void;
  onReset: () => void;
  viewBounds: {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
  };
  cursorPosition: {
    x: number | null;
    y: number | null;
  };
  zoomStepSize: number;
  onZoomStepSizeChange: (value: number) => void;
  zoomAnimationSpeed: number;
  onZoomAnimationSpeedChange: (value: number) => void;
  selectedColorScheme: ColorScheme;
  onColorSchemeChange: (scheme: ColorScheme) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  maxIterations,
  onMaxIterationsChange,
  onReset,
  viewBounds,
  cursorPosition,
  zoomStepSize,
  onZoomStepSizeChange,
  zoomAnimationSpeed,
  onZoomAnimationSpeedChange,
  selectedColorScheme,
  onColorSchemeChange,
}) => {
  return (
    <div style={{
      position: 'fixed',
      top: 20,
      right: 20,
      padding: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      color: 'white',
      borderRadius: 8,
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
      zIndex: 1000,
      width: '250px',
    }}>
      <button
        onClick={onReset}
        style={{
          width: '100%',
          padding: '12px',
          marginBottom: 20,
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        Reset View
      </button>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', marginBottom: 10 }}>
          Color Scheme:
        </label>
        <select
          value={selectedColorScheme.name}
          onChange={(e) => {
            const scheme = colorSchemes.find(s => s.name === e.target.value);
            if (scheme) onColorSchemeChange(scheme);
          }}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: '#333',
            color: 'white',
            border: 'none',
            borderRadius: 4,
          }}
        >
          {colorSchemes.map(scheme => (
            <option key={scheme.name} value={scheme.name}>
              {scheme.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <label>Iterations:</label>
          <span>{maxIterations}</span>
        </div>
        <input
          type="range"
          min="10"
          max="1000"
          value={maxIterations}
          onChange={(e) => onMaxIterationsChange(Number(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <label>Zoom Step Size:</label>
          <span>{(zoomStepSize * 100).toFixed(0)}%</span>
        </div>
        <input
          type="range"
          min="5"
          max="50"
          value={zoomStepSize * 100}
          onChange={(e) => onZoomStepSizeChange(Number(e.target.value) / 100)}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <label>Zoom Animation Speed:</label>
          <span>{(zoomAnimationSpeed * 100).toFixed(0)}%</span>
        </div>
        <input
          type="range"
          min="5"
          max="50"
          value={zoomAnimationSpeed * 100}
          onChange={(e) => onZoomAnimationSpeedChange(Number(e.target.value) / 100)}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginTop: 20, fontFamily: 'monospace' }}>
        <p style={{ margin: '8px 0' }}>
          View Bounds:
        </p>
        <p style={{ margin: '4px 0', paddingLeft: '10px' }}>
          X: [{viewBounds.xMin.toFixed(3)}, {viewBounds.xMax.toFixed(3)}]
        </p>
        <p style={{ margin: '4px 0', paddingLeft: '10px' }}>
          Y: [{viewBounds.yMin.toFixed(3)}, {viewBounds.yMax.toFixed(3)}]
        </p>
        <p style={{ margin: '8px 0' }}>
          Cursor: ({cursorPosition.x?.toFixed(8) || 'N/A'}, {cursorPosition.y?.toFixed(8) || 'N/A'})
        </p>
      </div>
    </div>
  );
};

export default ControlPanel; 