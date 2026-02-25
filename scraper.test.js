const { fetchWithBrowser, closeBrowser, getBrowser } = require('./scraper');

afterAll(async () => {
  await closeBrowser();
});

describe('scraper module', () => {
  describe('fetchWithBrowser', () => {
    test('returns { html, ogImage, images } structure', async () => {
      // Use a simple data URL page to avoid network dependencies
      const result = await fetchWithBrowser('data:text/html,<html><head><meta property="og:image" content="https://example.com/photo.jpg"></head><body><img src="https://example.com/big.jpg" width="400" height="300"></body></html>');
      expect(result).not.toBeNull();
      expect(result).toHaveProperty('html');
      expect(result).toHaveProperty('ogImage');
      expect(result).toHaveProperty('images');
      expect(typeof result.html).toBe('string');
      expect(Array.isArray(result.images)).toBe(true);
    }, 30000);

    test('extracts og:image from meta tag', async () => {
      const result = await fetchWithBrowser('data:text/html,<html><head><meta property="og:image" content="https://example.com/recipe.jpg"></head><body></body></html>');
      expect(result).not.toBeNull();
      expect(result.ogImage).toBe('https://example.com/recipe.jpg');
      expect(result.images).toContain('https://example.com/recipe.jpg');
    }, 30000);

    test('extracts images from <img> tags', async () => {
      const html = `<html><body>
        <img src="https://example.com/big-photo.jpg" width="600" height="400">
        <img src="https://example.com/icon.svg" width="24" height="24">
      </body></html>`;
      const result = await fetchWithBrowser(`data:text/html,${encodeURIComponent(html)}`);
      expect(result).not.toBeNull();
      expect(result.images).toContain('https://example.com/big-photo.jpg');
      // SVGs should be filtered out
      expect(result.images).not.toContain('https://example.com/icon.svg');
    }, 30000);

    test('extracts images from JSON-LD Recipe schema', async () => {
      const html = `<html><head>
        <script type="application/ld+json">
        {"@type":"Recipe","name":"Hummus","image":"https://example.com/hummus.jpg","recipeIngredient":["chickpeas"]}
        </script>
      </head><body></body></html>`;
      const result = await fetchWithBrowser(`data:text/html,${encodeURIComponent(html)}`);
      expect(result).not.toBeNull();
      expect(result.images).toContain('https://example.com/hummus.jpg');
    }, 30000);

    test('normalizes protocol-relative URLs', async () => {
      const html = `<html><head><meta property="og:image" content="//cdn.example.com/photo.jpg"></head><body></body></html>`;
      const result = await fetchWithBrowser(`data:text/html,${encodeURIComponent(html)}`);
      expect(result).not.toBeNull();
      expect(result.ogImage).toBe('https://cdn.example.com/photo.jpg');
    }, 30000);

    test('returns null on invalid URL', async () => {
      const result = await fetchWithBrowser('not-a-real-url', { timeout: 5000 });
      expect(result).toBeNull();
    }, 15000);

    test('returns null on timeout', async () => {
      // Use a very short timeout with a slow-loading page
      const result = await fetchWithBrowser('https://httpstat.us/200?sleep=30000', { timeout: 1000 });
      expect(result).toBeNull();
    }, 15000);

    test('caps images at 12', async () => {
      const imgs = Array.from({ length: 20 }, (_, i) =>
        `<img src="https://example.com/img${i}.jpg" width="400" height="300">`
      ).join('');
      const html = `<html><body>${imgs}</body></html>`;
      const result = await fetchWithBrowser(`data:text/html,${encodeURIComponent(html)}`);
      expect(result).not.toBeNull();
      expect(result.images.length).toBeLessThanOrEqual(12);
    }, 30000);
  });

  describe('browser instance management', () => {
    test('getBrowser returns a connected browser', async () => {
      const browser = await getBrowser();
      expect(browser).not.toBeNull();
      expect(browser.connected).toBe(true);
    }, 15000);

    test('getBrowser reuses the same instance', async () => {
      const b1 = await getBrowser();
      const b2 = await getBrowser();
      expect(b1).toBe(b2);
    }, 15000);

    test('closeBrowser shuts down cleanly', async () => {
      await getBrowser(); // ensure one exists
      await closeBrowser();
      // After closing, getBrowser should create a new one
      const b = await getBrowser();
      expect(b.connected).toBe(true);
    }, 15000);
  });
});
