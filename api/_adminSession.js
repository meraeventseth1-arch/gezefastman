// Signed, HttpOnly admin session cookie helpers.
//
// No session store/database needed: the cookie's value is
// "<expiry-timestamp>.<hmac-signature>". On each request we recompute the
// HMAC over the expiry with ADMIN_SESSION_SECRET and compare — if it
// matches and hasn't expired, the session is valid. Because the browser
// never sees the secret and the cookie is HttpOnly, there's nothing for
// client-side JS (or an attacker reading it) to read or forge.

const crypto = require("crypto");

const COOKIE_NAME = "admin_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "ADMIN_SESSION_SECRET is not set. Add it in Vercel → Settings → Environment Variables and redeploy."
    );
  }
  return secret;
}

function sign(value) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

function createSessionCookie() {
  const expiry = Date.now() + SESSION_TTL_MS;
  const value = `${expiry}.${sign(String(expiry))}`;
  const maxAgeSeconds = Math.floor(SESSION_TTL_MS / 1000);
  return `${COOKIE_NAME}=${value}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAgeSeconds}`;
}

function clearSessionCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

function parseCookies(req) {
  const header = req.headers.cookie || "";
  const out = {};
  header.split(";").forEach((pair) => {
    const idx = pair.indexOf("=");
    if (idx === -1) return;
    const key = pair.slice(0, idx).trim();
    const val = pair.slice(idx + 1).trim();
    if (key) out[key] = decodeURIComponent(val);
  });
  return out;
}

function isValidSession(req) {
  const cookies = parseCookies(req);
  const raw = cookies[COOKIE_NAME];
  if (!raw) return false;

  const dotIdx = raw.indexOf(".");
  if (dotIdx === -1) return false;

  const expiryStr = raw.slice(0, dotIdx);
  const signature = raw.slice(dotIdx + 1);
  const expiry = Number(expiryStr);
  if (!expiry || Number.isNaN(expiry)) return false;
  if (Date.now() > expiry) return false;

  const expected = sign(expiryStr);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

module.exports = {
  createSessionCookie,
  clearSessionCookie,
  isValidSession,
};
