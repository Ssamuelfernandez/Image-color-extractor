import { createPixelArray } from './extractor-core.js';

class BrowserColorExtractor {
    // Return the most dominant color from the palette.
    static async getColor(img, quality = 10) {
        const pixels = this.getPixels(img);
        const totalPixels = img.naturalWidth * img.naturalHeight;
        const palette = await this.getPalette(pixels, totalPixels, 5, quality);
        return palette[0];
    }

    static async getPalette(pixels, totalPixels, colorCount = 10, quality = 10) {
        const pixelArray = createPixelArray(pixels, totalPixels, quality);
        
        return new Promise((resolve, reject) => {
            // Create a Web Worker to process color quantization
            const worker = new Worker(new URL('./quantizer-worker.js', import.meta.url));
            // Send pixel data to the worker
            worker.postMessage({
                pixels: pixelArray,
                colorCount: colorCount
            });
            // Handle worker response with the extracted color palette
            worker.onmessage = (e) => {
                resolve(e.data); // Resolve the promise with the color palette
                worker.terminate(); // Terminate the worker to free resources
            };
            // Handle worker errors
            worker.onerror = (e) => {
                reject(new Error(`Worker error: ${e.message}`));
                worker.terminate();
            };
        });
    }
    // Extracts pixel data from an image using an offscreen canvas.
    static getPixels(img) {
        if (!img?.naturalWidth || !img?.naturalHeight) {
            throw new Error("La imagen no está cargada correctamente.");
        }
        // Create a temporary canvas to draw the image
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        // Draw the image onto the canvas
        ctx.drawImage(img, 0, 0);
        // Retrieve and return the raw pixel data
        return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    }
}

export default BrowserColorExtractor;