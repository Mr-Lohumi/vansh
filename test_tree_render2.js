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
sharedData = sharedData.replace(/let pendingInvites/g, 'var pendingInvites');

const dom = new JSDOM(`
  <!DOCTYPE html>
  <html>
    <body>
      <div id="dynamicTreeNodes"></div>
      <svg id="treeSvgLines" class="connections"></svg>
    </body>
  </html>
`);
global.window = dom.window;
global.document = dom.window.document;
global.ResizeObserver = class { observe() {} disconnect() {} };
global.getAuthData = () => ({ userId: 'u1' });

eval(sharedData);
eval(sharedTree);

familyMembers.length = 0;
familyMembers.push({ id: 'u1', firstName: 'A', lastName: 'B', gender: 'M', parents: ['u2'] });
familyMembers.push({ id: 'u2', firstName: 'C', lastName: 'D', gender: 'M', parents: [] });

try {
  renderTreeToContainer('dynamicTreeNodes', 'treeSvgLines', 'u1', 'openProfile');
  console.log("Tree rendered successfully.");
  console.log(document.getElementById('dynamicTreeNodes').innerHTML.substring(0, 500));
} catch (e) {
  console.error("ERROR rendering tree:", e);
}
