let imgcolex;

if (typeof window === 'undefined') {
  // Node
  imgcolex = (await import('./utils/node-color-extractor.js')).default;
} else {
  // Browser
  imgcolex = (await import('./utils/browser-color-extractor.js')).default;
}

export default imgcolex;
