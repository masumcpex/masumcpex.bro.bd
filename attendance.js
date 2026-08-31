/* =========================================================
   Attendance module
   ---------------------------------------------------------
   - AttendanceStorage: the ONLY place that talks to the data
     backend. Every method is async and returns a Promise, so
     swapping LocalStorage for Firebase Firestore later means
     rewriting the inside of this object only — nothing else
     in this file (or elsewhere on the site) needs to change.
   - AttendanceCalc: pure functions, no DOM, no storage.
   - AttendanceCalendarUtil: pure calendar-grid math.
   - Everything below that renders to the DOM and wires events
     targets the exact ids/classes already defined in the
     Attendance section of index.html.
   ========================================================= */

const AttendanceStorage = (() => {
  const KEY = "masum_attendance_records_v1";

  function readAll() {
    try {
      const raw = localStorage.getItem(KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error("Attendance: could not read from storage", err);
      return [];
    }
  }

  function writeAll(records) {
    try {
      localStorage.setItem(KEY, JSON.stringify(records));
      return true;
    } catch (err) {
      console.error("Attendance: could not write to storage", err);
      return false;
    }
  }

  return {
    // Returns every saved record: [{ date, hours, status }, ...]
    async getAttendance() {
      return readAll();
    },

    // Upsert by date — saving the same date again always updates
    // the existing record instead of creating a duplicate.
    async saveAttendance(record) {
      const all = readAll();
      const idx = all.findIndex((r) => r.date === record.date);
      if (idx >= 0) all[idx] = { ...all[idx], ...record };
      else all.push(record);
      writeAll(all);
      return record;
    },

    async updateAttendance(date, changes) {
      const all = readAll();
      const idx = all.findIndex((r) => r.date === date);
      if (idx < 0) return null;
      all[idx] = { ...all[idx], ...changes };
      writeAll(all);
      return all[idx];
    },

    async deleteAttendance(date) {
      const all = readAll();
      writeAll(all.filter((r) => r.date !== date));
      return true;
    },
  };
})();

const AttendanceCalc = {
  filterMonth(records, year, month) {
    return records.filter((r) => {
      const d = new Date(`${r.date}T00:00:00`);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  },

  summarize(records, year, month) {
    const monthRecords = this.filterMonth(records, year, month);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let totalHours = 0;
    let dutyDays = 0;
    let leaveDays = 0;
    let offDays = 0;
    let holidayDays = 0;

    monthRecords.forEach((r) => {
      if (r.status === "duty") {
        dutyDays += 1;
        totalHours += Number(r.hours) || 0;
      } else if (r.status === "leave") leaveDays += 1;
      else if (r.status === "off") offDays += 1;
      else if (r.status === "holiday") holidayDays += 1;
    });

    return {
      totalHours,
      dutyDays,
      leaveDays,
      offDays,
      holidayDays,
      markedDays: monthRecords.length,
      daysInMonth,
      avgHours: dutyDays > 0 ? totalHours / dutyDays : 0,
    };
  },
};

const AttendanceCalendarUtil = {
  // Returns an array of day numbers (1..N) padded with `null`
  // at the front so the grid lines up Monday-first, matching
  // the static weekday header in index.html.
  build(year, month) {
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let startOffset = firstDay.getDay() - 1; // JS: 0=Sun..6=Sat -> Monday-first
    if (startOffset < 0) startOffset = 6;
    const cells = new Array(startOffset).fill(null);
    for (let d = 1; d <= daysInMonth; d += 1) cells.push(d);
    return cells;
  },
};

const ATT_STATUS_META = {
  duty: { label: "Duty", dot: "duty" },
  leave: { label: "Leave", dot: "leave" },
  off: { label: "Off", dot: "off" },
  holiday: { label: "Holiday", dot: "holiday" },
};

const ATT_MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

document.addEventListener("DOMContentLoaded", () => {
  const attSection = document.getElementById("attendance");
  if (!attSection) return; // Attendance markup isn't present — nothing to do.

  const els = {
    prevBtn: document.getElementById("attPrevMonth"),
    nextBtn: document.getElementById("attNextMonth"),
    monthLabel: document.getElementById("attMonthLabel"),
    todayBtn: document.getElementById("attTodayBtn"),

    summaryGrid: document.getElementById("attSummaryGrid"),

    entryForm: document.getElementById("attEntryForm"),
    entryDate: document.getElementById("attEntryDate"),
    entryHours: document.getElementById("attEntryHours"),
    entryStatus: document.getElementById("attEntryStatus"),
    entryMsg: document.getElementById("attEntryMsg"),

    calendarGrid: document.getElementById("attCalendarGrid"),

    historyEmpty: document.getElementById("attHistoryEmpty"),
    emptyCta: document.getElementById("attEmptyCta"),
    historyTableWrap: document.getElementById("attHistoryTableWrap"),
    historyBody: document.getElementById("attHistoryBody"),

    modal: document.getElementById("attModal"),
    modalClose: document.getElementById("attModalClose"),
    modalDateDisplay: document.getElementById("attModalDateDisplay"),
    editForm: document.getElementById("attEditForm"),
    editDateKey: document.getElementById("attEditDateKey"),
    editHours: document.getElementById("attEditHours"),
    editStatus: document.getElementById("attEditStatus"),
    editMsg: document.getElementById("attEditMsg"),
    deleteBtn: document.getElementById("attDeleteBtn"),

    toastWrap: document.getElementById("attToastWrap"),
  };

  let viewYear;
  let viewMonth; // 0-indexed
  let records = [];

  function todayDateStr() {
    return formatDateISO(new Date());
  }
  function formatDateISO(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  function parseISO(s) {
    return new Date(`${s}T00:00:00`);
  }
  function round1(n) {
    return Math.round((Number(n) || 0) * 100) / 100;
  }
  function recordFor(dateStr) {
    return records.find((r) => r.date === dateStr);
  }

  function showToast(message, type = "success") {
    if (!els.toastWrap) return;
    const toast = document.createElement("div");
    toast.className = `att-toast att-toast-${type}`;
    toast.textContent = message;
    els.toastWrap.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("is-visible"));
    setTimeout(() => {
      toast.classList.remove("is-visible");
      setTimeout(() => toast.remove(), 300);
    }, 2600);
  }

  function setInlineMsg(el, message, type) {
    if (!el) return;
    el.textContent = message || "";
    el.classList.remove("is-error", "is-success");
    if (message && type) el.classList.add(type === "error" ? "is-error" : "is-success");
  }

  function validateHours(raw, status) {
    if (status !== "duty") return { ok: true, hours: 0 };
    if (raw === "") return { ok: false, message: "দয়া করে কাজের ঘণ্টা লিখুন।" };
    const n = Number(raw);
    if (Number.isNaN(n)) return { ok: false, message: "ঘণ্টা অবশ্যই একটি সংখ্যা হতে হবে।" };
    if (n < 0) return { ok: false, message: "ঘণ্টা নেগেটিভ হতে পারে না।" };
    if (n > 24) return { ok: false, message: "ঘণ্টা ২৪-এর বেশি হতে পারে না।" };
    return { ok: true, hours: n };
  }

  async function init() {
    records = await AttendanceStorage.getAttendance();
    const now = new Date();
    viewYear = now.getFullYear();
    viewMonth = now.getMonth();
    if (els.entryDate) {
      els.entryDate.textContent = now.toLocaleDateString("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
      });
    }
    render();
  }

  function render() {
    renderMonthLabel();
    const summary = AttendanceCalc.summarize(records, viewYear, viewMonth);
    renderSummary(summary);
    renderCalendar();
    renderHistory();
  }

  function renderMonthLabel() {
    if (els.monthLabel) els.monthLabel.textContent = `${ATT_MONTH_NAMES[viewMonth]} ${viewYear}`;
  }

  function renderSummary(s) {
    if (!els.summaryGrid) return;
    const cards = [
      { value: `${round1(s.totalHours)}h`, label: "Total Hours" },
      { value: s.dutyDays, label: "Duty Days" },
      { value: s.leaveDays, label: "Leave" },
      { value: s.offDays, label: "Off Days" },
      { value: s.markedDays, label: "Days Marked" },
      { value: `${round1(s.avgHours)}h`, label: "Avg / Duty Day" },
    ];
    els.summaryGrid.innerHTML = cards
      .map((c) => `
        <div class="att-stat-card">
          <div class="att-stat-value">${c.value}</div>
          <div class="att-stat-label">${c.label}</div>
        </div>
      `)
      .join("");
  }

  function renderCalendar() {
    if (!els.calendarGrid) return;
    const cells = AttendanceCalendarUtil.build(viewYear, viewMonth);
    const todayStr = todayDateStr();

    els.calendarGrid.innerHTML = cells
      .map((day) => {
        if (day === null) return `<div class="att-cal-cell att-cal-empty"></div>`;
        const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const rec = recordFor(dateStr);
        const isToday = dateStr === todayStr;
        const statusClass = rec ? `att-status-${rec.status}` : "";
        const badge = rec
          ? rec.status === "duty"
            ? `${round1(rec.hours)}h`
            : ATT_STATUS_META[rec.status].label
          : "";
        return `
          <button type="button" class="att-cal-cell ${isToday ? "is-today" : ""} ${statusClass}" data-date="${dateStr}" aria-label="${dateStr}${rec ? `, ${ATT_STATUS_META[rec.status].label}` : ""}">
            <span class="att-cal-day">${day}</span>
            ${badge ? `<span class="att-cal-hours">${badge}</span>` : ""}
          </button>
        `;
      })
      .join("");

    els.calendarGrid.querySelectorAll("[data-date]").forEach((cell) => {
      cell.addEventListener("click", () => openEditModal(cell.dataset.date));
    });
  }

  function renderHistory() {
    if (!els.historyBody) return;
    const monthRecords = AttendanceCalc.filterMonth(records, viewYear, viewMonth)
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date));

    if (!monthRecords.length) {
      if (els.historyTableWrap) els.historyTableWrap.hidden = true;
      if (els.historyEmpty) els.historyEmpty.hidden = false;
      return;
    }
    if (els.historyTableWrap) els.historyTableWrap.hidden = false;
    if (els.historyEmpty) els.historyEmpty.hidden = true;

    els.historyBody.innerHTML = monthRecords
      .map((r) => {
        const d = parseISO(r.date);
        const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
        const dateLabel = d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
        const meta = ATT_STATUS_META[r.status];
        const hoursLabel = r.status === "duty" ? `${round1(r.hours)}h` : "—";
        return `
          <tr>
            <td data-label="Date">${dateLabel}</td>
            <td data-label="Day">${dayName}</td>
            <td data-label="Hours">${hoursLabel}</td>
            <td data-label="Status"><span class="att-badge att-badge-${meta.dot}"><i class="att-dot att-dot-${meta.dot}"></i>${meta.label}</span></td>
            <td data-label="Action"><button type="button" class="att-edit-link" data-date="${r.date}">Edit</button></td>
          </tr>
        `;
      })
      .join("");

    els.historyBody.querySelectorAll("[data-date]").forEach((btn) => {
      btn.addEventListener("click", () => openEditModal(btn.dataset.date));
    });
  }

  // ---------- Quick "today" entry ----------
  els.entryForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const status = els.entryStatus.value;
    const validation = validateHours(els.entryHours.value.trim(), status);
    if (!validation.ok) { setInlineMsg(els.entryMsg, validation.message, "error"); return; }
    setInlineMsg(els.entryMsg, "", null);

    const dateStr = todayDateStr();
    await AttendanceStorage.saveAttendance({ date: dateStr, hours: validation.hours, status });
    records = await AttendanceStorage.getAttendance();

    const now = new Date();
    viewYear = now.getFullYear();
    viewMonth = now.getMonth();
    render();
    showToast("আজকের হাজিরা সেভ হয়েছে", "success");
    els.entryForm.reset();
    els.entryStatus.value = "duty";
  });

  // Typing a positive number implies Duty, matching the stated rule,
  // while still letting the user override the dropdown manually.
  els.entryHours?.addEventListener("input", () => {
    const raw = els.entryHours.value.trim();
    const n = Number(raw);
    if (raw !== "" && !Number.isNaN(n) && n > 0) els.entryStatus.value = "duty";
    setInlineMsg(els.entryMsg, "", null);
  });

  // ---------- Month navigation ----------
  function shiftMonth(delta) {
    viewMonth += delta;
    if (viewMonth < 0) { viewMonth = 11; viewYear -= 1; }
    else if (viewMonth > 11) { viewMonth = 0; viewYear += 1; }
    render();
  }
  els.prevBtn?.addEventListener("click", () => shiftMonth(-1));
  els.nextBtn?.addEventListener("click", () => shiftMonth(1));
  els.todayBtn?.addEventListener("click", () => {
    const now = new Date();
    viewYear = now.getFullYear();
    viewMonth = now.getMonth();
    render();
  });

  // ---------- Empty state CTA ----------
  els.emptyCta?.addEventListener("click", () => {
    els.entryHours?.focus();
  });

  // ---------- Edit / delete modal ----------
  function openEditModal(dateStr) {
    const rec = recordFor(dateStr);
    if (els.editDateKey) els.editDateKey.value = dateStr;
    if (els.modalDateDisplay) {
      els.modalDateDisplay.textContent = parseISO(dateStr).toLocaleDateString("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
      });
    }
    if (els.editHours) els.editHours.value = rec && rec.status === "duty" ? rec.hours : "";
    if (els.editStatus) els.editStatus.value = rec ? rec.status : "duty";
    if (els.deleteBtn) els.deleteBtn.hidden = !rec;
    setInlineMsg(els.editMsg, "", null);
    els.modal?.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }
  function closeEditModal() {
    els.modal?.classList.remove("is-open");
    document.body.style.overflow = "";
  }
  els.modalClose?.addEventListener("click", closeEditModal);
  els.modal?.addEventListener("click", (e) => {
    if (e.target === els.modal) closeEditModal();
  });

  els.editForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const status = els.editStatus.value;
    const validation = validateHours(els.editHours.value.trim(), status);
    if (!validation.ok) { setInlineMsg(els.editMsg, validation.message, "error"); return; }

    await AttendanceStorage.saveAttendance({
      date: els.editDateKey.value,
      hours: validation.hours,
      status,
    });
    records = await AttendanceStorage.getAttendance();
    closeEditModal();
    render();
    showToast("হাজিরা আপডেট হয়েছে", "success");
  });

  els.deleteBtn?.addEventListener("click", async () => {
    const ok = window.confirm("এই তারিখের হাজিরা রেকর্ড মুছে ফেলবেন? এটি পূর্বাবস্থায় ফেরানো যাবে না।");
    if (!ok) return;
    await AttendanceStorage.deleteAttendance(els.editDateKey.value);
    records = await AttendanceStorage.getAttendance();
    closeEditModal();
    render();
    showToast("হাজিরা রেকর্ড মুছে ফেলা হয়েছে", "success");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (els.modal?.classList.contains("is-open")) closeEditModal();
  });

  init();
});
