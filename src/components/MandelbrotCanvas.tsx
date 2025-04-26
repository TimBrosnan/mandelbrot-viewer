import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { ColorScheme } from '../types/ColorScheme';

interface Props {
  maxIterations: number;
  coordinates: { x: number; y: number };
  zoomLevel: number;
  onCoordinatesUpdate: (coords: { x: number; y: number }) => void;
  setZoomLevel: (zoom: number) => void;
  selectedColorScheme: ColorScheme;
  quality: number;
  onCursorMove: (coords: { x: number | null; y: number | null }) => void;
  zoomStepSize: number; // Percentage as decimal (e.g., 0.2 for 20%)
  zoomAnimationSpeed: number; // Animation speed factor (e.g., 0.1)
  onScreenshot?: (dataUrl: string) => void; // New prop for screenshot callback
}

export interface MandelbrotCanvasRef {
  captureScreenshot: () => void;
}

const ASPECT_RATIO = 4/3; // Standard 800x600 aspect ratio

const MandelbrotCanvas = forwardRef<MandelbrotCanvasRef, Props>(({
  maxIterations,
  coordinates,
  zoomLevel,
  onCoordinatesUpdate,
  setZoomLevel,
  selectedColorScheme,
  quality,
  onCursorMove,
  zoomStepSize,
  zoomAnimationSpeed,
  onScreenshot
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [renderTimeout, setRenderTimeout] = useState<number | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const targetZoomRef = useRef(zoomLevel);
  const currentZoomRef = useRef(zoomLevel);

  // Expose the captureScreenshot method via ref
  useImperativeHandle(ref, () => ({
    captureScreenshot
  }));

  // Keep zoom refs in sync with props
  useEffect(() => {
    targetZoomRef.current = zoomLevel;
    currentZoomRef.current = zoomLevel;
  }, [zoomLevel]);

  // Initialize Web Worker
  useEffect(() => {
    const workerCode = `
      self.onmessage = function(e) {
        const { width, height, maxIterations, xMin, xMax, yMin, yMax, quality } = e.data;
        const data = new Uint8ClampedArray(width * height * 4);
        
        for (let px = 0; px < width; px += quality) {
          for (let py = 0; py < height; py += quality) {
            const x0 = xMin + (px / width) * (xMax - xMin);
            const y0 = yMin + (py / height) * (yMax - yMin);
            
            let x = 0;
            let y = 0;
            let iteration = 0;
            
            while (x * x + y * y <= 4 && iteration < maxIterations) {
              const xTemp = x * x - y * y + x0;
              y = 2 * x * y + y0;
              x = xTemp;
              iteration++;
            }
            
            // Fill the block of pixels
            for (let i = 0; i < quality && px + i < width; i++) {
              for (let j = 0; j < quality && py + j < height; j++) {
                const index = ((py + j) * width + (px + i)) * 4;
                data[index + 3] = 255; // Alpha channel
                
                if (iteration === maxIterations) {
                  data[index] = data[index + 1] = data[index + 2] = 0;
                } else {
                  // Send back just the iteration count, color will be applied in the main thread
                  data[index] = iteration;
                  data[index + 1] = maxIterations;
                  data[index + 2] = 0;
                }
              }
            }
          }
        }
        
        self.postMessage({ data, width, height });
      };
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    workerRef.current = new Worker(workerUrl);

    return () => {
      workerRef.current?.terminate();
      URL.revokeObjectURL(workerUrl);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const calculateViewBounds = useCallback(() => {
    const unitSize = 2 / zoomLevel; // Base unit size
    const width = unitSize * 2; // Total width in complex plane units
    const height = width / ASPECT_RATIO; // Maintain aspect ratio

    return {
      xMin: coordinates.x - width / 2,
      xMax: coordinates.x + width / 2,
      yMin: coordinates.y - height / 2,
      yMax: coordinates.y + height / 2
    };
  }, [coordinates, zoomLevel]);

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const viewBounds = calculateViewBounds();
    const { xMin, xMax, yMin, yMax } = viewBounds;

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.font = '12px Arial';
    ctx.fillStyle = 'white';

    // Calculate grid spacing based on zoom level
    const gridSpacing = Math.pow(10, Math.floor(Math.log10(4 / zoomLevel)));
    
    // Function to convert complex coordinates to screen coordinates
    const toScreenX = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
    const toScreenY = (y: number) => ((yMax - y) / (yMax - yMin)) * height;

    // Draw axes if they're in view
    if (xMin <= 0 && xMax >= 0) {
      const xZero = toScreenX(0);
      ctx.beginPath();
      ctx.moveTo(xZero, 0);
      ctx.lineTo(xZero, height);
      ctx.stroke();
    }

    if (yMin <= 0 && yMax >= 0) {
      const yZero = toScreenY(0);
      ctx.beginPath();
      ctx.moveTo(0, yZero);
      ctx.lineTo(width, yZero);
      ctx.stroke();
    }

    // Draw grid lines
    for (let x = Math.ceil(xMin / gridSpacing) * gridSpacing; x <= xMax; x += gridSpacing) {
      const screenX = toScreenX(x);
      ctx.beginPath();
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, height);
      ctx.stroke();

      // Draw label
      if (Math.abs(x) > gridSpacing / 2) { // Avoid crowding near zero
        const label = x.toFixed(Math.max(0, -Math.floor(Math.log10(gridSpacing))));
        ctx.fillText(label, screenX + 2, toScreenY(0) + 14);
      }
    }

    for (let y = Math.ceil(yMin / gridSpacing) * gridSpacing; y <= yMax; y += gridSpacing) {
      const screenY = toScreenY(y);
      ctx.beginPath();
      ctx.moveTo(0, screenY);
      ctx.lineTo(width, screenY);
      ctx.stroke();

      // Draw label
      if (Math.abs(y) > gridSpacing / 2) { // Avoid crowding near zero
        const label = y.toFixed(Math.max(0, -Math.floor(Math.log10(gridSpacing))));
        ctx.fillText(label, toScreenX(0) + 2, screenY - 2);
      }
    }

    // Draw origin label
    if (xMin <= 0 && xMax >= 0 && yMin <= 0 && yMax >= 0) {
      ctx.fillText("0", toScreenX(0) + 2, toScreenY(0) - 2);
    }

    ctx.restore();
  }, [coordinates, zoomLevel, calculateViewBounds]);

  const drawMandelbrot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !workerRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const viewBounds = calculateViewBounds();
    const { xMin, xMax, yMin, yMax } = viewBounds;

    workerRef.current.onmessage = (e) => {
      const { data, width, height } = e.data;
      const imageData = ctx.createImageData(width, height);
      
      // Apply color scheme to the iteration data
      for (let i = 0; i < data.length; i += 4) {
        const iteration = data[i];
        const maxIter = data[i + 1];
        
        if (iteration === maxIter) {
          imageData.data[i] = imageData.data[i + 1] = imageData.data[i + 2] = 0;
        } else {
          const color = selectedColorScheme.getColor(iteration, maxIter);
          imageData.data[i] = color.r;
          imageData.data[i + 1] = color.g;
          imageData.data[i + 2] = color.b;
        }
        imageData.data[i + 3] = 255;
      }
      
      ctx.putImageData(imageData, 0, 0);
      drawGrid(ctx, width, height);
    };

    workerRef.current.postMessage({
      width,
      height,
      maxIterations,
      xMin,
      xMax,
      yMin,
      yMax,
      quality: quality * (Math.abs(currentZoomRef.current - targetZoomRef.current) > 0.01 ? 2 : 1)
    });
  }, [coordinates, maxIterations, selectedColorScheme, quality, drawGrid, calculateViewBounds]);

  const animateZoom = useCallback(() => {
    const diff = targetZoomRef.current - currentZoomRef.current;
    if (Math.abs(diff) < 0.001) {
      currentZoomRef.current = targetZoomRef.current;
      setZoomLevel(targetZoomRef.current);
      animationFrameRef.current = null;
      drawMandelbrot();
      return;
    }

    currentZoomRef.current += diff * zoomAnimationSpeed;
    setZoomLevel(currentZoomRef.current);
    drawMandelbrot();
    animationFrameRef.current = requestAnimationFrame(animateZoom);
  }, [drawMandelbrot, setZoomLevel, zoomAnimationSpeed]);

  useEffect(() => {
    if (renderTimeout) {
      clearTimeout(renderTimeout);
    }
    
    const timeout = window.setTimeout(() => {
      drawMandelbrot();
    }, 100);
    
    setRenderTimeout(timeout);
    
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [drawMandelbrot]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const viewBounds = calculateViewBounds();
    const { xMin, xMax, yMin, yMax } = viewBounds;

    const x = xMin + (mouseX / canvas.width) * (xMax - xMin);
    const y = yMax - (mouseY / canvas.height) * (yMax - yMin);

    onCursorMove({ x, y });

    if (isDragging) {
      const dx = (e.clientX - lastMousePos.x) / canvas.width * (xMax - xMin);
      const dy = (e.clientY - lastMousePos.y) / canvas.height * (yMax - yMin);

      const newX = coordinates.x - dx;
      const newY = coordinates.y - dy;
      
      if (newX >= -10 && newX <= 10 && newY >= -10 && newY <= 10) {
        onCoordinatesUpdate({ x: newX, y: newY });
      }

      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    onCursorMove({ x: null, y: null });
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Calculate mouse position relative to canvas
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Convert mouse position to complex plane coordinates
    const x = coordinates.x + (mouseX / canvas.width - 0.5) * (4 / currentZoomRef.current);
    const y = coordinates.y + (mouseY / canvas.height - 0.5) * (4 / currentZoomRef.current);

    // Calculate new zoom level with configurable zoom factor
    const zoomFactor = e.deltaY > 0 ? (1 - zoomStepSize) : (1 + zoomStepSize);
    targetZoomRef.current = currentZoomRef.current * zoomFactor;

    // Update coordinates to center on mouse position
    const newX = x - (x - coordinates.x) * (currentZoomRef.current / targetZoomRef.current);
    const newY = y - (y - coordinates.y) * (currentZoomRef.current / targetZoomRef.current);
    onCoordinatesUpdate({ x: newX, y: newY });

    // Start zoom animation if not already running
    if (!animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(animateZoom);
    }
  };

  const captureScreenshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !onScreenshot) return;

    // Create a temporary canvas for high-quality capture
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // Draw the current canvas content
    tempCtx.drawImage(canvas, 0, 0);

    // Convert to data URL and trigger callback
    const dataUrl = tempCanvas.toDataURL('image/png');
    onScreenshot(dataUrl);
  }, [onScreenshot]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      style={{ 
        border: '1px solid #333',
        backgroundColor: '#000',
        maxWidth: '100%',
        maxHeight: 'calc(100vh - 40px)',
        display: 'block',
        margin: '0 auto'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
    />
  );
});

export default MandelbrotCanvas; 