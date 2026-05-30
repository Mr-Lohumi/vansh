const fs = require('fs');

let sharedData = fs.readFileSync('js/shared-data.js', 'utf8');
sharedData = sharedData.replace(/let familyMembers/g, 'var familyMembers');
eval(sharedData);

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

function findRootAncestor(startId) {
  let curr = getMemberById(startId);
  if (!curr) return null;
  let visited = new Set();
  
  while (curr && curr.parents && curr.parents.length > 0) {
    if (visited.has(curr.id)) break;
    visited.add(curr.id);
    let parentNode = curr.parents.map(id => getMemberById(id)).find(p => p && p.gender === 'M');
    if (!parentNode) {
      parentNode = getMemberById(curr.parents[0]);
    }
    if (parentNode) {
      curr = parentNode;
    } else {
      break;
    }
  }
  return curr;
}

function getVanshavaliNetwork(currentPOV) {
  const root = findRootAncestor(currentPOV);
  if (!root) return [];
  
  const queue = [{ id: root.id, gen: 1 }];
  const processed = new Set();
  let network = [];
  
  while (queue.length > 0) {
    const { id, gen } = queue.shift();
    if (processed.has(id)) continue;
    processed.add(id);
    
    const m = getMemberById(id);
    if (!m) continue;
    
    m.gen = gen;
    network.push(m);
    
    if (m.spouse) {
      const sp = getMemberById(m.spouse);
      if (sp && !processed.has(sp.id)) {
        sp.gen = gen;
        network.push(sp);
        processed.add(sp.id);
      }
    }
    
    const children = familyMembers.filter(child => {
       if (!child.parents) return false;
       return child.parents.includes(m.id) || (m.spouse && child.parents.includes(m.spouse));
    });
    
    children.forEach(c => {
       if (!processed.has(c.id)) {
          queue.push({ id: c.id, gen: gen + 1 });
       }
    });
  }
  return network;
}

let net = getVanshavaliNetwork('aarav');
console.log("Found network of size:", net.length);
net.sort((a,b) => a.gen - b.gen);
net.forEach(m => {
   console.log(`Gen ${m.gen}: ${m.firstName} ${m.lastName}`);
});
