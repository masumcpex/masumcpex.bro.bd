const ATT_AVATAR_COLORS = [
  "#2563EB", "#16A34A", "#D97706", "#DC2626", "#7C3AED",
  "#0891B2", "#DB2777", "#65A30D", "#334155", "#EA580C",
  "#0D9488", "#9333EA",
];

const ICON_DOTS = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.7"></circle><circle cx="12" cy="12" r="1.7"></circle><circle cx="12" cy="19" r="1.7"></circle></svg>';
const ICON_EYE = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
const ICON_EDIT = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg>';
const ICON_TRASH = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg>';
const ICON_USERS = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>';
const ICON_CHEVRON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';
const ICON_CLOSE = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

const ATT_ADMIN_UID = "ZyPCiTwxSmU3piZ7hyI3jfjcpsB3";
const ATT_MEMBERS_COLLECTION = "attendance_members";

function attDb() {
  return firebase.firestore();
}

const MemberStorage = {
  async ensureSelf(user) {
    const ref = attDb().collection(ATT_MEMBERS_COLLECTION).doc(user.uid);
    const snap = await ref.get();
    if (!snap.exists) {
      await ref.set({
        name: user.displayName || user.email || "Member",
        photoURL: user.photoURL || "",
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    }
    return ref;
  },

  async addMember(name) {
    const trimmed = name.trim();
    const ref = attDb().collection(ATT_MEMBERS_COLLECTION).doc();
    await ref.set({
      name: trimmed,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return { id: ref.id, name: trimmed };
  },

  async getMembers(currentUid, isAdmin) {
    if (isAdmin) {
      const snap = await attDb().collection(ATT_MEMBERS_COLLECTION).get();
      return snap.docs.map((d) => ({ id: d.id, name: d.data().name || "Member" }));
    }
    const snap = await attDb().collection(ATT_MEMBERS_COLLECTION).doc(currentUid).get();
    if (!snap.exists) return [];
    return [{ id: snap.id, name: snap.data().name || "Member" }];
  },

  async updateMember(id, newName) {
    const trimmed = newName.trim();
    await attDb().collection(ATT_MEMBERS_COLLECTION).doc(id).update({ name: trimmed });
    return { id, name: trimmed };
  },

  async deleteMember(id) {
    await attDb().collection(ATT_MEMBERS_COLLECTION).doc(id).delete();
    return true;
  },
};

const AttendanceStorage = {
  async getAttendance(memberId) {
    const snap = await attDb().collection(ATT_MEMBERS_COLLECTION).doc(memberId).get();
    const records = (snap.exists && snap.data().records) || {};
    return Object.keys(records).map((date) => ({ date, ...records[date] }));
  },

  async saveAttendance(memberId, record) {
    await attDb().collection(ATT_MEMBERS_COLLECTION).doc(memberId).set(
      { records: { [record.date]: { hours: record.hours, status: record.status } } },
      { merge: true }
    );
    return record;
  },

  async updateAttendance(memberId, date, changes) {
    const ref = attDb().collection(ATT_MEMBERS_COLLECTION).doc(memberId);
    const snap = await ref.get();
    const existing = (snap.exists && snap.data().records && snap.data().records[date]) || {};
    const merged = { ...existing, ...changes };
    await ref.set({ records: { [date]: merged } }, { merge: true });
    return merged;
  },

  async deleteAttendance(memberId, date) {
    const ref = attDb().collection(ATT_MEMBERS_COLLECTION).doc(memberId);
    await ref.update({ [`records.${date}`]: firebase.firestore.FieldValue.delete() });
    return true;
  },

  async deleteAllAttendance(memberId) {
    const ref = attDb().collection(ATT_MEMBERS_COLLECTION).doc(memberId);
    await ref.update({ records: {} });
    return true;
  },

  async deleteMonthAttendance(memberId, year, month) {
    const ref = attDb().collection(ATT_MEMBERS_COLLECTION).doc(memberId);
    const snap = await ref.get();
    const records = (snap.exists && snap.data().records) || {};
    const updates = {};
    Object.keys(records).forEach((dateStr) => {
      const d = new Date(`${dateStr}T00:00:00`);
      if (d.getFullYear() === year && d.getMonth() === month) {
        updates[`records.${dateStr}`] = firebase.firestore.FieldValue.delete();
      }
    });
    if (Object.keys(updates).length) await ref.update(updates);
    return true;
  },
};

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
    addMemberOpen: document.getElementById("attAddMemberOpen"),
    addMemberModal: document.getElementById("attAddMemberModal"),
    addMemberModalClose: document.getElementById("attAddMemberModalClose"),
    addMemberCancel: document.getElementById("attAddMemberCancel"),
    addMemberForm: document.getElementById("attAddMemberForm"),
    newMemberName: document.getElementById("attNewMemberName"),
    addMemberMsg: document.getElementById("attAddMemberMsg"),

    memberList: document.getElementById("attMemberList"),
    memberEmpty: document.getElementById("attMemberEmpty"),

    dashboard: document.getElementById("attDashboard"),
    noMemberState: document.getElementById("attNoMemberState"),

    selectedName: document.getElementById("attSelectedName"),
    selectedAvatar: document.getElementById("attSelectedAvatar"),
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

    confirmModal: document.getElementById("attConfirmModal"),
    confirmModalTitle: document.getElementById("attConfirmModalTitle"),
    confirmModalMessage: document.getElementById("attConfirmModalMessage"),
    confirmModalCancel: document.getElementById("attConfirmModalCancel"),
    confirmModalConfirm: document.getElementById("attConfirmModalConfirm"),

    toastWrap: document.getElementById("attToastWrap"),

    // Built dynamically the first time an admin opens the "Team Members" card.
    teamModal: null,
    teamModalClose: null,
    teamModalList: null,
    teamModalTitle: null,
  };

  const SELECTED_KEY = "masum_attendance_selected_member";

  let members = [];
  let othersCache = [];
  let selectedMemberId = null;
  let viewYear;
  let viewMonth;
  let records = [];
  let confirmAction = null;
  let currentUid = null;
  let isAdmin = false;
  let teamModalBuilt = false;

  function memberById(id) {
    return members.find((m) => m.id === id) || null;
  }

  function loadSelectedMemberId() {
    if (!isAdmin) return currentUid;
    const saved = localStorage.getItem(SELECTED_KEY);
    if (saved && members.some((m) => m.id === saved)) return saved;
    return members.length ? members[0].id : null;
  }
  function persistSelectedMemberId(id) {
    if (!isAdmin) return;
    try {
      if (id) localStorage.setItem(SELECTED_KEY, id);
      else localStorage.removeItem(SELECTED_KEY);
    } catch (err) {}
  }

  function initials(name) {
    const parts = (name || "").trim().split(/\s+/).filter(Boolean);
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
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
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

  function closeAllMenus() {
    document.querySelectorAll(".att-menu-dropdown.is-open").forEach((el) => {
      el.classList.remove("is-open");
      const toggle = el.previousElementSibling;
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    });
  }

  /* ---------------- Add Member modal (kept for compatibility — panel is hidden) ---------------- */
  function openAddMemberModal() {
    if (els.newMemberName) els.newMemberName.value = "";
    setInlineMsg(els.addMemberMsg, "", null);
    els.addMemberModal?.classList.add("is-open");
    document.body.style.overflow = "hidden";
    els.newMemberName?.focus();
  }
  function closeAddMemberModal() {
    els.addMemberModal?.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  /* ---------------- Generic confirm modal ---------------- */
  function openConfirmModal(title, message, confirmLabel, action) {
    if (els.confirmModalTitle) els.confirmModalTitle.textContent = title;
    if (els.confirmModalMessage) els.confirmModalMessage.textContent = message;
    if (els.confirmModalConfirm) els.confirmModalConfirm.textContent = confirmLabel;
    confirmAction = action;
    els.confirmModal?.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }
  function closeConfirmModal() {
    els.confirmModal?.classList.remove("is-open");
    document.body.style.overflow = "";
    confirmAction = null;
  }

  /* ---------------- Edit-attendance modal ---------------- */
  function openEditModal(dateStr) {
    const rec = recordFor(dateStr);
    if (els.editDateKey) els.editDateKey.value = dateStr;
    if (els.editHours) els.editHours.value = rec && rec.status === "duty" ? rec.hours : "";
    if (els.editStatus) els.editStatus.value = rec ? rec.status : "duty";
    if (els.modalDateDisplay) {
      const d = parseISO(dateStr);
      els.modalDateDisplay.textContent = d.toLocaleDateString("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
      });
    }
    setInlineMsg(els.editMsg, "", null);
    if (els.deleteBtn) els.deleteBtn.hidden = !rec;
    els.modal?.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }
  function closeEditModal() {
    els.modal?.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  /* ---------------- Team Members modal (built once, on first use) ---------------- */
  function ensureTeamModal() {
    if (teamModalBuilt) return;
    teamModalBuilt = true;

    const markup = `
      <div class="modal-overlay" id="attTeamModal" role="dialog" aria-modal="true" aria-labelledby="attTeamModalTitle">
        <div class="modal-box att-modal-box att-team-modal-box">
          <button class="icon-btn modal-close" id="attTeamModalClose" type="button" aria-label="বন্ধ করুন">${ICON_CLOSE}</button>
          <h3 class="modal-title" id="attTeamModalTitle">Team Members</h3>
          <div class="att-team-modal-list" id="attTeamModalList"></div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", markup);

    els.teamModal = document.getElementById("attTeamModal");
    els.teamModalClose = document.getElementById("attTeamModalClose");
    els.teamModalList = document.getElementById("attTeamModalList");
    els.teamModalTitle = document.getElementById("attTeamModalTitle");

    els.teamModalClose?.addEventListener("click", closeTeamModal);
    els.teamModal?.addEventListener("click", (e) => {
      if (e.target === els.teamModal) closeTeamModal();
    });
    els.teamModalList?.addEventListener("click", handleMemberListClick);
  }
  function openTeamModal() {
    ensureTeamModal();
    renderTeamModalList();
    els.teamModal?.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }
  function closeTeamModal() {
    els.teamModal?.classList.remove("is-open");
    document.body.style.overflow = "";
  }
  function renderTeamModalList() {
    if (!els.teamModalList) return;
    if (els.teamModalTitle) {
      els.teamModalTitle.textContent = `Team Members — ${othersCache.length}`;
    }
    if (!othersCache.length) {
      els.teamModalList.innerHTML = `<p class="att-form-msg">কোনো টিম মেম্বার নেই।</p>`;
      return;
    }
    els.teamModalList.innerHTML = othersCache.map(({ member, summary, colorIndex }) => {
      const isSelected = member.id === selectedMemberId;
      return `
        <div class="att-team-row ${isSelected ? "is-selected" : ""}" data-member-id="${member.id}">
          <span class="att-member-avatar att-team-row-avatar" style="background:${avatarColor(colorIndex)}">${initials(member.name)}</span>
          <span class="att-team-row-info">
            <span class="att-member-name">${escapeHtml(member.name)}</span>
            <span class="att-team-row-stats">${round1(summary.totalHours)}h &middot; ${summary.dutyDays} duty &middot; ${summary.leaveDays} leave</span>
          </span>
          <button type="button" class="att-team-view-btn" data-view-id="${member.id}">${ICON_EYE}<span>View</span></button>
          <span class="att-menu att-team-row-menu">
            <button type="button" class="att-menu-toggle" data-menu-toggle aria-haspopup="true" aria-expanded="false" aria-label="অপশন">${ICON_DOTS}</button>
            <span class="att-menu-dropdown" role="menu">
              <button type="button" class="att-menu-item" data-rename-id="${member.id}" role="menuitem">${ICON_EDIT}<span>Rename</span></button>
              <button type="button" class="att-menu-item att-menu-item-danger" data-delete-id="${member.id}" role="menuitem">${ICON_TRASH}<span>Delete</span></button>
            </span>
          </span>
        </div>
      `;
    }).join("");
  }

  /* ---------------- App start / reset (called from attendance-auth.js) ---------------- */
  async function start(user) {
    currentUid = user.uid;
    isAdmin = user.uid === ATT_ADMIN_UID;
    await MemberStorage.ensureSelf(user);

    const manageWrap = document.getElementById("attManageWrap");
    if (manageWrap) manageWrap.hidden = true;
    const teamWrap = document.getElementById("attTeamWrap");
    if (teamWrap) teamWrap.hidden = !isAdmin;

    members = await MemberStorage.getMembers(currentUid, isAdmin);
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

  function reset() {
    members = [];
    othersCache = [];
    selectedMemberId = null;
    records = [];
    currentUid = null;
    isAdmin = false;
    closeAddMemberModal();
    closeConfirmModal();
    closeEditModal();
    closeTeamModal();
    if (els.memberList) els.memberList.innerHTML = "";
    if (els.historyBody) els.historyBody.innerHTML = "";
    if (els.calendarGrid) els.calendarGrid.innerHTML = "";
    if (els.summaryGrid) els.summaryGrid.innerHTML = "";
  }

  /* ---------------- Rendering ---------------- */
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
  }

  function renderSelectedName() {
    const member = memberById(selectedMemberId);
    const name = member ? member.name : "—";
    const memberIndex = member ? members.findIndex((m) => m.id === member.id) : -1;
    if (els.selectedName) els.selectedName.textContent = name;
    if (els.selectedAvatar) {
      els.selectedAvatar.textContent = member ? initials(member.name) : "—";
      els.selectedAvatar.style.background = member ? avatarColor(Math.max(memberIndex, 0)) : "";
    }
    if (els.entryMemberName) els.entryMemberName.textContent = member ? `— ${name}` : "";
  }

  // Your own card is always shown up front; everyone else collapses into a
  // single "Team Members" summary card that opens the team modal on click.
  async function renderMemberList() {
    if (!els.memberList) return;

    if (!members.length) {
      els.memberList.innerHTML = "";
      if (els.memberEmpty) els.memberEmpty.hidden = false;
      return;
    }
    if (els.memberEmpty) els.memberEmpty.hidden = true;

    const selfMember = memberById(currentUid);
    const others = members.filter((m) => m.id !== currentUid);

    let html = "";

    if (selfMember) {
      const selfRecords = await AttendanceStorage.getAttendance(selfMember.id);
      const s = AttendanceCalc.summarize(selfRecords, viewYear, viewMonth);
      const isSelected = selfMember.id === selectedMemberId;
      html += `
        <div class="att-member-card att-member-card-self ${isSelected ? "is-selected" : ""}" data-member-id="${selfMember.id}">
          <span class="att-menu att-member-menu">
            <button type="button" class="att-menu-toggle" data-menu-toggle aria-haspopup="true" aria-expanded="false" aria-label="অপশন">${ICON_DOTS}</button>
            <span class="att-menu-dropdown" role="menu">
              <button type="button" class="att-menu-item" data-rename-id="${selfMember.id}" role="menuitem">${ICON_EDIT}<span>Edit Name</span></button>
            </span>
          </span>
          <button type="button" class="att-member-main" data-select-id="${selfMember.id}">
            <span class="att-member-top">
              <span class="att-member-avatar" style="background:${avatarColor(0)}">${initials(selfMember.name)}</span>
              <span class="att-member-identity">
                <span class="att-self-tags">
                  <span class="att-member-selected-tag att-self-tag">You</span>
                  ${isSelected ? `<span class="att-member-selected-tag">Selected</span>` : ``}
                </span>
                <span class="att-member-name">${escapeHtml(selfMember.name)}</span>
              </span>
            </span>
            <span class="att-member-stats">
              <span class="att-member-stat"><strong>${round1(s.totalHours)}h</strong><em>Total Hours</em></span>
              <span class="att-member-stat"><strong>${s.dutyDays}</strong><em>Duty Days</em></span>
              <span class="att-member-stat"><strong>${s.leaveDays}</strong><em>Leave Days</em></span>
            </span>
          </button>
        </div>
      `;
    }

    if (others.length) {
      othersCache = [];
      for (let i = 0; i < others.length; i += 1) {
        const member = others[i];
        const memberRecords = await AttendanceStorage.getAttendance(member.id);
        const s = AttendanceCalc.summarize(memberRecords, viewYear, viewMonth);
        othersCache.push({ member, summary: s, colorIndex: i + 1 });
      }
      html += `
        <button type="button" class="att-member-card att-team-summary-card" data-open-team-modal>
          <span class="att-team-summary-icon">${ICON_USERS}</span>
          <span class="att-team-summary-text">
            <span class="att-member-name">Team Members</span>
            <span class="att-team-summary-count">${others.length} member${others.length > 1 ? "s" : ""}</span>
          </span>
          <span class="att-team-summary-arrow">${ICON_CHEVRON}</span>
        </button>
      `;
    } else {
      othersCache = [];
    }

    els.memberList.innerHTML = html;
    if (els.teamModal?.classList.contains("is-open")) renderTeamModalList();
  }

  async function selectMember(memberId) {
    if (memberId === selectedMemberId) return;
    selectedMemberId = memberId;
    persistSelectedMemberId(memberId);
    records = await AttendanceStorage.getAttendance(memberId);
    await render();
  }

  function renderSummary(summary) {
    if (!els.summaryGrid) return;
    const cards = [
      { key: "total", value: `${round1(summary.totalHours)}h`, label: "Total Hours" },
      { key: "duty", value: summary.dutyDays, label: "Duty Days" },
      { key: "leave", value: summary.leaveDays, label: "Leave" },
      { key: "off", value: summary.offDays, label: "Off Days" },
      { key: "holiday", value: summary.holidayDays, label: "Holiday" },
      { key: "marked", value: summary.markedDays, label: "Days Marked" },
      { key: "avg", value: `${round1(summary.avgHours)}h`, label: "Avg / Duty Day" },
    ];
    els.summaryGrid.innerHTML = cards.map((c) => `
      <div class="att-stat-card" data-stat="${c.key}">
        <div class="att-stat-value">${c.value}</div>
        <div class="att-stat-label">${c.label}</div>
      </div>
    `).join("");
  }

  function renderCalendar() {
    if (!els.calendarGrid) return;
    const cells = AttendanceCalendarUtil.build(viewYear, viewMonth);
    const todayStr = todayDateStr();
    els.calendarGrid.innerHTML = cells.map((day) => {
      if (day === null) return `<div class="att-cal-cell att-cal-empty"></div>`;
      const m = String(viewMonth + 1).padStart(2, "0");
      const d = String(day).padStart(2, "0");
      const dateStr = `${viewYear}-${m}-${d}`;
      const rec = recordFor(dateStr);
      const statusClass = rec ? `att-status-${rec.status}` : "";
      const isToday = dateStr === todayStr ? "is-today" : "";
      const hoursLabel = rec
        ? (rec.status === "duty" ? `${round1(rec.hours)}h` : (ATT_STATUS_META[rec.status]?.label || ""))
        : "—";
      return `
        <button type="button" class="att-cal-cell ${statusClass} ${isToday}" data-date="${dateStr}">
          <span class="att-cal-day">${day}</span>
          <span class="att-cal-hours">${hoursLabel}</span>
        </button>
      `;
    }).join("");
  }

  function renderHistory() {
    const monthRecords = AttendanceCalc.filterMonth(records, viewYear, viewMonth)
      .slice()
      .sort((a, b) => (a.date < b.date ? 1 : -1));
    const hasAny = monthRecords.length > 0;
    if (els.historyEmpty) els.historyEmpty.hidden = hasAny;
    if (els.historyTableWrap) els.historyTableWrap.hidden = !hasAny;
    if (!els.historyBody) return;

    els.historyBody.innerHTML = monthRecords.map((r) => {
      const d = parseISO(r.date);
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      const dateLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      const meta = ATT_STATUS_META[r.status] || { label: r.status };
      const hoursLabel = r.status === "duty" ? `${round1(r.hours)}h` : "—";
      return `
        <tr>
          <td data-label="Date">${dateLabel}</td>
          <td data-label="Day">${dayName}</td>
          <td data-label="Hours">${hoursLabel}</td>
          <td data-label="Status"><span class="att-badge att-badge-${r.status}">${meta.label}</span></td>
          <td data-label="Action">
            <button type="button" class="icon-btn" data-edit-date="${r.date}" aria-label="Edit">${ICON_EDIT}</button>
          </td>
        </tr>
      `;
    }).join("");
  }

  /* ---------------- Member actions ---------------- */
  async function renameMember(memberId) {
    const member = memberById(memberId);
    if (!member) return;
    const next = window.prompt("নতুন নাম লিখুন:", member.name);
    if (next === null) return;
    const trimmed = next.trim();
    if (!trimmed || trimmed === member.name) return;

    await MemberStorage.updateMember(memberId, trimmed);
    members = await MemberStorage.getMembers(currentUid, isAdmin);
    await render();
    showToast("নাম আপডেট হয়েছে", "success");
  }

  async function deleteMemberFlow(memberId) {
    const member = memberById(memberId);
    if (!member) return;
    openConfirmModal(
      "Delete member?",
      `${member.name}-এর সব হাজিরা ডাটা স্থায়ীভাবে ডিলিট হয়ে যাবে। এটা আর ফেরানো যাবে না।`,
      "Delete",
      async () => {
        await MemberStorage.deleteMember(memberId);
        members = await MemberStorage.getMembers(currentUid, isAdmin);
        if (selectedMemberId === memberId) {
          selectedMemberId = members.length ? members[0].id : null;
          persistSelectedMemberId(selectedMemberId);
          records = selectedMemberId ? await AttendanceStorage.getAttendance(selectedMemberId) : [];
        }
        await render();
        showToast(`${member.name} ডিলিট করা হয়েছে`, "success");
      }
    );
  }

  /* ---------------- Shared click handler for member cards / team modal rows ---------------- */
  async function handleMemberListClick(e) {
    const menuToggle = e.target.closest("[data-menu-toggle]");
    if (menuToggle) {
      e.stopPropagation();
      const dropdown = menuToggle.nextElementSibling;
      const isOpen = dropdown?.classList.contains("is-open");
      closeAllMenus();
      if (dropdown && !isOpen) {
        dropdown.classList.add("is-open");
        menuToggle.setAttribute("aria-expanded", "true");
      }
      return;
    }

    const viewBtn = e.target.closest("[data-view-id]");
    if (viewBtn) {
      closeAllMenus();
      closeTeamModal();
      await selectMember(viewBtn.getAttribute("data-view-id"));
      return;
    }

    const renameBtn = e.target.closest("[data-rename-id]");
    if (renameBtn) {
      closeAllMenus();
      await renameMember(renameBtn.getAttribute("data-rename-id"));
      return;
    }

    const deleteBtnEl = e.target.closest("[data-delete-id]");
    if (deleteBtnEl) {
      closeAllMenus();
      await deleteMemberFlow(deleteBtnEl.getAttribute("data-delete-id"));
      return;
    }

    const teamCard = e.target.closest("[data-open-team-modal]");
    if (teamCard) {
      openTeamModal();
      return;
    }

    const selectBtn = e.target.closest("[data-select-id]");
    if (selectBtn) {
      closeTeamModal();
      await selectMember(selectBtn.getAttribute("data-select-id"));
    }
  }

  els.memberList?.addEventListener("click", handleMemberListClick);
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".att-menu")) closeAllMenus();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeEditModal();
    closeAddMemberModal();
    closeConfirmModal();
    closeTeamModal();
  });

  /* ---------------- Add Member modal wiring (hidden panel — kept working) ---------------- */
  els.addMemberOpen?.addEventListener("click", openAddMemberModal);
  els.addMemberModalClose?.addEventListener("click", closeAddMemberModal);
  els.addMemberCancel?.addEventListener("click", closeAddMemberModal);
  els.addMemberModal?.addEventListener("click", (e) => {
    if (e.target === els.addMemberModal) closeAddMemberModal();
  });

  els.addMemberForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = (els.newMemberName?.value || "").trim();
    if (!name) {
      setInlineMsg(els.addMemberMsg, "দয়া করে একটি নাম লিখুন।", "error");
      return;
    }
    setInlineMsg(els.addMemberMsg, "", null);

    const member = await MemberStorage.addMember(name);
    members = await MemberStorage.getMembers(currentUid, isAdmin);
    const wasEmpty = !selectedMemberId;
    if (wasEmpty) {
      selectedMemberId = member.id;
      persistSelectedMemberId(member.id);
      records = await AttendanceStorage.getAttendance(member.id);
    }
    els.addMemberForm.reset();
    closeAddMemberModal();
    await render();
    showToast(`${member.name} সফলভাবে যোগ করা হয়েছে`, "success");
  });

  /* ---------------- Month navigation ---------------- */
  els.prevBtn?.addEventListener("click", async () => {
    viewMonth -= 1;
    if (viewMonth < 0) { viewMonth = 11; viewYear -= 1; }
    await render();
  });
  els.nextBtn?.addEventListener("click", async () => {
    viewMonth += 1;
    if (viewMonth > 11) { viewMonth = 0; viewYear += 1; }
    await render();
  });
  els.todayBtn?.addEventListener("click", async () => {
    const now = new Date();
    viewYear = now.getFullYear();
    viewMonth = now.getMonth();
    await render();
  });

  /* ---------------- Mark today's attendance ---------------- */
  els.entryForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!selectedMemberId) return;
    setInlineMsg(els.entryMsg, "", null);

    const status = els.entryStatus?.value || "duty";
    const rawHours = els.entryHours?.value ?? "";
    const check = validateHours(rawHours, status);
    if (!check.ok) {
      setInlineMsg(els.entryMsg, check.message, "error");
      return;
    }

    const date = todayDateStr();
    try {
      await AttendanceStorage.saveAttendance(selectedMemberId, { date, hours: check.hours, status });
      records = await AttendanceStorage.getAttendance(selectedMemberId);
      if (els.entryHours) els.entryHours.value = "";
      if (els.entryStatus) els.entryStatus.value = "duty";
      setInlineMsg(els.entryMsg, "", null);
      await render();
      showToast("হাজিরা সেভ হয়েছে", "success");
    } catch (err) {
      console.error("Save attendance failed", err);
      setInlineMsg(els.entryMsg, "সেভ করতে সমস্যা হয়েছে, আবার চেষ্টা করুন।", "error");
    }
  });

  els.emptyCta?.addEventListener("click", () => {
    els.entryHours?.focus();
  });

  /* ---------------- Calendar / history → edit modal ---------------- */
  els.calendarGrid?.addEventListener("click", (e) => {
    const cell = e.target.closest(".att-cal-cell[data-date]");
    if (!cell) return;
    openEditModal(cell.getAttribute("data-date"));
  });
  els.historyBody?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-edit-date]");
    if (!btn) return;
    openEditModal(btn.getAttribute("data-edit-date"));
  });

  els.modalClose?.addEventListener("click", closeEditModal);
  els.modal?.addEventListener("click", (e) => {
    if (e.target === els.modal) closeEditModal();
  });

  els.editForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!selectedMemberId) return;
    const dateStr = els.editDateKey?.value;
    const status = els.editStatus?.value || "duty";
    const rawHours = els.editHours?.value ?? "";
    const check = validateHours(rawHours, status);
    if (!check.ok) {
      setInlineMsg(els.editMsg, check.message, "error");
      return;
    }
    try {
      await AttendanceStorage.saveAttendance(selectedMemberId, { date: dateStr, hours: check.hours, status });
      records = await AttendanceStorage.getAttendance(selectedMemberId);
      closeEditModal();
      await render();
      showToast("আপডেট হয়েছে", "success");
    } catch (err) {
      console.error("Update attendance failed", err);
      setInlineMsg(els.editMsg, "আপডেট করতে সমস্যা হয়েছে।", "error");
    }
  });

  els.deleteBtn?.addEventListener("click", async () => {
    if (!selectedMemberId) return;
    const dateStr = els.editDateKey?.value;
    if (!dateStr) return;
    try {
      await AttendanceStorage.deleteAttendance(selectedMemberId, dateStr);
      records = await AttendanceStorage.getAttendance(selectedMemberId);
      closeEditModal();
      await render();
      showToast("ডিলিট হয়েছে", "success");
    } catch (err) {
      console.error("Delete attendance failed", err);
    }
  });

  /* ---------------- Confirm modal (Clear Month / Delete Member) ---------------- */
  els.confirmModalCancel?.addEventListener("click", closeConfirmModal);
  els.confirmModal?.addEventListener("click", (e) => {
    if (e.target === els.confirmModal) closeConfirmModal();
  });
  els.confirmModalConfirm?.addEventListener("click", async () => {
    const action = confirmAction;
    closeConfirmModal();
    if (typeof action === "function") await action();
  });

  els.clearMonthBtn?.addEventListener("click", () => {
    if (!selectedMemberId) return;
    openConfirmModal(
      "Clear this month?",
      `${ATT_MONTH_NAMES[viewMonth]} ${viewYear} মাসের সব হাজিরা রেকর্ড ডিলিট হয়ে যাবে। এটা আর ফেরানো যাবে না।`,
      "Clear Month",
      async () => {
        await AttendanceStorage.deleteMonthAttendance(selectedMemberId, viewYear, viewMonth);
        records = await AttendanceStorage.getAttendance(selectedMemberId);
        await render();
        showToast("এই মাসের হাজিরা মুছে ফেলা হয়েছে", "success");
      }
    );
  });

  /* ---------------- PDF export ---------------- */
  els.exportPdfBtn?.addEventListener("click", () => {
    if (!selectedMemberId || typeof window.jspdf === "undefined") return;
    const member = memberById(selectedMemberId);
    const monthRecords = AttendanceCalc.filterMonth(records, viewYear, viewMonth)
      .slice()
      .sort((a, b) => (a.date < b.date ? -1 : 1));
    const summary = AttendanceCalc.summarize(records, viewYear, viewMonth);

    const doc = new window.jspdf.jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235);
    doc.text("Attendance Report", 14, 18);

    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);
    doc.text(`${ATT_MONTH_NAMES[viewMonth]} ${viewYear}`, 14, 25);
    doc.text(`Employee: ${member ? member.name : "-"}`, 14, 31);

    doc.autoTable({
      startY: 37,
      head: [["Summary", "Value"]],
      body: [
        ["Total Hours", `${round1(summary.totalHours)}h`],
        ["Duty Days", String(summary.dutyDays)],
        ["Off Days", String(summary.offDays)],
        ["Leave", String(summary.leaveDays)],
        ["Holiday", String(summary.holidayDays)],
        ["Avg / Duty Day", `${round1(summary.avgHours)}h`],
      ],
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [37, 99, 235] },
      margin: { left: 14, right: 14 },
    });

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 8,
      head: [["Date", "Day", "Hours", "Status"]],
      body: monthRecords.map((r) => {
        const d = parseISO(r.date);
        return [
          d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          d.toLocaleDateString("en-US", { weekday: "short" }),
          r.status === "duty" ? `${round1(r.hours)}h` : "-",
          (ATT_STATUS_META[r.status] && ATT_STATUS_META[r.status].label) || r.status,
        ];
      }),
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [37, 99, 235] },
      margin: { left: 14, right: 14 },
      didDrawPage: () => {
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(140, 140, 140);
        doc.text(
          `Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${pageCount}`,
          pageWidth - 34,
          pageHeight - 10
        );
        doc.text(
          `masumcpex.com | Attendance Management System | Generated ${new Date().toLocaleString()}`,
          14,
          pageHeight - 10
        );
      },
    });

    const safeName = (member ? member.name : "report").replace(/\s+/g, "_");
    doc.save(`attendance-${safeName}-${ATT_MONTH_NAMES[viewMonth]}-${viewYear}.pdf`);
  });

  /* ---------------- Hook up to attendance-auth.js ---------------- */
  window.attStartAttendanceApp = start;
  window.attResetAttendanceApp = reset;
});
