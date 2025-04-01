import NodeColorExtractor from '../../src/utils/node-color-extractor.js';
import { readFileSync } from 'fs';

const loadImage = (path) => readFileSync(`./test-images/${path}`);

describe('NodeColorExtractor', () => {
  
  test.each([
    ['RedTest.jpg'],
    ['BlueTest.webp'],
    ['GreenTest.png']
  ])('Decodes image %s successfully', (imagePath) => {
    const buffer = loadImage(imagePath);
    expect(() => NodeColorExtractor.getPixels(buffer)).not.toThrow();
  });

  test.each([
    ['RedTest.jpg', [255, 0, 0]],
    ['BlueTest.webp', [0, 0, 255]],
    ['GreenTest.png', [0, 255, 0]]
  ])('Gets dominant color of %s', async (imagePath, expectedColor) => {
    const buffer = loadImage(imagePath);
    const color = await NodeColorExtractor.getColor(buffer);
    expect(color).toEqual(expect.arrayContaining(expectedColor));
  });

  test('Throws error with empty or corrupt image', async () => {
    const emptyBuffer = Buffer.from([]);
    await expect(NodeColorExtractor.getColor(emptyBuffer)).rejects.toThrow('Error decoding image: Input Buffer is empty');
  });

  test('Obtains dominant color from multi-color image', async () => {
    const buffer = loadImage('Multicolor.jpg');
    const color = await NodeColorExtractor.getPalette(buffer);
    expect(color[0]).toEqual(expect.arrayContaining([0, 0, 254])); 
  });
});
