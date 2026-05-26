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
  if (window.supabaseClient) {
    window.supabaseClient.auth.signOut().then(() => {
      window.location.href = 'login.html';
    });
  } else {
    window.location.href = 'login.html';
  }
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
 * Loads current database directly from localStorage safely (with self-healing auto-repair)
 */
function getActiveDatabase() {
  try {
    const saved = localStorage.getItem(DATABASE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch(e) {}
  
  // Return empty array for production (no demo data)
  return [];
}

/**
 * Authenticates user using Mobile OR Name + Password
 */
function authenticateUser(loginKey, password) {
  const members = getActiveDatabase();
  if (!loginKey) return { success: false, message: "Please enter your name or mobile number." };
  const cleanKey = loginKey.trim().toLowerCase();
  
  const matched = members.find(m => {
    const fName = m.firstName ? m.firstName.toString().trim() : "";
    const lName = m.lastName ? m.lastName.toString().trim() : "";
    const fullName = `${fName} ${lName}`.toLowerCase().trim();
    const firstOnly = fName.toLowerCase();
    const mobileNo = m.mobile ? m.mobile.toString().trim() : "";
    const email = m.email ? m.email.toString().toLowerCase().trim() : "";
    
    return fullName === cleanKey || firstOnly === cleanKey || mobileNo === cleanKey || email === cleanKey;
  });

  if (!matched) {
    return { success: false, message: "Member name or mobile number not registered." };
  }

  // Support default password for old seed profiles
  const correctPassword = matched.password ? matched.password.toString() : "vansh2025";
  const inputPassword = password ? password.toString() : "";
  if (inputPassword === correctPassword) {
    if (matched.verified === false) {
      return { success: false, message: "Your account is pending admin approval." };
    }
    login(matched.id, `${matched.firstName || "Member"} ${matched.lastName || ""}`);
    return { success: true, member: matched };
  } else {
    return { success: false, message: "Incorrect password. Please try again." };
  }
}

/**
 * Registers a brand new family member and logs them in
 */
function registerUser(firstName, lastName, email, password, details = {}) {
  const members = getActiveDatabase();
  
  const cleanEmail = email ? email.toString().toLowerCase().trim() : "";
  // Check if email already exists
  if (cleanEmail && members.some(m => m.email && m.email.toString().toLowerCase().trim() === cleanEmail)) {
    return { success: false, message: "A member with this email is already registered." };
  }

  // Calculate next ID defensively
  const maxId = members.reduce((max, m) => {
    if (!m.id) return max;
    const n = parseInt(m.id.toString().replace('P', ''));
    return !isNaN(n) && n > max ? n : max;
  }, 0);
  const nextId = 'P' + (maxId + 1);

  // Generate unique username
  const baseUsername = (firstName.trim() + "_" + lastName.trim()).toLowerCase().replace(/[^a-z0-9_]/g, '');
  let newUsername = baseUsername || "user";
  let counter = 1;
  while (members.some(m => m.username === newUsername)) {
    newUsername = baseUsername + counter;
    counter++;
  }

  const newMember = {
    id: nextId,
    username: newUsername,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: cleanEmail,
    password: password,
    gender: details.gender || "M",
    age: parseInt(details.age) || 25,
    caste: details.caste || "Brahmin",
    subCaste: details.subCaste || "",
    gotra: details.gotra || "Kashyap",
    nativePlace: details.nativePlace || "",
    parents: [],
    spouse: null,
    verified: true, // Auto-verified in local prototype
    gen: 2, // Default to Generation 2
    bio: "Lineage heir registered via production gateway.",
    education: details.education || "",
    occupation: details.occupation || "Network Member"
  };

  members.push(newMember);
  localStorage.setItem(DATABASE_KEY, JSON.stringify(members));
  
  // Log them in immediately
  login(newMember.id, newUsername);
  return { success: true, member: newMember, message: "Registration successful. Welcome to Vansh!" };
}
