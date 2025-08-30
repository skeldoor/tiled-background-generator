
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
  ]);
  const [backgroundColor, setBackgroundColor] = useState('#b8d4a0'); // Sage green default
  const [gridSize, setGridSize] = useState(7); // 7x7 grid default

  const handleAddImageUrl = () => {
    setImageUrls([...imageUrls, '']);
  };

  const handleRemoveImageUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleImageUrlChange = (index: number, value: string) => {
    const newImageUrls = [...imageUrls];
    newImageUrls[index] = value;
    setImageUrls(newImageUrls);
  };
  const [density, setDensity] = useState(100) // 100% density (fill all tiles)
  const [scale, setScale] = useState(120) // 120px scale default
  const [spacing, setSpacing] = useState(20) // 20px spacing default
  const [embossIntensity, setEmbossIntensity] = useState(30)
  const [embossDirection, setEmbossDirection] = useState(225) // Default to 225
  const [embossDepth, setEmbossDepth] = useState(1) // New state for emboss depth
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
                density,
                scale,
                spacing,
                embossIntensity,
                embossDirection,
                embossDepth, // Pass new embossDepth
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
    [imageUrls, backgroundColor, gridSize, density, scale, spacing, embossIntensity, embossDirection, embossDepth, rowOffset, renderCanvas]
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
    <div className="bg-muted-50 p-3">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-2">
          <h1 className="text-xl font-bold text-muted-900 mb-1">
            Tiled Background Generator
          </h1>
          <p className="text-muted-600 text-xs">
            Create beautiful tiled patterns from your images
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-3">
          {/* Control Panel */}
          <div className="xl:col-span-1">
            <div className="control-panel sticky top-3">
              <h2 className="text-base font-semibold text-muted-900 mb-3">
                Controls
              </h2>

              {/* Image Input Section */}
              <div className="control-group">
                <label className="control-label">Image URLs</label>
                <div className="space-y-1">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="flex items-center space-x-1">
                      <input
                        type="text"
                        className="control-input flex-1 text-[10px]"
                        placeholder="Enter image URL"
                        value={url}
                        onChange={(e) => handleImageUrlChange(index, e.target.value)}
                      />
                      <button
                        onClick={() => handleRemoveImageUrl(index)}
                        className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-md transition-colors text-sm"
                        disabled={imageUrls.length === 1}
                      >
                        -
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={handleAddImageUrl}
                    className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-md transition-colors text-sm w-full"
                  >
                    + Add Image URL
                  </button>
                </div>
                <p className="text-xs text-muted-500 mt-1">
                  Add multiple image URLs for variety in your tiles
                </p>
              </div>

              {/* Preset Image URLs */}
              <div className="control-group">
                <label className="control-label">Preset Image URLs</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setImageUrls([
                      'https://oldschool.runescape.wiki/images/Bronze_thrownaxe.png',
                      'https://oldschool.runescape.wiki/images/Bronze_battleaxe.png',
                      'https://oldschool.runescape.wiki/images/Bronze_pickaxe.png',
                      'https://oldschool.runescape.wiki/images/Bronze_axe.png'
                    ])}
                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition-colors text-sm"
                  >
                    Axes
                  </button>
                  <button
                    onClick={() => setImageUrls([
                      'https://oldschool.runescape.wiki/images/Attack_icon.png',
                      'https://oldschool.runescape.wiki/images/Strength_icon.png',
                      'https://oldschool.runescape.wiki/images/Defence_icon.png',
                      'https://oldschool.runescape.wiki/images/Ranged_icon.png',
                      'https://oldschool.runescape.wiki/images/Prayer_icon.png',
                      'https://oldschool.runescape.wiki/images/Magic_icon.png',
                      'https://oldschool.runescape.wiki/images/Runecraft_icon.png',
                      'https://oldschool.runescape.wiki/images/Hitpoints_icon.png',
                      'https://oldschool.runescape.wiki/images/Crafting_icon.png',
                      'https://oldschool.runescape.wiki/images/Mining_icon.png',
                      'https://oldschool.runescape.wiki/images/Smithing_icon.png',
                      'https://oldschool.runescape.wiki/images/Fishing_icon.png',
                      'https://oldschool.runescape.wiki/images/Cooking_icon.png',
                      'https://oldschool.runescape.wiki/images/Firemaking_icon.png',
                      'https://oldschool.runescape.wiki/images/Woodcutting_icon.png',
                      'https://oldschool.runescape.wiki/images/Agility_icon.png',
                      'https://oldschool.runescape.wiki/images/Herblore_icon.png',
                      'https://oldschool.runescape.wiki/images/Thieving_icon.png',
                      'https://oldschool.runescape.wiki/images/Fletching_icon.png',
                      'https://oldschool.runescape.wiki/images/Slayer_icon.png',
                      'https://oldschool.runescape.wiki/images/Farming_icon.png',
                      'https://oldschool.runescape.wiki/images/Construction_icon.png',
                      'https://oldschool.runescape.wiki/images/Hunter_icon.png'
                    ])}
                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition-colors text-sm"
                  >
                    Skills
                  </button>
                  <button
                    onClick={() => setImageUrls([
                      'https://oldschool.runescape.wiki/images/Scythe_of_vitur.png',
                      'https://oldschool.runescape.wiki/images/Tumeken%27s_shadow.png',
                      'https://oldschool.runescape.wiki/images/Twisted_bow.png'
                    ])}
                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition-colors text-sm"
                  >
                    Raids
                  </button>
                  <button
                    onClick={() => setImageUrls([
                      'https://oldschool.runescape.wiki/images/Archer_helm.png',
                      'https://oldschool.runescape.wiki/images/Berserker_helm.png',
                      'https://oldschool.runescape.wiki/images/Warrior_helm.png',
                      'https://oldschool.runescape.wiki/images/Farseer_helm.png'
                    ])}
                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition-colors text-sm"
                  >
                    Frem
                  </button>
                </div>
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
                  Density: {density}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={density}
                  onChange={(e) => setDensity(Number(e.target.value))}
                  className="slider"
                />
                <p className="text-xs text-muted-500 mt-1">
                  Controls how many tiles are filled (100% = fully filled, 10% = mostly empty)
                </p>
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

              <div className="control-group">
                <label className="control-label">
                  Emboss Depth: {embossDepth}
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={embossDepth}
                  onChange={(e) => setEmbossDepth(Number(e.target.value))}
                  className="slider"
                />
              </div>

            </div>
          </div>

          {/* Canvas Preview Area & Color Controls */}
          <div className="xl:col-span-3 space-y-3">
            {/* Color Controls Section */}
            <div className="bg-white rounded-lg shadow-sm border border-muted-200 p-3">
              <h3 className="text-base font-semibold text-muted-900 mb-3 flex items-center">
                <Palette className="w-4 h-4 mr-2" />
                Color Settings
              </h3>

              {/* Background Color Section - Full Width */}
              <div className="border-b border-muted-200 pb-3 mb-4">
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
            <div className="bg-white rounded-lg shadow-sm border border-muted-200 p-3 flex flex-col flex-grow">
              <div className="relative flex-grow flex items-center justify-center">
                <div className="bg-muted-100 rounded-md flex items-center justify-center overflow-hidden w-full h-full">
                  <canvas
                    ref={previewCanvasRef}
                    className="w-full h-full object-contain"
                    style={{
                      backgroundColor,
                      opacity: isRendering ? 0.5 : 1,
                      transition: 'opacity 0.2s'
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
