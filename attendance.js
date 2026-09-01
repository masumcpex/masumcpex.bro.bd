const ATTENDANCE_MEMBERS = [
  { id: "masum", name: "Masum" },
  { id: "member2", name: "Member 2" },
  { id: "member3", name: "Member 3" },
  { id: "member4", name: "Member 4" },
  { id: "member5", name: "Member 5" },
  { id: "member6", name: "Member 6" },
  { id: "member7", name: "Member 7" },
  { id: "member8", name: "Member 8" },
  { id: "member9", name: "Member 9" },
];

const ATT_AVATAR_COLORS = [
  "#2563EB", "#16A34A", "#D97706", "#DC2626", "#7C3AED",
  "#0891B2", "#DB2777", "#65A30D", "#334155",
];

const AttendanceStorage = (() => {
  const KEY = "masum_attendance_v2";
  const LEGACY_KEY = "masum_attendance_records_v1";
  const LEGACY_MEMBER_ID = "masum";

  function migrateLegacy() {
    try {
      const raw = localStorage.getItem(LEGACY_KEY);
      if (!raw) return {};
      const oldRecords = JSON.parse(raw);
      if (!Array.isArray(oldRecords) || !oldRecords.length) return {};
      const map = {};
      oldRecords.forEach((r) => {
        map[r.date] = { hours: r.hours, status: r.status };
      });
      const store = { [LEGACY_MEMBER_ID]: map };
      writeStore(store);
      return store;
    } catch (err) {
      console.error("Attendance: legacy migration failed", err);
      return {};
    }
  }

  function readStore() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : {};
      }
    } catch (err) {
      console.error("Attendance: could not read from storage", err);
    }
    return migrateLegacy();
  }

  function writeStore(store) {
    try {
      localStorage.setItem(KEY, JSON.stringify(store));
      return true;
    } catch (err) {
      console.error("Attendance: could not write to storage", err);
      return false;
    }
  }

  function toArray(memberMap) {
    return Object.keys(memberMap || {}).map((date) => ({ date, ...memberMap[date] }));
  }

  return {
    async getAttendance(memberId) {
      const store = readStore();
      return toArray(store[memberId]);
    },

    async saveAttendance(memberId, record) {
      const store = readStore();
      if (!store[memberId]) store[memberId] = {};
      store[memberId][record.date] = { hours: record.hours, status: record.status };
      writeStore(store);
      return record;
    },

    async updateAttendance(memberId, date, changes) {
      const store = readStore();
      if (!store[memberId] || !store[memberId][date]) return null;
      store[memberId][date] = { ...store[memberId][date], ...changes };
      writeStore(store);
      return store[memberId][date];
    },

    async deleteAttendance(memberId, date) {
      const store = readStore();
      if (store[memberId]) delete store[memberId][date];
      writeStore(store);
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
  build(year, month) {
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let startOffset = firstDay.getDay() - 1;
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
  if (!attSection) return;

  const els = {
    memberList: document.getElementById("attMemberList"),
    teamMonthLabel: document.getElementById("attTeamMonthLabel"),
    selectedName: document.getElementById("attSelectedName"),
    entryMemberName: document.getElementById("attEntryMemberName"),

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

  const SELECTED_KEY = "masum_attendance_selected_member";

  let selectedMemberId;
  let viewYear;
  let viewMonth;
  let records = [];

  function memberById(id) {
    return ATTENDANCE_MEMBERS.find((m) => m.id === id) || ATTENDANCE_MEMBERS[0];
  }
  function loadSelectedMemberId() {
    const saved = localStorage.getItem(SELECTED_KEY);
    if (saved && ATTENDANCE_MEMBERS.some((m) => m.id === saved)) return saved;
    return ATTENDANCE_MEMBERS[0].id;
  }
  function persistSelectedMemberId(id) {
    try { localStorage.setItem(SELECTED_KEY, id); } catch (err) { /* ignore */ }
  }
  function initials(name) {
    return name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  }
  function avatarColor(index) {
    return ATT_AVATAR_COLORS[index % ATT_AVATAR_COLORS.length];
  }

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
    selectedMemberId = loadSelectedMemberId();
    records = await AttendanceStorage.getAttendance(selectedMemberId);
    const now = new Date();
    viewYear = now.getFullYear();
    viewMonth = now.getMonth();
    if (els.entryDate) {
      els.entryDate.textContent = now.toLocaleDateString("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
      });
    }
    await render();
  }

  async function render() {
    renderMonthLabel();
    renderSelectedName();
    await renderMemberList();
    const summary = AttendanceCalc.summarize(records, viewYear, viewMonth);
    renderSummary(summary);
    renderCalendar();
    renderHistory();
  }

  function renderMonthLabel() {
    const text = `${ATT_MONTH_NAMES[viewMonth]} ${viewYear}`;
    if (els.monthLabel) els.monthLabel.textContent = text;
    if (els.teamMonthLabel) els.teamMonthLabel.textContent = text;
  }

  function renderSelectedName() {
    const name = memberById(selectedMemberId).name;
    if (els.selectedName) els.selectedName.textContent = name;
    if (els.entryMemberName) els.entryMemberName.textContent = `— ${name}`;
  }

  async function renderMemberList() {
    if (!els.memberList) return;
    const rows = [];
    for (let i = 0; i < ATTENDANCE_MEMBERS.length; i += 1) {
      const member = ATTENDANCE_MEMBERS[i];
      const memberRecords = await AttendanceStorage.getAttendance(member.id);
      const s = AttendanceCalc.summarize(memberRecords, viewYear, viewMonth);
      const isSelected = member.id === selectedMemberId;
      rows.push(`
        <button type="button" class="att-member-card ${isSelected ? "is-selected" : ""}" data-member-id="${member.id}">
          <span class="att-member-avatar" style="background:${avatarColor(i)}">${initials(member.name)}</span>
          <span class="att-member-info">
            <span class="att-member-name">${member.name}</span>
            <span class="att-member-stats">${round1(s.totalHours)}h · ${s.dutyDays} Duty · ${s.leaveDays} Leave</span>
          </span>
        </button>
      `);
    }
    els.memberList.innerHTML = rows.join("");
    els.memberList.querySelectorAll("[data-member-id]").forEach((btn) => {
      btn.addEventListener("click", () => selectMember(btn.dataset.memberId));
    });
  }

  async function selectMember(memberId) {
    if (memberId === selectedMemberId) return;
    selectedMemberId = memberId;
    persistSelectedMemberId(memberId);
    records = await AttendanceStorage.getAttendance(memberId);
    await render();
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

  els.entryForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const status = els.entryStatus.value;
    const validation = validateHours(els.entryHours.value.trim(), status);
    if (!validation.ok) { setInlineMsg(els.entryMsg, validation.message, "error"); return; }
    setInlineMsg(els.entryMsg, "", null);

    const dateStr = todayDateStr();
    await AttendanceStorage.saveAttendance(selectedMemberId, { date: dateStr, hours: validation.hours, status });
    records = await AttendanceStorage.getAttendance(selectedMemberId);

    const now = new Date();
    viewYear = now.getFullYear();
    viewMonth = now.getMonth();
    await render();
    showToast(`${memberById(selectedMemberId).name}-এর আজকের হাজিরা সেভ হয়েছে`, "success");
    els.entryForm.reset();
    els.entryStatus.value = "duty";
  });

  els.entryHours?.addEventListener("input", () => {
    const raw = els.entryHours.value.trim();
    const n = Number(raw);
    if (raw !== "" && !Number.isNaN(n) && n > 0) els.entryStatus.value = "duty";
    setInlineMsg(els.entryMsg, "", null);
  });

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

  els.emptyCta?.addEventListener("click", () => {
    els.entryHours?.focus();
  });

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

    await AttendanceStorage.saveAttendance(selectedMemberId, {
      date: els.editDateKey.value,
      hours: validation.hours,
      status,
    });
    records = await AttendanceStorage.getAttendance(selectedMemberId);
    closeEditModal();
    await render();
    showToast("হাজিরা আপডেট হয়েছে", "success");
  });

  els.deleteBtn?.addEventListener("click", async () => {
    const ok = window.confirm("এই তারিখের হাজিরা রেকর্ড মুছে ফেলবেন? এটি পূর্বাবস্থায় ফেরানো যাবে না।");
    if (!ok) return;
    await AttendanceStorage.deleteAttendance(selectedMemberId, els.editDateKey.value);
    records = await AttendanceStorage.getAttendance(selectedMemberId);
    closeEditModal();
    await render();
    showToast("হাজিরা রেকর্ড মুছে ফেলা হয়েছে", "success");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (els.modal?.classList.contains("is-open")) closeEditModal();
  });

  init();
});
