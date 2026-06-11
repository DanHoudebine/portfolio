// Dev-only interaction QA: lightbox, skills tabs, language toggle, mobile menu.
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

// ——— Desktop: lightbox + tabs + lang ———
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
await sleep(5200);

// open lightbox on first featured project
await page.evaluate(() => document.querySelector('#work article').scrollIntoView({ block: 'center' }));
await sleep(1500);
await page.click('#work article');
await sleep(800);
await page.screenshot({ path: `${OUT}/qa-lightbox.png` });
// arrow-key navigation then escape
await page.keyboard.press('ArrowRight');
await sleep(500);
await page.screenshot({ path: `${OUT}/qa-lightbox-next.png` });
await page.keyboard.press('Escape');
await sleep(500);
const lightboxClosed = await page.evaluate(() => !document.querySelector('.z-\\[95\\]'));

// skills: switch to TECHNIQUE tab then ARTISTIQUE
await page.evaluate(() => document.getElementById('skills').scrollIntoView());
await sleep(1500);
const tabs = await page.$$('#skills button');
await tabs[1].click();
await sleep(900);
await page.screenshot({ path: `${OUT}/qa-skills-technical.png` });
await tabs[2].click();
await sleep(900);
await page.screenshot({ path: `${OUT}/qa-skills-artistic.png` });

// language toggle (header button) — switch to EN
await page.evaluate(() => window.scrollTo(0, 0));
await sleep(800);
await page.click('header nav button:last-child');
await sleep(800);
await page.screenshot({ path: `${OUT}/qa-hero-en.png` });
const heroEn = await page.evaluate(() => document.querySelector('.hero-content .font-serif-i')?.textContent);
await page.close();

// ——— Mobile: burger menu ———
const m = await browser.newPage();
await m.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
await m.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
await sleep(5200);
await m.click('header button[aria-label="Menu"]');
await sleep(700);
await m.screenshot({ path: `${OUT}/qa-mobile-menu.png` });
await m.close();

await browser.close();
console.log(JSON.stringify({ lightboxClosed, heroEn }));
