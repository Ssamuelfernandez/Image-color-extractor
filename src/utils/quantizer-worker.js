import Quantizer from './quantizer.js';

// Global error handler
self.addEventListener('error', (event) => {
    event.preventDefault();
    self.postMessage({
        success: false,
        error: {
            name: 'UncaughtError',
            message: event.message,
            stack: event.error?.stack || 'No stack trace'
        }
    });
});

// Module error handler
self.addEventListener('unhandledrejection', (event) => {
    event.preventDefault();
    self.postMessage({
        success: false,
        error: {
            name: 'UnhandledRejection',
            message: event.reason?.message || 'Unknown rejection',
            stack: event.reason?.stack || 'No stack trace'
        }
    });
});

function validateInput(data) {

    // Validation of input data
    if (!data || typeof data !== 'object') {
        throw new Error('Payload must be an object');
    }

    // Extracts the pixel data and the desired number of colors from the received message
    const { pixels, colorCount } = data;

    //Type validation
    if (!Array.isArray(pixels) || pixels.length === 0) {
        throw new Error('Invalid pixel format. Must be a non-empty array.');
    }


    pixels.forEach(pixel => {
        if (!Array.isArray(pixel) || pixel.length !== 3 ||
            pixel.some(c => c < 0 || c > 255)) {
            throw new Error(`Invalid pixel: ${JSON.stringify(pixel)}`);
        }
    });
};

self.onmessage = (e) => {
    try {
        validateInput(e.data);

        const { pixels, colorCount } = e.data;
        const color = Quantizer.extractColor(pixels, colorCount);
        const palette = Quantizer.extractPalette(pixels, colorCount);

        self.postMessage({ success: true, color, palette });
    } catch (error) {
        self.postMessage({
            success: false,
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack
            }
        });
    }
};