import { useRef, useCallback } from 'react';
import type { ProcessedImage } from '../utils/imageProcessing';
import {
  loadImage,
  createSilhouette,
  calculateTintColor
} from '../utils/imageProcessing';

export interface CanvasSettings {
  backgroundColor: string;
  gridSize: number;
  sparsity: number;
  scale: number;
  spacing: number;
  embossIntensity: number;
  embossDirection: number;
  rowOffset: number;
}

export const useCanvasRenderer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<ProcessedImage[]>([]);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Canvas dimensions - 2560x1440 as requested
  const CANVAS_WIDTH = 2560;
  const CANVAS_HEIGHT = 1440;

  // Preview canvas now matches export canvas dimensions for accurate preview
  const PREVIEW_WIDTH = CANVAS_WIDTH;
  const PREVIEW_HEIGHT = CANVAS_HEIGHT;

  const renderCanvas = useCallback(async (
    imageUrls: string[],
    settings: CanvasSettings
  ) => {
    // Render to main canvas for export (high resolution)
    const canvas = canvasRef.current;
    let mainCtx: CanvasRenderingContext2D | null = null;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = settings.backgroundColor;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        mainCtx = ctx;
      }
    }

    // Render to preview canvas for real-time display (lower resolution)
    const previewCanvas = previewCanvasRef.current;
    if (!previewCanvas) return;

    const previewCtx = previewCanvas.getContext('2d');
    if (!previewCtx) return;

    // Set preview canvas size
    previewCanvas.width = PREVIEW_WIDTH;
    previewCanvas.height = PREVIEW_HEIGHT;

    // Disable image smoothing for pixel-perfect rendering
    previewCtx.imageSmoothingEnabled = false;

    // Clear preview canvas with background color
    previewCtx.fillStyle = settings.backgroundColor;
    previewCtx.fillRect(0, 0, PREVIEW_WIDTH, PREVIEW_HEIGHT);

    if (imageUrls.length === 0) return;

    // Load and process images if not already loaded
    if (imagesRef.current.length !== imageUrls.length ||
        imagesRef.current.some((img, index) => img.url !== imageUrls[index])) {

      imagesRef.current = [];

      for (const url of imageUrls) {
        if (!url.trim()) continue;

        try {
          const img = await loadImage(url);
          const tintColor = calculateTintColor(settings.backgroundColor);
          const silhouette = createSilhouette(
            img,
            tintColor,
            settings.embossIntensity,
            settings.embossDirection
          );

          imagesRef.current.push({
            img,
            url,
            silhouette
          });
        } catch (error) {
          console.warn(`Failed to load image ${url}:`, error);
        }
      }
    }

    // Update silhouettes with current settings
    const tintColor = calculateTintColor(settings.backgroundColor);
    imagesRef.current.forEach((processedImage) => {
      processedImage.silhouette = createSilhouette(
        processedImage.img,
        tintColor,
        settings.embossIntensity,
        settings.embossDirection
      );
    });

    if (imagesRef.current.length === 0) return;

    // Calculate seamless grid layout - ensure tiles fill entire canvas
    // Scale is now in pixels, no conversion needed
    const pixelScale = settings.scale;

    // Grid layout for consistent positioning

    // Render tiles to both canvases with seamless placement
    for (let row = 0; row < settings.gridSize; row++) {
      for (let col = 0; col < settings.gridSize; col++) {
        // Skip tile based on sparsity
        if (Math.random() * 100 > settings.sparsity) continue;

        // Select random image
        const randomImage = imagesRef.current[
          Math.floor(Math.random() * imagesRef.current.length)
        ];

        if (!randomImage.silhouette) continue;

        // Calculate position in grid layout (same for both canvases now)
        const colWidth = CANVAS_WIDTH / settings.gridSize;
        const rowHeight = CANVAS_HEIGHT / settings.gridSize;
        const offsetX = (row % 2 === 0) ? 0 : (colWidth * settings.rowOffset / 100);
        const x = col * colWidth + offsetX + (colWidth / 2);
        const y = row * rowHeight + (rowHeight / 2);

        // Scale image to fixed pixel size for consistency
        const scaleX = pixelScale / randomImage.silhouette.width;
        const scaleY = pixelScale / randomImage.silhouette.height;
        const finalScale = Math.min(scaleX, scaleY);

        const drawWidth = randomImage.silhouette.width * finalScale;
        const drawHeight = randomImage.silhouette.height * finalScale;

        // Center in grid cell (same for both canvases)
        const drawX = x - (drawWidth / 2);
        const drawY = y - (drawHeight / 2);

        // Draw to main canvas (high resolution)
        if (mainCtx) {
          mainCtx.save();
          mainCtx.imageSmoothingEnabled = false;
          mainCtx.drawImage(
            randomImage.silhouette,
            drawX,
            drawY,
            drawWidth,
            drawHeight
          );
          mainCtx.restore();
        }

        // Draw to preview canvas (same dimensions and positioning as export)
        previewCtx.save();
        previewCtx.imageSmoothingEnabled = false;
        previewCtx.drawImage(
          randomImage.silhouette,
          drawX,
          drawY,
          drawWidth,
          drawHeight
        );
        previewCtx.restore();
      }
    }
  }, []);

  const exportCanvas = useCallback((filename: string = 'tiled-background') => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('Export failed: canvas not found');
      return;
    }

    console.log('Exporting canvas:', canvas.width, 'x', canvas.height);

    // Check if canvas has any content (not just background)
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      let hasContent = false;

      // Check if there's any non-background content
      for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];
        if (alpha > 0) {
          hasContent = true;
          break;
        }
      }

      if (!hasContent) {
        console.error('Export failed: canvas appears to be empty');
        return;
      }
    }

    // Create download link
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error('Export failed: no blob created');
        return;
      }

      console.log('Blob created, size:', blob.size);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log('Download initiated');
    }, 'image/png');
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    imagesRef.current = [];
  }, []);

  return {
    canvasRef,
    previewCanvasRef,
    renderCanvas,
    exportCanvas,
    clearCanvas,
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: CANVAS_HEIGHT
  };
};