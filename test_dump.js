const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const url = 'file:///' + process.cwd().replace(/\\/g, '/') + '/dashboard.html';
  await page.goto(url);
  await page.waitForTimeout(1000);
  
  const bodyHtml = await page.evaluate(() => {
    return document.body.innerHTML;
  });
  
  require('fs').writeFileSync('body_dump.html', bodyHtml);
  console.log('Saved to body_dump.html');

  await browser.close();
})();
