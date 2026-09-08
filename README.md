# Enkutatash Concert — Ghion Hotel (plain HTML/CSS/JS)

Landing page + ticket order form for the Enkutatash Concert at Ghion
Hotel, Pagume 5 (September 10), featuring Efrem Tamiru, Gossaye
Tesfaye, Leul Sisay, MC Siyamregn and Milu. Presented by Fanta x Mera
Events.

No build step, no framework — just HTML, CSS and JS you can open and
edit directly, backed by Firestore + Vercel serverless functions.

## Files

```
index.html                the landing page + order form
admin.html                 admin panel (server-side login)
verify.html                 door-scan ticket verification page
styles.css                  shared design system
admin.css                   admin panel-specific styles
script.js                   countdown + order form + screenshot upload + tickets
admin.js                     admin panel logic (approve/reject)
i18n.js                      English / Amharic text
firestore.rules              locks Firestore to server-only access
vendor/qrcode.min.js         MIT-licensed QR code generator (kazuhikoarase/qrcode-generator)
images/                      hero + lineup flyer images
api/_firebaseAdmin.js        shared Firebase Admin SDK init
api/_adminSession.js         signed admin session cookie helpers
api/checkout.js              creates the order in Firestore
api/upload-screenshot.js     saves the payment screenshot, flips to pending_review
api/order-status.js          public status lookup (reference + phone)
api/admin-login.js           checks password, sets session cookie
api/admin-logout.js          clears session cookie
api/admin-orders.js          lists all orders (admin-only)
api/admin-order-action.js    approve/reject/reset an order (admin-only)
```

## Tickets & pricing

Four tiers, per the event flyer:

| Tier | Price | Notes |
|---|---|---|
| First Wave | 600 ETB | **Sold out** — shown for reference only, not purchasable |
| At the Gate | 1,500 ETB | |
| VIP | 2,500 ETB | |
| VVIP | 8,000 ETB | Includes dinner, tire siga and tibs, with the closest seats to the stage |

Each ticket bought gets its own seat ID and QR code (`EVE-XXXXXX-G1`
for Gate, `-V1` for VIP, `-W1` for VVIP), so a group can each show
their own scannable ticket at the door. To change prices, edit
`PACKAGE_PRICES_ETB` in **both** `script.js` (client-side total/
display) and `api/checkout.js` (server-side — this is the number that
actually gets charged/recorded, so it's the one that matters for
security).

## Payment

Buyers pay manually via Telebirr to:
- **Account name:** Addis Zemen (New Year)
- **Number:** 0958684843

This is hardcoded in `script.js` (`finishOrder`). If the number or
account name changes, update it there.

## Language

English / አማርኛ toggle, sticky at the top. Swaps text via `data-i18n`
attributes and a dictionary in `i18n.js` — no build step, no separate
URLs. Remembered per-browser (localStorage).

**The Amharic text is a best-effort translation, not reviewed by a
native speaker** — have someone fluent check the wording in `i18n.js`
before this goes in front of real ticket buyers.

## Ticket sale countdown

Counts down to when sales **close** — Pagume 5, 12:00 PM Addis Ababa
time (September 10, 2026), the same day as the event. If sales should
actually close a few hours before doors open instead, change
`SALE_END` in `script.js`.

## Sponsor logos

The sponsor row (Fanta, Mera Events, Bedele Special, Ethio Telecom,
telebirr, ልዩ ድግስ) currently shows as plain text, the same way the
original template did — **no third-party logo image files are
bundled in this repo**, since official brand marks should come from
each sponsor's own press kit / brand guidelines page (or directly
from the sponsor) rather than being sourced by an AI assistant. To
swap in real logos:

1. Drop the logo image files into `images/sponsors/`.
2. In `index.html`, replace each `<span>Sponsor Name</span>` inside
   `.sponsor-row` with an `<img src="images/sponsors/xyz.png" alt="Sponsor Name" />`.
3. Add a bit of CSS (e.g. `max-height: 28px`) if they need sizing.

## Images

`images/` currently contains the flyer photos you uploaded, used
as-is for the hero banner and lineup section (same approach the
original template used — full promotional images, captioned with the
performer names). If you get individual clean portraits later, feel
free to swap them in for tighter crops.

## Admin panel

The password is checked **server-side** in `/api/admin-login`
(nothing to read in the page source). On success it sets a signed,
HttpOnly session cookie — no password or session token lives in the
browser's JS. Approve/reject buttons call `/api/admin-order-action`,
which also requires that session cookie.

**Set your admin password as an environment variable in Vercel**
(`ADMIN_PASSWORD`) — never hardcode it in any file. See below.

## Env vars required in Vercel (Settings → Environment Variables)

| Variable | Purpose |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Full service account JSON (minified to one line) — Firebase Console → Project Settings → Service Accounts → Generate new private key |
| `ADMIN_PASSWORD` | The password for `/admin.html` (`/manage`) |
| `ADMIN_SESSION_SECRET` | Any long random string — signs the admin session cookie |

Redeploy after adding/changing any of these. Never commit the service
account JSON to the repo.

**One thing still temporary:** screenshots are stored as a base64
data URL directly on the Firestore order doc (`screenshotUrl` field).
That works and ships fine, but Firestore docs cap out at 1MB and
there's no CDN/image optimization — swap this for a real Cloudinary
(or similar) upload later if you want (store the returned URL
instead). Everything downstream already just expects a URL string.

## Run locally

Just open `index.html` in a browser for layout/design work — no
install, no build step. The order form needs `/api/checkout` and
`/api/upload-screenshot` actually live, though (orders have to land
in Firestore for admin.html to see them). Use `vercel dev` to run the
API functions locally, or just test against your Vercel deployment.

## Deploy on Vercel

1. Push this folder to a GitHub repo (or drag it into a new Vercel
   project directly).
2. In Vercel: **New Project → Import** your repo. No framework preset
   needed — Vercel serves the HTML files as a static site and
   automatically turns everything in `api/` into live endpoints.
3. Add the three environment variables listed above before or right
   after the first deploy — without them, `/api/checkout` and the
   admin login will fail.
4. Deploy (or redeploy, if you added the env vars after the first
   one).

## Payment gateway — still manual

**No real payment gateway is wired up.** See the comment block at the
bottom of `api/checkout.js` for the suggested shape of a SantimPay (or
similar) integration. Buyers currently pay via Telebirr manually and
upload a screenshot for admin approval.
