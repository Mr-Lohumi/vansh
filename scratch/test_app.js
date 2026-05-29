const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const DIR = path.resolve('c:/50/OPG');

// Simple static server
const server = http.createServer((req, res) => {
  let parsedUrl = url.parse(req.url);
  let pathname = `.${parsedUrl.pathname}`;
  if (pathname === './') pathname = './dashboard.html';
  const ext = path.parse(pathname).ext;
  const map = {
    '.ico': 'image/x-icon', '.html': 'text/html', '.js': 'text/javascript',
    '.json': 'application/json', '.css': 'text/css', '.png': 'image/png'
  };
  fs.readFile(path.join(DIR, pathname), function(err, data){
    if(err){
      res.statusCode = 500;
      res.end(`Error getting the file: ${err}.`);
    } else {
      res.setHeader('Content-type', map[ext] || 'text/plain');
      res.end(data);
    }
  });
});

server.listen(8081, async () => {
  console.log("Server listening on port 8081");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  
  // Inject auth into local storage for localhost:8081
  await context.addInitScript(() => {
    window.localStorage.setItem('rootd_auth', JSON.stringify({ userId: 'M1', userName: 'Test User' }));
    window.localStorage.setItem('vansh_family_data_v2', JSON.stringify([
      { id: 'M1', firstName: 'Simran', gender: 'F', parents: [], age: 21 },
      { id: 'M2', firstName: 'Father', gender: 'M', parents: [], spouse: 'M3' },
      { id: 'M3', firstName: 'Mother', gender: 'F', parents: [] },
    ]));
  });

  const page = await context.newPage();
  const errors = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      errors.push(`[${msg.type()}] ${msg.text()}`);
    }
  });
  page.on('pageerror', exception => {
    errors.push(`[pageerror] ${exception}`);
  });

  try {
    console.log("Testing dashboard.html...");
    await page.goto('http://localhost:8081/dashboard.html', { waitUntil: 'networkidle' });
    
    // Check if tree renders
    const treeNodesCount = await page.evaluate(() => {
      return document.querySelectorAll('.ct-node').length;
    });
    console.log(`Dashboard tree nodes rendered: ${treeNodesCount}`);
    
    console.log("Testing profile.html (Self)...");
    await page.goto('http://localhost:8081/profile.html', { waitUntil: 'networkidle' });
    const isSelf = await page.evaluate(() => {
      return document.body.innerHTML.includes('Edit My Profile');
    });
    console.log(`Profile Self Rendered: ${isSelf}`);
    
    console.log("Testing traditions.html...");
    await page.goto('http://localhost:8081/traditions.html', { waitUntil: 'networkidle' });
    const isTraditions = await page.evaluate(() => {
      return document.body.innerHTML.includes('Add to Archive') || document.body.innerHTML.includes('The Vansh Archive');
    });
    console.log(`Traditions Rendered: ${isTraditions}`);
    
    if (errors.length > 0) {
      console.log("\nBrowser Console Errors found:");
      errors.forEach(e => console.log(e));
    } else {
      console.log("\nNo Browser Console Errors!");
    }
  } catch (err) {
    console.error("Test script failed:", err);
  } finally {
    await browser.close();
    server.close();
  }
});
