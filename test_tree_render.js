const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

let storage = {};
global.localStorage = {
  getItem: (key) => storage[key] || null,
  setItem: (key, val) => { storage[key] = val; }
};

let sharedData = fs.readFileSync('js/shared-data.js', 'utf8');
let sharedTree = fs.readFileSync('js/shared-tree.js', 'utf8');

// replace let/const to var
sharedData = sharedData.replace(/let familyMembers/g, 'var familyMembers');

const dom = new JSDOM(`
  <!DOCTYPE html>
  <html>
    <body>
      <div id="dynamicTreeNodes"></div>
      <svg id="treeSvgLines"></svg>
    </body>
  </html>
`);
global.window = dom.window;
global.document = dom.window.document;
global.ResizeObserver = class { observe() {} disconnect() {} };
global.getAuthData = () => ({ userId: 'M1' });

eval(sharedData);
eval(sharedTree);

familyMembers.length = 0;
familyMembers.push(...MATCHMAKING_DB);
// Give them some fake parents to form a network
familyMembers[0].parents = ['M6', 'M7']; // Just a random link to see if it renders

try {
  renderTreeToContainer('dynamicTreeNodes', 'treeSvgLines', 'M1', 'openProfile');
  console.log("Tree rendered successfully.");
  console.log(document.getElementById('dynamicTreeNodes').innerHTML.substring(0, 500));
} catch (e) {
  console.error("ERROR rendering tree:", e);
}
