// Shared Firebase Admin SDK init, reused across every /api/*.js function.
//
// Reads the full service account JSON from the FIREBASE_SERVICE_ACCOUNT_KEY
// env var (Vercel → Settings → Environment Variables), minified to one line.
// Get this from Firebase Console → Project Settings → Service Accounts →
// Generate new private key. Never commit this file's contents to git.

const admin = require("firebase-admin");

function getApp() {
  if (admin.apps.length) return admin.apps[0];

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY is not set. Add it in Vercel → Settings → Environment Variables and redeploy."
    );
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(raw);
  } catch (e) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON. Paste the full service account file contents, minified to one line."
    );
  }

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

function getDb() {
  getApp();
  return admin.firestore();
}

module.exports = { admin, getApp, getDb };
