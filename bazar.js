/* ============================================================
   Bazar — Daily Expense Management
   Reuses the existing Firebase project/auth already initialized
   in bazar.html (same project as Attendance). Do not touch
   attendance.js / attendance-auth.js / the attendance_members
   collection from here.
   ============================================================ */

/* ---------------- Icons (professional stroke SVGs, no emoji) ---------------- */
const BICON_CART = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.5 3h2l2.6 12.6a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21 8H6.2"></path></svg>';
const BICON_PLUS = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
const BICON_EDIT = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg>';
const BICON_TRASH = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg>';
const BICON_SEARCH = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>';
const BICON_CHEV_L = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>';
const BICON_CHEV_R = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';
const BICON_DOWNLOAD = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>';
const BICON_PRINT = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>';
const BICON_WALLET = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5Z"></path><path d="M16 12h4"></path></svg>';
const BICON_RECEIPT = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2h16v20l-3-2-3 2-3-2-3 2-3-2-3 2Z"></path><line x1="8" y1="7" x2="16" y2="7"></line><line x1="8" y1="11" x2="16" y2="11"></line><line x1="8" y1="15" x2="12" y2="15"></line></svg>';
const BICON_TREND = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 17 9 11 13 15 21 7"></polyline><polyline points="14 7 21 7 21 14"></polyline></svg>';
const BICON_CALCHECK = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M9 16l2 2 4-4"></path></svg>';
const BICON_SIGNOUT = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>';
const BICON_BASKET_EMPTY = '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.5 3h2l2.6 12.6a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21 8H6.2"></path></svg>';

/* ---------------- Categories ---------------- */
const BAZ_CATEGORIES = [
  { value: "grocery",    label: "মুদি (Grocery)",      color: "#2563EB" },
  { value: "fish",       label: "মাছ (Fish)",          color: "#0891B2" },
  { value: "meat",       label: "মাংস (Meat)",         color: "#DC2626" },
  { value: "vegetables", label: "সবজি (Vegetables)",   color: "#16A34A" },
  { value: "food",       label: "খাবার (Food)",        color: "#D97706" },
  { value: "household",  label: "গৃহস্থালী (Household)", color: "#7C3AED" },
  { value: "other",      label: "অন্যান্য (Other)",     color: "#64748B" },
];
const BAZ_CAT_MAP = Object.fromEntries(BAZ_CATEGORIES.map((c) => [c.value, c]));
const BAZ_QUICK_AMOUNTS = [10, 20, 50, 100];
const BAZ_MONTH_NAMES_BN = ["জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"];
const BAZ_MONTH_NAMES_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];

/* ---------------- Firestore access (isolated "bazar" collection) ---------------- */
function bazDb() { return firebase.firestore(); }

const BazarStorage = {
  async getEntries(uid) {
    const snap = await bazDb().collection("bazar").doc(uid).collection("entries").orderBy("date", "desc").get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },
  async addEntry(uid, entry) {
    const ref = await bazDb().collection("bazar").doc(uid).collection("entries").add({
      date: entry.date,
      description: entry.description,
      amount: entry.amount,
      category: entry.category,
      note: entry.note || "",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return ref.id;
  },
  async updateEntry(uid, id, changes) {
    await bazDb().collection("bazar").doc(uid).collection("entries").doc(id).update({
      ...changes,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  },
  async deleteEntry(uid, id) {
    await bazDb().collection("bazar").doc(uid).collection("entries").doc(id).delete();
  },
};

/* ---------------- State ---------------- */
let currentUser = null;
let allEntries = [];
const today = new Date();
let viewYear = today.getFullYear();
let viewMonth = today.getMonth();
let activeCategory = "all";
let searchQuery = "";
let pendingDeleteId = null;

document.addEventListener("DOMContentLoaded", () => {

  const els = {
    gate: document.getElementById("bazGate"),
    gateIcon: document.getElementById("bazGateIcon"),
    gateMsg: document.getElementById("bazGateMsg"),
    googleBtn: document.getElementById("bazGoogleSignIn"),
    facebookBtn: document.getElementById("bazFacebookSignIn"),
    main: document.getElementById("bazMain"),
    userGreeting: document.getElementById("bazUserGreeting"),
    signOutBtn: document.getElementById("bazSignOutBtn"),
    headIcon: document.getElementById("bazHeadIcon"),
    prevMonth: document.getElementById("bazPrevMonth"),
    nextMonth: document.getElementById("bazNextMonth"),
    monthLabel: document.getElementById("bazMonthLabel"),
    addBtn: document.getElementById("bazAddBtn"),
    summaryCards: document.getElementById("bazSummaryCards"),
    searchIcon: document.getElementById("bazSearchIcon"),
    searchInput: document.getElementById("bazSearchInput"),
    printBtn: document.getElementById("bazPrintBtn"),
    pdfBtn: document.getElementById("bazPdfBtn"),
    filters: document.getElementById("bazFilters"),
    historyList: document.getElementById("bazHistoryList"),
    monthlySummary: document.getElementById("bazMonthlySummary"),
    toastWrap: document.getElementById("bazToastWrap"),

    formModal: document.getElementById("bazFormModal"),
    formClose: document.getElementById("bazFormClose"),
    formCancel: document.getElementById("bazFormCancel"),
    formEyebrow: document.getElementById("bazFormEyebrow"),
    formTitle: document.getElementById("bazFormTitle"),
    form: document.getElementById("bazForm"),
    entryId: document.getElementById("bazEntryId"),
    date: document.getElementById("bazDate"),
    category: document.getElementById("bazCategory"),
    description: document.getElementById("bazDescription"),
    amount: document.getElementById("bazAmount"),
    quickAmounts: document.getElementById("bazQuickAmounts"),
    note: document.getElementById("bazNote"),
    formMsg: document.getElementById("bazFormMsg"),
    formSave: document.getElementById("bazFormSave"),

    confirmModal: document.getElementById("bazConfirmModal"),
    confirmClose: document.getElementById("bazConfirmClose"),
    confirmCancel: document.getElementById("bazConfirmCancel"),
    confirmDelete: document.getElementById("bazConfirmDelete"),
  };

  if (!els.gate || !els.main) return;

  /* ---------------- Static icon slots ---------------- */
  els.gateIcon.innerHTML = BICON_CART;
  els.headIcon.innerHTML = BICON_CART;
  els.searchIcon.innerHTML = BICON_SEARCH;
  els.prevMonth.innerHTML = BICON_CHEV_L;
  els.nextMonth.innerHTML = BICON_CHEV_R;
  els.addBtn.innerHTML = `${BICON_PLUS}<span>বাজার যোগ করুন</span>`;
  els.printBtn.innerHTML = `${BICON_PRINT}<span>Print</span>`;
  els.pdfBtn.innerHTML = `${BICON_DOWNLOAD}<span>PDF রিপোর্ট</span>`;
  els.signOutBtn.innerHTML = `${BICON_SIGNOUT}<span>সাইন-আউট</span>`;

  /* ---------------- Helpers ---------------- */
  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function todayISO() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  function parseISO(s) {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  function formatDateShort(s) {
    const d = parseISO(s);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  }
  function formatMoney(n) {
    return `RM ${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  function showToast(message, type = "success") {
    if (!els.toastWrap) return;
    const toast = document.createElement("div");
    toast.className = `baz-toast baz-toast-${type}`;
    toast.textContent = message;
    els.toastWrap.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("is-visible"));
    setTimeout(() => {
      toast.classList.remove("is-visible");
      setTimeout(() => toast.remove(), 300);
    }, 2600);
  }

  /* ---------------- Category select + quick amounts (static UI) ---------------- */
  els.category.innerHTML = BAZ_CATEGORIES.map((c) => `<option value="${c.value}">${escapeHtml(c.label)}</option>`).join("");
  els.quickAmounts.innerHTML = BAZ_QUICK_AMOUNTS.map((a) => `<button type="button" class="baz-quick-btn" data-amt="${a}">RM ${a}</button>`).join("");
  els.quickAmounts.querySelectorAll(".baz-quick-btn").forEach((btn) => {
    btn.addEventListener("click", () => { els.amount.value = btn.dataset.amt; });
  });

  /* ---------------- Data helpers ---------------- */
  function entriesForMonth(year, month) {
    return allEntries.filter((e) => {
      const d = parseISO(e.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }
  function filteredHistoryEntries() {
    let list = entriesForMonth(viewYear, viewMonth);
    if (activeCategory !== "all") list = list.filter((e) => e.category === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((e) =>
        (e.description || "").toLowerCase().includes(q) ||
        (e.note || "").toLowerCase().includes(q)
      );
    }
    return list.slice().sort((a, b) => b.date.localeCompare(a.date));
  }

  /* ---------------- Rendering ---------------- */
  function updateMonthLabel() {
    els.monthLabel.textContent = `${BAZ_MONTH_NAMES_BN[viewMonth]} ${viewYear}`;
  }

  function renderSummaryCards() {
    const monthEntries = entriesForMonth(viewYear, viewMonth);
    const total = monthEntries.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const divisor = isCurrentMonth ? today.getDate() : daysInMonth;
    const dailyAvg = divisor > 0 ? total / divisor : 0;

    const lastEntry = allEntries.slice().sort((a, b) => b.date.localeCompare(a.date))[0];

    const cards = [
      { icon: BICON_WALLET, color: "#2563EB", value: formatMoney(total), label: "এই মাসে মোট" },
      { icon: BICON_RECEIPT, color: "#16A34A", value: String(monthEntries.length), label: "মোট বাজার এন্ট্রি" },
      { icon: BICON_TREND, color: "#D97706", value: formatMoney(dailyAvg), label: "দৈনিক গড়" },
      { icon: BICON_CALCHECK, color: "#7C3AED", value: lastEntry ? formatDateShort(lastEntry.date) : "—", label: "সর্বশেষ বাজার" },
    ];

    els.summaryCards.innerHTML = cards.map((c) => `
      <div class="baz-stat-card">
        <div class="baz-stat-icon" style="background:${c.color}1a; color:${c.color};">${c.icon}</div>
        <div>
          <div class="baz-stat-value">${c.value}</div>
          <div class="baz-stat-label">${c.label}</div>
        </div>
      </div>
    `).join("");
  }

  function renderFilters() {
    const chips = [{ value: "all", label: "সব" }, ...BAZ_CATEGORIES];
    els.filters.innerHTML = chips.map((c) =>
      `<button type="button" class="baz-chip${activeCategory === c.value ? " is-active" : ""}" data-cat="${c.value}">${escapeHtml(c.label)}</button>`
    ).join("");
    els.filters.querySelectorAll(".baz-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        activeCategory = chip.dataset.cat;
        renderFilters();
        renderHistory();
      });
    });
  }

  function renderHistory() {
    const list = filteredHistoryEntries();
    if (!list.length) {
      els.historyList.innerHTML = `
        <div class="baz-empty">
          ${BICON_BASKET_EMPTY}
          <div class="baz-empty-title">এই মাসে কোনো বাজার এন্ট্রি নেই</div>
          <div class="baz-empty-sub">উপরের "বাজার যোগ করুন" বাটনে ক্লিক করে প্রথম এন্ট্রি যোগ করুন।</div>
        </div>`;
      return;
    }
    els.historyList.innerHTML = list.map((e) => {
      const cat = BAZ_CAT_MAP[e.category] || BAZ_CAT_MAP.other;
      return `
        <div class="baz-row" data-id="${e.id}">
          <div class="baz-row-date">${formatDateShort(e.date)}</div>
          <div class="baz-row-main">
            <div class="baz-row-desc">${escapeHtml(e.description)}</div>
            ${e.note ? `<div class="baz-row-note">${escapeHtml(e.note)}</div>` : ""}
            <span class="baz-cat-badge" style="background:${cat.color}1a; color:${cat.color};">${escapeHtml(cat.label.split(" ")[0])}</span>
          </div>
          <div class="baz-row-amount">${formatMoney(e.amount)}</div>
          <div class="baz-row-actions">
            <button type="button" class="baz-edit-btn" data-id="${e.id}" aria-label="সম্পাদনা">${BICON_EDIT}</button>
            <button type="button" class="baz-del-btn" data-id="${e.id}" aria-label="মুছুন">${BICON_TRASH}</button>
          </div>
        </div>`;
    }).join("");

    els.historyList.querySelectorAll(".baz-edit-btn").forEach((btn) => {
      btn.addEventListener("click", () => openEditModal(btn.dataset.id));
    });
    els.historyList.querySelectorAll(".baz-del-btn").forEach((btn) => {
      btn.addEventListener("click", () => openConfirmModal(btn.dataset.id));
    });
  }

  function renderMonthlySummary() {
    const monthEntries = entriesForMonth(viewYear, viewMonth);
    const total = monthEntries.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const count = monthEntries.length;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();
    const divisor = isCurrentMonth ? today.getDate() : daysInMonth;
    const avg = divisor > 0 ? total / divisor : 0;
    const amounts = monthEntries.map((e) => Number(e.amount || 0));
    const highest = amounts.length ? Math.max(...amounts) : 0;
    const lowest = amounts.length ? Math.min(...amounts) : 0;

    const items = [
      { val: formatMoney(total), lbl: "মোট বাজার" },
      { val: String(count), lbl: "মোট এন্ট্রি" },
      { val: formatMoney(avg), lbl: "দৈনিক গড়" },
      { val: formatMoney(highest), lbl: "সর্বোচ্চ খরচ" },
      { val: formatMoney(lowest), lbl: "সর্বনিম্ন খরচ" },
    ];

    els.monthlySummary.innerHTML = `
      <h3 class="baz-monthly-title">মাসিক সামারি — ${BAZ_MONTH_NAMES_BN[viewMonth]} ${viewYear}</h3>
      <div class="baz-monthly-grid">
        ${items.map((i) => `
          <div class="baz-monthly-item">
            <div class="baz-monthly-val">${i.val}</div>
            <div class="baz-monthly-lbl">${i.lbl}</div>
          </div>`).join("")}
      </div>`;
  }

  function renderAll() {
    updateMonthLabel();
    renderSummaryCards();
    renderFilters();
    renderHistory();
    renderMonthlySummary();
  }

  /* ---------------- Month navigation ---------------- */
  els.prevMonth.addEventListener("click", () => {
    viewMonth -= 1;
    if (viewMonth < 0) { viewMonth = 11; viewYear -= 1; }
    renderAll();
  });
  els.nextMonth.addEventListener("click", () => {
    viewMonth += 1;
    if (viewMonth > 11) { viewMonth = 0; viewYear += 1; }
    renderAll();
  });

  /* ---------------- Search ---------------- */
  els.searchInput.addEventListener("input", () => {
    searchQuery = els.searchInput.value;
    renderHistory();
  });

  /* ---------------- Add / Edit modal ---------------- */
  function openFormModal() {
    els.formModal.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }
  function closeFormModal() {
    els.formModal.classList.remove("is-open");
    document.body.style.overflow = "";
    els.formMsg.textContent = "";
  }
  function openAddModal() {
    els.form.reset();
    els.entryId.value = "";
    els.date.value = todayISO();
    els.category.value = "grocery";
    els.formEyebrow.textContent = "Bazar";
    els.formTitle.textContent = "বাজার যোগ করুন";
    els.formSave.textContent = "সেভ করুন";
    openFormModal();
  }
  function openEditModal(id) {
    const entry = allEntries.find((e) => e.id === id);
    if (!entry) return;
    els.entryId.value = entry.id;
    els.date.value = entry.date;
    els.category.value = entry.category;
    els.description.value = entry.description;
    els.amount.value = entry.amount;
    els.note.value = entry.note || "";
    els.formEyebrow.textContent = "Bazar";
    els.formTitle.textContent = "বাজার সম্পাদনা করুন";
    els.formSave.textContent = "আপডেট করুন";
    openFormModal();
  }

  els.addBtn.addEventListener("click", openAddModal);
  els.formClose.addEventListener("click", closeFormModal);
  els.formCancel.addEventListener("click", closeFormModal);
  els.formModal.addEventListener("click", (e) => { if (e.target === els.formModal) closeFormModal(); });

  els.form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const date = els.date.value;
    const category = els.category.value;
    const description = els.description.value.trim();
    const amount = parseFloat(els.amount.value);
    const note = els.note.value.trim();

    if (!date || !description || !isFinite(amount) || amount <= 0) {
      els.formMsg.textContent = "তারিখ, বিবরণ ও সঠিক পরিমাণ দিন।";
      return;
    }

    const id = els.entryId.value;
    els.formSave.disabled = true;
    try {
      if (id) {
        await BazarStorage.updateEntry(currentUser.uid, id, { date, category, description, amount, note });
        const idx = allEntries.findIndex((x) => x.id === id);
        if (idx !== -1) allEntries[idx] = { ...allEntries[idx], date, category, description, amount, note };
        showToast("বাজার আপডেট হয়েছে", "success");
      } else {
        const newId = await BazarStorage.addEntry(currentUser.uid, { date, category, description, amount, note });
        allEntries.unshift({ id: newId, date, category, description, amount, note });
        showToast("বাজার যোগ হয়েছে", "success");
      }
      closeFormModal();
      renderAll();
    } catch (err) {
      console.error("Bazar save failed", err);
      els.formMsg.textContent = "সেভ করতে সমস্যা হয়েছে, আবার চেষ্টা করুন।";
    } finally {
      els.formSave.disabled = false;
    }
  });

  /* ---------------- Delete confirm ---------------- */
  function openConfirmModal(id) {
    pendingDeleteId = id;
    els.confirmModal.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }
  function closeConfirmModal() {
    els.confirmModal.classList.remove("is-open");
    document.body.style.overflow = "";
    pendingDeleteId = null;
  }
  els.confirmClose.addEventListener("click", closeConfirmModal);
  els.confirmCancel.addEventListener("click", closeConfirmModal);
  els.confirmModal.addEventListener("click", (e) => { if (e.target === els.confirmModal) closeConfirmModal(); });
  els.confirmDelete.addEventListener("click", async () => {
    if (!pendingDeleteId || !currentUser) return;
    const id = pendingDeleteId;
    try {
      await BazarStorage.deleteEntry(currentUser.uid, id);
      allEntries = allEntries.filter((e) => e.id !== id);
      closeConfirmModal();
      renderAll();
      showToast("বাজার মুছে ফেলা হয়েছে", "success");
    } catch (err) {
      console.error("Bazar delete failed", err);
      showToast("মুছতে সমস্যা হয়েছে", "error");
    }
  });

  /* ---------------- PDF report ---------------- */
  function getSiteAccentColor() {
    try {
      const raw = getComputedStyle(document.documentElement).getPropertyValue("--color-accent").trim();
      const ctx = document.createElement("canvas").getContext("2d");
      ctx.fillStyle = "#000"; ctx.fillStyle = raw;
      const hex = ctx.fillStyle;
      if (hex.startsWith("#")) {
        const bigint = parseInt(hex.slice(1), 16);
        return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
      }
    } catch (err) {}
    return [37, 99, 235];
  }
  function loadImageAsDataURL(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
          canvas.getContext("2d").drawImage(img, 0, 0);
          resolve({ dataUrl: canvas.toDataURL("image/png"), width: img.naturalWidth, height: img.naturalHeight });
        } catch (err) { reject(err); }
      };
      img.onerror = () => reject(new Error("logo failed to load"));
      img.src = src;
    });
  }

  async function generateMonthlyPdf() {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      showToast("PDF তৈরি করা যায়নি, পেজ রিলোড করে আবার চেষ্টা করুন।", "error");
      return;
    }
    els.pdfBtn.disabled = true;
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 40;
      const contentWidth = pageWidth - margin * 2;
      const BRAND = getSiteAccentColor();
      const GRAY = [120, 120, 120];
      const DARK = [20, 20, 20];
      const BORDER = [226, 232, 240];
      const FILL = [248, 250, 252];

      let logo = null;
      try { logo = await loadImageAsDataURL("masum.png"); } catch (err) { logo = null; }

      let textX = margin;
      const top = margin;
      if (logo) {
        const w = 42, h = (logo.height / logo.width) * w;
        doc.addImage(logo.dataUrl, "PNG", margin, top - 4, w, h);
        textX = margin + w + 14;
      }

      doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(...DARK);
      doc.text("MASUM NOTES", textX, top + 12);
      doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...GRAY);
      doc.text("masumcpex.bro.bd", textX, top + 24);
      doc.text("masumcpex.com", textX, top + 35);

      doc.setFont("helvetica", "bold"); doc.setFontSize(15); doc.setTextColor(...BRAND);
      doc.text("MONTHLY BAZAR REPORT", pageWidth - margin, top + 10, { align: "right" });
      doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(...DARK);
      doc.text(`${BAZ_MONTH_NAMES_EN[viewMonth]} ${viewYear}`, pageWidth - margin, top + 24, { align: "right" });
      const generatedAt = new Date();
      const generatedStr = `Generated: ${generatedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
      doc.setFontSize(8); doc.setTextColor(...GRAY);
      doc.text(generatedStr, pageWidth - margin, top + 36, { align: "right" });

      let y = top + 54;
      doc.setDrawColor(...BRAND); doc.setLineWidth(1.2);
      doc.line(margin, y, pageWidth - margin, y);
      y += 22;

      const monthEntries = entriesForMonth(viewYear, viewMonth).slice().sort((a, b) => a.date.localeCompare(b.date));
      const total = monthEntries.reduce((s, e) => s + Number(e.amount || 0), 0);
      const amounts = monthEntries.map((e) => Number(e.amount || 0));
      const highest = amounts.length ? Math.max(...amounts) : 0;
      const lowest = amounts.length ? Math.min(...amounts) : 0;
      const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
      const avg = daysInMonth > 0 ? total / daysInMonth : 0;

      const cards = [
        { v: formatMoney(total), l: "Total Bazar" },
        { v: String(monthEntries.length), l: "Total Entries" },
        { v: formatMoney(avg), l: "Daily Average" },
        { v: formatMoney(highest), l: "Highest Expense" },
        { v: formatMoney(lowest), l: "Lowest Expense" },
      ];
      const gap = 6;
      const cw = (contentWidth - gap * (cards.length - 1)) / cards.length;
      const ch = 42;
      cards.forEach((c, i) => {
        const x = margin + i * (cw + gap);
        doc.setDrawColor(...BORDER); doc.setFillColor(...FILL);
        doc.roundedRect(x, y, cw, ch, 3, 3, "FD");
        doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(...BRAND);
        doc.text(c.v, x + cw / 2, y + 19, { align: "center" });
        doc.setFont("helvetica", "normal"); doc.setFontSize(6.4); doc.setTextColor(...GRAY);
        doc.text(c.l.toUpperCase(), x + cw / 2, y + 33, { align: "center" });
      });
      y += ch + 20;

      const body = monthEntries.map((e) => [
        formatDateShort(e.date),
        e.description,
        (BAZ_CAT_MAP[e.category] || BAZ_CAT_MAP.other).label.split(" ")[0],
        formatMoney(e.amount),
      ]);

      function drawFooter() {
        const pageHeight = doc.internal.pageSize.getHeight();
        const fy = pageHeight - 34;
        doc.setDrawColor(...BORDER); doc.setLineWidth(0.6);
        doc.line(margin, fy, pageWidth - margin, fy);
        doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...GRAY);
        doc.text("masumcpex.com", margin, fy + 14);
        doc.text(generatedStr, pageWidth - margin, fy + 14, { align: "right" });
      }

      if (typeof doc.autoTable === "function") {
        doc.autoTable({
          startY: y,
          margin: { left: margin, right: margin, bottom: 58 },
          head: [["Date", "Description", "Category", "Amount"]],
          body: body.length ? body : [["—", "No records this month", "—", "—"]],
          theme: "grid",
          headStyles: { fillColor: BRAND, textColor: 255, fontStyle: "bold", fontSize: 8.5 },
          bodyStyles: { fontSize: 8.8, textColor: [40, 40, 40], cellPadding: 6 },
          alternateRowStyles: { fillColor: FILL },
          columnStyles: { 0: { cellWidth: 70 }, 2: { cellWidth: 100 }, 3: { halign: "right", cellWidth: 90 } },
          didDrawPage: drawFooter,
        });
        y = doc.lastAutoTable.finalY + 24;
      } else {
        drawFooter();
        y += 20;
      }

      if (y > doc.internal.pageSize.getHeight() - 80) { doc.addPage(); y = margin; }
      doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(...DARK);
      doc.text(`TOTAL BAZAR: ${formatMoney(total)}`, pageWidth - margin, y, { align: "right" });

      const totalPages = doc.internal.getNumberOfPages();
      const pageHeight = doc.internal.pageSize.getHeight();
      for (let p = 1; p <= totalPages; p += 1) {
        doc.setPage(p);
        doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...GRAY);
        doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin, pageHeight - 34 + 26, { align: "right" });
      }

      doc.save(`Bazar_Report_${BAZ_MONTH_NAMES_EN[viewMonth]}_${viewYear}.pdf`);
      showToast("PDF রিপোর্ট ডাউনলোড হয়েছে", "success");
    } catch (err) {
      console.error("Bazar PDF export failed", err);
      showToast("PDF তৈরি করতে সমস্যা হয়েছে", "error");
    } finally {
      els.pdfBtn.disabled = false;
    }
  }

  els.pdfBtn.addEventListener("click", generateMonthlyPdf);
  els.printBtn.addEventListener("click", () => window.print());

  /* ---------------- Auth ---------------- */
  els.googleBtn.addEventListener("click", async () => {
    els.gateMsg.textContent = "";
    els.googleBtn.disabled = true;
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      await firebase.auth().signInWithPopup(provider);
    } catch (err) {
      console.error("Google sign-in failed", err);
      els.gateMsg.textContent = "সাইন-ইন করতে সমস্যা হয়েছে, আবার চেষ্টা করুন।";
    } finally {
      els.googleBtn.disabled = false;
    }
  });
  els.facebookBtn.addEventListener("click", async () => {
    els.gateMsg.textContent = "";
    els.facebookBtn.disabled = true;
    try {
      const provider = new firebase.auth.FacebookAuthProvider();
      await firebase.auth().signInWithPopup(provider);
    } catch (err) {
      console.error("Facebook sign-in failed", err);
      els.gateMsg.textContent = "সাইন-ইন করতে সমস্যা হয়েছে, আবার চেষ্টা করুন।";
    } finally {
      els.facebookBtn.disabled = false;
    }
  });
  els.signOutBtn.addEventListener("click", async () => {
    try { await firebase.auth().signOut(); } catch (err) { console.error("Sign-out failed", err); }
  });

  async function loadUserData() {
    try {
      allEntries = await BazarStorage.getEntries(currentUser.uid);
    } catch (err) {
      console.error("Failed to load bazar entries", err);
      allEntries = [];
      showToast("বাজার ডেটা লোড করতে সমস্যা হয়েছে", "error");
    }
    renderAll();
  }

  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      currentUser = user;
      els.gate.hidden = true;
      els.main.hidden = false;
      els.userGreeting.textContent = user.displayName || user.email || "";
      loadUserData();
    } else {
      currentUser = null;
      allEntries = [];
      els.gate.hidden = false;
      els.main.hidden = true;
      els.gateMsg.textContent = "";
    }
  });

});
