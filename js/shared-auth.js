/* ═══════════════════════════════════════════════════════════════
   VANSH (वंश) — Premium Production Authentication Manager
   Supports dual sign-in (Mobile / Name), Sign Up & local state sync.
   ═══════════════════════════════════════════════════════════════ */

const AUTH_KEY = 'rootd_auth';
const DATABASE_KEY = 'vansh_family_data_v2';

function getAuthData() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch(e) { return null; }
}

function login(userId, userName) {
  const session = {
    userId: userId,
    userName: userName,
    loggedInAt: Date.now(),
    familyCode: 'SHARMA-' + new Date().getFullYear(),
  };
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  return session;
}

function logout() {
  localStorage.removeItem(AUTH_KEY);
  window.location.href = 'login.html';
}

function requireAuth() {
  const auth = getAuthData();
  if (!auth) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

function isLoggedIn() {
  return getAuthData() !== null;
}

/**
 * Loads current database directly from localStorage safely
 */
function getActiveDatabase() {
  try {
    const saved = localStorage.getItem(DATABASE_KEY);
    if (saved) return JSON.parse(saved);
  } catch(e) {}
  
  // Return a minimal seed array if local storage is blank
  return [
    { id:"P1", firstName:"Rajesh", lastName:"Sharma", gender:"M", age:75, caste:"Brahmin", subCaste:"Lohumi", gotra:"Kashyap", parents:[], spouse:"P14", nativePlace:"Uttarakhand", verified:true, gen:0, mobile:"9999999999", password:"vansh2025" },
    { id:"P14", firstName:"Savitri", lastName:"Sharma", gender:"F", age:73, caste:"Brahmin", subCaste:"Lohumi", gotra:"Kashyap", parents:[], spouse:"P1", nativePlace:"Uttarakhand", verified:true, gen:0, deceased:true, mobile:"", password:"" },
    { id:"P12", firstName:"Ram", lastName:"Prasad", gender:"M", age:76, caste:"Brahmin", subCaste:"Pandit", gotra:"Vashishta", parents:[], spouse:"P13", nativePlace:"Delhi", verified:true, gen:0, mobile:"", password:"" },
    { id:"P13", firstName:"Kamla", lastName:"Devi", gender:"F", age:72, caste:"Brahmin", subCaste:"Pandit", gotra:"Gautam", parents:[], spouse:"P12", nativePlace:"Delhi", verified:true, gen:0, mobile:"", password:"" },
    { id:"P2", firstName:"Vikram", lastName:"Sharma", gender:"M", age:55, caste:"Brahmin", subCaste:"Lohumi", gotra:"Kashyap", parents:["P1","P14"], spouse:"P9", nativePlace:"Uttarakhand", verified:true, gen:1, mobile:"8888888888", password:"vansh2025" },
    { id:"P9", firstName:"Meena", lastName:"Sharma", gender:"F", age:52, caste:"Brahmin", subCaste:"Garhwali", gotra:"Bharadwaj", parents:[], spouse:"P2", nativePlace:"Uttarakhand", verified:true, gen:1, mobile:"", password:"" },
    { id:"P3", firstName:"Anand", lastName:"Sharma", gender:"M", age:50, caste:"Brahmin", subCaste:"Lohumi", gotra:"Kashyap", parents:["P1","P14"], spouse:"P4", nativePlace:"Uttarakhand", verified:true, gen:1, mobile:"9876543210", password:"vansh2025" },
    { id:"P4", firstName:"Sunita", lastName:"Sharma", gender:"F", age:48, caste:"Brahmin", subCaste:"Maternal", gotra:"Vashishta", parents:["P12","P13"], spouse:"P3", nativePlace:"Delhi", verified:true, gen:1, mobile:"", password:"" },
    { id:"P10", firstName:"Arjun", lastName:"Sharma", gender:"M", age:28, caste:"Brahmin", subCaste:"Lohumi", gotra:"Kashyap", parents:["P2","P9"], spouse:null, nativePlace:"Uttarakhand", verified:true, gen:2, mobile:"", password:"" },
    { id:"P11", firstName:"Kavita", lastName:"Sharma", gender:"F", age:24, caste:"Brahmin", subCaste:"Lohumi", gotra:"Kashyap", parents:["P2","P9"], spouse:null, nativePlace:"Uttarakhand", verified:true, gen:2, mobile:"", password:"" },
    { id:"P5", firstName:"Priya", lastName:"Sharma", gender:"F", age:25, caste:"Brahmin", subCaste:"Lohumi", gotra:"Kashyap", parents:["P3","P4"], spouse:"P6", nativePlace:"Uttarakhand", verified:true, gen:2, mobile:"", password:"" },
    { id:"P6", firstName:"Deepak", lastName:"Verma", gender:"M", age:28, caste:"Khatri", subCaste:"Verma", gotra:"Bharadwaj", parents:[], spouse:"P5", nativePlace:"Punjab", verified:true, gen:2, mobile:"", password:"" },
    { id:"P7", firstName:"Rahul", lastName:"Sharma", gender:"M", age:22, caste:"Brahmin", subCaste:"Lohumi", gotra:"Kashyap", parents:["P3","P4"], spouse:null, nativePlace:"Uttarakhand", verified:true, gen:2, mobile:"", password:"" },
    { id:"P8", firstName:"Aman", lastName:"Sharma", gender:"M", age:22, caste:"Brahmin", subCaste:"Lohumi", gotra:"Kashyap", parents:["P3","P4"], spouse:null, nativePlace:"Uttarakhand", verified:true, gen:2, mobile:"", password:"" }
  ];
}

/**
 * Authenticates user using Mobile OR Name + Password
 */
function authenticateUser(loginKey, password) {
  const members = getActiveDatabase();
  const cleanKey = loginKey.trim().toLowerCase();
  
  const matched = members.find(m => {
    const fullName = `${m.firstName} ${m.lastName}`.toLowerCase();
    const firstOnly = m.firstName.toLowerCase();
    const mobileNo = m.mobile ? m.mobile.toString().trim() : "";
    
    return fullName === cleanKey || firstOnly === cleanKey || mobileNo === cleanKey;
  });

  if (!matched) {
    return { success: false, message: "Member name or mobile number not registered." };
  }

  // Support default password for old seed profiles
  const correctPassword = matched.password || "vansh2025";
  if (password === correctPassword) {
    login(matched.id, `${matched.firstName} ${matched.lastName}`);
    return { success: true, member: matched };
  } else {
    return { success: false, message: "Incorrect password. Please try again." };
  }
}

/**
 * Registers a brand new family member and logs them in
 */
function registerUser(firstName, lastName, mobile, password, details = {}) {
  const members = getActiveDatabase();
  
  // Check if mobile already exists
  if (mobile && members.some(m => m.mobile && m.mobile.toString().trim() === mobile.trim())) {
    return { success: false, message: "A member with this mobile number is already registered." };
  }

  // Calculate next ID
  const maxId = members.reduce((max, m) => {
    const n = parseInt(m.id.replace('P', ''));
    return n > max ? n : max;
  }, 0);
  const nextId = 'P' + (maxId + 1);

  const newMember = {
    id: nextId,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    mobile: mobile.trim(),
    password: password,
    gender: details.gender || "M",
    age: parseInt(details.age) || 25,
    caste: details.caste || "Brahmin",
    subCaste: details.subCaste || "",
    gotra: details.gotra || "Kashyap",
    nativePlace: details.nativePlace || "",
    parents: [],
    spouse: null,
    verified: true, // Auto-verify on registration
    gen: 2, // Default to Generation 2
    bio: "Lineage heir registered via production gateway.",
    education: details.education || "",
    occupation: details.occupation || "Network Member"
  };

  members.push(newMember);
  localStorage.setItem(DATABASE_KEY, JSON.stringify(members));
  
  // Log them in immediately
  login(newMember.id, `${newMember.firstName} ${newMember.lastName}`);
  return { success: true, member: newMember };
}
