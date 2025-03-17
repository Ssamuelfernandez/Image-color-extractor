
import { createPixelArray, validateOptions } from './extractor-core.js';
import Quantizer from './quantizer.js';
import sharp from 'sharp';

class NodeColorExtractor {

    /**
     * Extracts the dominant color from an image buffer.
     * - Converts the image buffer into raw pixel data.
     * - Validates that the image contains valid pixel data.
     * - Generates a color palette and returns the most dominant color.
     */

    static async getColor(buffer, quality = 10) {
        const { data, width, height, channels } = await this.getPixels(buffer);

        if (!data || data.length === 0) {
            throw new Error('The image does not contain valid data');
        }

        const palette = await this.getPalette({ data, width, height, channels }, 5, quality);
        return palette[0];
    }

    /**
     * Generates a color palette from image pixel data.
     * - Validates the provided options (color count and quality).
     * - Converts the pixel data into a processed pixel array.
     * - Uses the quantizer algorithm to extract a specified number of colors.
     */

    static async getPalette({ data, width, height, channels }, colorCount = 10, quality = 10) {
        const options = validateOptions({ colorCount, quality });
        const pixelArray = createPixelArray(data, width * height, options.quality);
        return Quantizer.quantize(pixelArray, options.colorCount);
    }

    /**
     * Decodes an image buffer into raw pixel data.
     * - Uses Sharp to process the image and ensure an alpha channel is present.
     * - Converts the image into raw pixel format.
     * - Returns pixel data along with image dimensions and channel information.
     */

    static async getPixels(buffer) {
        try {
            const { data, info } = await sharp(buffer)
                .ensureAlpha()
                .raw()
                .toBuffer({ resolveWithObject: true });
    
            return {
                data,
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