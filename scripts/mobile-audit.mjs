// Mobile readability audit: small viewports, overflow detection,
// font-size census, tap-target sizes, lightbox check.
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';

const URL = 'http://localhost:3000';
const OUT = '.shots';
mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
  args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required', '--mute-audio'],
});

const report = {};

for (const width of [320, 360, 390]) {
  const page = await browser.newPage();
  await page.setViewport({ width, height: 740, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await sleep(5500);

  const audit = await page.evaluate(() => {
    const vw = window.innerWidth;
    // elements wider than the viewport
    const offenders = [];
    document.querySelectorAll('body *').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > vw + 1 && !el.closest('.animate-marquee') && !el.classList.contains('animate-marquee')) {
        const cs = getComputedStyle(el);
        if (cs.position === 'fixed') return;
        offenders.push({
          tag: el.tagName,
          cls: String(el.className).slice(0, 60),
          w: Math.round(r.width),
          text: (el.textContent || '').trim().slice(0, 30),
        });
      }
    });
    // smallest readable text on page (visible elements with own text)
    let minFont = 99;
    document.querySelectorAll('p, span, a, button, h1, h2, h3, div').forEach((el) => {
      if (!el.childNodes.length) return;
      const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (!hasText) return;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      minFont = Math.min(minFont, parseFloat(getComputedStyle(el).fontSize));
    });
    // tap targets in header + lightbox triggers
    const taps = [...document.querySelectorAll('header button, #contact a, .link-line')].map((el) => {
      const r = el.getBoundingClientRect();
      return { t: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 16), w: Math.round(r.width), h: Math.round(r.height) };
    });
    return {
      scrollW: document.documentElement.scrollWidth,
      vw,
      overflow: document.documentElement.scrollWidth > vw,
      offenders: offenders.slice(0, 8),
      minFont,
      taps: taps.filter((x) => x.h > 0 && x.h < 32),
      h1: Math.round(document.querySelector('h1').getBoundingClientRect().width),
    };
  });
  report[width] = audit;

  if (width === 360) {
    // shots of every section at 360
    for (const id of ['hero', 'work', 'about', 'skills', 'contact']) {
      await page.evaluate((s) => document.getElementById(s)?.scrollIntoView({ block: 'start' }), id);
      await sleep(1400);
      await page.screenshot({ path: `${OUT}/m360-${id}.png` });
    }
    // lightbox on touch viewport
    await page.evaluate(() => document.querySelector('#work article').scrollIntoView({ block: 'center' }));
    await sleep(1200);
    await page.tap('#work article');
    await sleep(900);
    await page.screenshot({ path: `${OUT}/m360-lightbox.png` });
    report.lightboxOpen360 = await page.evaluate(() => !!document.querySelector('img[draggable], .fixed.z-\\[95\\]') && document.body.textContent.includes('CLOSE'));
    // footer
    await page.keyboard.press('Escape');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await sleep(1200);
    await page.screenshot({ path: `${OUT}/m360-footer.png` });
  }
  await page.close();
}

await browser.close();
console.log(JSON.stringify(report, null, 1));
