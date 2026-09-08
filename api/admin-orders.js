// GET /api/admin-orders
// Lists every order, newest first. Requires a valid admin session
// cookie (set by /api/admin-login) — otherwise 401.

const { getDb } = require("./_firebaseAdmin");
const { isValidSession } = require("./_adminSession");

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!isValidSession(req)) {
    res.status(401).json({ error: "Not authenticated." });
    return;
  }

  try {
    const db = getDb();
    const snap = await db
      .collection("orders")
      .orderBy("createdAt", "desc")
      .get();

    const orders = snap.docs.map((doc) => doc.data());
    res.status(200).json({ orders });
  } catch (err) {
    console.error("admin-orders error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
