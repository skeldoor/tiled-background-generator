
import { useState, useEffect, useCallback } from 'react'
import { useMobileDetection } from './hooks/useMobileDetection'
import { useCanvasRenderer } from './hooks/useCanvasRenderer'
import MobileWarning from './components/MobileWarning'
import { colorPalettes } from './utils/colorPalettes'
import { Palette, Download } from 'lucide-react'

function App() {
  const isMobile = useMobileDetection()
  const { canvasRef, previewCanvasRef, renderCanvas, exportCanvas } = useCanvasRenderer()

  const [imageUrls, setImageUrls] = useState<string[]>([
    'https://oldschool.runescape.wiki/images/Bronze_thrownaxe.png',
    'https://oldschool.runescape.wiki/images/Bronze_battleaxe.png',
    'https://oldschool.runescape.wiki/images/Bronze_pickaxe.png',
    'https://oldschool.runescape.wiki/images/Bronze_axe.png'
  ])
  const [backgroundColor, setBackgroundColor] = useState('#b8d4a0') // Sage green default
  const [gridSize, setGridSize] = useState(7) // 7x7 grid default
  const [sparsity, setSparsity] = useState(100) // 100% sparsity (fill all tiles)
  const [scale, setScale] = useState(120) // 120px scale default
  const [spacing, setSpacing] = useState(20) // 20px spacing default
  const [embossIntensity, setEmbossIntensity] = useState(30)
  const [embossDirection, setEmbossDirection] = useState(45)
  const [rowOffset, setRowOffset] = useState(50)
  const [isRendering, setIsRendering] = useState(false)

  // Debounced canvas rendering
  const debouncedRender = useCallback(
    (() => {
      let timeoutId: number;
      return () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          if (imageUrls.length > 0) {
            setIsRendering(true);
            try {
              await renderCanvas(imageUrls, {
                backgroundColor,
                gridSize,
                sparsity,
                scale,
                spacing,
                embossIntensity,
                embossDirection,
                rowOffset
              });
            } catch (error) {
              console.error('Rendering error:', error);
            } finally {
              setIsRendering(false);
            }
          }
        }, 500);
      };
    })(),
    [imageUrls, backgroundColor, gridSize, sparsity, scale, spacing, embossIntensity, embossDirection, rowOffset, renderCanvas]
  );

  // Trigger render when settings change
  useEffect(() => {
    debouncedRender();
  }, [debouncedRender]);

  const handleExport = () => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    exportCanvas(`tiled-background-${timestamp}`);
  };

  const applyPalette = (color: string) => {
    setBackgroundColor(color);
  };

  if (isMobile) {
    return <MobileWarning />
  }

  return (
    <div className="min-h-screen bg-muted-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-muted-900 mb-2">
            Tiled Background Generator
          </h1>
          <p className="text-muted-600">
            Create beautiful tiled patterns from your images
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Control Panel */}
          <div className="xl:col-span-1">
            <div className="control-panel sticky top-6">
              <h2 className="text-xl font-semibold text-muted-900 mb-6">
                Controls
              </h2>

              {/* Image Input Section */}
              <div className="control-group">
                <label className="control-label">Image URLs</label>
                <textarea
                  className="control-input h-32 resize-none"
                  placeholder="Enter image URLs (one per line)"
                  value={imageUrls.join('\n')}
                  onChange={(e) => setImageUrls(e.target.value.split('\n').filter(url => url.trim()))}
                />
                <p className="text-xs text-muted-500 mt-1">
                  Add multiple image URLs for variety in your tiles
                </p>
              </div>

              {/* Layout Controls */}
              <div className="control-group">
                <label className="control-label">
                  Grid Size: {gridSize} × {gridSize}
                </label>
                <input
                  type="range"
                  min="5"
                  max="20"
                  value={gridSize}
                  onChange={(e) => setGridSize(Number(e.target.value))}
                  className="slider"
                />
              </div>

              <div className="control-group">
                <label className="control-label">
                  Sparsity: {sparsity}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={sparsity}
                  onChange={(e) => setSparsity(Number(e.target.value))}
                  className="slider"
                />
              </div>

              <div className="control-group">
                <label className="control-label">
                  Scale: {scale}px
                </label>
                <input
                  type="range"
                  min="64"
                  max="256"
                  step="8"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="slider"
                />
              </div>

              <div className="control-group">
                <label className="control-label">
                  Spacing: {spacing}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={spacing}
                  onChange={(e) => setSpacing(Number(e.target.value))}
                  className="slider"
                />
              </div>

              <div className="control-group">
                <label className="control-label">
                  Row Offset: {rowOffset}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={rowOffset}
                  onChange={(e) => setRowOffset(Number(e.target.value))}
                  className="slider"
                />
                <p className="text-xs text-muted-500 mt-1">
                  Offset alternate rows for brick-like patterns
                </p>
              </div>

              {/* Style Controls */}
              <div className="control-group">
                <label className="control-label">
                  Emboss Intensity: {embossIntensity}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={embossIntensity}
                  onChange={(e) => setEmbossIntensity(Number(e.target.value))}
                  className="slider"
                />
              </div>

              <div className="control-group">
                <label className="control-label">
                  Emboss Direction: {embossDirection}°
                </label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={embossDirection}
                  onChange={(e) => setEmbossDirection(Number(e.target.value))}
                  className="slider"
                />
              </div>

            </div>
          </div>

          {/* Canvas Preview Area & Color Controls */}
          <div className="xl:col-span-3 space-y-6">
            {/* Color Controls Section */}
            <div className="bg-white rounded-lg shadow-sm border border-muted-200 p-6">
              <h3 className="text-lg font-semibold text-muted-900 mb-4 flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                Color Settings
              </h3>

              {/* Background Color Section - Full Width */}
              <div className="border-b border-muted-200 pb-4 mb-6">
                <label className="control-label">Background Color</label>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="control-input h-10 w-16 flex-shrink-0"
                    />
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-6 h-6 rounded border border-muted-300"
                          style={{ backgroundColor }}
                        />
                        <span className="text-xs text-muted-600">Background</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-6 h-6 rounded border border-muted-300"
                          style={{
                            backgroundColor: `rgb(${
                              Math.max(60, Math.round(parseInt(backgroundColor.slice(1, 3), 16) * 0.85))
                            }, ${
                              Math.max(60, Math.round(parseInt(backgroundColor.slice(3, 5), 16) * 0.85))
                            }, ${
                              Math.max(60, Math.round(parseInt(backgroundColor.slice(5, 7), 16) * 0.85))
                            })`,
                            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)'
                          }}
                        />
                        <span className="text-xs text-muted-600">Tint</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleExport}
                    disabled={imageUrls.length === 0 || isRendering}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors text-sm"
                  >
                    <Download className="w-4 h-4 inline mr-1" />
                    {isRendering ? 'Rendering...' : 'Download'}
                  </button>
                </div>
              </div>

              {/* Preset Palettes - Clean Single Line Layout */}
              <div>
                <label className="control-label">Preset Palettes</label>
                <div className="mt-3 flex gap-1.5 overflow-x-auto">
                  {colorPalettes.map((palette) => (
                    <button
                      key={palette.name}
                      onClick={() => applyPalette(palette.colors[0])}
                      className="w-8 h-8 flex-shrink-0 rounded border border-muted-300 hover:border-muted-500 hover:scale-110 transition-all duration-200 shadow-sm hover:shadow-md"
                      title={`${palette.name} - ${palette.description}`}
                      style={{ backgroundColor: palette.colors[0] }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Canvas Preview */}
            <div className="bg-white rounded-lg shadow-sm border border-muted-200 p-6">
              <div className="relative">
                <div className="aspect-video bg-muted-100 rounded-md flex items-center justify-center overflow-hidden">
                  <canvas
                    ref={previewCanvasRef}
                    className="max-w-full max-h-full object-contain"
                    style={{
                      backgroundColor,
                      opacity: isRendering ? 0.5 : 1,
                      transition: 'opacity 0.2s',
                      width: '100%',
                      height: 'auto',
                      maxWidth: '800px',
                      maxHeight: '450px'
                    }}
                  />
                  {/* Hidden canvas for export */}
                  <canvas
                    ref={canvasRef}
                    style={{ display: 'none' }}
                    width="2560"
                    height="1440"
                  />
                  {imageUrls.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-500 text-center">
                      <div>
                        <div className="text-lg font-medium mb-2">Canvas Preview</div>
                        <div className="text-sm">Add image URLs above to start creating your tiled background</div>
                      </div>
                    </div>
                  )}
                  {isRendering && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-md">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <div className="text-sm text-muted-700">Rendering...</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
