import Quantizer from './quantizer.js';

self.onmessage = function(e) {
  // Extracts the pixel data and the desired number of colors from the received message
  const { pixels, colorCount } = e.data;
  // Uses the quantizer algorithm to generate a color palette
  const palette = Quantizer.quantize(pixels, colorCount);
  // Sends the resulting color palette back to the main thread
  self.postMessage(palette);
};