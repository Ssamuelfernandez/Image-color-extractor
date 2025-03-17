
export function createPixelArray(imgData, pixelCount, quality) {
    const pixelArray = [];
    for (let i = 0; i < pixelCount; i += quality) {
        const offset = i * 4;
        const [r, g, b, a] = imgData.slice(offset, offset + 4);
        if (a >= 125 && !(r > 250 && g > 250 && b > 250)) {
            pixelArray.push([r, g, b]);
        }
    }
    return pixelArray;
}

export function validateOptions({ colorCount = 10, quality = 10 }) {
    if (colorCount === 1) throw new Error('Usa getColor() en lugar de getPalette()');
    return {
        colorCount: Math.min(Math.max(colorCount, 2), 20),
        quality: Math.max(quality, 1)
    };
}