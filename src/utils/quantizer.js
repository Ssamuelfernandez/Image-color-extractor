
class Quantizer {
    // Generates a color palette by iteratively splitting color cubes
    static quantize(pixelArray, maxColors) {
        let cubes = [new Cube(pixelArray)];

        // Continues splitting cubes until the desired number of colors is reached
        while (cubes.length < maxColors) {
            const cubeToSplit = this.findCubeToSplit(cubes);
            const [cube1, cube2] = this.splitCube(cubeToSplit);
            cubes = cubes.filter(c => c !== cubeToSplit).concat([cube1, cube2]);
        }

        // Returns the average color of each cube as the final color palette
        return cubes.map(cube => cube.getAverage());
    }

    // Finds the cube with the largest color range to split next
    static findCubeToSplit(cubes) {
        return cubes.reduce((prev, curr) => 
            curr.getLongestRange() > prev.getLongestRange() ? curr : prev
        );
    }

    // Splits a cube into two smaller cubes along the channel with the widest range
    static splitCube(cube) {
        const sortedPixels = this.sortByChannel(cube.pixels, cube.splitChannel);
        const medianIndex = Math.floor(sortedPixels.length / 2);
        return [
            new Cube(sortedPixels.slice(0, medianIndex)),
            new Cube(sortedPixels.slice(medianIndex))
        ];
    }

    // Sorts the pixels based on the specified color channel
    static sortByChannel(pixels, channel) {
        return [...pixels].sort((a, b) => a[channel] - b[channel]);
    }
}

class Cube {
    constructor(pixels) {
        this.pixels = pixels;
        this.updateRanges();
    }

    // Updates the color ranges of the cube and determines the best channel to split
    updateRanges() {
        this.ranges = { r: { min: 255, max: 0 }, g: { min: 255, max: 0 }, b: { min: 255, max: 0 } };
        
        this.pixels.forEach(pixel => {
            ['r', 'g', 'b'].forEach((channel, idx) => {
                const val = pixel[idx];
                if (val < this.ranges[channel].min) this.ranges[channel].min = val;
                if (val > this.ranges[channel].max) this.ranges[channel].max = val;
            });
        });

        this.splitChannel = this.getLongestRangeChannel();
    }

    // Calculates the longest range among the color channels
    getLongestRange() {
        const ranges = Object.values(this.ranges).map(r => r.max - r.min);
        return Math.max(...ranges);
    }

    // Determines the color channel with the highest variation to use for splitting
    getLongestRangeChannel() {
        const ranges = {
            r: this.ranges.r.max - this.ranges.r.min,
            g: this.ranges.g.max - this.ranges.g.min,
            b: this.ranges.b.max - this.ranges.b.min
        };
        return Object.entries(ranges).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    }

    // Computes the average color of all pixels in the cube
    getAverage() {
        const sum = this.pixels.reduce((acc, pixel) => {
            acc.r += pixel[0];
            acc.g += pixel[1];
            acc.b += pixel[2];
            return acc;
        }, { r: 0, g: 0, b: 0 });

        return [
            Math.round(sum.r / this.pixels.length),
            Math.round(sum.g / this.pixels.length),
            Math.round(sum.b / this.pixels.length)
        ];
    }
}

export default Quantizer;