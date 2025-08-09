import sharp from "sharp";

type Processed = {
  width: number;
  height: number;
  pixels: Uint8Array; // grayscale, 1 byte per pixel
  variance: number;
  edgeCount: number;
  densityScore: number;
};

async function toGrayscaleRaw(input: Buffer): Promise<{
  width: number;
  height: number;
  data: Uint8Array;
}> {
  const resized = sharp(input).grayscale().resize({ width: 256, withoutEnlargement: true });
  const { data, info } = await resized.raw().toBuffer({ resolveWithObject: true });
  return { width: info.width, height: info.height, data: new Uint8Array(data) };
}

function computeVariance(pixels: Uint8Array): number {
  let sum = 0;
  for (let i = 0; i < pixels.length; i++) sum += pixels[i];
  const mean = sum / pixels.length;
  let sq = 0;
  for (let i = 0; i < pixels.length; i++) {
    const d = pixels[i] - mean;
    sq += d * d;
  }
  return Math.sqrt(sq / pixels.length);
}

function sobelEdgeCount(pixels: Uint8Array, width: number, height: number): number {
  const gx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const gy = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
  let count = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let sx = 0;
      let sy = 0;
      let k = 0;
      for (let j = -1; j <= 1; j++) {
        for (let i = -1; i <= 1; i++) {
          const v = pixels[(y + j) * width + (x + i)];
          sx += gx[k] * v;
          sy += gy[k] * v;
          k++;
        }
      }
      const mag = Math.sqrt(sx * sx + sy * sy);
      if (mag > 120) count++;
    }
  }
  return count;
}

function simpleCornerDensity(pixels: Uint8Array, width: number, height: number): number {
  // Naive corner-ish detection: high gradient magnitude AND local intensity contrast
  let score = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const c = pixels[y * width + x];
      let maxN = 0;
      let minN = 255;
      let gx = 0,
        gy = 0;
      // 3x3 window
      for (let j = -1; j <= 1; j++) {
        for (let i = -1; i <= 1; i++) {
          const v = pixels[(y + j) * width + (x + i)];
          if (v > maxN) maxN = v;
          if (v < minN) minN = v;
        }
      }
      // gradient approx
      gx = pixels[y * width + (x + 1)] - pixels[y * width + (x - 1)];
      gy = pixels[(y + 1) * width + x] - pixels[(y - 1) * width + x];
      const mag = Math.sqrt(gx * gx + gy * gy);
      const contrast = maxN - minN;
      if (mag > 40 && contrast > 25 && Math.abs(c - (minN + maxN) / 2) > 10) {
        score++;
      }
    }
  }
  return score;
}

async function processOne(buf: Buffer): Promise<Processed> {
  const { width, height, data } = await toGrayscaleRaw(buf);
  const variance = computeVariance(data);
  const edgeCount = sobelEdgeCount(data, width, height);
  const densityScore = simpleCornerDensity(data, width, height);
  return { width, height, pixels: data, variance, edgeCount, densityScore };
}

export async function detectFollicularVoid(images: Buffer[]): Promise<boolean> {
  const processed = await Promise.all(images.map((b) => processOne(b)));
  const avgVar = processed.reduce((a, p) => a + p.variance, 0) / processed.length;
  const avgEdges = processed.reduce((a, p) => a + p.edgeCount, 0) / processed.length;
  // Arbitrary but "perfect" thresholds
  return avgVar < 12 && avgEdges < 3500;
}

export async function calculateHoloFollicularCount(images: Buffer[]): Promise<number> {
  // front, back, left, right
  const processed = await Promise.all(images.map((b) => processOne(b)));
  const [front, back, left, right] = processed.map((p) => p.densityScore);
  const volumetricIndex = (front + back) * 0.6 + (left + right) * 0.4;
  const count = volumetricIndex * 117.34;
  return count;
}


