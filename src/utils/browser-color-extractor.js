import { createPixelArray } from './extractor-core.js';

class BrowserColorExtractor {
    // Return the most dominant color from the palette.
    static async getColor(img, quality = 10) {
        const pixelData = this.getPixels(img);
        const pixelArray = createPixelArray(pixelData, { quality, colorCount: 1 });

        return new Promise((resolve, reject) => {
            const workerUrl = new URL('./quantizer-worker.js', import.meta.url);
            const worker = new Worker(workerUrl, { type: 'module' });

            // Timeout
            const timeoutId = setTimeout(() => {
                reject(new Error('Timeout: Worker no respondió en 10 segundos'));
                worker.terminate();
            }, 10_000);

            // Send only one color max
            worker.postMessage({
                pixels: pixelArray,
                colorCount: 1
            });

            worker.onmessage = (e) => {
                clearTimeout(timeoutId);
                if (e.data.success) {
                    resolve(e.data.color); // First and unique color
                } else {
                    reject(new Error(e.data.error?.message || "Error en el worker"));
                }
                worker.terminate();
            };

            worker.onerror = (e) => {
                clearTimeout(timeoutId);
                reject(new Error(`Error en worker: ${e.message}`));
                worker.terminate();
            };
        });
    }

    static async getPalette(imgOrData, colorCount = 10, quality = 10) {
        let pixelData;
        if (imgOrData instanceof HTMLImageElement) {
            pixelData = this.getPixels(imgOrData);
        } else {
            pixelData = imgOrData;
        }
        const pixelArray = createPixelArray(pixelData, { quality });

        // Validation
        if (!pixelArray || pixelArray.length === 0) {
            throw new Error('The pixel array is empty');
        }

        return new Promise((resolve, reject) => {

            // Create a Web Worker to process color quantization
            const workerUrl = new URL('./quantizer-worker.js', import.meta.url);
            const worker = new Worker(workerUrl, { type: 'module' });


            // Timeout
            const timeoutId = setTimeout(() => {
                reject(new Error('Timeout: Worker did not respond within 10 seconds'));
                worker.terminate();
            }, 10_000);

            // Send pixel data to the worker
            worker.postMessage({
                pixels: pixelArray,
                colorCount: Math.min(colorCount, 20)
            });

            // Handle worker response with the extracted color palette
            worker.onmessage = (e) => {
                clearTimeout(timeoutId);

                if (!e.data) {
                    reject(new Error('Empty worker response'));
                    return;
                }

                if (e.data.success) {
                    resolve(e.data.palette); // Resolve the promise with the color palette
                } else {
                    const errorInfo = e.data.error || {};
                    const error = new Error(`Worker Error: ${errorInfo.message}`);
                    error.stack = errorInfo.stack;
                    reject(error);
                }

                worker.terminate(); // Terminate the worker to free resources
            };

            // Handle worker errors
            worker.onerror = (e) => {
                clearTimeout(timeoutId);
                const error = new Error(
                    `Worker load failed: ${e.message} (${e.filename}:${e.lineno})`
                );
                console.error('Critical error in worker:', error);
                reject(error);
                worker.terminate();
            };

        });
    }
    // Extracts pixel data from an image using an offscreen canvas.
    static getPixels(img) {
        if (!img?.naturalWidth || !img?.naturalHeight) {
            throw new Error("The image is not loaded correctly.");
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