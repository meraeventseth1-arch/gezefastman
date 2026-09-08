// POST /api/admin-logout
// Clears the admin session cookie.

const { clearSessionCookie } = require("./_adminSession");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  res.setHeader("Set-Cookie", clearSessionCookie());
  res.status(200).json({ ok: true });
};
