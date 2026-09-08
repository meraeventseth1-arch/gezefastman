// POST /api/checkout
// Body: { fullName, phone, tickets: { gate, vip, vvip } }
// Creates a new order in Firestore (status: pending_payment) and returns
// its reference number, which the buyer uses to pay via Telebirr and
// later to check on their order.

const { getDb } = require("./_firebaseAdmin");

const PACKAGE_PRICES_ETB = { gate: 1500, vip: 2500, vvip: 8000 };
const MAX_TICKETS_PER_ORDER = 10;

function makeReference() {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `EVE-${rand}`;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { fullName, phone, tickets } = req.body || {};

    if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
      res.status(400).json({ error: "Full name is required." });
      return;
    }

    const phoneDigits = String(phone || "").replace(/\D/g, "");
    if (!/^(09|07)\d{8}$/.test(phoneDigits)) {
      res.status(400).json({ error: "Invalid phone number." });
      return;
    }

    const gate = Number(tickets?.gate) || 0;
    const vip = Number(tickets?.vip) || 0;
    const vvip = Number(tickets?.vvip) || 0;
    const total = gate + vip + vvip;

    if (
      total < 1 ||
      total > MAX_TICKETS_PER_ORDER ||
      gate < 0 ||
      vip < 0 ||
      vvip < 0
    ) {
      res.status(400).json({ error: "Invalid ticket quantities." });
      return;
    }

    const totalEtb =
      gate * PACKAGE_PRICES_ETB.gate +
      vip * PACKAGE_PRICES_ETB.vip +
      vvip * PACKAGE_PRICES_ETB.vvip;

    const db = getDb();
    const reference = makeReference();

    await db
      .collection("orders")
      .doc(reference)
      .set({
        reference,
        fullName: fullName.trim().slice(0, 120),
        phone: phoneDigits,
        tickets: { gate, vip, vvip },
        totalEtb,
        status: "pending_payment",
        screenshotUrl: null,
        createdAt: new Date().toISOString(),
      });

    res.status(200).json({ reference });
  } catch (err) {
    console.error("checkout error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// -----------------------------------------------------------------
// A real payment gateway (e.g. SantimPay) is NOT wired up here — orders
// are paid manually via Telebirr and confirmed by an admin. If/when a
// gateway goes in, the suggested shape is:
//   1. After creating the order above, call the gateway's API to create
//      a payment session for `totalEtb`, passing `reference` as the
//      order ID.
//   2. Redirect the buyer to the session's checkout URL instead of
//      showing the Telebirr deposit box.
//   3. Add a webhook endpoint (e.g. /api/payment-webhook) that the
//      gateway calls on success/failure, which flips the order's
//      status directly instead of waiting on a manual screenshot review.
// -----------------------------------------------------------------
