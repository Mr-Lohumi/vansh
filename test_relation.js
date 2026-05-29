const fs = require('fs');

let storage = {};
global.localStorage = {
  getItem: (key) => storage[key] || null,
  setItem: (key, val) => { storage[key] = val; }
};

let code = fs.readFileSync('js/shared-data.js', 'utf8');
code = code.replace(/let familyMembers/g, 'var familyMembers');
code = code.replace(/let pendingInvites/g, 'var pendingInvites');

eval(code);

familyMembers.length = 0; 
const user1 = { id: 'u1', firstName: 'Sender', gender: 'M', parents: [] };
const user2 = { id: 'u2', firstName: 'Receiver', gender: 'M', parents: [] };
familyMembers.push(user1, user2);

global.getAuthData = () => ({ userId: 'u1' });

sendInvite('u1', 'u2', 'father');
const invites = JSON.parse(storage['vansh_invites_v1'] || '[]');
acceptInvite(invites[0].id);

const rel1 = getSmartIndianRelation(familyMembers, 'u1', 'u2');
console.log("u1 to u2 relation:", rel1);

const rel2 = getSmartIndianRelation(familyMembers, 'u2', 'u1');
console.log("u2 to u1 relation:", rel2);
