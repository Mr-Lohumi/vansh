const fs = require('fs');

let sharedData = fs.readFileSync('js/shared-data.js', 'utf8');
let sharedTree = fs.readFileSync('js/shared-tree.js', 'utf8');
sharedData = sharedData.replace(/let familyMembers/g, 'var familyMembers');

eval(sharedData);

// Mock browser env for shared-tree
global.window = {};
global.document = { getElementById: () => null };

eval(sharedTree);

familyMembers.length = 0; // Clear mock

// Hari Singh (Gen 1)
familyMembers.push({ id: 'hari', firstName: 'Hari', lastName: 'Singh', gender: 'M', parents: [] });
familyMembers.push({ id: 'hari_wife', firstName: 'HariWife', lastName: 'Singh', gender: 'F', spouse: 'hari', parents: [] });

// Gen 2
familyMembers.push({ id: 'mahesh', firstName: 'Mahesh', lastName: 'Singh', gender: 'M', parents: ['hari', 'hari_wife'] });
familyMembers.push({ id: 'suresh', firstName: 'Suresh', lastName: 'Singh', gender: 'M', parents: ['hari', 'hari_wife'] });

// Gen 3 (Mahesh's kids)
familyMembers.push({ id: 'pankaj', firstName: 'Pankaj', lastName: 'Singh', gender: 'M', parents: ['mahesh'] });
familyMembers.push({ id: 'amit', firstName: 'Amit', lastName: 'Singh', gender: 'M', parents: ['mahesh'] });
familyMembers.push({ id: 'ritu', firstName: 'Ritu', lastName: 'Singh', gender: 'F', parents: ['mahesh'] });

// Gen 3 (Suresh's kids)
familyMembers.push({ id: 'deepak', firstName: 'Deepak', lastName: 'Singh', gender: 'M', parents: ['suresh'] });
familyMembers.push({ id: 'nitin', firstName: 'Nitin', lastName: 'Singh', gender: 'M', parents: ['suresh'] });
familyMembers.push({ id: 'pooja', firstName: 'Pooja', lastName: 'Singh', gender: 'F', parents: ['suresh'] });

// Gen 4 (Pankaj's kids)
familyMembers.push({ id: 'riya', firstName: 'Riya', lastName: 'Singh', gender: 'F', spouse: 'pankaj', parents: [] });
familyMembers.push({ id: 'aarav', firstName: 'Aarav', lastName: 'Singh', gender: 'M', parents: ['pankaj', 'riya'] });
familyMembers.push({ id: 'anaya', firstName: 'Anaya', lastName: 'Singh', gender: 'F', parents: ['pankaj', 'riya'] });
familyMembers.push({ id: 'aryan', firstName: 'Aryan', lastName: 'Singh', gender: 'M', parents: ['pankaj', 'riya'] });

let net = getBloodlineNetwork('aarav');
console.log("Found network of size:", net.length);
net.sort((a,b) => a.gen - b.gen);
net.forEach(m => {
   console.log(`Gen ${m.gen}: ${m.firstName} ${m.lastName}`);
});
