
import { jest } from '@jest/globals';
import * as actualModule from '../../src/utils/browser-color-extractor.js';

import BrowserColorExtractor from '../../src/utils/browser-color-extractor.js';
import { createPixelArray } from '../../src/utils/extractor-core.js';

jest.unstable_mockModule('../../src/utils/browser-color-extractor.js', () => ({
  ...actualModule,
  getPalette: jest.fn(() => Promise.resolve([])), // Mock de la función
}));


// ======================================
// Section 1: Global Mocks
// ======================================

// Mock for import.meta.url
globalThis.__importMetaUrl__ = `file://${process.cwd()}/src/utils/`;

// ======================================
// Section 2: Web Worker Mock
// ======================================
const MockWorker = jest.fn().mockImplementation(function () {
  this.postMessage = jest.fn((data) => {
    // Run immediately without timeout
    process.nextTick(() => {
      if (this.onmessage) {
        this.onmessage({
          data: {
            success: true,
            color: [255, 0, 0],
            palette: [[255, 0, 0], [0, 255, 0], [0, 0, 255]]
          }
        });
      }
    });
  });
  this.terminate = jest.fn();
  MockWorker.instance = this;
});

MockWorker.instance = null;
global.Worker = MockWorker;

// ======================================
// Section 3: Image Mock
// ======================================
class MockImage {
  constructor() {
    this.naturalWidth = 2;
    this.naturalHeight = 2;
    this.complete = true;
    this.onload = null;
  }
}
global.Image = MockImage;

// ======================================
// Section 4: Canvas Mock
// ======================================
const setupCanvasMock = () => {
  const ctx = {
    drawImage: jest.fn(),
    getImageData: jest.fn(() => ({ data: mockImageData }))
  };

  HTMLCanvasElement.prototype.getContext = jest.fn(() => ctx);
  return ctx;
};

// ======================================
// Section 5: Test Data
// ======================================
const mockImageData = new Uint8ClampedArray([
  255, 0, 0, 255,   // Rojo
  0, 255, 0, 255,   // Verde
  0, 0, 255, 255,   // Azul
  255, 255, 255, 255 // Blanco
]);

// ======================================
// Test Configuration
// ======================================
beforeEach(() => {
  jest.clearAllMocks();
  MockWorker.instance = null;
  setupCanvasMock();
});

// ======================================
// Test Suite
// ======================================
describe('BrowserColorExtractor', () => {
  describe('Basic Methods', () => {
    describe('getPixels()', () => {
      it('should throw error for invalid image', () => {
        const invalidImg = { naturalWidth: 0, naturalHeight: 0 };
        expect(() => BrowserColorExtractor.getPixels(invalidImg)).toThrow();
      });

      it('must return valid image data', () => {
        const img = new MockImage();
        const result = BrowserColorExtractor.getPixels(img);
        expect(result).toBeInstanceOf(Uint8ClampedArray);
      });
    });

    describe('createPixelArray()', () => {
      it('must filter out transparent and white pixels', () => {
        const result = createPixelArray(mockImageData, { quality: 1 });
        expect(result).toEqual([
          [255, 0, 0],
          [0, 255, 0],
          [0, 0, 255]
        ]);
      });
    });
  });

  describe('Advanced Functionality', () => {
    describe('getPalette()', () => {
      it('must be resolved with the worker`s palette', async () => {
        const palette = await BrowserColorExtractor.getPalette(mockImageData, 5, 10);
        expect(palette).toEqual([[255, 0, 0], [0, 255, 0], [0, 0, 255]]);
        expect(MockWorker).toHaveBeenCalled();
      }, 5000);
    });

    describe('getColor()', () => {
      it('must return the most repeated color', async () => {
        
        const color = await BrowserColorExtractor.getColor(new MockImage());
        
        expect(color).toEqual([255, 0, 0]);
      });
    });
  });
});