/* ═══════════════════════════════════════════════════════════════
   ROOTD. — Authentication Guard
   localStorage-based session management (no backend required)
   ═══════════════════════════════════════════════════════════════ */

const AUTH_KEY = 'rootd_auth';

/**
 * getAuthData() — Returns current auth session or null
 */
function getAuthData() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch(e) { return null; }
}

/**
 * login(userId, userName) — Create auth session
 */
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

/**
 * logout() — Destroy session and redirect to login
 */
function logout() {
  localStorage.removeItem(AUTH_KEY);
  window.location.href = 'login.html';
}

/**
 * requireAuth() — Redirect to login if no session
 * Call this at the top of every protected page's script.
 */
function requireAuth() {
  const auth = getAuthData();
  if (!auth) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

/**
 * isLoggedIn() — Check if user has active session
 */
function isLoggedIn() {
  return getAuthData() !== null;
}
