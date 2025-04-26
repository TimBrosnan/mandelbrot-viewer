# Mandelbrot Viewer

An interactive web application for exploring the Mandelbrot set with real-time rendering and smooth navigation.

## Features

- **Real-time Rendering**: Uses Web Workers for efficient computation
- **Smooth Navigation**: 
  - Pan by dragging
  - Zoom with mouse wheel
  - Configurable zoom step size
  - Smooth zoom animations
- **Multiple Color Schemes**:
  - Primary & Secondary
  - Ocean
  - Psychedelic
- **Interactive Controls**:
  - Adjustable iteration count
  - Configurable zoom step size
  - Adjustable animation speed
  - Reset view button
- **Visual Feedback**:
  - Coordinate grid overlay
  - Real-time cursor position
  - Current view bounds
  - Zoom ratio display
- **Screenshot Capture**: Save high-quality images of your discoveries

## Technical Details

- Built with React and TypeScript
- Uses HTML5 Canvas for rendering
- Web Workers for parallel computation
- Responsive design
- Modern UI with dark theme

## Usage

1. **Navigation**:
   - Click and drag to pan
   - Use mouse wheel to zoom in/out
   - Click "Reset View" to return to default view

2. **Controls**:
   - Adjust iterations for more/less detail
   - Change color scheme for different visualizations
   - Modify zoom step size for finer/coarser control
   - Adjust animation speed for smoother/faster transitions

3. **Screenshots**:
   - Click "Capture Screenshot" to save the current view
   - Images are saved as PNG files with timestamps

## Development

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/mandelbrot-viewer.git

# Install dependencies
cd mandelbrot-viewer
npm install

# Start development server
npm run dev
```

### Building for Production

```bash
npm run build
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by the beauty and complexity of the Mandelbrot set
- Built with modern web technologies
- Special thanks to the open-source community 