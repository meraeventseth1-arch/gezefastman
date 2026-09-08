// POST /api/admin-login
// Body: { password }
// Checks the password against ADMIN_PASSWORD (never sent to the browser
// to compare against) and, on success, sets a signed HttpOnly session
// cookie. Nothing about the password or session lives in client-side JS.

const crypto = require("crypto");
const { createSessionCookie } = require("./_adminSession");

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) {
      res
        .status(500)
        .json({ error: "ADMIN_PASSWORD is not configured on the server." });
      return;
    }

    const { password } = req.body || {};
    if (!password || !safeEqual(password, expected)) {
      res.status(401).json({ error: "Wrong password." });
      return;
    }

    res.setHeader("Set-Cookie", createSessionCookie());
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("admin-login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
