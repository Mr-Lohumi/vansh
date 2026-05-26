const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('console', msg => console.log('CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  const url = 'file:///' + process.cwd().replace(/\\/g, '/') + '/dashboard.html';
  
  // Navigate to an empty page first to set localStorage for the file:// origin
  await page.goto('file:///' + process.cwd().replace(/\\/g, '/') + '/login.html');
  await page.evaluate(() => {
    localStorage.setItem('rootd_auth', JSON.stringify({ userId: 'P3' }));
    
    // We should also set familyMembers to ensure it's not empty, just in case
    const mockFamily = [
      { id: 'P3', firstName: 'Test', lastName: 'User', verified: true }
    ];
    localStorage.setItem('vansh_family_data_v2', JSON.stringify(mockFamily));
  });

  console.log('Navigating to dashboard...');
  await page.goto(url);
  await page.waitForTimeout(2000);
  
  const sidebarHtml = await page.evaluate(() => {
    const sb = document.getElementById('sidebar');
    return sb ? sb.innerHTML.length : -1;
  });
  console.log('SIDEBAR HTML LENGTH:', sidebarHtml);

  await browser.close();
})();
