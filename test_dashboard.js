const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  const url = 'file:///' + process.cwd().replace(/\\/g, '/') + '/dashboard.html';
  console.log('Navigating to:', url);
  await page.goto(url);
  await page.waitForTimeout(2000);
  await browser.close();
})();
