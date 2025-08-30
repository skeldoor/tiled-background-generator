# Tiled Background Generator

A modern web application for creating beautiful tiled background patterns from images. Perfect for video backgrounds, wallpapers, and design projects.

![Tiled Background Generator](https://via.placeholder.com/800x400/6366f1/ffffff?text=Tiled+Background+Generator)

## Features

### 🎨 Core Functionality
- **Image Input**: Add multiple image URLs to create diverse patterns
- **Smart Silhouettes**: Automatic conversion to flat, colored silhouettes
- **Grid System**: Configurable N×N grid (5×5 to 20×20)
- **Real-time Preview**: Live updates as you adjust settings
- **High-Resolution Export**: Download 2560×1440 PNG backgrounds

### 🎛️ Advanced Controls
- **Scale Control**: Adjust silhouette size (10%-100%)
- **Spacing Control**: Customize gap between tiles (0-50px)
- **Sparsity Control**: Control pattern density (10%-100%)
- **Emboss Effect**: Add depth with configurable intensity and direction
- **Color System**: Custom background colors with automatic tinting

### 🎨 Curated Color Palettes
12 professionally designed muted pastel palettes:
- Sage & Cream
- Dusty Rose
- Warm Sand
- Cool Mist
- Lavender Dream
- Earthen Tones
- Ocean Breeze
- Morning Light
- Forest Whisper
- Silver & Stone
- Sunset Glow
- Twilight Blue

## Technology Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: TailwindCSS 3.4
- **Canvas**: HTML5 Canvas API for rendering
- **Icons**: Lucide React
- **Color Picker**: React Colorful
- **Deployment**: Vercel

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone git@github.com:skeldoor/tiled-background-generator.git
cd tiled-background-generator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```bash
npm run build
npm run preview
```

## Usage Guide

### 1. Add Images
- Enter image URLs in the text area (one URL per line)
- Use PNG or JPG images with transparent backgrounds for best results
- The app processes images client-side for privacy

### 2. Configure Your Pattern
- **Grid Size**: Choose your pattern dimensions (5×5 to 20×20)
- **Sparsity**: Control how many tiles are filled (lower = more empty space)
- **Scale**: Adjust silhouette size within each tile
- **Spacing**: Set gaps between tiles
- **Emboss**: Add depth with intensity and directional controls

### 3. Customize Colors
- Pick a background color using the color picker
- Or choose from 12 curated muted pastel palettes
- Silhouettes automatically tint to complement your background

### 4. Export Your Design
- Click "Download Background" to save as high-resolution PNG
- Perfect for video editing, presentations, or digital art

## Responsive Design

- **Desktop-First**: Optimized for desktop and tablet use
- **Mobile Detection**: Shows friendly message on mobile devices
- **Adaptive Layout**: Control panel and preview adjust to screen size

## Performance Features

- **Debounced Rendering**: Smooth real-time preview without lag
- **Efficient Canvas Operations**: Optimized for large grid sizes
- **Memory Management**: Automatic cleanup of image resources
- **Error Boundaries**: Graceful error handling with recovery options

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with modern React patterns and hooks
- Canvas rendering optimized for performance
- Color palettes curated for professional use
- Mobile-responsive design principles

## Support

For questions or issues, please open an issue on GitHub or contact the maintainers.

---

**Made with ❤️ for designers and creators**
