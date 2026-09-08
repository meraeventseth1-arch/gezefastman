// POST /api/admin-order-action
// Body: { reference, status } where status is one of
// "approved" | "rejected" | "pending_review"
// Requires a valid admin session cookie — otherwise 401.

const { getDb } = require("./_firebaseAdmin");
const { isValidSession } = require("./_adminSession");

const ALLOWED_STATUSES = ["approved", "rejected", "pending_review"];

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!isValidSession(req)) {
    res.status(401).json({ error: "Not authenticated." });
    return;
  }

  try {
    const { reference, status } = req.body || {};

    if (!reference || !ALLOWED_STATUSES.includes(status)) {
      res.status(400).json({ error: "Invalid reference or status." });
      return;
    }

    const db = getDb();
    const ref = db.collection("orders").doc(reference);
    const snap = await ref.get();

    if (!snap.exists) {
      res.status(404).json({ error: "Order not found." });
      return;
    }

    await ref.update({
      status,
      reviewedAt: new Date().toISOString(),
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("admin-order-action error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
