const fs = require('fs');

// Read the js files
let sharedData = fs.readFileSync('js/shared-data.js', 'utf8');
let supabaseConfig = fs.readFileSync('js/supabase-config.js', 'utf8');

// Mock browser environment
global.window = {};
global.localStorage = {
  getItem: () => null,
  setItem: () => {}
};
global.console = {
  error: console.error,
  log: console.log,
  warn: console.warn
};

// Mock Supabase Client
global.window.supabaseClient = {
  from: (table) => {
    return {
      update: () => ({ eq: () => Promise.resolve({ error: null }) }),
      select: () => ({
        eq: (col, val) => ({
          single: () => {
            if (val === 'PMPMAH9MAKZ3M') {
              return Promise.resolve({
                data: {
                  id: 'PMPMAH9MAKZ3M',
                  first_name: 'B',
                  last_name: 'lohumi',
                  gender: 'F'
                }, error: null
              });
            }
            if (val === 'PMPMAF0OXHH4R') {
              return Promise.resolve({
                data: {
                  id: 'PMPMAF0OXHH4R',
                  first_name: 'A',
                  last_name: 'Lohumi',
                  gender: 'M'
                }, error: null
              });
            }
            return Promise.resolve({ data: null, error: true });
          }
        })
      })
    };
  }
};

// Execute the JS to load it into global scope
try {
  eval(supabaseConfig);
  eval(sharedData);
} catch (e) {
  console.log("Eval error:", e);
}

// Run the test
async function runTest() {
  const invite = {
    id: 'INV_mpmancbhmjam',
    fromUserId: 'PMPMAH9MAKZ3M',
    toUserId: 'PMPMAF0OXHH4R',
    relationType: 'mummy'
  };
  
  try {
    const success = await processCloudInvite(invite, 'accepted');
    console.log("Success result:", success);
    console.log("Family Members length:", familyMembers.length);
  } catch (e) {
    console.error("Test Exception:", e);
  }
}

runTest();
