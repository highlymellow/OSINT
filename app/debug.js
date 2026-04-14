import puppeteer from 'puppeteer';
const browser = await puppeteer.launch();
const page = await browser.newPage();
page.on('pageerror', err => {
  console.log('UNCAUGHT EXCEPTION:', err.message);
  console.log(err.stack);
});
page.on('console', msg => {
  console.log(`[${msg.type()}] ${msg.text()}`);
});
try {
  await page.goto('http://localhost:5174', { waitUntil: 'load', timeout: 10000 });
} catch (e) {
  console.log('Goto Error:', e);
}
const content = await page.content();
console.log('DOM length:', content.length);
await browser.close();
