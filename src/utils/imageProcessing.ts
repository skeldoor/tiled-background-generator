// Utility functions for image processing and silhouette conversion

export interface ProcessedImage {
  img: HTMLImageElement;
  url: string;
  silhouette?: HTMLCanvasElement;
}

/**
 * Load an image from URL and return a promise
 */
export const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));

    img.src = url;
  });
};

/**
 * Convert an image to a solid silhouette based on alpha channel
 */
export const createSilhouette = (
  img: HTMLImageElement,
  tintColor: string,
  embossIntensity: number = 0,
  embossDirection: number = 45,
  embossDepth: number = 1 // New parameter
): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  // Set canvas size to match image
  canvas.width = img.width;
  canvas.height = img.height;

  // Disable image smoothing for pixel-perfect processing
  ctx.imageSmoothingEnabled = false;

  // Clear canvas with transparent background
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw original image
  ctx.drawImage(img, 0, 0);

  // Get image data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Step 1: Create white silhouette (solid white shape)
  let hasVisiblePixels = false;
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];

    if (alpha > 10) { // Very lenient alpha threshold
      // Create solid white silhouette
      data[i] = 255;     // Red
      data[i + 1] = 255; // Green
      data[i + 2] = 255; // Blue
      data[i + 3] = 255; // Full opacity
      hasVisiblePixels = true;
    } else {
      // Make transparent pixels fully transparent
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 0;
    }
  }

  // Step 2: If no pixels found, try alternative approach (brightness-based)
  if (!hasVisiblePixels) {
    // Reset image data
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    const altImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const altData = altImageData.data;

    for (let i = 0; i < altData.length; i += 4) {
      const r = altData[i];
      const g = altData[i + 1];
      const b = altData[i + 2];
      const alpha = altData[i + 3];

      // Use brightness as fallback (dark pixels become silhouette)
      const brightness = (r + g + b) / 3;
      if (brightness < 200 && alpha > 50) {
        data[i] = 255;     // White silhouette
        data[i + 1] = 255;
        data[i + 2] = 255;
        data[i + 3] = 255;
        hasVisiblePixels = true;
      } else {
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = 0;
      }
    }
  }

  // Step 3: Apply tint color transformation
  const tint = hexToRgb(tintColor);

  if (hasVisiblePixels) {
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] === 255) { // Only tint white silhouette pixels
        // Use the tint color directly instead of blending
        data[i] = tint.r;
        data[i + 1] = tint.g;
        data[i + 2] = tint.b;
        data[i + 3] = 255;
      }
    }
  } else {
    // Ultimate fallback: create a simple rectangle silhouette
    for (let i = 0; i < data.length; i += 4) {
      data[i] = tint.r;
      data[i + 1] = tint.g;
      data[i + 2] = tint.b;
      data[i + 3] = 255;
    }
  }

  // Apply emboss effect if intensity > 0
  if (embossIntensity > 0 && hasVisiblePixels) {
    applyEmbossEffect(imageData, embossIntensity / 100, embossDirection, embossDepth, hexToRgb(tintColor));
  }

  // Put modified data back
  ctx.putImageData(imageData, 0, 0);

  return canvas;
};

/**
 * Apply emboss effect to image data
 */
const applyEmbossEffect = (
  imageData: ImageData,
  intensity: number,
  direction: number,
  depth: number, // New parameter
  tintColor: { r: number; g: number; b: number }
): void => {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;

  const output = new Uint8ClampedArray(data);

  // Convert direction to radians and calculate light direction
  const angle = (direction * Math.PI) / 180;
  const lightX = Math.cos(angle);
  const lightY = Math.sin(angle);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;

      // Only process silhouette pixels
      if (data[idx + 3] === 255) {
        let normalX = 0;
        let normalY = 0;
        let isEdge = false;

        // Check neighbors within the embossDepth radius
        for (let dy = -Math.floor(depth); dy <= Math.floor(depth); dy++) {
          for (let dx = -Math.floor(depth); dx <= Math.floor(depth); dx++) {
            if (dx === 0 && dy === 0) continue;

            const nx = x + dx;
            const ny = y + dy;

            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const neighborIdx = (ny * width + nx) * 4;
              if (data[neighborIdx + 3] === 0) { // Transparent neighbor
                isEdge = true;
                // Accumulate normal based on direction to transparent pixel
                normalX -= dx;
                normalY -= dy;
              }
            }
          }
        }

        if (isEdge) {
          // Normalize the normal vector
          const length = Math.sqrt(normalX * normalX + normalY * normalY);
          if (length > 0) {
            normalX /= length;
            normalY /= length;

            // Calculate dot product with light direction
            const dot = normalX * lightX + normalY * lightY;
            const lightIntensity = Math.max(-1, Math.min(1, dot));

            // Apply emboss effect based on lighting
            const embossFactor = lightIntensity * intensity * 0.4; // Depth is now handled by neighbor check

            for (let channel = 0; channel < 3; channel++) {
              const baseColor = tintColor[channel === 0 ? 'r' : channel === 1 ? 'g' : 'b'];
              const embossedColor = Math.round(baseColor * (1 + embossFactor));
              output[idx + channel] = Math.max(20, Math.min(255, embossedColor));
            }
          } else {
            // Copy original color for non-edge pixels
            for (let channel = 0; channel < 3; channel++) {
              output[idx + channel] = data[idx + channel];
            }
          }
        } else {
          // Copy original color for interior pixels
          for (let channel = 0; channel < 3; channel++) {
            output[idx + channel] = data[idx + channel];
          }
        }
      } else {
        // Copy original data for transparent pixels
        for (let channel = 0; channel < 4; channel++) {
          output[idx + channel] = data[idx + channel];
        }
      }
    }
  }

  // Copy output back to original data
  for (let i = 0; i < output.length; i++) {
    data[i] = output[i];
  }
};

/**
 * Convert hex color to RGB
 */
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  // Handle hex colors
  const hexResult = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (hexResult) {
    return {
      r: parseInt(hexResult[1], 16),
      g: parseInt(hexResult[2], 16),
      b: parseInt(hexResult[3], 16)
    };
  }

  // Handle rgb() colors
  const rgbResult = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/i.exec(hex);
  if (rgbResult) {
    return {
      r: parseInt(rgbResult[1], 10),
      g: parseInt(rgbResult[2], 10),
      b: parseInt(rgbResult[3], 10)
    };
  }

  // Handle hsl() colors (convert to rgb)
  const hslResult = /^hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)$/i.exec(hex);
  if (hslResult) {
    const h = parseInt(hslResult[1], 10) / 360;
    const s = parseInt(hslResult[2], 10) / 100;
    const l = parseInt(hslResult[3], 10) / 100;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    return {
      r: Math.round(hue2rgb(p, q, h + 1/3) * 255),
      g: Math.round(hue2rgb(p, q, h) * 255),
      b: Math.round(hue2rgb(p, q, h - 1/3) * 255)
    };
  }

  // Fallback to a visible color
  console.warn(`Unable to parse color: ${hex}, using fallback`);
  return { r: 100, g: 149, b: 237 }; // Cornflower blue
};

/**
 * Calculate a darker shade of the background color for silhouettes
 */
export const calculateTintColor = (backgroundColor: string, darkness: number = 0.15): string => {
  const rgb = hexToRgb(backgroundColor);

  // Ensure minimum brightness for visibility
  const minBrightness = 80;

  // Calculate brightness of original color
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;

  let r, g, b;

  if (brightness > minBrightness) {
    // Original color is bright enough, darken it
    r = Math.max(minBrightness, Math.round(rgb.r * (1 - darkness)));
    g = Math.max(minBrightness, Math.round(rgb.g * (1 - darkness)));
    b = Math.max(minBrightness, Math.round(rgb.b * (1 - darkness)));
  } else {
    // Original color is too dark, use a brighter complementary color
    // Create a color that's noticeably different from the background
    r = Math.min(255, rgb.r + 80);
    g = Math.min(255, rgb.g + 80);
    b = Math.min(255, rgb.b + 80);
  }

  return `rgb(${r}, ${g}, ${b})`;
};

/**
 * Resize an image to fit within given dimensions while maintaining aspect ratio
 */
export const resizeImage = (
  img: HTMLImageElement,
  maxWidth: number,
  maxHeight: number
): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
  canvas.width = img.width * ratio;
  canvas.height = img.height * ratio;

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return canvas;
};