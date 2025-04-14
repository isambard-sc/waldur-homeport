import { interpolateInferno } from 'd3-scale-chromatic';

import { DEFAULT_PRIMARY_COLORS } from './constants';

const calculatePoint = (i, intervalSize, colorRangeInfo) => {
  const { colorStart, colorEnd, useEndAsStart } = colorRangeInfo;
  return useEndAsStart
    ? colorEnd - i * intervalSize
    : colorStart + i * intervalSize;
};

const interpolateColors = (dataLength, colorScale, colorRangeInfo) => {
  const { colorStart, colorEnd } = colorRangeInfo;
  const colorRange = colorEnd - colorStart;
  const intervalSize = colorRange / dataLength;
  let i, colorPoint;
  const colorArray = [];

  for (i = 0; i < dataLength; i++) {
    colorPoint = calculatePoint(i, intervalSize, colorRangeInfo);
    colorArray.push(colorScale(colorPoint));
  }

  return colorArray;
};

export const generateColors = (amount: number, colorRangeInfo): string[] =>
  interpolateColors(amount, interpolateInferno, colorRangeInfo);

export const hexToRgb = (hex) => {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function (_, r, g, b) {
    return r + r + g + g + b + b;
  });

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return result ? `${r}, ${g}, ${b}` : null;
};

const hslToHex = (h, s, l) => {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r1, g1, b1;

  if (h < 60) [r1, g1, b1] = [c, x, 0];
  else if (h < 120) [r1, g1, b1] = [x, c, 0];
  else if (h < 180) [r1, g1, b1] = [0, c, x];
  else if (h < 240) [r1, g1, b1] = [0, x, c];
  else if (h < 300) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];

  const r = Math.round((r1 + m) * 255);
  const g = Math.round((g1 + m) * 255);
  const b = Math.round((b1 + m) * 255);

  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
};

/**
 *
 * @param hex Color hex
 * @param lightness Form 0 (dark) to 1 (light)
 * @param rgb Return as RGB color
 * @returns New color in hex or rgb
 */
const colorLightness = (hex: string, lightness: number, rgb = false) => {
  // HEX to RGB
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);

  // RGB to HSL
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let l = (max + min) / 2; // Lightness
  let h, s;

  if (max === min) {
    h = s = 0; // gray
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
    }
    h *= 60;
  }

  l = Math.max(0, Math.min(1, lightness));

  const newHex = hslToHex(h, s, l);

  if (rgb) return hexToRgb(newHex);
  return newHex;
};

export const generateBrandColors = (color: string) => {
  const luminanceValues = {
    25: 0.97,
    50: 0.93,
    100: 0.83,
    200: 0.74,
    300: 0.67,
    400: 0.6,
    500: 0.55,
    600: 0.4,
    700: 0.36,
    800: 0.25,
    900: 0.14,
    950: 0.07,
  };

  const brandColors: Record<string, string> = {};
  Object.keys(luminanceValues).forEach((key) => {
    const luminance = luminanceValues[key];
    let _color;
    if (color === DEFAULT_PRIMARY_COLORS[600]) {
      _color = DEFAULT_PRIMARY_COLORS[key];
    } else {
      _color = Number(key) === 600 ? color : colorLightness(color, luminance);
    }
    const colorRgb = hexToRgb(_color);
    Object.assign(brandColors, { [key]: _color, [key + '-rgb']: colorRgb });
  });

  return brandColors;
};
