// Regenerates public/og-image.jpg (1200×630 social preview) from the live hero.
import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
  args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required', '--mute-audio'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise((r) => setTimeout(r, 6000)); // preloader + intro + a nice reel frame
await page.screenshot({ path: 'public/og-image.jpg', type: 'jpeg', quality: 84 });
await browser.close();
console.log('og-image written');
