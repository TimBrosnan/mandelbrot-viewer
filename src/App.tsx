// Mandelbrot Explorer App
import React, { useState, useCallback } from 'react';
import './App.css';
import MandelbrotCanvas from './components/MandelbrotCanvas';
import ControlPanel from './components/ControlPanel';
import { ColorScheme, colorSchemes } from './types/ColorScheme';

interface Coordinates {
  x: number;
  y: number;
}

const DEFAULT_VIEW = {
  x: -0.75, // Center point between -2.3 and 0.8
  y: 0,     // Center point between -1.2 and 1.2
  zoom: 1.29 // Calculated to show x: [-2.3, 0.8] and y: [-1.2, 1.2]
};

const App: React.FC = () => {
  const [maxIterations, setMaxIterations] = useState<number>(100);
  const [coordinates, setCoordinates] = useState<Coordinates>(DEFAULT_VIEW);
  const [zoomLevel, setZoomLevel] = useState<number>(DEFAULT_VIEW.zoom);
  const [selectedColorScheme, setSelectedColorScheme] = useState<ColorScheme>(colorSchemes[2]); // Index 2 is Psychedelic
  const quality = 1; // Changed from useState to a constant since we don't need to change it
  const [cursorPosition, setCursorPosition] = useState<{ x: number | null; y: number | null }>({ x: null, y: null });
  const [zoomStepSize, setZoomStepSize] = useState(0.2); // 20% zoom step
  const [zoomAnimationSpeed, setZoomAnimationSpeed] = useState(0.5); // 50% animation speed

  const handleReset = useCallback(() => {
    setCoordinates(DEFAULT_VIEW);
    setZoomLevel(DEFAULT_VIEW.zoom);
  }, []);

  // Calculate current view bounds
  const viewBounds = {
    xMin: coordinates.x - 2 / zoomLevel,
    xMax: coordinates.x + 2 / zoomLevel,
    yMin: coordinates.y - 2 / zoomLevel,
    yMax: coordinates.y + 2 / zoomLevel
  };

  return (
    <div style={{ 
      display: 'flex', 
      padding: '20px', 
      backgroundColor: '#1a1a1a', 
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ 
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
      }}>
        <MandelbrotCanvas
          maxIterations={maxIterations}
          coordinates={coordinates}
          zoomLevel={zoomLevel}
          onCoordinatesUpdate={setCoordinates}
          setZoomLevel={setZoomLevel}
          selectedColorScheme={selectedColorScheme}
          quality={quality}
          onCursorMove={setCursorPosition}
          zoomStepSize={zoomStepSize}
          zoomAnimationSpeed={zoomAnimationSpeed}
        />
      </div>
      <ControlPanel
        maxIterations={maxIterations}
        onMaxIterationsChange={setMaxIterations}
        onReset={handleReset}
        viewBounds={viewBounds}
        cursorPosition={cursorPosition}
        zoomStepSize={zoomStepSize}
        onZoomStepSizeChange={setZoomStepSize}
        zoomAnimationSpeed={zoomAnimationSpeed}
        onZoomAnimationSpeedChange={setZoomAnimationSpeed}
        selectedColorScheme={selectedColorScheme}
        onColorSchemeChange={setSelectedColorScheme}
      />
    </div>
  );
};

export default App; 