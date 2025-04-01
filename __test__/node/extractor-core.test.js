import { createPixelArray, validateOptions } from '../../src/utils/extractor-core.js';

describe('Extractor Core', () => {

  describe('createPixelArray', () => {
    test('Filters pixels with alpha channel >= 125 and excludes pure whites', () => {
      const imgData = new Uint8ClampedArray([
        255, 0, 0, 200,  // Red (valid)
        0, 255, 0, 100,  // Green (discarded due to low alpha)
        0, 0, 255, 255,  // Blue (valid)
        255, 255, 255, 255 // Pure white (discarded)
      ]);
      const result = createPixelArray(imgData, { quality: 1, alphaThreshold: 125 });

      expect(result).toEqual([
        [255, 0, 0],
        [0, 0, 255]
      ]);
    });

    test('Skips pixels based on quality', () => {
      const imgData = new Uint8ClampedArray([
        255, 0, 0, 255,  // Red (valid)
        0, 255, 0, 255,  // Green (valid but ignored for quality=2)
        0, 0, 255, 255   // Blue (valid)
      ]);
      const result = createPixelArray(imgData, { quality: 2 });

      expect(result).toEqual([
        [255, 0, 0],
        [0, 0, 255]
      ]);
    });

    test('Returns empty array if all pixels are invalid', () => {
      const imgData = new Uint8ClampedArray([
        0, 0, 0, 100,    // Black (discarded for low alpha)
        255, 255, 255, 255 // Pure white (discarded)
      ]);
      const result = createPixelArray(imgData, { quality: 1 });
      expect(result).toEqual([]);
    });
  });

  describe('validateOptions', () => {

    test('Ensures that quality is at least 1', () => {
      expect(validateOptions({ quality: 0 })).toEqual({
        colorCount: 10,
        quality: 1,
        alphaThreshold: 125
      });
    });

    test('Maintains values ​​within the allowed range', () => {
      expect(validateOptions({ colorCount: 5, quality: 3 })).toEqual({
        colorCount: 5,
        quality: 3,
        alphaThreshold: 125
      });
    });

  });
});
