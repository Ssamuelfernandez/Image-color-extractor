
(async () => {
    if (typeof import.meta !== 'undefined') {
      const { fileURLToPath } = await import('node:url');
      const { dirname } = await import('node:path');
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      global.__filename = __filename;
      global.__dirname = __dirname;
    }
  })();
  