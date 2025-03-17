
# 🎨 Image Color Extractor (Imgcolex)

Extracts the **dominant color** and a **color palette** from an image in **Node.js** and **browser**.




## 🚀 Installation

```bash
  npm install image-color-extractor
```
    
## 🧪 Running Tests

To run tests, run the following command

```bash
  npm test
  npm run test:node
  npm run test:browser

```


## 🛠 Use `getColor` and `getPalette`

### Get a color

#### Requirements:
- **`img`**: The input image.
- In **Node.js**: A `Buffer` representing the image (e.g., read from a file).
- In **Browser**: An `HTMLImageElement` (e.g., an image loaded into the DOM).
- **`quality`** (optional): A number between 1 and 100 that controls the quality of the dominant color extraction process. A lower value improves quality, but may increase processing time. The default value is 10.

### **Returned value:**
- An object representing the dominant color of the image, usually in RGBA or similar format (an array of color values).

### Get a palette

#### Requirements:
- **`img`**: The input image.
- In **Node.js**: A `Buffer` representing the image (e.g., read from a file).
- In **Browser**: An `HTMLImageElement` element (e.g., an image loaded into the DOM).
- **`colorCount`** (optional): Number of primary colors to extract. The default value is 10.
- **`quality`** (optional): A number between 1 and 100 that controls the quality of the color palette extraction process. A lower value improves quality, but may increase processing time. The default value is 10.

### **Returned value:**
- An array of objects representing the primary colors extracted from the image, usually in RGBA or similar format (each object representing a color).


## 📌 Examples

### Node.js (with Buffer)
```javascript
import fs from 'fs';
import Imgcolex from 'image-color-extractor';

const imageBuffer = fs.readFileSync('imagen.jpg');

// Get dominant color
Imgcolex.getColor(imageBuffer).then(color => {
    console.log('Color dominante:', color);
});

// Get color palette
Imgcolex.getPalette(imageBuffer, 5).then(palette => {
    console.log('Paleta de colores:', palette);
});

```
### Browser (with `<img>`)

```javascript
import Imgcolex from 'image-color-extractor';

const img = document.getElementById('myImage');

img.onload = async () => {
    const dominantColor = await Imgcolex.getColor(img);
    console.log('Color dominante:', dominantColor);

    const palette = await Imgcolex.getPalette(img, 5);
    console.log('Paleta de colores:', palette);
};


```

