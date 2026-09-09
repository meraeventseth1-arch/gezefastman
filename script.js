// ---------- Sale countdown ----------

// Ticket sales CLOSE at Pagume 5, 12:00 PM Addis Ababa time (East
// Africa Time, UTC+3, no daylight saving). Pagume 5, 2018 E.C. falls
// on September 10, 2026 in the Gregorian calendar — the day the
// countdown counts down to. Adjust this if sales should close closer
// to doors-open time instead.
const SALE_END = new Date("2026-09-10T20:00:00+03:00");

function initCountdown() {
  const wrap = document.getElementById("countdown");
  const buyBtn = document.getElementById("buy-tickets-btn");
  const daysEl = document.getElementById("cd-days");
  const hoursEl = document.getElementById("cd-hours");
  const minsEl = document.getElementById("cd-mins");
  const secsEl = document.getElementById("cd-secs");

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  // Hero bar countdown elements
  const heroCd = document.getElementById("hero-countdown");
  const hcdDays = document.getElementById("hcd-days");
  const hcdHours = document.getElementById("hcd-hours");
  const hcdMins = document.getElementById("hcd-mins");
  const hcdSecs = document.getElementById("hcd-secs");

  // Sticky top-of-page countdown (lives in the language bar, so it
  // stays visible while scrolling — unlike the hero one, which scrolls
  // away with the banner image).
  const topCd = document.getElementById("top-countdown");
  const tcdDays = document.getElementById("tcd-days");
  const tcdHours = document.getElementById("tcd-hours");
  const tcdMins = document.getElementById("tcd-mins");
  const tcdSecs = document.getElementById("tcd-secs");

  function tick() {
    const diff = SALE_END.getTime() - Date.now();

    if (diff <= 0) {
      clearInterval(timer);
      wrap.hidden = true;
      if (heroCd) heroCd.hidden = true;
      if (topCd) topCd.hidden = true;
      buyBtn.disabled = true;
      buyBtn.setAttribute("data-i18n", "buy_button_ended");
      buyBtn.textContent = t("buy_button_ended");
      const topBuyBtn = document.getElementById("top-buy-btn");
      if (topBuyBtn) {
        topBuyBtn.disabled = true;
        topBuyBtn.setAttribute("data-i18n", "buy_button_ended");
        topBuyBtn.textContent = t("buy_button_ended");
      }
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    daysEl.textContent = pad(days);
    hoursEl.textContent = pad(hours);
    minsEl.textContent = pad(mins);
    secsEl.textContent = pad(secs);

    // Mirror to hero bar
    if (hcdDays) hcdDays.textContent = pad(days);
    if (hcdHours) hcdHours.textContent = pad(hours);
    if (hcdMins) hcdMins.textContent = pad(mins);
    if (hcdSecs) hcdSecs.textContent = pad(secs);

    // Mirror to sticky top bar
    if (tcdDays) tcdDays.textContent = pad(days);
    if (tcdHours) tcdHours.textContent = pad(hours);
    if (tcdMins) tcdMins.textContent = pad(mins);
    if (tcdSecs) tcdSecs.textContent = pad(secs);
  }

  tick();
  const timer = setInterval(tick, 1000);
}

// ---------- Buy Tickets modal ----------

function initModal() {
  const overlay = document.getElementById("modal-overlay");
  const buyBtn = document.getElementById("buy-tickets-btn");
  const heroBuyBtn = document.getElementById("hero-buy-btn");
  const topBuyBtn = document.getElementById("top-buy-btn");
  const closeBtn = document.getElementById("modal-close");

  function openModal() {
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    overlay.hidden = true;
    document.body.style.overflow = "";
    stopStatusPolling();
  }

  buyBtn.addEventListener("click", () => {
    if (!buyBtn.disabled) openModal();
  });

  // Hero button mirrors the in-section Buy Tickets button — same
  // disabled state (sales-closed), same modal, no more scroll-to-form.
  heroBuyBtn?.addEventListener("click", () => {
    if (!buyBtn.disabled) openModal();
  });

  // Sticky top-corner button — same behaviour, always reachable
  // without scrolling since it lives in the sticky lang bar.
  topBuyBtn?.addEventListener("click", () => {
    if (!buyBtn.disabled) openModal();
  });

  closeBtn.addEventListener("click", closeModal);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !overlay.hidden) closeModal();
  });
}

// ---------- Order form ----------

// "First Wave" (600 ETB) is sold out and shown for reference only —
// it's not a purchasable key here. Buyers choose from these three:
const PACKAGE_PRICES_ETB = { gate: 1500, vip: 2500, vvip: 8000 };
const PACKAGE_ORDER = ["gate", "vip", "vvip"];
const MIN_TICKETS = 1;
const MAX_TICKETS_PER_ORDER = 10;

function formatEtb(amount) {
  return amount.toLocaleString() + " ETB";
}

// Compress an uploaded image to a reasonable size before storing it
// as a data URL (Firestore documents cap out at 1MB).
function compressImage(file, maxWidth = 1000, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function initOrderForm() {
  const form = document.getElementById("order-form");
  const picker = document.getElementById("ticket-picker");
  const hintEl = document.getElementById("ticket-picker-hint");
  const totalEl = document.getElementById("order-total");
  const errorEl = document.getElementById("order-error");
  const submitBtn = document.getElementById("order-submit");
  const container = document.getElementById("order-form-container");

  const qty = { gate: 1, vip: 0, vvip: 0 };
  const valueEls = {
    gate: document.getElementById("qty-gate"),
    vip: document.getElementById("qty-vip"),
    vvip: document.getElementById("qty-vvip"),
  };
  const rowEls = {
    gate: picker.querySelector('[data-package="gate"]'),
    vip: picker.querySelector('[data-package="vip"]'),
    vvip: picker.querySelector('[data-package="vvip"]'),
  };

  function total() {
    return qty.gate + qty.vip + qty.vvip;
  }

  function render() {
    PACKAGE_ORDER.forEach((pkg) => {
      valueEls[pkg].textContent = qty[pkg];
      rowEls[pkg].classList.toggle("ticket-picker__row--active", qty[pkg] > 0);
    });

    picker.querySelectorAll("[data-decrease]").forEach((btn) => {
      btn.disabled = qty[btn.dataset.decrease] <= 0;
    });

    picker.querySelectorAll("[data-increase]").forEach((btn) => {
      btn.disabled = total() >= MAX_TICKETS_PER_ORDER;
    });

    const totalEtb = PACKAGE_ORDER.reduce(
      (sum, pkg) => sum + qty[pkg] * PACKAGE_PRICES_ETB[pkg],
      0
    );
    totalEl.textContent = formatEtb(totalEtb);

    if (total() >= MAX_TICKETS_PER_ORDER) {
      hintEl.textContent = t("ticket_picker_hint_limit");
      hintEl.classList.add("ticket-picker__hint--limit");
    } else {
      hintEl.textContent = t("ticket_picker_hint");
      hintEl.classList.remove("ticket-picker__hint--limit");
    }
  }

  picker.querySelectorAll("[data-increase]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const pkg = btn.dataset.increase;
      if (total() >= MAX_TICKETS_PER_ORDER) return;
      qty[pkg] += 1;
      render();
    });
  });

  picker.querySelectorAll("[data-decrease]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const pkg = btn.dataset.decrease;
      if (qty[pkg] <= 0) return;
      qty[pkg] -= 1;
      render();
    });
  });

  render();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.hidden = true;

    const payload = {
      fullName: document.getElementById("fullName").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      tickets: { gate: qty.gate, vip: qty.vip, vvip: qty.vvip },
    };

    if (!payload.fullName || !payload.phone) {
      errorEl.textContent = t("form_error_required");
      errorEl.hidden = false;
      return;
    }

    // Ethiopian phone: must start with 09 or 07 and be exactly 10 digits
    const phoneDigits = payload.phone.replace(/\D/g, "");
    const validPhone = /^(09|07)\d{8}$/.test(phoneDigits);
    if (!validPhone) {
      errorEl.textContent =
        "Phone number must start with 09 or 07 and be 10 digits (e.g. 0912345678).";
      errorEl.hidden = false;
      return;
    }
    payload.phone = phoneDigits;

    if (total() < MIN_TICKETS) {
      errorEl.textContent = t("form_error_no_tickets");
      errorEl.hidden = false;
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = t("submit_button_loading");

    try {
      // Talks to /api/checkout (a Vercel serverless function, see
      // /api/checkout.js).
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Server error");

      const data = await res.json();
      finishOrder(container, data.reference, payload);
    } catch (err) {
      errorEl.textContent = t("form_error_network");
      errorEl.hidden = false;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = t("submit_button");
    }
  });
}

function finishOrder(container, reference, payload) {
  // Calculate total from payload so we can show the exact amount to deposit
  const totalEtb = PACKAGE_ORDER.reduce(
    (sum, pkg) => sum + (payload.tickets[pkg] || 0) * PACKAGE_PRICES_ETB[pkg],
    0
  );

  container.innerHTML = `
    <div class="order__success order__success--payment">
      <h3>${t("success_heading")}</h3>
      <p>${t("success_ref_label")}</p>
      <p class="order__ref">${reference}</p>

      <div class="telebirr-box">
        <div class="telebirr-box__header">
          <div class="telebirr-box__header-text">
            <div class="telebirr-box__header-title">Deposit via Telebirr</div>
            <div class="telebirr-box__header-sub">Send payment to the number below</div>
          </div>
        </div>
        <div class="telebirr-box__body">
          <div class="telebirr-box__row">
            <span class="telebirr-box__label">Account name</span>
            <span class="telebirr-box__value">Addis Zemen (New Year)</span>
          </div>
          <div class="telebirr-box__row">
            <span class="telebirr-box__label">Telebirr number</span>
            <span class="telebirr-box__value telebirr-box__value--number">0958684843</span>
          </div>
          <div class="telebirr-box__amount">
            <span class="telebirr-box__amount-label">Amount to send</span>
            <span class="telebirr-box__amount-value">${totalEtb.toLocaleString()} ETB</span>
          </div>
        </div>
      </div>

      <div class="screenshot-upload" id="screenshot-upload">
        <label for="screenshot-input">${t("screenshot_label")}</label>
        <div class="screenshot-upload__drop" id="screenshot-drop" onclick="document.getElementById('screenshot-input').click()">
          <span class="screenshot-upload__icon">📎</span>
          <span class="screenshot-upload__text" id="screenshot-filename">Tap to attach payment screenshot</span>
        </div>
        <input type="file" id="screenshot-input" accept="image/*" style="display:none" />
        <button class="btn btn--ghost" type="button" id="screenshot-submit" disabled style="opacity:0.4;cursor:not-allowed;">
          ${t("screenshot_button")}
        </button>
        <p class="order__error" id="screenshot-error" hidden></p>
      </div>
    </div>
  `;

  initScreenshotUpload(container, reference, payload);
}

function initScreenshotUpload(container, reference, payload) {
  const input = document.getElementById("screenshot-input");
  const submitBtn = document.getElementById("screenshot-submit");
  const errorEl = document.getElementById("screenshot-error");
  const uploadBox = document.getElementById("screenshot-upload");
  const filenameEl = document.getElementById("screenshot-filename");
  const dropEl = document.getElementById("screenshot-drop");

  // Enable submit only once a file is chosen
  input.addEventListener("change", () => {
    const file = input.files && input.files[0];
    if (file) {
      submitBtn.disabled = false;
      submitBtn.style.opacity = "1";
      submitBtn.style.cursor = "pointer";
      if (filenameEl) filenameEl.textContent = "✓ " + file.name;
      if (dropEl) dropEl.classList.add("screenshot-upload__drop--chosen");
    } else {
      submitBtn.disabled = true;
      submitBtn.style.opacity = "0.4";
      submitBtn.style.cursor = "not-allowed";
      if (filenameEl)
        filenameEl.textContent = "Tap to attach payment screenshot";
      if (dropEl) dropEl.classList.remove("screenshot-upload__drop--chosen");
    }
  });

  submitBtn.addEventListener("click", async () => {
    errorEl.hidden = true;
    const file = input.files && input.files[0];

    if (!file) {
      errorEl.textContent = t("screenshot_error_none");
      errorEl.hidden = false;
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = t("screenshot_button_loading");

    try {
      const dataUrl = await compressImage(file);

      const res = await fetch("/api/upload-screenshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, screenshotBase64: dataUrl }),
      });

      if (!res.ok) throw new Error("Server error");

      startStatusPolling(container, reference, payload);
    } catch (err) {
      errorEl.textContent = t("screenshot_error_read");
      errorEl.hidden = false;
      submitBtn.disabled = false;
      submitBtn.textContent = t("screenshot_button");
    }
  });
}

// ---------- Live status polling + ticket ----------
//
// After the screenshot is uploaded, the buyer's own browser polls
// /api/order-status (public, keyed by reference+phone) so the ticket
// appears here the instant an admin approves the order — no login
// needed. Only runs while this modal/page stays open.

const STATUS_POLL_INTERVAL_MS = 5000;
const STATUS_POLL_TIMEOUT_MS = 45 * 60 * 1000; // give up nagging the server after 45 min
let statusPollTimer = null;

function stopStatusPolling() {
  if (statusPollTimer) {
    clearInterval(statusPollTimer);
    statusPollTimer = null;
  }
}

function startStatusPolling(container, reference, payload) {
  container.innerHTML = `
    <div class="order__success order__waiting" id="status-waiting">
      <div class="spinner" aria-hidden="true"></div>
      <h3>${t("waiting_heading")}</h3>
      <p>${t("waiting_body")}</p>
      <p class="order__ref">${reference}</p>
      <p class="order__error" id="status-error" hidden></p>
    </div>
  `;

  const startedAt = Date.now();

  async function poll() {
    if (Date.now() - startedAt > STATUS_POLL_TIMEOUT_MS) {
      stopStatusPolling();
      const waitingEl = document.getElementById("status-waiting");
      if (waitingEl) {
        waitingEl.querySelector(".spinner")?.remove();
        waitingEl.querySelector("p").textContent = t("waiting_timeout");
      }
      return;
    }

    try {
      const url = `/api/order-status?reference=${encodeURIComponent(
        reference
      )}&phone=${encodeURIComponent(payload.phone)}`;
      const res = await fetch(url);
      if (!res.ok) return; // transient network/server hiccup — just try again next tick

      const order = await res.json();

      if (order.status === "approved") {
        stopStatusPolling();
        renderTicket(container, order);
      } else if (order.status === "rejected") {
        stopStatusPolling();
        renderRejected(container, order);
      }
      // pending_payment / pending_review: keep waiting silently
    } catch (err) {
      const errorEl = document.getElementById("status-error");
      if (errorEl) {
        errorEl.textContent = t("status_check_error");
        errorEl.hidden = false;
      }
    }
  }

  poll();
  statusPollTimer = setInterval(poll, STATUS_POLL_INTERVAL_MS);
}

function renderRejected(container, order) {
  container.innerHTML = `
    <div class="order__success">
      <h3>${t("rejected_heading")}</h3>
      <p>${t("rejected_body")}</p>
      <p class="order__ref">${order.reference}</p>
    </div>
  `;
}

const PACKAGE_LABELS = {
  gate: () => t("package_gate_name"),
  vip: () => t("package_vip_name"),
  vvip: () => t("package_vvip_name"),
};

function renderTicket(container, order) {
  const seats = buildSeatList(order);

  container.innerHTML = `
    <div class="tickets-result">
      <h3 class="tickets-result__heading">${t("tickets_ready_heading")}</h3>
      <p class="ticket__save-hint">${t("ticket_save_hint")}</p>
      <div class="tickets-result__list">
        ${seats.map((seat) => ticketCardHtml(order, seat)).join("")}
      </div>
    </div>
  `;

  seats.forEach((seat) => {
    const qrHost = document.getElementById(`ticket-qr-${seat.seatId}`);
    if (!qrHost) return;

    const verifyUrl = `${location.origin}/verify?ref=${encodeURIComponent(
      order.reference
    )}&seat=${encodeURIComponent(seat.seatId)}&phone=${encodeURIComponent(
      order.phone
    )}`;

    try {
      qrHost.innerHTML = makeQrSvg(verifyUrl);
    } catch (e) {
      qrHost.textContent = seat.seatId;
    }

    const downloadBtn = document.getElementById(
      `ticket-download-${seat.seatId}`
    );
    downloadBtn?.addEventListener("click", async () => {
      downloadBtn.disabled = true;
      const originalText = downloadBtn.textContent;
      downloadBtn.textContent = t("ticket_download_loading");
      try {
        await downloadTicketImage(order, seat, verifyUrl);
      } catch (e) {
        // If canvas rendering fails for any reason, the ticket is still
        // fully visible on-screen — screenshotting it still works fine.
      } finally {
        downloadBtn.disabled = false;
        downloadBtn.textContent = originalText;
      }
    });
  });
}

// Builds a downloadable PNG of one ticket from scratch on a <canvas> —
// deliberately not a screenshot of the DOM. It doesn't pixel-match the
// on-screen card exactly, but carries the same info and QR code, which
// is what actually matters at the door.
function downloadTicketImage(order, seat, verifyUrl) {
  return new Promise((resolve, reject) => {
    const W = 1000;
    const H = 600;
    const SPLIT = 380;

    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");

    const packageLabel = PACKAGE_LABELS[seat.packageType]
      ? PACKAGE_LABELS[seat.packageType]()
      : seat.packageType;
    const isPremium = seat.packageType === "vip" || seat.packageType === "vvip";

    const poster = new Image();
    poster.crossOrigin = "anonymous";

    poster.onload = () => {
      try {
        // Left panel: poster image, cropped to cover
        const scale = Math.max(SPLIT / poster.width, H / poster.height);
        const pw = poster.width * scale;
        const ph = poster.height * scale;
        const px = (SPLIT - pw) * 0.08;
        const py = (H - ph) * 0.12;
        ctx.drawImage(poster, px, py, pw, ph);

        // Right panel: navy gradient
        const grad = ctx.createLinearGradient(SPLIT, 0, W, H);
        grad.addColorStop(0, "#1a3363");
        grad.addColorStop(0.6, "#10254a");
        grad.addColorStop(1, "#060d1e");
        ctx.fillStyle = grad;
        ctx.fillRect(SPLIT, 0, W - SPLIT, H);

        // Dashed divider
        ctx.strokeStyle = "rgba(217, 164, 65, 0.5)";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(SPLIT, 0);
        ctx.lineTo(SPLIT, H);
        ctx.stroke();
        ctx.setLineDash([]);

        const padX = SPLIT + 36;
        let y = 56;

        ctx.fillStyle = "#d9a441";
        ctx.font = "700 15px 'Work Sans', Arial";
        ctx.fillText(t("ticket_eyebrow").toUpperCase(), padX, y);

        y += 32;
        ctx.fillStyle = "#f3ecdd";
        ctx.font = "600 26px Georgia, serif";
        ctx.fillText(t("ticket_subheading"), padX, y);

        // Badge
        y += 34;
        ctx.font = "700 13px 'Work Sans', Arial";
        const badgeText = packageLabel;
        const badgeW = ctx.measureText(badgeText).width + 28;
        ctx.fillStyle = isPremium
          ? "rgba(217, 164, 65, 0.2)"
          : "rgba(147, 164, 196, 0.16)";
        roundRect(ctx, padX, y - 18, badgeW, 28, 14);
        ctx.fill();
        if (isPremium) {
          ctx.strokeStyle = "#d9a441";
          ctx.lineWidth = 1;
          roundRect(ctx, padX, y - 18, badgeW, 28, 14);
          ctx.stroke();
        }
        ctx.fillStyle = isPremium ? "#f0c36b" : "#f3ecdd";
        ctx.fillText(badgeText, padX + 14, y);

        // Divider
        y += 26;
        ctx.strokeStyle = "rgba(243, 236, 221, 0.2)";
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.moveTo(padX, y);
        ctx.lineTo(W - 36, y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Fields
        const fields = [
          [t("ticket_name_label"), order.fullName],
          [t("ticket_phone_label"), order.phone],
          [t("ticket_id_label"), seat.seatId],
        ];
        y += 30;
        fields.forEach(([label, value]) => {
          ctx.fillStyle = "#d9a441";
          ctx.font = "700 11px 'Work Sans', Arial";
          ctx.fillText(label.toUpperCase(), padX, y);
          y += 20;
          ctx.fillStyle = "#f3ecdd";
          ctx.font = "500 18px 'Work Sans', Arial";
          ctx.fillText(String(value), padX, y);
          y += 26;
        });

        // QR
        const qrSvg = makeQrSvg(verifyUrl);
        const qrImg = new Image();
        const qrSize = 170;
        const qrX = padX;
        const qrY = H - qrSize - 60;

        qrImg.onload = () => {
          ctx.fillStyle = "#f3ecdd";
          roundRect(ctx, qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 6);
          ctx.fill();
          ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

          ctx.fillStyle = "#93a4c4";
          ctx.font = "600 11px 'Work Sans', Arial";
          ctx.fillText(
            t("ticket_scan_label").toUpperCase(),
            qrX,
            qrY + qrSize + 26
          );

          finish();
        };
        qrImg.onerror = finish; // still download the card even if the QR image fails
        qrImg.src =
          "data:image/svg+xml;charset=utf-8," + encodeURIComponent(qrSvg);

        function finish() {
          canvas.toBlob((blob) => {
            if (!blob) return reject(new Error("toBlob failed"));
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `ticket-${seat.seatId}.png`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            resolve();
          }, "image/png");
        }
      } catch (e) {
        reject(e);
      }
    };

    poster.onerror = () => reject(new Error("Could not load poster image"));
    poster.src = "images/hero-group-main.jpg";
  });
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Every ticket TYPE bought (Gate + VIP + VVIP) can be bought together in
// one order, and each individual ticket gets its own seat ID + QR code —
// so a group of friends can each show their own scannable ticket at the
// door instead of passing around one shared code for the whole order.
// Seat IDs use G/V/W prefixes for Gate/VIP/VVIP respectively.
function buildSeatList(order) {
  const tickets = order.tickets || { gate: order.quantity || 1 };
  const seats = [];

  for (let i = 1; i <= (tickets.gate || 0); i++) {
    seats.push({ seatId: `${order.reference}-G${i}`, packageType: "gate" });
  }
  for (let i = 1; i <= (tickets.vip || 0); i++) {
    seats.push({ seatId: `${order.reference}-V${i}`, packageType: "vip" });
  }
  for (let i = 1; i <= (tickets.vvip || 0); i++) {
    seats.push({ seatId: `${order.reference}-W${i}`, packageType: "vvip" });
  }

  return seats;
}

function ticketCardHtml(order, seat) {
  const packageLabel = PACKAGE_LABELS[seat.packageType]
    ? PACKAGE_LABELS[seat.packageType]()
    : seat.packageType;

  return `
    <div class="ticket">
      <div class="ticket__main">
        <img class="ticket__poster" src="images/hero-group-main.jpg" alt="" />
      </div>

      <div class="ticket__stub">
        <p class="ticket__eyebrow">${t("ticket_eyebrow")}</p>
        <h3 class="ticket__heading">${t("ticket_subheading")}</h3>
        <span class="ticket__badge ticket__badge--${
          seat.packageType
        }">${packageLabel}</span>

        <dl class="ticket__fields">
          <div>
            <dt>${t("ticket_name_label")}</dt>
            <dd>${escapeHtml(order.fullName)}</dd>
          </div>
          <div>
            <dt>${t("ticket_phone_label")}</dt>
            <dd>${escapeHtml(order.phone)}</dd>
          </div>
          <div>
            <dt>${t("ticket_id_label")}</dt>
            <dd class="ticket__id">${escapeHtml(seat.seatId)}</dd>
          </div>
        </dl>

        <div class="ticket__qr" id="ticket-qr-${seat.seatId}"></div>
        <p class="ticket__scan-label">${t("ticket_scan_label")}</p>
        <button class="btn btn--ghost ticket__download-btn" type="button" id="ticket-download-${
          seat.seatId
        }">
          ${t("ticket_download_button")}
        </button>
      </div>
    </div>
  `;
}

// The vendored qrcode-generator library (vendor/qrcode.min.js, global
// `qrcode`) needs an explicit "type number" (roughly, QR code size/
// capacity) rather than picking one automatically — it throws if the
// text doesn't fit the requested size. So we just try increasing sizes
// until one fits, same as the library's own official demos do.
//
// We build the <svg> ourselves from the module grid (qr.isDark(row,col))
// instead of using the library's own createSvgTag(): that helper emits a
// fixed-pixel SVG with NO viewBox, so once CSS resizes it to fit the
// ticket layout, browsers have nothing to scale the drawing coordinates
// against — the QR can end up clipped or blank depending on the browser.
// A real viewBox tied to the module count fixes that for good.
function makeQrSvg(text) {
  for (let typeNumber = 1; typeNumber <= 20; typeNumber++) {
    try {
      const qr = qrcode(typeNumber, "M");
      qr.addData(text);
      qr.make();

      const count = qr.getModuleCount();
      let path = "";
      for (let row = 0; row < count; row++) {
        for (let col = 0; col < count; col++) {
          if (qr.isDark(row, col)) {
            path += `M${col},${row}h1v1h-1z`;
          }
        }
      }

      return (
        `<svg viewBox="0 0 ${count} ${count}" xmlns="http://www.w3.org/2000/svg" ` +
        `shape-rendering="crispEdges" preserveAspectRatio="xMidYMid meet">` +
        `<rect width="${count}" height="${count}" fill="#ffffff"/>` +
        `<path d="${path}" fill="#111"/></svg>`
      );
    } catch (e) {
      // too small for this typeNumber — try the next size up
    }
  }
  throw new Error("Could not generate QR code");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", () => {
  initCountdown();
  initModal();
  initOrderForm();
});
