const fs = require('fs');
const path = require('path');

global.localStorage = {
  getItem: () => null,
  setItem: () => {}
};
global.window = {};

const mockData = [
  { id: '1', firstName: 'Grandpa', parents: [] },
  { id: '2', firstName: 'Grandma', parents: [], spouse: '1' },
  { id: '3', firstName: 'Father', parents: ['1', '2'], spouse: '4' },
  { id: '4', firstName: 'Mother', parents: [] },
  { id: '5', firstName: 'Me (Son)', parents: ['3', '4'] },
  { id: '6', firstName: 'Sister', parents: ['3', '4'] },
  { id: '7', firstName: 'Uncle', parents: ['1', '2'] },
  { id: '8', firstName: 'Cousin', parents: ['7'] },
  { id: '9', firstName: 'Stranger', parents: [] }
];

global.loadFamilyData = () => mockData;

let code = fs.readFileSync(path.join(__dirname, '../js/shared-data.js'), 'utf8');

// Replace `let familyMembers` with `var familyMembers` so it's in global scope
code = code.replace(/let familyMembers/g, 'var familyMembers');

eval(code);

// Now familyMembers will be set to mockData automatically!

console.log("Tier Me to Me:", getRelationshipTier('5', '5')); // Should be SELF
console.log("Tier Me to Father:", getRelationshipTier('5', '3')); // Should be CLOSE_FAMILY
console.log("Tier Me to Sister:", getRelationshipTier('5', '6')); // Should be CLOSE_FAMILY
console.log("Tier Me to Uncle:", getRelationshipTier('5', '7')); // Should be FAMILY_NETWORK
console.log("Tier Me to Cousin:", getRelationshipTier('5', '8')); // Should be FAMILY_NETWORK
console.log("Tier Me to Stranger:", getRelationshipTier('5', '9')); // Should be STRANGER

console.log("All tests completed.");
