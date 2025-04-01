export function createPixelArray(imgData, options = {}) {
    const { quality, alphaThreshold } = validateOptions(options);
    const pixelArray = [];
    
    const pixelCount = imgData.length / 4;
    for (let i = 0; i < pixelCount; i += quality) {
        const offset = i * 4;
        const r = imgData[offset];
        const g = imgData[offset + 1];
        const b = imgData[offset + 2];
        const a = imgData[offset + 3];

        if (a >= alphaThreshold && !(r > 250 && g > 250 && b > 250)) {
            
            pixelArray.push([r, g, b]);
        }
    }
    return pixelArray;
}

export function validateOptions({ 
    colorCount = 10, 
    quality = 10, 
    alphaThreshold = 125 
}) {
    return {
        colorCount: Math.min(Math.max(colorCount, 1), 20),
        quality: Math.max(quality, 1),
        alphaThreshold: Math.min(Math.max(alphaThreshold, 0), 255)
    };
}