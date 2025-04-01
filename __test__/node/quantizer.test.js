import Quantizer from '../../src/utils/quantizer.js';

test('Generates a 2-color palette', () => {
  const pixels = [
    [255, 0, 0], [255, 0, 0], // Red
    [0, 255, 0], [0, 255, 0]  // Green
  ];

  const palette = Quantizer.extractPalette(pixels, 2);
  expect(palette).toEqual(expect.arrayContaining([
    [255, 0, 0],
    [0, 255, 0]
  ]));
});