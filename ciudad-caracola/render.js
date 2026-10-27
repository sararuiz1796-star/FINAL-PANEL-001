// Exporta cada pieza de graficos.html como PNG 1920×1080 en ./png
// Uso: node ciudad-caracola/render.js
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;
  const browser = await chromium.launch({ proxy });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, ignoreHTTPSErrors: !!proxy });
  await page.goto('file://' + path.join(__dirname, 'graficos.html') + '#render');
  await page.evaluate(() => document.fonts.ready);
  const fonts = await page.evaluate(() => ['800 10px Urbanist', '600 10px Caveat'].map(f => document.fonts.check(f)));
  if (fonts.includes(false)) console.warn('Aviso: no cargaron las fuentes', fonts);
  const out = path.join(__dirname, 'png');
  fs.mkdirSync(out, { recursive: true });
  for (const el of await page.$$('.stage')) {
    const id = await el.getAttribute('data-id');
    const alpha = (await el.getAttribute('data-alpha')) === '1';
    const frame = await el.$('.frame');
    await frame.screenshot({ path: path.join(out, id + '.png'), omitBackground: alpha });
    console.log(id + '.png');
  }
  await browser.close();
})();
