import { createPixelArray } from './extractor-core.js';
import Quantizer from './quantizer.js';
import sharp from 'sharp';

class NodeColorExtractor {

    /**
     * Extracts the dominant color from an image buffer.
     * - Converts the image buffer into raw pixel data.
     * - Validates that the image contains valid pixel data.
     * - Generates a color palette and returns the most dominant color.
     */

    static async getColor(img, quality = 10) {
        const { data } = await this.getPixels(img);
        const pixelArray = createPixelArray(data, { quality, colorCount: 1, alphaThreshold: 255 });
        const color = Quantizer.extractColor(pixelArray);
        return color;
    }

    /**
     * Generates a color palette from image pixel data.
     * - Validates the provided options (color count and quality).
     * - Converts the pixel data into a processed pixel array.
     * - Uses the quantizer algorithm to extract a specified number of colors.
     */

    static async getPalette(img, colorCount = 10, quality = 10) {
        if (colorCount < 2) throw new Error('Use getColor() instead of getPalette()');
        const { data } = await this.getPixels(img);
        const pixelArray = createPixelArray(data, { colorCount, quality });
        return Quantizer.extractPalette(pixelArray, colorCount);
    }

    /**
     * Decodes an image buffer into raw pixel data.
     * - Uses Sharp to process the image and ensure an alpha channel is present.
     * - Converts the image into raw pixel format.
     * - Returns pixel data along with image dimensions and channel information.
     */

    static async getPixels(img) {
        try {

            const metadata = await sharp(img).metadata();

            const image = sharp(img)
                .withMetadata(false)
                .toColorspace('srgb');

            if (metadata.format !== 'png') {
                image.ensureAlpha();
            }
            const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
            return {
                data: new Uint8ClampedArray(data.buffer),
                width: info.width,
                height: info.height,
                channels: info.channels
            };
        } catch (error) {
            throw new Error(`Error decoding image: ${error.message}`);
        }
    }
}

export default NodeColorExtractor;