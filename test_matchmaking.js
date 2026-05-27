const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('matchmaking.html', 'utf8');

const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });

// Polyfill localStorage
dom.window.localStorage = {
  getItem: function(key) { return key === 'rootd_auth' ? '{"userId": "m1"}' : null; },
  setItem: function() {}
};

setTimeout(() => {
  const sidebar = dom.window.document.getElementById('sidebar');
  if (sidebar) {
    console.log("SIDEBAR HTML:", sidebar.innerHTML);
    if(sidebar.innerHTML === '') console.log("SIDEBAR IS EMPTY!");
  } else {
    console.log("SIDEBAR NOT FOUND");
  }
  
  const matchSelect = dom.window.document.getElementById('matchForSelect');
  console.log("MATCH SELECT HTML:", matchSelect ? matchSelect.innerHTML : "NULL");
}, 2000);
