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

sharedData = sharedData.replace(/let familyMembers/g, 'var familyMembers');

const dom = new JSDOM(`
  <!DOCTYPE html>
  <html>
    <body>
      <div id="wrapper" style="width:1000px; height:1000px; position:relative;">
        <div id="dynamicTreeNodes"></div>
        <svg id="treeSvgLines" class="connections">
          <g id="conn-group"></g>
        </svg>
      </div>
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
// Test QA (u1), Pankaj (u2), Father (u3), Mother (u4)
familyMembers.push({ id: 'u1', firstName: 'Test', lastName: 'QA', gender: 'M', parents: ['u3', 'u4'] });
familyMembers.push({ id: 'u2', firstName: 'Pankaj', lastName: 'Lohumi', gender: 'M', parents: ['u3'] });
familyMembers.push({ id: 'u3', firstName: 'Father', lastName: 'QA', gender: 'M', spouse: 'u4', parents: [] });
familyMembers.push({ id: 'u4', firstName: 'Mother', lastName: 'QA', gender: 'F', spouse: 'u3', parents: [] });

dom.window.HTMLElement.prototype.getBoundingClientRect = function() {
    if (this.id === 'pc-u3') return { left: 400, top: 100, width: 200, height: 100 }; // Father
    if (this.id === 'pc-u4') return { left: 700, top: 100, width: 200, height: 100 }; // Mother
    if (this.id === 'pc-u1') return { left: 300, top: 300, width: 200, height: 100 }; // Test QA
    if (this.id === 'pc-u2') return { left: 800, top: 300, width: 200, height: 100 }; // Pankaj
    if (this.id === 'wrapper') return { left: 0, top: 0, width: 1000, height: 1000 };
    return { left: 0, top: 0, width: 0, height: 0 };
};

try {
  renderTreeToContainer('dynamicTreeNodes', 'treeSvgLines', 'u1', 'openProfile');
  setTimeout(() => {
    console.log("Tree rendered successfully.");
    console.log(document.getElementById('conn-group').innerHTML);
  }, 500);
} catch (e) {
  console.error("ERROR rendering tree:", e);
}
