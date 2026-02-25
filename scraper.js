const puppeteer = require('puppeteer');

let browser = null;

async function getBrowser() {
  if (browser && browser.connected) return browser;
  browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-extensions',
      '--disable-background-networking',
      '--disable-default-apps',
      '--no-first-run'
    ]
  });
  browser.on('disconnected', () => { browser = null; });
  return browser;
}

function normalizeUrl(url) {
  if (!url) return url;
  if (url.startsWith('//')) return 'https:' + url;
  if (url.startsWith('http://')) return url.replace('http://', 'https://');
  return url;
}

/**
 * Fetch a URL with a headless browser, wait for JS to render,
 * then extract images from the fully rendered DOM.
 * Returns { html, ogImage, images } or null on failure.
 */
async function fetchWithBrowser(url, { timeout = 20000 } = {}) {
  let page = null;
  try {
    const b = await getBrowser();
    page = await b.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
    );

    await page.goto(url, { waitUntil: 'networkidle2', timeout });

    const result = await page.evaluate(() => {
      let ogImage = null;
      const images = [];
      const seen = new Set();

      function addImage(src) {
        if (!src || src.startsWith('data:')) return;
        let normalized = src;
        if (normalized.startsWith('//')) normalized = 'https:' + normalized;
        else if (normalized.startsWith('http://')) normalized = normalized.replace('http://', 'https://');
        if (seen.has(normalized)) return;
        seen.add(normalized);
        images.push(normalized);
      }

      // og:image
      const ogEl = document.querySelector('meta[property="og:image"]');
      if (ogEl) { ogImage = ogEl.getAttribute('content'); addImage(ogImage); }
      const ogSecure = document.querySelector('meta[property="og:image:secure_url"]');
      if (ogSecure) { const v = ogSecure.getAttribute('content'); if (!ogImage) ogImage = v; addImage(v); }

      // twitter:image
      const tw = document.querySelector('meta[name="twitter:image"]');
      if (tw) addImage(tw.getAttribute('content'));

      // JSON-LD Recipe images
      document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
        try {
          let data = JSON.parse(script.textContent);
          if (data['@graph']) data = data['@graph'];
          if (!Array.isArray(data)) data = [data];
          for (const item of data) {
            const type = item['@type'];
            if (type === 'Recipe' || (Array.isArray(type) && type.includes('Recipe'))) {
              const img = Array.isArray(item.image) ? item.image[0]
                : (typeof item.image === 'object' ? item.image.url : item.image);
              if (img) addImage(img);
            }
          }
        } catch (_) {}
      });

      // All <img> elements — filter icons/tracking pixels
      document.querySelectorAll('img').forEach(img => {
        const src = img.src || img.getAttribute('src');
        if (!src || src.startsWith('data:')) return;
        if (/gravatar|pixel|track|badge|icon|logo|avatar|emoji|widget/i.test(src)) return;
        if (/\.svg(\?|$)/i.test(src)) return;
        const rect = img.getBoundingClientRect();
        if (rect.width > 0 && rect.width < 80) return;
        if (rect.height > 0 && rect.height < 80) return;
        const w = parseInt(img.getAttribute('width'));
        const h = parseInt(img.getAttribute('height'));
        if ((w && w < 80) || (h && h < 80)) return;
        addImage(src);
      });

      // srcset
      document.querySelectorAll('img[srcset]').forEach(img => {
        const srcset = img.getAttribute('srcset');
        srcset.split(',').map(s => s.trim().split(/\s+/)[0]).forEach(addImage);
      });

      // Lazy-loaded
      document.querySelectorAll('[data-src], [data-srcset], [data-bgset]').forEach(el => {
        for (const attr of ['data-src', 'data-srcset', 'data-bgset']) {
          const val = el.getAttribute(attr);
          if (!val) continue;
          if (attr === 'data-src') {
            if (/\.(jpg|jpeg|png|webp)/i.test(val)) addImage(val);
          } else {
            val.split(',').map(s => s.trim().split(/\s+/)[0]).forEach(addImage);
          }
        }
      });

      // Normalize ogImage
      if (ogImage) {
        if (ogImage.startsWith('//')) ogImage = 'https:' + ogImage;
        else if (ogImage.startsWith('http://')) ogImage = ogImage.replace('http://', 'https://');
      }

      return { ogImage, images: images.slice(0, 12) };
    });

    const html = await page.content();
    await page.close();

    return { html, ogImage: result.ogImage, images: result.images };
  } catch (err) {
    if (page) await page.close().catch(() => {});
    return null;
  }
}

async function closeBrowser() {
  if (browser) {
    await browser.close().catch(() => {});
    browser = null;
  }
}

module.exports = { fetchWithBrowser, closeBrowser, getBrowser };
