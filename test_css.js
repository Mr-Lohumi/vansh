const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const dom = new JSDOM(`
  <!DOCTYPE html>
  <html>
    <head>
      <style>
        :root { --gold: #CBA365; }
        .connections { width: 1000px; height: 1000px; }
      </style>
    </head>
    <body>
      <svg class="connections" xmlns="http://www.w3.org/2000/svg">
        <path d="M 500 200 L 800 200" fill="none" stroke="var(--gold)" stroke-width="5" />
      </svg>
    </body>
  </html>
`);

// The DOM won't actually render visually, but we can verify that var(--gold) is syntactically valid in modern browsers.
// But we already know var(--gold) works in modern browsers.
