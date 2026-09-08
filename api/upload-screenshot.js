// POST /api/upload-screenshot
// Body: { reference, screenshotBase64 }
// Saves the payment screenshot on the order doc and flips its status to
// pending_review so it shows up in /admin.html.
//
// TEMPORARY: screenshots are stored as a base64 data URL directly on the
// Firestore doc. That works and ships fine, but Firestore docs cap out
// at 1MB and there's no CDN/image optimization — swap this for a real
// upload service (e.g. Cloudinary: store the returned secure_url instead
// of the data URL) once that's wired in. Everything downstream
// (admin.html's <img> tags, the lightbox) already just expects a URL
// string, so that swap won't touch anything else.

const { getDb } = require("./_firebaseAdmin");

const MAX_BYTES = 900 * 1024; // leave headroom under Firestore's 1MB doc cap

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { reference, screenshotBase64 } = req.body || {};

    if (!reference || typeof reference !== "string") {
      res.status(400).json({ error: "Missing reference." });
      return;
    }
    if (
      !screenshotBase64 ||
      typeof screenshotBase64 !== "string" ||
      !screenshotBase64.startsWith("data:image/")
    ) {
      res.status(400).json({ error: "Missing or invalid screenshot." });
      return;
    }
    if (screenshotBase64.length > MAX_BYTES) {
      res.status(400).json({ error: "Screenshot is too large." });
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
      screenshotUrl: screenshotBase64,
      status: "pending_review",
      screenshotUploadedAt: new Date().toISOString(),
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("upload-screenshot error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
