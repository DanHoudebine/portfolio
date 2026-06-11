// Dev-only visual QA: drives the system Chrome headless against the local
// dev server and saves section screenshots to .shots/.
//   node scripts/shoot.mjs
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

async function shoot(width, height, tag, sections) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await sleep(5200); // preloader + hero intro
  await page.screenshot({ path: `${OUT}/${tag}-hero.png` });

  for (const id of sections) {
    await page.evaluate((sel) => {
      document.querySelector(sel)?.scrollIntoView({ behavior: 'instant', block: 'start' });
      window.scrollBy(0, -40);
    }, `#${id}`);
    await sleep(1600); // let reveal animations settle
    await page.screenshot({ path: `${OUT}/${tag}-${id}.png` });
  }

  // mid-gallery: second featured row (flipped layout) and archive grid
  for (const [name, sel] of [
    ['work-feature2', '#work article:nth-of-type(2)'],
    ['work-archive', '#work .grid'],
  ]) {
    await page.evaluate((s) => {
      document.querySelector(s)?.scrollIntoView({ behavior: 'instant', block: 'center' });
    }, sel);
    await sleep(1600);
    await page.screenshot({ path: `${OUT}/${tag}-${name}.png` });
  }

  // extra: bottom of work (archive grid) + footer
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(1600);
  await page.screenshot({ path: `${OUT}/${tag}-footer.png` });
  await page.close();
}

await shoot(1440, 900, 'desktop', ['work', 'about', 'skills', 'contact']);
await shoot(390, 844, 'mobile', ['work', 'about', 'skills', 'contact']);

await browser.close();
console.log('done');
