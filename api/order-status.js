// GET /api/order-status?reference=EVE-XXXXXX&phone=09XXXXXXXX
// Public endpoint (no admin session needed) — keyed by BOTH reference
// and phone so a stranger can't check someone else's order just by
// guessing/incrementing reference numbers. Used by the buyer's own
// browser (polling for approval) and by /verify.html (door scanning).

const { getDb } = require("./_firebaseAdmin");

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const reference = String(req.query.reference || "");
    const phone = String(req.query.phone || "").replace(/\D/g, "");

    if (!reference || !phone) {
      res.status(400).json({ error: "Missing reference or phone." });
      return;
    }

    const db = getDb();
    const snap = await db.collection("orders").doc(reference).get();

    if (!snap.exists) {
      res.status(404).json({ error: "Order not found." });
      return;
    }

    const order = snap.data();

    if (order.phone !== phone) {
      // Don't reveal whether the reference exists if the phone doesn't
      // match — same response shape as a genuine 404.
      res.status(404).json({ error: "Order not found." });
      return;
    }

    res.status(200).json({
      reference: order.reference,
      fullName: order.fullName,
      phone: order.phone,
      tickets: order.tickets,
      totalEtb: order.totalEtb,
      status: order.status,
    });
  } catch (err) {
    console.error("order-status error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
