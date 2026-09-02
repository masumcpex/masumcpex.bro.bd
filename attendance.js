/* ATTENDANCE_JS_VERSION = 7 (member-card two-row layout + PDF export) */
/* =========================================================
   Attendance module — dynamic member management.
   Members are fully user-managed (add / rename / delete),
   persisted in LocalStorage, and each member's attendance is
   stored separately keyed by a stable member ID (never by
   name), so renaming never breaks history. Structure is kept
   Firebase-migration-friendly: getMembers/addMember/updateMember/
   deleteMember and getAttendance/saveAttendance/updateAttendance/
   deleteAttendance are the only storage entry points used by the UI.
   ========================================================= */

const ATT_AVATAR_COLORS = [
  "#2563EB", "#16A34A", "#D97706", "#DC2626", "#7C3AED",
  "#0891B2", "#DB2777", "#65A30D", "#334155", "#EA580C",
  "#0D9488", "#9333EA",
];

/* ---------- Member storage (LocalStorage, Firebase-ready shape) ---------- */
const MemberStorage = (() => {
  const KEY = "masum_attendance_members_v1";

  function readList() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error("Members: could not read from storage", err);
      return [];
    }
  }

  function writeList(list) {
    try {
      localStorage.setItem(KEY, JSON.stringify(list));
      return true;
    } catch (err) {
      console.error("Members: could not write to storage", err);
      return false;
    }
  }

  function genId() {
    return `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  return {
    async getMembers() {
      return readList();
    },

    async addMember(name) {
      const list = readList();
      const member = { id: genId(), name: name.trim() };
      list.push(member);
      writeList(list);
      return member;
    },

    async updateMember(id, newName) {
      const list = readList();
      const member = list.find((m) => m.id === id);
      if (!member) return null;
      member.name = newName.trim();
      writeList(list);
      return member;
    },

    async deleteMember(id) {
      const list = readList().filter((m) => m.id !== id);
      writeList(list);
      return true;
    },
  };
})();

/* ---------- Attendance storage, keyed by member ID ---------- */
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

    async deleteAllAttendance(memberId) {
      const store = readStore();
      delete store[memberId];
      writeStore(store);
      return true;
    },

    async deleteMonthAttendance(memberId, year, month) {
      const store = readStore();
      if (store[memberId]) {
        Object.keys(store[memberId]).forEach((dateStr) => {
          const d = new Date(`${dateStr}T00:00:00`);
          if (d.getFullYear() === year && d.getMonth() === month) {
            delete store[memberId][dateStr];
          }
        });
      }
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
    addMemberForm: document.getElementById("attAddMemberForm"),
    newMemberName: document.getElementById("attNewMemberName"),
    addMemberMsg: document.getElementById("attAddMemberMsg"),

    memberList: document.getElementById("attMemberList"),
    memberEmpty: document.getElementById("attMemberEmpty"),
    teamMonthLabel: document.getElementById("attTeamMonthLabel"),

    dashboard: document.getElementById("attDashboard"),
    noMemberState: document.getElementById("attNoMemberState"),

    selectedName: document.getElementById("attSelectedName"),
    entryMemberName: document.getElementById("attEntryMemberName"),

    prevBtn: document.getElementById("attPrevMonth"),
    nextBtn: document.getElementById("attNextMonth"),
    monthLabel: document.getElementById("attMonthLabel"),
    todayBtn: document.getElementById("attTodayBtn"),

    exportPdfBtn: document.getElementById("attExportPdfBtn"),
    clearMonthBtn: document.getElementById("attClearMonthBtn"),

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

  let members = [];
  let selectedMemberId = null;
  let viewYear;
  let viewMonth;
  let records = [];

  function memberById(id) {
    return members.find((m) => m.id === id) || null;
  }

  function loadSelectedMemberId() {
    const saved = localStorage.getItem(SELECTED_KEY);
    if (saved && members.some((m) => m.id === saved)) return saved;
    return members.length ? members[0].id : null;
  }
  function persistSelectedMemberId(id) {
    try {
      if (id) localStorage.setItem(SELECTED_KEY, id);
      else localStorage.removeItem(SELECTED_KEY);
    } catch (err) { /* ignore */ }
  }

  function initials(name) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "?";
    return parts.map((w) => w[0]).slice(0, 2).join("").toUpperCase();
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

  /* ---------- Init ---------- */
  async function init() {
    members = await MemberStorage.getMembers();
    selectedMemberId = loadSelectedMemberId();
    records = selectedMemberId ? await AttendanceStorage.getAttendance(selectedMemberId) : [];

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
    await renderMemberList();
    toggleDashboard();
    if (!selectedMemberId) return;

    renderSelectedName();
    const summary = AttendanceCalc.summarize(records, viewYear, viewMonth);
    renderSummary(summary);
    renderCalendar();
    renderHistory();
  }

  function toggleDashboard() {
    const hasSelection = Boolean(selectedMemberId);
    if (els.dashboard) els.dashboard.hidden = !hasSelection;
    if (els.noMemberState) els.noMemberState.hidden = hasSelection;
  }

  function renderMonthLabel() {
    const text = `${ATT_MONTH_NAMES[viewMonth]} ${viewYear}`;
    if (els.monthLabel) els.monthLabel.textContent = text;
    if (els.teamMonthLabel) els.teamMonthLabel.textContent = text;
  }

  function renderSelectedName() {
    const member = memberById(selectedMemberId);
    const name = member ? member.name : "—";
    if (els.selectedName) els.selectedName.textContent = name;
    if (els.entryMemberName) els.entryMemberName.textContent = member ? `— ${name}` : "";
  }

  /* ---------- Member management + selector ---------- */
  async function renderMemberList() {
    if (!els.memberList) return;

    if (!members.length) {
      els.memberList.innerHTML = "";
      if (els.memberEmpty) els.memberEmpty.hidden = false;
      return;
    }
    if (els.memberEmpty) els.memberEmpty.hidden = true;

    const rows = [];
    for (let i = 0; i < members.length; i += 1) {
      const member = members[i];
      const memberRecords = await AttendanceStorage.getAttendance(member.id);
      const s = AttendanceCalc.summarize(memberRecords, viewYear, viewMonth);
      const isSelected = member.id === selectedMemberId;
      rows.push(`
        <div class="att-member-card ${isSelected ? "is-selected" : ""}" data-member-id="${member.id}">
          <button type="button" class="att-member-main" data-select-id="${member.id}">
            <span class="att-member-top">
              <span class="att-member-avatar" style="background:${avatarColor(i)}">${initials(member.name)}</span>
              <span class="att-member-name">👤 ${escapeHtml(member.name)}</span>
            </span>
            <span class="att-member-stats">${round1(s.totalHours)}h · ${s.dutyDays} Duty · ${s.leaveDays} Leave</span>
          </button>
          <span class="att-member-actions">
            <button type="button" class="att-member-action-btn" data-rename-id="${member.id}" aria-label="Rename member" title="Rename">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg>
            </button>
            <button type="button" class="att-member-action-btn att-member-action-danger" data-delete-id="${member.id}" aria-label="Delete member" title="Delete">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg>
            </button>
          </span>
        </div>
      `);
    }
    els.memberList.innerHTML = rows.join("");

    els.memberList.querySelectorAll("[data-select-id]").forEach((btn) => {
      btn.addEventListener("click", () => selectMember(btn.dataset.selectId));
    });
    els.memberList.querySelectorAll("[data-rename-id]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        renameMember(btn.dataset.renameId);
      });
    });
    els.memberList.querySelectorAll("[data-delete-id]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        removeMember(btn.dataset.deleteId);
      });
    });
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  async function selectMember(memberId) {
    if (memberId === selectedMemberId) return;
    selectedMemberId = memberId;
    persistSelectedMemberId(memberId);
    records = await AttendanceStorage.getAttendance(memberId);
    await render();
  }

  els.addMemberForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = (els.newMemberName?.value || "").trim();
    if (!name) {
      setInlineMsg(els.addMemberMsg, "দয়া করে একটি নাম লিখুন।", "error");
      return;
    }
    setInlineMsg(els.addMemberMsg, "", null);

    const member = await MemberStorage.addMember(name);
    members = await MemberStorage.getMembers();
    const wasEmpty = !selectedMemberId;
    if (wasEmpty) {
      selectedMemberId = member.id;
      persistSelectedMemberId(member.id);
      records = await AttendanceStorage.getAttendance(member.id);
    }
    els.addMemberForm.reset();
    await render();
    showToast(`${member.name} সফলভাবে যোগ করা হয়েছে`, "success");
  });

  async function renameMember(memberId) {
    const member = memberById(memberId);
    if (!member) return;
    const next = window.prompt("নতুন নাম লিখুন:", member.name);
    if (next === null) return;
    const trimmed = next.trim();
    if (!trimmed || trimmed === member.name) return;

    await MemberStorage.updateMember(memberId, trimmed);
    members = await MemberStorage.getMembers();
    await render();
    showToast("নাম আপডেট হয়েছে", "success");
  }

  async function removeMember(memberId) {
    const member = memberById(memberId);
    if (!member) return;
    const ok = window.confirm(
      `"${member.name}" কে মুছে ফেলবেন? তার সকল হাজিরা রেকর্ডও মুছে যাবে। এটি পূর্বাবস্থায় ফেরানো যাবে না।`
    );
    if (!ok) return;

    await MemberStorage.deleteMember(memberId);
    await AttendanceStorage.deleteAllAttendance(memberId);
    members = await MemberStorage.getMembers();

    if (selectedMemberId === memberId) {
      selectedMemberId = members.length ? members[0].id : null;
      persistSelectedMemberId(selectedMemberId);
      records = selectedMemberId ? await AttendanceStorage.getAttendance(selectedMemberId) : [];
    }

    await render();
    showToast(`${member.name} মুছে ফেলা হয়েছে`, "success");
  }

  /* ---------- Summary / calendar / history ---------- */
  function renderSummary(s) {
    if (!els.summaryGrid) return;
    const cards = [
      { value: `${round1(s.totalHours)}h`, label: "Total Hours" },
      { value: s.dutyDays, label: "Duty Days" },
      { value: s.leaveDays, label: "Leave" },
      { value: s.offDays, label: "Off Days" },
      { value: s.holidayDays, label: "Holiday" },
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
    if (els.clearMonthBtn) els.clearMonthBtn.disabled = s.markedDays === 0;
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
    if (!selectedMemberId) return;
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
    showToast(`${memberById(selectedMemberId)?.name || ""}-এর আজকের হাজিরা সেভ হয়েছে`, "success");
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

  els.clearMonthBtn?.addEventListener("click", async () => {
    if (!selectedMemberId) return;
    const member = memberById(selectedMemberId);
    if (!member) return;
    const monthLabel = `${ATT_MONTH_NAMES[viewMonth]} ${viewYear}`;
    const ok = window.confirm(
      `"${member.name}"-এর ${monthLabel} মাসের সব হাজিরা রেকর্ড মুছে ফেলবেন?\n\nসদস্যের নাম ও অন্য মাসের রেকর্ড অক্ষত থাকবে — শুধু এই মাসেরটাই মুছে যাবে। এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।`
    );
    if (!ok) return;

    await AttendanceStorage.deleteMonthAttendance(selectedMemberId, viewYear, viewMonth);
    records = await AttendanceStorage.getAttendance(selectedMemberId);
    await render();
    showToast(`${monthLabel}-এর হাজিরা মুছে ফেলা হয়েছে`, "success");
  });

  /* ---------- PDF report export ---------- */
  const REPORT_LOGO_SRC = "masum.png";
  const REPORT_FALLBACK_COLOR = [37, 99, 235];

  function cssColorToRgb(colorStr) {
    if (!colorStr) return REPORT_FALLBACK_COLOR;
    try {
      const ctx = document.createElement("canvas").getContext("2d");
      ctx.fillStyle = "#000000";
      ctx.fillStyle = colorStr.trim();
      const normalized = ctx.fillStyle;
      if (normalized.startsWith("#")) {
        let hex = normalized.slice(1);
        if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
        const bigint = parseInt(hex, 16);
        return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
      }
      const nums = normalized.match(/[\d.]+/g);
      if (nums && nums.length >= 3) return nums.slice(0, 3).map((n) => Math.round(Number(n)));
    } catch (err) { /* fall through */ }
    return REPORT_FALLBACK_COLOR;
  }

  function getSiteAccentColor() {
    const rootStyles = getComputedStyle(document.documentElement);
    const raw = rootStyles.getPropertyValue("--color-accent");
    return cssColorToRgb(raw);
  }

  function loadImageAsDataURL(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          resolve({
            dataUrl: canvas.toDataURL("image/png"),
            width: img.naturalWidth,
            height: img.naturalHeight,
          });
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error("logo failed to load"));
      img.src = src;
    });
  }

  async function exportMemberReportPdf() {
    if (!selectedMemberId) return;
    const member = memberById(selectedMemberId);
    if (!member) return;

    if (!window.jspdf || !window.jspdf.jsPDF) {
      showToast("PDF তৈরি করা যায়নি, পেজ রিলোড করে আবার চেষ্টা করুন।", "error");
      return;
    }

    if (els.exportPdfBtn) els.exportPdfBtn.disabled = true;

    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 42;
      const REPORT_BRAND_COLOR = getSiteAccentColor();
      let logo = null;
      try {
        logo = await loadImageAsDataURL(REPORT_LOGO_SRC);
      } catch (err) {
        logo = null;
      }

      let headTextX = margin;
      const headTop = margin;

      if (logo) {
        const logoW = 44;
        const logoH = (logo.height / logo.width) * logoW;
        doc.addImage(logo.dataUrl, "PNG", margin, headTop - 4, logoW, logoH);
        headTextX = margin + logoW + 14;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(20, 20, 20);
      doc.text("Attendance Management System", headTextX, headTop + 14);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(120, 120, 120);
      doc.text("masumcpex.bro.bd", headTextX, headTop + 27);
      doc.text("masumcpex.com", headTextX, headTop + 38);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(17);
      doc.setTextColor(...REPORT_BRAND_COLOR);
      doc.text("Attendance Report", pageWidth - margin, headTop + 12, { align: "right" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      doc.text(`${ATT_MONTH_NAMES[viewMonth]} ${viewYear}`, pageWidth - margin, headTop + 27, { align: "right" });

      let cursorY = headTop + 54;
      doc.setDrawColor(...REPORT_BRAND_COLOR);
      doc.setLineWidth(1.4);
      doc.line(margin, cursorY, pageWidth - margin, cursorY);
      cursorY += 26;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(20, 20, 20);
      doc.text(member.name, margin, cursorY);
      cursorY += 18;

      const s = AttendanceCalc.summarize(records, viewYear, viewMonth);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(70, 70, 70);
      const summaryLine =
        `Total Hours: ${round1(s.totalHours)}h    Duty Days: ${s.dutyDays}    ` +
        `Leave: ${s.leaveDays}    Off: ${s.offDays}    Holiday: ${s.holidayDays}    ` +
        `Avg / Duty Day: ${round1(s.avgHours)}h`;
      doc.text(summaryLine, margin, cursorY);
      cursorY += 20;

      const monthRecords = AttendanceCalc.filterMonth(records, viewYear, viewMonth)
        .slice()
        .sort((a, b) => a.date.localeCompare(b.date));

      const body = monthRecords.map((r) => {
        const d = parseISO(r.date);
        return [
          d.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
          d.toLocaleDateString("en-US", { weekday: "long" }),
          r.status === "duty" ? `${round1(r.hours)}h` : "—",
          ATT_STATUS_META[r.status].label,
        ];
      });

      const generatedAt = new Date();
      const generatedStr = `Generated: ${generatedAt.toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
      })}, ${generatedAt.toLocaleTimeString("en-US", {
        hour: "numeric", minute: "2-digit", second: "2-digit",
      })}`;

      function drawFooter() {
        const pageHeight = doc.internal.pageSize.getHeight();
        const footerY = pageHeight - 24;
        doc.setDrawColor(228, 228, 228);
        doc.setLineWidth(0.6);
        doc.line(margin, footerY - 12, pageWidth - margin, footerY - 12);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(130, 130, 130);
        doc.text("masumcpex.com   |   admin@masumcpex.com", margin, footerY);
        doc.text(generatedStr, pageWidth - margin, footerY, { align: "right" });
      }

      if (typeof doc.autoTable === "function") {
        doc.autoTable({
          startY: cursorY,
          margin: { left: margin, right: margin, bottom: 46 },
          head: [["Date", "Day", "Hours", "Status"]],
          body: body.length ? body : [["—", "—", "—", "No records this month"]],
          theme: "grid",
          headStyles: { fillColor: REPORT_BRAND_COLOR, textColor: 255, fontStyle: "bold", fontSize: 9 },
          bodyStyles: { fontSize: 9, textColor: [40, 40, 40] },
          alternateRowStyles: { fillColor: [246, 248, 247] },
          styles: { cellPadding: 6 },
          didDrawPage: drawFooter,
        });
      } else {
        drawFooter();
      }

      const safeName = member.name.trim().replace(/\s+/g, "_").replace(/[^\w-]/g, "") || "Member";
      const fileName = `${safeName}_Attendance_${ATT_MONTH_NAMES[viewMonth]}_${viewYear}.pdf`;
      doc.save(fileName);
      showToast("PDF রিপোর্ট ডাউনলোড হয়েছে", "success");
    } catch (err) {
      console.error("PDF export failed", err);
      showToast("PDF তৈরি করতে সমস্যা হয়েছে", "error");
    } finally {
      if (els.exportPdfBtn) els.exportPdfBtn.disabled = false;
    }
  }

  els.exportPdfBtn?.addEventListener("click", exportMemberReportPdf);

  function openEditModal(dateStr) {
    if (!selectedMemberId) return;
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
    if (!selectedMemberId) return;
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
    if (!selectedMemberId) return;
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
