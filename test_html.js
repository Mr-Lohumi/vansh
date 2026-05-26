const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const url = 'file:///' + process.cwd().replace(/\\/g, '/') + '/dashboard.html';
  console.log('Navigating to:', url);
  await page.goto(url);
  await page.waitForTimeout(1000);
  
  const sidebarHtml = await page.evaluate(() => {
    const sb = document.getElementById('sidebar');
    return sb ? sb.innerHTML : 'NULL';
  });
  
  console.log('SIDEBAR HTML LENGTH:', sidebarHtml.length);
  if (sidebarHtml.length < 50) {
    console.log('SIDEBAR HTML:', sidebarHtml);
  } else {
    console.log('SIDEBAR is rendered with length', sidebarHtml.length);
  }

  const topbarHtml = await page.evaluate(() => {
    const tb = document.getElementById('topbar');
    return tb ? tb.innerHTML : 'NULL';
  });
  console.log('TOPBAR HTML LENGTH:', topbarHtml.length);

  await browser.close();
})();
