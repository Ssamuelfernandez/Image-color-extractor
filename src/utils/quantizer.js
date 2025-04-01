
class Quantizer {

    // Generates a color palette by iteratively splitting color cubes
    static extractColor(pixelArray, maxColors = 1) {

        if (!pixelArray || pixelArray.length === 0) {
            throw new Error("The pixel array is empty");
        }
        if (maxColors < 1) {
            throw new Error("maxColors must be at least 1");
        }

        let cubes = [new Cube(pixelArray)];

        // Continues splitting cubes until the desired number of colors is reached
        while (cubes.length < maxColors) {
            const cubeToSplit = this.findCubeToSplit(cubes);
            if (!cubeToSplit || cubeToSplit.getLongestRange() === 0) break;
            const [cube1, cube2] = this.splitCube(cubeToSplit);
            cubes = cubes.filter(c => c !== cubeToSplit).concat([cube1, cube2]);
        }

        const dominantCube = cubes.reduce((prev, current) =>
            prev.pixelCount > current.pixelCount ? prev : current
        );

        return dominantCube.getAverage();
    }

    static extractPalette(pixelArray, maxColors, maxIterations = 10) {
        if (!pixelArray || pixelArray.length === 0) {
            throw new Error("The pixel array is empty");
        }

        pixelArray.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);

        const centroids = [];
        const step = Math.floor(pixelArray.length / maxColors);
        for (let i = 0; i < maxColors; i++) {
            centroids.push(pixelArray[i * step]);
        }

        let clusters = new Array(maxColors);
        // Iterate to adjust clusters
        for (let iter = 0; iter < maxIterations; iter++) {
            // Initialize each cluster as an empty array
            clusters = Array.from({ length: maxColors }, () => []);

            // Assigns each pixel to the nearest centroid
            for (const pixel of pixelArray) {
                let minDist = Infinity;
                let clusterIndex = 0;
                for (let i = 0; i < centroids.length; i++) {
                    const dist = Quantizer.euclideanDistance(pixel, centroids[i]);
                    if (dist < minDist) {
                        minDist = dist;
                        clusterIndex = i;
                    }
                }
                clusters[clusterIndex].push(pixel);
            }

            // Calculates new centroids based on the mean of each cluster
            let converged = true;
            for (let i = 0; i < maxColors; i++) {
                // If a cluster is left empty, the previous centroid is kept
                if (clusters[i].length === 0) continue;
                const newCentroid = Quantizer.averageColor(clusters[i]);
                // If the difference is greater than a small threshold, it has not converged.
                if (Quantizer.euclideanDistance(newCentroid, centroids[i]) > 1) {
                    converged = false;
                }
                centroids[i] = newCentroid;
            }
            if (converged) break;
        }
        return centroids;
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
        const medianIndex = Math.max(1, Math.floor(sortedPixels.length / 2));
        return [
            new Cube(sortedPixels.slice(0, medianIndex)),
            new Cube(sortedPixels.slice(medianIndex))
        ];
    }

    // Sorts the pixels based on the specified color channel
    static sortByChannel(pixels, channel) {
        return [...pixels].sort((a, b) => a[channel] - b[channel]);
    }

    static euclideanDistance(a, b) {
        return Math.sqrt(
            Math.pow(a[0] - b[0], 2) +
            Math.pow(a[1] - b[1], 2) +
            Math.pow(a[2] - b[2], 2)
        );
    }

    static averageColor(cluster) {
        const sum = cluster.reduce(
            (acc, pixel) => {
                acc[0] += pixel[0];
                acc[1] += pixel[1];
                acc[2] += pixel[2];
                return acc;
            },
            [0, 0, 0]
        );
        const len = cluster.length;
        return [
            Math.round(sum[0] / len),
            Math.round(sum[1] / len),
            Math.round(sum[2] / len)
        ];
    }

}

class Cube {
    constructor(pixels) {
        if (!pixels || pixels.length === 0) {
            throw new Error("A cube cannot be created without pixels");
        }
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
        if (this.pixels.length === 0) return [0, 0, 0];
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