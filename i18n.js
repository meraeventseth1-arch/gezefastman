// -----------------------------------------------------------------
// Simple English/Amharic toggle — no build step, no framework.
//
// Elements with data-i18n="key" get their textContent swapped based
// on the selected language. Dynamic strings generated in script.js
// (form errors, success messages) use the t(key) helper below.
//
// NOTE: the Amharic strings here are a best-effort translation, not
// reviewed by a native speaker. Have someone fluent check the wording
// before this goes in front of real ticket buyers.
// -----------------------------------------------------------------

const translations = {
  en: {
    presents_line: "Fanta x Mera Events Presents",
    hero_cta: "Buy Tickets",

    venue_label: "The venue",
    venue_heading: "An Enkutatash night at Ghion Hotel",
    venue_body:
      "Ring in the new year with Efrem Tamiru, Gossaye Tesfaye, Leul Sisay, MC Siyamregn and Milu, live at Ghion Hotel — one night of music, food, and celebration.",
    fact_location_label: "Location",
    fact_location_value: "Ghion Hotel",
    fact_date_label: "Date",
    fact_date_value: "Pagume 5 (September 10)",
    fact_vvip_label: "VVIP includes",
    fact_vvip_value:
      "Dinner, tire siga and tibs, with the closest seats to the stage",

    tickets_label: "Tickets",
    tickets_heading: "Enkutatash Concert — pick your tier",
    package_name: "Enkutatash Concert",
    tier_first_wave_name: "First Wave",
    tier_gate_name: "At the Gate",
    tier_vip_name: "VIP",
    tier_vvip_name: "VVIP",
    sold_out: "Sold out",
    stub_note:
      "VVIP includes dinner, tire siga and tibs, with the closest seats to the stage. Entry is 21 and over.",
    restriction_1: "21+",
    restriction_2: "No outside food or drink",
    restriction_3: "No weapons",

    countdown_label: "Ticket sales end in",
    countdown_target: "Pagume 5, 8:00 PM (Addis Ababa time)",
    days: "Days",
    hours: "Hrs",
    mins: "Min",
    secs: "Sec",
    buy_button_active: "Buy Tickets",
    buy_button_ended: "Sales closed",

    modal_reserve_label: "Reserve",
    modal_heading: "Hold your tickets",
    modal_intro:
      "Fill in your details to reserve your tickets. Payment is currently handled manually — you'll be contacted directly to complete it.",
    field_fullname: "Full name",
    field_phone: "Phone",
    field_package: "Tickets",
    package_gate_name: "At the Gate",
    package_vip_name: "VIP",
    package_vvip_name: "VVIP",
    field_tickets: "Tickets",
    ticket_picker_hint: "Mix and match — pick any number of each.",
    ticket_picker_hint_limit: "Maximum 10 tickets per order.",
    total_label: "Total",
    submit_button: "Reserve tickets",
    submit_button_loading: "Submitting…",
    form_error_required: "Please fill in all fields.",
    form_error_no_tickets: "Choose at least one ticket.",
    form_error_network: "Could not reach the server — check your connection and try again.",
    order_disclaimer:
      "This reserves your order. Payment is handled manually for now — you'll be contacted to complete payment and confirm your ticket.",

    success_heading: "Order received",
    success_ref_label: "Your reference number:",
    success_body:
      "This reserves your place. Once you've paid, upload a screenshot of the payment below and our team will confirm your ticket.",
    screenshot_label: "Payment screenshot",
    screenshot_button: "Upload screenshot",
    screenshot_button_loading: "Uploading…",
    screenshot_error_none: "Choose a screenshot first.",
    screenshot_done: "Screenshot received — your order is awaiting review.",
    screenshot_error_read: "Could not read that file. Try another image.",

    waiting_heading: "Awaiting approval",
    waiting_body: "Keep this page open — your ticket will appear here the moment our team approves your payment.",
    waiting_timeout: "Still awaiting approval. You can close this page — check back with your reference number, or contact the organizers.",
    rejected_heading: "Payment not confirmed",
    rejected_body: "We couldn't confirm your payment. Please contact the organizers with your reference number below.",
    status_check_error: "Could not check your order status — check your connection.",

    tickets_ready_heading: "Your tickets are ready",
    ticket_eyebrow: "Enkutatash Concert",
    ticket_subheading: "Happy Enkutatash! — Ghion Hotel, Addis Ababa",
    ticket_name_label: "Name",
    ticket_phone_label: "Phone",
    ticket_id_label: "Ticket ID",
    ticket_package_label: "Package",
    ticket_qty_label: "Tickets",
    ticket_scan_label: "Scan for entry",
    ticket_save_hint: "📸 Screenshot each ticket or tap Download to save it to your phone.",
    ticket_download_button: "Download ticket",
    ticket_download_loading: "Preparing…",

    footer_title: "Enkutatash Concert — Fanta x Mera Events",
    footer_location: "Ghion Hotel, Addis Ababa",
  },

  am: {
    presents_line: "ፋንታ x ሜራ ኢቨንትስ ያቀርባል",
    hero_cta: "ትኬት ይግዙ",

    venue_label: "አዳራሽ",
    venue_heading: "እንቁጣጣሽ በጌዮን ሆቴል",
    venue_body:
      "አዲሱን ዓመት ከኤፍሬም ታምሩ፣ ጎሳዬ ተስፋዬ፣ ልዑል ሲሳይ፣ ኤምሲ ስያምረኝ እና ሚሉ ጋር በጌዮን ሆቴል ይቀበሉ — ለአንድ ሌሊት ሙዚቃ፣ ምግብና በዓል።",
    fact_location_label: "ቦታ",
    fact_location_value: "ጌዮን ሆቴል",
    fact_date_label: "ቀን",
    fact_date_value: "ጳጉሜ 5",
    fact_vvip_label: "ቪ.ቪ.አይ.ፒ ያካትታል",
    fact_vvip_value: "እራት፣ ጥሬ ስጋ እና ጥብስ፣ ከመድረኩ ጋር በጣም ቅርብ የሆነ መቀመጫ",

    tickets_label: "ትኬት",
    tickets_heading: "እንቁጣጣሽ ኮንሰርት — የፈለጉትን ደረጃ ይምረጡ",
    package_name: "እንቁጣጣሽ ኮንሰርት",
    tier_first_wave_name: "የመጀመሪያ ዙር",
    tier_gate_name: "በበሩ ላይ",
    tier_vip_name: "ቪ.አይ.ፒ",
    tier_vvip_name: "ቪ.ቪ.አይ.ፒ",
    sold_out: "ተሽጦ አልቋል",
    stub_note:
      "ቪ.ቪ.አይ.ፒ እራት፣ ጥሬ ስጋ እና ጥብስ፣ ከመድረኩ ጋር በጣም ቅርብ የሆነ መቀመጫ ያካትታል። መግቢያ ከ21 ዓመት በላይ ብቻ ነው።",
    restriction_1: "21+",
    restriction_2: "ከውጭ የመጣ ምግብ ወይም መጠጥ አይፈቀድም",
    restriction_3: "የጦር መሳሪያ አይፈቀድም",

    countdown_label: "የትኬት ሽያጭ የሚያበቃው በ",
    countdown_target: "ጳጉሜ 5፣ 8:00 ሰዓት (የአዲስ አበባ ሰዓት)",
    days: "ቀናት",
    hours: "ሰዓት",
    mins: "ደቂቃ",
    secs: "ሰከንድ",
    buy_button_active: "ትኬት ይግዙ",
    buy_button_ended: "ሽያጭ ተዘግቷል",

    modal_reserve_label: "ያስይዙ",
    modal_heading: "ትኬትዎን ያስይዙ",
    modal_intro:
      "ትኬትዎን ለማስያዝ መረጃዎን ይሙሉ። ክፍያ በአሁኑ ጊዜ በእጅ ይስተናገዳል — ክፍያውን ለማጠናቀቅ በቀጥታ እናገኝዎታለን።",
    field_fullname: "ሙሉ ስም",
    field_phone: "ስልክ",
    field_package: "ትኬቶች",
    package_gate_name: "በበሩ ላይ",
    package_vip_name: "ቪ.አይ.ፒ",
    package_vvip_name: "ቪ.ቪ.አይ.ፒ",
    field_tickets: "ትኬት ብዛት",
    ticket_picker_hint: "እንደፈለጉት ይምረጡ — ከሁሉም ዓይነት ትኬት መግዛት ይችላሉ።",
    ticket_picker_hint_limit: "በአንድ ትዕዛዝ ቢበዛ 10 ትኬቶች ብቻ።",
    total_label: "ጠቅላላ",
    submit_button: "ትኬት ያስይዙ",
    submit_button_loading: "በመላክ ላይ…",
    form_error_required: "እባክዎ ሁሉንም መስኮች ይሙሉ።",
    form_error_no_tickets: "እባክዎ ቢያንስ አንድ ትኬት ይምረጡ።",
    form_error_network: "አገልጋዩን ማግኘት አልተቻለም — ግንኙነትዎን ያረጋግጡና እንደገና ይሞክሩ።",
    order_disclaimer:
      "ይህ ትዕዛዝዎን ያስይዛል። ክፍያ በአሁኑ ጊዜ በእጅ ይስተናገዳል — ክፍያውን አጠናቅቀው ትኬትዎን ለማረጋገጥ በቀጥታ እናገኝዎታለን።",

    success_heading: "ትዕዛዝ ደርሶናል",
    success_ref_label: "የማጣቀሻ ቁጥርዎ:",
    success_body:
      "ይህ ቦታዎን ያስይዛል። ከከፈሉ በኋላ፣ ከታች የክፍያ ስክሪንሾት ይላኩ፤ ቡድናችን ትኬትዎን ያረጋግጣል።",
    screenshot_label: "የክፍያ ስክሪንሾት",
    screenshot_button: "ስክሪንሾት ላክ",
    screenshot_button_loading: "በመላክ ላይ…",
    screenshot_error_none: "እባክዎ መጀመሪያ ስክሪንሾት ይምረጡ።",
    screenshot_done: "ስክሪንሾት ደርሶናል — ትዕዛዝዎ በግምገማ ላይ ነው።",
    screenshot_error_read: "ፋይሉን ማንበብ አልተቻለም። እባክዎ ሌላ ምስል ይሞክሩ።",

    waiting_heading: "ማረጋገጫ በመጠበቅ ላይ",
    waiting_body: "ይህን ገጽ ክፍት ያድርጉት — ትዕዛዝዎ ሲረጋገጥ ትኬትዎ እዚሁ ይታያል።",
    waiting_timeout: "አሁንም በመጠበቅ ላይ ነው። ይህን ገጽ ዘግተው በማጣቀሻ ቁጥርዎ ቆይተው ማየት ወይም አዘጋጆቹን ማነጋገር ይችላሉ።",
    rejected_heading: "ክፍያ አልተረጋገጠም",
    rejected_body: "ክፍያዎን ማረጋገጥ አልቻልንም። እባክዎ ከታች ባለው የማጣቀሻ ቁጥርዎ አዘጋጆቹን ያነጋግሩ።",
    status_check_error: "የትዕዛዝዎን ሁኔታ ማየት አልተቻለም — ግንኙነትዎን ያረጋግጡ።",

    tickets_ready_heading: "ትኬቶችዎ ዝግጁ ናቸው",
    ticket_eyebrow: "እንቁጣጣሽ ኮንሰርት",
    ticket_subheading: "እንኳን አደረሰዎት! — ጌዮን ሆቴል፣ አዲስ አበባ",
    ticket_name_label: "ስም",
    ticket_phone_label: "ስልክ",
    ticket_id_label: "የትኬት ቁጥር",
    ticket_package_label: "ጥቅል",
    ticket_qty_label: "ትኬቶች",
    ticket_scan_label: "ለመግቢያ ይቃኙ",
    ticket_save_hint: "📸 እያንዳንዱን ትኬት ስክሪንሾት ያድርጉ ወይም Download ተጭነው ወደ ስልክዎ ያስቀምጡት።",
    ticket_download_button: "ትኬት አውርድ",
    ticket_download_loading: "በማዘጋጀት ላይ…",

    footer_title: "እንቁጣጣሽ ኮንሰርት — ፋንታ x ሜራ ኢቨንትስ",
    footer_location: "ጌዮን ሆቴል፣ አዲስ አበባ",
  },
};

const LANG_KEY = "eve_lang";

function getLang() {
  return localStorage.getItem(LANG_KEY) || "en";
}

function t(key) {
  const lang = getLang();
  return (translations[lang] && translations[lang][key]) || translations.en[key] || key;
}

function applyTranslations() {
  const lang = getLang();
  document.documentElement.lang = lang;
  document.body.classList.toggle("lang-am", lang === "am");

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const text = t(key);
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
      el.setAttribute("placeholder", text);
    } else {
      el.textContent = text;
    }
  });

  document.getElementById("lang-en")?.classList.toggle("lang-btn--active", lang === "en");
  document.getElementById("lang-am")?.classList.toggle("lang-btn--active", lang === "am");
}

function setLang(lang) {
  localStorage.setItem(LANG_KEY, lang);
  applyTranslations();
}

function initLangToggle() {
  document.getElementById("lang-en")?.addEventListener("click", () => setLang("en"));
  document.getElementById("lang-am")?.addEventListener("click", () => setLang("am"));
  applyTranslations();
}

document.addEventListener("DOMContentLoaded", initLangToggle);
