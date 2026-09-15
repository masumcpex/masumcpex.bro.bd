import {
  db, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot,
  query, where, serverTimestamp, writeBatch, runTransaction, getDoc
} from "./firebase.js";

const membersCol = collection(db, "kh_members");
const recordsCol = collection(db, "kh_records");

const ICON_KEBAB = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="19" r="1.5" fill="currentColor" stroke="none"/></svg>`;
const ICON_EDIT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`;
const ICON_TRASH = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>`;
const ICON_TRASH_LG = ICON_TRASH.replace("<svg ", '<svg class="kh-modal-icon-svg" ');
const ICON_WARNING = `<svg class="kh-modal-icon-svg kh-modal-icon-svg--warn" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
const ICON_SPINNER = `<svg class="kh-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3a9 9 0 1 0 9 9"/></svg>`;
const ICON_CLOSE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
const ICON_CHECK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;
const ICON_INFO = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
const ICON_USER = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6"/></svg>`;
const ICON_DOC = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>`;
const ICON_SETTINGS = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;
const ICON_LOGOUT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`;

let appStarted = false;

export function initKhApp(uid){
  if(appStarted) return; 
  appStarted = true;

  let members = [];
  let records = [];
  let membersLoaded = false;
  let recordsLoaded = false;
  let selectedMemberId = null;

  const memberChips   = document.getElementById("memberChips");
  const noMemberNote  = document.getElementById("noMemberNote");
  const noMemberWarn  = document.getElementById("noMemberWarn");
  const memberInput   = document.getElementById("memberInput");
  const entryMember   = document.getElementById("entryMember");
  const filterMember  = document.getElementById("filterMember");
  const entryDate     = document.getElementById("entryDate");
  const entryHours    = document.getElementById("entryHours");
  const entryHoursError = document.getElementById("entryHoursError");
  const hoursField    = document.getElementById("hoursField");
  const entryForm     = document.getElementById("entryForm");
  const saveBtn       = entryForm.querySelector(".kh-save-btn");
  const addMemberBtn  = document.getElementById("addMemberBtn");
  const registerLoading = document.getElementById("registerLoading");
  const downloadCsvBtn  = document.getElementById("downloadCsvBtn");
  const downloadPdfBtn  = document.getElementById("downloadPdfBtn");
  const registerGroups  = document.getElementById("registerGroups");
  const summaryMonthSelect = document.getElementById("summaryMonthSelect");
  const currentMonthNameEl  = document.getElementById("currentMonthName");
  const currentMonthHoursEl = document.getElementById("currentMonthHours");
  const previousMonthNameEl  = document.getElementById("previousMonthName");
  const previousMonthHoursEl = document.getElementById("previousMonthHours");

  entryDate.value = new Date().toISOString().slice(0,10);

  function ensureToastContainer(){
    return document.getElementById("khToastContainer");
  }
  function showToast(message, type){
    const container = ensureToastContainer();
    if(!container) return;
    const toast = document.createElement("div");
    toast.className = "kh-toast" + (type ? ` kh-toast--${type}` : "");
    const icon = type === "error" ? ICON_WARNING.replace('class="kh-modal-icon-svg kh-modal-icon-svg--warn"','class="kh-toast-icon"')
      : type === "warning" ? ICON_WARNING.replace('class="kh-modal-icon-svg kh-modal-icon-svg--warn"','class="kh-toast-icon"')
      : type === "info" ? ICON_INFO.replace('viewBox', 'class="kh-toast-icon" viewBox')
      : ICON_CHECK.replace('viewBox', 'class="kh-toast-icon" viewBox');
    toast.innerHTML = `${icon}<span>${escapeHtmlLocal(message)}</span><button type="button" class="kh-toast-close" aria-label="Close">${ICON_CLOSE}</button>`;
    container.appendChild(toast);
    const remove = () => { toast.remove(); };
    const timer = setTimeout(remove, 4200);
    toast.querySelector(".kh-toast-close").addEventListener("click", () => { clearTimeout(timer); remove(); });
  }
  function escapeHtmlLocal(str){
    return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  }

  function khBounce(el){
    if(!el) return;
    el.classList.remove("kh-bounce");
    void el.offsetWidth; 
    el.classList.add("kh-bounce");
    el.addEventListener("animationend", () => el.classList.remove("kh-bounce"), { once:true });
  }

  async function generateMemberId(name){
    const counterRef = doc(db, "kh_meta", uid);
    const seq = await runTransaction(db, async (tx) => {
      const snap = await tx.get(counterRef);
      const next = (snap.exists() ? (snap.data().memberCount || 0) : 0) + 1;
      tx.set(counterRef, { memberCount: next }, { merge: true });
      return next;
    });
    const prefix = (name || "USER").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12) || "USER";
    return `${prefix}-${String(seq).padStart(4, "0")}`;
  }

  const AVATAR_COLORS = ["#3B82F6","#2ECC71","#F5A623","#9B59B6","#EF6C6C","#14B8A6","#EC4899","#6366F1"];
  function avatarColorFor(id){
    let hash = 0;
    for(let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
  }
  function monthStatsFor(name, ym){
    const monthRecords = records.filter(r => r.member === name && r.date.startsWith(ym));
    let hours = 0, duty = 0, leave = 0;
    monthRecords.forEach(r => {
      if(r.status === "duty"){ duty++; hours += (r.hours || 0); }
      else leave++;
    });
    return { hours, duty, leave };
  }
  function renderMembers(){
    const ym = currentYearMonth();
    memberChips.innerHTML = members.map(m => {
      const stats = monthStatsFor(m.name, ym);
      const initial = (m.name || "?").trim().charAt(0).toUpperCase();
      const isSelected = m.id === selectedMemberId;
      return `
      <div class="member-card${isSelected ? " is-selected" : ""}" data-id="${m.id}" data-name="${escapeHtmlLocal(m.name)}">
        <div class="member-card-avatar" style="background:${avatarColorFor(m.id)}">${escapeHtmlLocal(initial)}</div>
        <div class="member-card-body">
          <div class="member-card-name">${escapeHtmlLocal(m.name)}</div>
          <div class="member-card-stats">${stats.hours}h • ${stats.duty} Duty • ${stats.leave} Leave</div>
        </div>
        <div class="member-card-actions">
          <button type="button" class="member-card-icon-btn member-card-more" data-id="${m.id}" title="More options" aria-label="More options" aria-haspopup="true">${ICON_KEBAB}</button>
          <div class="member-card-menu" data-id="${m.id}">
            <button type="button" class="member-card-menu-item member-card-view" data-id="${m.id}">${ICON_USER}View Profile</button>
            <button type="button" class="member-card-menu-item member-card-edit" data-id="${m.id}">${ICON_EDIT}Edit Member</button>
            <button type="button" class="member-card-menu-item is-danger member-card-delete" data-id="${m.id}">${ICON_TRASH}Remove Member</button>
          </div>
        </div>
      </div>`;
    }).join("");
    const memberDots = document.getElementById("memberDots");
    if(memberDots){
      memberDots.innerHTML = members.map((_, i) => `<span class="${i === 0 ? "is-active" : ""}"></span>`).join("");
    }
    noMemberNote.style.display = members.length ? "none" : "block";
    noMemberWarn.style.display = members.length ? "none" : "block";
    saveBtn.disabled = !members.length;

    if(selectedMemberId && !members.some(m => m.id === selectedMemberId)){
      selectedMemberId = null;
    }

    const currentEntryVal  = entryMember.value;
    const currentFilterVal = filterMember.value;

    const opts = members.map(m => `<option value="${m.name}">${m.name}</option>`).join("");
    entryMember.innerHTML = opts || `<option value="">— No members —</option>`;
    filterMember.innerHTML = `<option value="All">All Members</option>` + opts;

    if(members.some(m => m.name === currentEntryVal)) entryMember.value = currentEntryVal;
    if(currentFilterVal === "All" || members.some(m => m.name === currentFilterVal)) filterMember.value = currentFilterVal;

    members.forEach(async m => {
      if(m.memberId || backfillingIds.has(m.id)) return;
      backfillingIds.add(m.id);
      try{
        const newId = await generateMemberId(m.name);
        await updateDoc(doc(db, "kh_members", m.id), { memberId: newId });
      }catch(err){
        console.error("memberId backfill failed for", m.name, err);
        backfillingIds.delete(m.id);
      }
    });
  }



  addMemberBtn.addEventListener("click", async () => {
    khBounce(addMemberBtn);
    const name = memberInput.value.trim();
    if(!name) return;
    if(members.some(m => m.name === name)){ memberInput.value = ""; return; }
    addMemberBtn.disabled = true;
    try{
      const memberId = await generateMemberId(name);
      await addDoc(membersCol, { name, memberId, ownerId: uid, createdAt: serverTimestamp() });
      memberInput.value = "";
      showToast("Member added successfully.");
    }catch(err){
      console.error(err);
      showToast("Failed to add member. Please check your internet connection and try again.", "error");
    }finally{
      addMemberBtn.disabled = false;
    }
  });
  memberInput.addEventListener("keydown", e => {
    if(e.key === "Enter"){ e.preventDefault(); addMemberBtn.click(); }
  });

  function ensureEditMemberModal(){
    let overlay = document.getElementById("khEditMemberOverlay");
    if(overlay) return overlay;
    overlay = document.createElement("div");
    overlay.id = "khEditMemberOverlay";
    overlay.className = "kh-modal-overlay";
    overlay.innerHTML = `
      <div class="kh-modal-card">
        <p class="kh-modal-icon">${ICON_EDIT.replace("<svg ", '<svg class="kh-modal-icon-svg" ')}</p>
        <p class="kh-modal-text" style="margin-bottom:.2rem;">Edit Member</p>
        <input type="text" class="kh-edit-modal-input" id="khEditMemberInput" maxlength="60">
        <span class="kh-field-error" id="khEditMemberError" aria-live="polite"></span>
        <div class="kh-modal-actions" style="margin-top:1rem;">
          <button type="button" class="btn3d btn-mint" id="khEditMemberSaveBtn">Save Changes</button>
          <button type="button" class="btn3d btn-coral" id="khEditMemberCancelBtn">Cancel</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    return overlay;
  }
  function openEditMemberModal(member){
    const overlay = ensureEditMemberModal();
    const input = overlay.querySelector("#khEditMemberInput");
    const errorEl = overlay.querySelector("#khEditMemberError");
    const saveBtnEl = overlay.querySelector("#khEditMemberSaveBtn");
    input.value = member.name;
    errorEl.textContent = "";
    input.classList.remove("kh-input-error");
    overlay.style.display = "flex";
    setTimeout(() => { input.focus(); input.select(); }, 30);

    function cleanup(){
      overlay.style.display = "none";
      saveBtnEl.removeEventListener("click", onSave);
      cancelBtnEl.removeEventListener("click", onCancel);
      input.removeEventListener("keydown", onKeydown);
    }
    function onCancel(){ cleanup(); }
    function onKeydown(e){
      if(e.key === "Enter"){ e.preventDefault(); onSave(); }
      if(e.key === "Escape"){ cleanup(); }
    }
    async function onSave(){
      const newName = input.value.trim();
      if(!newName){
        errorEl.textContent = "Please enter a name.";
        input.classList.add("kh-input-error");
        return;
      }
      if(newName !== member.name && members.some(m => m.name === newName)){
        errorEl.textContent = "A member with this name already exists.";
        input.classList.add("kh-input-error");
        return;
      }
      if(newName === member.name){ cleanup(); return; }
      saveBtnEl.disabled = true;
      try{
        await renameMember(member, newName);
        cleanup();
        showToast("Member updated successfully.");
      }catch(err){
        console.error(err);
        errorEl.textContent = "Failed to update member. Please try again.";
      }finally{
        saveBtnEl.disabled = false;
      }
    }
    const cancelBtnEl = overlay.querySelector("#khEditMemberCancelBtn");
    saveBtnEl.addEventListener("click", onSave);
    cancelBtnEl.addEventListener("click", onCancel);
    input.addEventListener("keydown", onKeydown);
  }

  async function renameMember(member, newName){
    const oldName = member.name;
    await updateDoc(doc(db, "kh_members", member.id), { name: newName });
    const matching = records.filter(r => r.member === oldName);
    const chunkSize = 400;
    for(let i = 0; i < matching.length; i += chunkSize){
      const batch = writeBatch(db);
      matching.slice(i, i + chunkSize).forEach(r => batch.update(doc(db, "kh_records", r.id), { member: newName }));
      await batch.commit();
    }
  }

  function ensureDeleteMemberModal(){
    let overlay = document.getElementById("khDeleteMemberOverlay");
    if(overlay) return overlay;
    overlay = document.createElement("div");
    overlay.id = "khDeleteMemberOverlay";
    overlay.className = "kh-modal-overlay";
    overlay.innerHTML = `
      <div class="kh-modal-card">
        <p class="kh-modal-icon">${ICON_TRASH_LG}</p>
        <p class="kh-modal-text" id="khDeleteMemberText"></p>
        <ul class="kh-modal-list">
          <li>Member profile</li>
          <li>All related attendance records</li>
          <li>Work hours history</li>
        </ul>
        <p class="kh-modal-text" style="font-size:.85rem; color:#C0392B; margin-bottom:1rem;">This action cannot be undone.</p>
        <div class="kh-modal-actions">
          <button type="button" class="btn3d btn-danger" id="khDeleteMemberYesBtn">Delete Member</button>
          <button type="button" class="btn3d btn-mint" id="khDeleteMemberCancelBtn">Cancel</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    return overlay;
  }
  function askDeleteMember(member){
    return new Promise(resolve => {
      const overlay = ensureDeleteMemberModal();
      overlay.querySelector("#khDeleteMemberText").textContent = `Are you sure you want to delete "${member.name}"?`;
      overlay.style.display = "flex";
      const yesBtn = overlay.querySelector("#khDeleteMemberYesBtn");
      const noBtn  = overlay.querySelector("#khDeleteMemberCancelBtn");
      function cleanup(result){
        overlay.style.display = "none";
        yesBtn.removeEventListener("click", onYes);
        noBtn.removeEventListener("click", onNo);
        resolve(result);
      }
      function onYes(){ cleanup(true); }
      function onNo(){ cleanup(false); }
      yesBtn.addEventListener("click", onYes);
      noBtn.addEventListener("click", onNo);
    });
  }

  async function deleteMemberCascade(member){
    const matching = records.filter(r => r.member === member.name);
    const chunkSize = 400;
    for(let i = 0; i < matching.length; i += chunkSize){
      const batch = writeBatch(db);
      matching.slice(i, i + chunkSize).forEach(r => batch.delete(doc(db, "kh_records", r.id)));
      await batch.commit();
    }
    await deleteDoc(doc(db, "kh_members", member.id));
  }

  function closeAllMemberMenus(){
    memberChips.querySelectorAll(".member-card-menu.is-open").forEach(m => m.classList.remove("is-open"));
  }
  if(!memberChips.dataset.scrollBound){
    memberChips.dataset.scrollBound = "1";
    let scrollTimer;
    memberChips.addEventListener("scroll", () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        const cards = memberChips.querySelectorAll(".member-card");
        const dots = document.querySelectorAll("#memberDots span");
        if(!cards.length || !dots.length) return;
        const center = memberChips.scrollLeft + memberChips.clientWidth / 2;
        let closestIdx = 0, closestDist = Infinity;
        cards.forEach((card, i) => {
          const dist = Math.abs((card.offsetLeft + card.offsetWidth / 2) - center);
          if(dist < closestDist){ closestDist = dist; closestIdx = i; }
        });
        dots.forEach((d, i) => d.classList.toggle("is-active", i === closestIdx));
      }, 80);
    }, { passive: true });
  }
  document.addEventListener("click", e => {
    if(!e.target.closest(".member-card-actions")) closeAllMemberMenus();
  });

  function ensureMemberProfileModal(){
    let overlay = document.getElementById("khMemberProfileOverlay");
    if(overlay) return overlay;
    overlay = document.createElement("div");
    overlay.id = "khMemberProfileOverlay";
    overlay.className = "kh-modal-overlay";
    overlay.innerHTML = `
      <div class="kh-modal-card kh-profile-card">
        <button type="button" class="kh-modal-x" id="khProfileCloseBtn" aria-label="Close">${ICON_CLOSE}</button>
        <div class="kh-profile-avatar" id="khProfileAvatar"></div>
        <div class="kh-profile-name" id="khProfileName"></div>
        <div class="kh-profile-month" id="khProfileMonth"></div>
        <div class="kh-profile-stats" id="khProfileStats"></div>
        <button type="button" class="btn3d btn-sky" id="khProfilePdfBtn" style="width:100%; margin-top:1rem;">${ICON_DOC} Download PDF Report</button>
      </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener("click", e => { if(e.target === overlay) overlay.style.display = "none"; });
    overlay.querySelector("#khProfileCloseBtn").addEventListener("click", () => { overlay.style.display = "none"; });
    return overlay;
  }

  function openMemberProfileModal(member){
    const overlay = ensureMemberProfileModal();
    const ym = currentYearMonth();
    const stats = monthStatsFor(member.name, ym);
    const advanceVal = typeof member.advance === "number" ? member.advance : 0;
    const initial = (member.name || "?").trim().charAt(0).toUpperCase();
    overlay.querySelector("#khProfileAvatar").style.background = avatarColorFor(member.id);
    overlay.querySelector("#khProfileAvatar").textContent = initial;
    overlay.querySelector("#khProfileName").textContent = member.name;
    overlay.querySelector("#khProfileMonth").textContent = monthLabel(ym);
    overlay.querySelector("#khProfileStats").innerHTML = `
      <div class="kh-profile-stat"><strong>${stats.hours}</strong><span>Total Hours</span></div>
      <div class="kh-profile-stat"><strong>${stats.duty}</strong><span>Work Days</span></div>
      <div class="kh-profile-stat"><strong>${stats.leave}</strong><span>Leave</span></div>
      <div class="kh-profile-stat"><strong>RM ${advanceVal.toFixed(2)}</strong><span>Advance</span></div>
    `;
    const pdfBtn = overlay.querySelector("#khProfilePdfBtn");
    pdfBtn.onclick = async () => {
      if(typeof window.html2canvas === "undefined" || typeof window.jspdf === "undefined"){
        showToast("PDF generation library failed to load. Please check your internet connection.", "error");
        return;
      }
      const monthRecords = records
        .filter(r => r.date.startsWith(ym) && r.member === member.name)
        .slice().sort((a,b) => a.date.localeCompare(b.date));
      if(!monthRecords.length){
        showToast("No records for this member this month yet.", "warning");
        return;
      }
      pdfBtn.disabled = true;
      const originalLabel = pdfBtn.innerHTML;
      pdfBtn.innerHTML = `${ICON_SPINNER}Generating PDF...`;
      try{
        await generatePdfReport(ym, monthRecords, member.name);
      }catch(err){
        console.error(err);
        showToast("Failed to generate PDF. Please try again.", "error");
      }finally{
        pdfBtn.disabled = false;
        pdfBtn.innerHTML = originalLabel;
      }
    };
    overlay.style.display = "flex";
  }

  memberChips.addEventListener("click", async e => {
    const moreBtn = e.target.closest(".member-card-more");
    if(moreBtn){
      const menu = moreBtn.nextElementSibling;
      const wasOpen = menu.classList.contains("is-open");
      closeAllMemberMenus();
      if(!wasOpen) menu.classList.add("is-open");
      return;
    }
    const viewBtn = e.target.closest(".member-card-view");
    if(viewBtn){
      closeAllMemberMenus();
      const m = members.find(x => x.id === viewBtn.dataset.id);
      if(m) openMemberProfileModal(m);
      return;
    }
    const editBtn = e.target.closest(".member-card-edit");
    if(editBtn){
      closeAllMemberMenus();
      const m = members.find(x => x.id === editBtn.dataset.id);
      if(m) openEditMemberModal(m);
      return;
    }
    const deleteBtn = e.target.closest(".member-card-delete");
    if(deleteBtn){
      closeAllMemberMenus();
      const m = members.find(x => x.id === deleteBtn.dataset.id);
      if(!m) return;
      const ok = await askDeleteMember(m);
      if(!ok) return;
      deleteBtn.disabled = true;
      try{
        await deleteMemberCascade(m);
        if(selectedMemberId === m.id) selectedMemberId = null;
        showToast("Member and all related attendance records have been deleted.");
      }catch(err){
        console.error(err);
        showToast("Failed to delete member. Please try again.", "error");
      }
      return;
    }
    const card = e.target.closest(".member-card");
    if(card){
      const id = card.dataset.id;
      selectedMemberId = selectedMemberId === id ? null : id;
      const m = members.find(x => x.id === selectedMemberId);
      if(m){
        entryMember.value = m.name;
        filterMember.value = m.name;
      }else{
        filterMember.value = "All";
      }
      renderRegister();
      renderMembers();
      document.getElementById("attendanceRegisterSection")
        .scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  entryForm.querySelectorAll('input[name="status"]').forEach(radio => {
    radio.addEventListener("change", () => {
      const isLeave = entryForm.querySelector('input[name="status"]:checked').value === "leave";
      entryHours.disabled = isLeave;
      hoursField.style.opacity = isLeave ? .5 : 1;
      if(isLeave) entryHours.value = "";
      clearHoursError();
    });
  });
  entryHours.addEventListener("input", clearHoursError);
  function clearHoursError(){
    entryHoursError.textContent = "";
    entryHours.classList.remove("kh-input-error");
  }

  function findExistingRecord(date, member){
    return records.find(r => r.date === date && r.member === member);
  }

  function autoFillFromExisting(){
    const existing = findExistingRecord(entryDate.value, entryMember.value);
    if(!existing) return;
    const radio = entryForm.querySelector(`input[name="status"][value="${existing.status}"]`);
    if(radio){ radio.checked = true; }
    const isLeave = existing.status === "leave";
    entryHours.disabled = isLeave;
    hoursField.style.opacity = isLeave ? .5 : 1;
    entryHours.value = isLeave ? "" : existing.hours;
  }
  entryMember.addEventListener("change", autoFillFromExisting);
  entryDate.addEventListener("change", autoFillFromExisting);

  function ensureConfirmModal(){
    let overlay = document.getElementById("khConfirmModalOverlay");
    if(overlay) return overlay;
    overlay = document.createElement("div");
    overlay.id = "khConfirmModalOverlay";
    overlay.className = "kh-modal-overlay";
    overlay.innerHTML = `
      <div class="kh-modal-card">
        <p class="kh-modal-icon">${ICON_TRASH_LG}</p>
        <p class="kh-modal-text" id="khConfirmText"></p>
        <div class="kh-modal-actions">
          <button type="button" class="btn3d btn-coral" id="khConfirmYesBtn">Yes, Confirm</button>
          <button type="button" class="btn3d btn-mint" id="khConfirmNoBtn">Cancel</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    return overlay;
  }
  function askConfirm(message){
    return new Promise(resolve => {
      const overlay = ensureConfirmModal();
      overlay.querySelector("#khConfirmText").textContent = message;
      overlay.style.display = "flex";
      const yesBtn = overlay.querySelector("#khConfirmYesBtn");
      const noBtn  = overlay.querySelector("#khConfirmNoBtn");
      function cleanup(result){
        overlay.style.display = "none";
        yesBtn.removeEventListener("click", onYes);
        noBtn.removeEventListener("click", onNo);
        resolve(result);
      }
      function onYes(){ cleanup(true); }
      function onNo(){ cleanup(false); }
      yesBtn.addEventListener("click", onYes);
      noBtn.addEventListener("click", onNo);
    });
  }

  function ensureDuplicateModal(){
    let overlay = document.getElementById("khDupModalOverlay");
    if(overlay) return overlay;
    overlay = document.createElement("div");
    overlay.id = "khDupModalOverlay";
    overlay.className = "kh-modal-overlay";
    overlay.innerHTML = `
      <div class="kh-modal-card">
        <p class="kh-modal-icon">${ICON_WARNING}</p>
        <p class="kh-modal-text">An attendance record for this member on this date already exists.</p>
        <div class="kh-modal-actions">
          <button type="button" class="btn3d btn-mint" id="khDupUpdateBtn">${ICON_EDIT}Update Record</button>
          <button type="button" class="btn3d btn-coral" id="khDupCancelBtn">Cancel</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    return overlay;
  }
  function askDuplicateAction(){
    return new Promise(resolve => {
      const overlay = ensureDuplicateModal();
      overlay.style.display = "flex";
      const updateBtn = overlay.querySelector("#khDupUpdateBtn");
      const cancelBtn = overlay.querySelector("#khDupCancelBtn");
      function cleanup(result){
        overlay.style.display = "none";
        updateBtn.removeEventListener("click", onUpdate);
        cancelBtn.removeEventListener("click", onCancel);
        resolve(result);
      }
      function onUpdate(){ cleanup("update"); }
      function onCancel(){ cleanup("cancel"); }
      updateBtn.addEventListener("click", onUpdate);
      cancelBtn.addEventListener("click", onCancel);
    });
  }

  entryForm.addEventListener("submit", async e => {
    e.preventDefault();
    if(!members.length) return;
    khBounce(saveBtn);
    const status = entryForm.querySelector('input[name="status"]:checked').value;
    const hoursVal = parseFloat(entryHours.value);
    if(status === "duty" && (entryHours.value === "" || isNaN(hoursVal) || hoursVal <= 0)){
      entryHoursError.textContent = "Please enter the number of hours worked.";
      entryHours.classList.add("kh-input-error");
      entryHours.focus();
      return;
    }
    clearHoursError();
    const record = {
      date: entryDate.value,
      member: entryMember.value,
      status: status,
      hours: status === "duty" ? hoursVal : 0,
      ownerId: uid,
      createdAt: serverTimestamp()
    };

    const existing = findExistingRecord(record.date, record.member);

    saveBtn.disabled = true;
    try{
      if(existing){
        const action = await askDuplicateAction();
        if(action === "cancel"){ return; }
        await updateDoc(doc(db, "kh_records", existing.id), {
          status: record.status,
          hours: record.hours,
          updatedAt: serverTimestamp()
        });
      }else{
        await addDoc(recordsCol, record);
      }
      entryHours.value = "";
      showToast(`${record.member}'s attendance for ${record.date === new Date().toISOString().slice(0,10) ? "today" : "this date"} has been saved.`);
    }catch(err){
      console.error(err);
      showToast("Failed to save record. Please check your internet connection and try again.", "error");
    }finally{
      saveBtn.disabled = !members.length;
    }
  });

  function currentYearMonth(){
    return new Date().toISOString().slice(0,7);
  }
  function previousYearMonth(){
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0,7);
  }

 
  function updateMonthBadges(){
    const cur  = currentYearMonth();
    const prev = previousYearMonth();
    const hoursForMonth = ym => records
      .filter(r => r.date.startsWith(ym) && r.status === "duty")
      .reduce((sum, r) => sum + (r.hours || 0), 0);

    if(currentMonthNameEl)  currentMonthNameEl.textContent  = monthLabel(cur);
    if(currentMonthHoursEl) currentMonthHoursEl.textContent = `${hoursForMonth(cur)} hours`;
    if(previousMonthNameEl)  previousMonthNameEl.textContent  = monthLabel(prev);
    if(previousMonthHoursEl) previousMonthHoursEl.textContent = `${hoursForMonth(prev)} hours`;
  }

  function populateSummaryMonthOptions(){
    if(!summaryMonthSelect) return;
    const cur  = currentYearMonth();
    const prev = previousYearMonth();
    const monthSet = new Set(records.map(r => r.date.slice(0,7)));
    monthSet.add(cur);
    const months = Array.from(monthSet).sort((a,b) => b.localeCompare(a));

    const previouslySelected = summaryMonthSelect.value;
    summaryMonthSelect.innerHTML = months.map(ym => {
      let label = monthLabel(ym);
      if(ym === cur) label = `Current Month — ${label}`;
      else if(ym === prev) label = `Previous Month — ${label}`;
      return `<option value="${ym}">${label}</option>`;
    }).join("");

    if(months.includes(previouslySelected)) summaryMonthSelect.value = previouslySelected;
    else summaryMonthSelect.value = cur;
  }

  function renderSummary(){
    const tbody = document.querySelector("#summaryTable tbody");
    const noSummaryNote = document.getElementById("noSummaryNote");
    const selectedYm = (summaryMonthSelect && summaryMonthSelect.value) || currentYearMonth();
    const monthRecords = records.filter(r => r.date.startsWith(selectedYm));

    if(!monthRecords.length){
      tbody.innerHTML = "";
      noSummaryNote.textContent = "No records for this month yet.";
      noSummaryNote.style.display = "block";
      return;
    }
    noSummaryNote.style.display = "none";
    const byMember = {};
    monthRecords.forEach(r => {
      if(!byMember[r.member]) byMember[r.member] = { days:0, leaves:0, hours:0 };
      if(r.status === "duty"){ byMember[r.member].days++; byMember[r.member].hours += r.hours; }
      else{ byMember[r.member].leaves++; }
    });
    tbody.innerHTML = Object.keys(byMember).map(name => {
      const d = byMember[name];
      const m = members.find(x => x.name === name);
      const advanceVal = m && typeof m.advance === "number" ? m.advance : 0;
      const advanceCell = m
        ? `<div class="kh-advance-wrap" data-id="${m.id}" data-balance="${advanceVal}">
             <span class="kh-advance-display">RM ${advanceVal.toFixed(2)}</span>
             <button type="button" class="kh-advance-edit-btn" data-id="${m.id}" title="Add advance" aria-label="Add advance">${ICON_EDIT}</button>
           </div>`
        : `<span class="kh-advance-prefix">RM 0.00</span>`;
      return `<tr><td>${name}</td><td>${d.days}</td><td>${d.leaves}</td><td><strong>${d.hours}</strong></td><td>${advanceCell}</td></tr>`;
    }).join("");
  }

  function refreshSummarySection(){
    updateMonthBadges();
    populateSummaryMonthOptions();
    renderSummary();
    renderQuickStats();
  }

  function renderQuickStats(){
    const ym = currentYearMonth();
    const monthRecords = records.filter(r => r.date.startsWith(ym));
    let present = 0, hours = 0;
    monthRecords.forEach(r => {
      if(r.status === "duty"){ present++; hours += (r.hours || 0); }
    });
    const totalAdvance = members.reduce((sum, m) => sum + (typeof m.advance === "number" ? m.advance : 0), 0);
    const qsMembers = document.getElementById("qsMembers");
    const qsPresent = document.getElementById("qsPresent");
    const qsHours   = document.getElementById("qsHours");
    const qsAdvance = document.getElementById("qsAdvance");
    if(qsMembers) qsMembers.textContent = toBn(members.length);
    if(qsPresent) qsPresent.textContent = toBn(present);
    if(qsHours)   qsHours.textContent = toBn(hours);
    if(qsAdvance) qsAdvance.textContent = `RM ${totalAdvance.toFixed(2)}`;
    const pill = document.getElementById("dashboardMonthPill");
    if(pill) pill.textContent = monthLabel(ym);
  }

  summaryMonthSelect?.addEventListener("change", renderSummary);

  document.querySelector("#summaryTable tbody").addEventListener("click", e => {
    const editBtn = e.target.closest(".kh-advance-edit-btn");
    if(editBtn){
      const wrap = editBtn.closest(".kh-advance-wrap");
      if(wrap.querySelector(".kh-advance-add-input")) return;
      wrap.innerHTML = `
        <div class="kh-advance-edit-wrap">
          <input type="number" class="kh-advance-add-input" min="0" step="0.01" placeholder="Amount" inputmode="decimal" autofocus>
          <button type="button" class="kh-advance-op-btn kh-advance-op-add" data-op="add" title="Add to advance">+ Add</button>
          <button type="button" class="kh-advance-op-btn kh-advance-op-deduct" data-op="deduct" title="Deduct from advance">&minus; Deduct</button>
        </div>`;
      const input = wrap.querySelector(".kh-advance-add-input");
      input.focus();

      input.addEventListener("keydown", ev => {
        if(ev.key === "Escape"){ renderSummary(); }
      });
      input.addEventListener("blur", () => {
        // Give a click on +Add / -Deduct a chance to register before cancelling.
        setTimeout(() => {
          if(!wrap.contains(document.activeElement)) renderSummary();
        }, 150);
      });
      return;
    }

    const opBtn = e.target.closest(".kh-advance-op-btn");
    if(opBtn) commitAdvanceOp(opBtn);
  });

  async function commitAdvanceOp(opBtn){
    const wrap = opBtn.closest(".kh-advance-wrap");
    const input = wrap.querySelector(".kh-advance-add-input");
    const rawVal = parseFloat(input.value);
    if(isNaN(rawVal) || rawVal <= 0){
      input.focus();
      input.classList.add("kh-input-error");
      return;
    }
    const currentBalance = parseFloat(wrap.dataset.balance) || 0;
    const memberId = wrap.dataset.id;
    const op = opBtn.dataset.op;
    const newBalance = op === "deduct" ? currentBalance - rawVal : currentBalance + rawVal;

    wrap.querySelectorAll("input, button").forEach(el => el.disabled = true);
    try{
      await updateDoc(doc(db, "kh_members", memberId), { advance: newBalance });
      if(newBalance < 0){
        showToast(`Saved, but new balance is negative: RM ${newBalance.toFixed(2)}.`, "error");
      }else{
        showToast(`${op === "deduct" ? "Deducted" : "Added"} RM ${rawVal.toFixed(2)}. New balance: RM ${newBalance.toFixed(2)}.`);
      }
    }catch(err){
      console.error(err);
      showToast("Failed to save advance. Please try again.", "error");
      wrap.querySelectorAll("input, button").forEach(el => el.disabled = false);
    }
  }

  const EN_MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  function toBn(n){ return String(n); }
  function monthLabel(ym){
    const [y, m] = ym.split("-").map(Number);
    return `${EN_MONTHS[m-1]} ${y}`;
  }

  function renderRegister(){
    const noRecordsNote = document.getElementById("noRecordsNote");
    const filter = filterMember.value;
    const filtered = filter === "All" ? records : records.filter(r => r.member === filter);

    if(!filtered.length){
      registerGroups.innerHTML = "";
      noRecordsNote.style.display = "block";
      return;
    }
    noRecordsNote.style.display = "none";

    const groups = {};
    filtered.forEach(r => {
      const ym = r.date.slice(0,7);
      (groups[ym] = groups[ym] || []).push(r);
    });
    const months = Object.keys(groups).sort((a,b) => b.localeCompare(a));

    registerGroups.innerHTML = months.map((ym, idx) => {
      const list = groups[ym].slice().sort((a,b) => b.date.localeCompare(a.date));
      const rows = list.map(r => `
        <tr>
          <td data-label="Date">${r.date}</td>
          <td data-label="Name">${r.member}</td>
          <td class="status-${r.status}" data-label="Status"><span>${r.status === "duty" ? "Present" : "Leave"}</span></td>
          <td class="hours-cell" data-label="Hours">${r.status === "duty" ? r.hours : "—"}</td>
          <td class="row-actions-cell" data-label="Action">
            <div class="row-actions">
              <button type="button" class="row-menu-btn" data-id="${r.id}" aria-haspopup="true" aria-expanded="false" aria-label="Row actions">${ICON_KEBAB}</button>
              <div class="row-actions-menu" role="menu">
                <button type="button" class="row-action-edit" role="menuitem" data-id="${r.id}" data-member="${r.member}" data-date="${r.date}">${ICON_EDIT}Edit</button>
                <button type="button" class="row-action-delete" role="menuitem" data-id="${r.id}">${ICON_TRASH}Delete</button>
              </div>
            </div>
          </td>
        </tr>`).join("");
      return `
        <details class="kh-month-group"${idx === 0 ? " open" : ""}>
          <summary class="kh-month-summary">
            <span class="kh-month-label">${monthLabel(ym)}</span>
            <span class="kh-month-count">${list.length} entries</span>
            <button type="button" class="btn3d kh-month-delete kh-month-delete--outline" data-ym="${ym}">${ICON_TRASH}Delete Month</button>
          </summary>
          <div class="table-wrap">
            <table class="kh-table">
              <thead><tr><th>Date</th><th>Name</th><th>Status</th><th>Hours</th><th></th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </details>`;
    }).join("");
  }

  async function deleteMonthRecords(ym, btn){
    const monthRecords = records.filter(r => r.date.startsWith(ym));
    if(!monthRecords.length) return;

    const ok = await askConfirm(
      `Delete ${monthLabel(ym)} records? All ${monthRecords.length} entries will be permanently deleted. This action cannot be undone.`
    );
    if(!ok) return;

    if(btn) btn.disabled = true;
    try{
      const chunkSize = 400;
      for(let i = 0; i < monthRecords.length; i += chunkSize){
        const batch = writeBatch(db);
        monthRecords.slice(i, i + chunkSize).forEach(r => batch.delete(doc(db, "kh_records", r.id)));
        await batch.commit();
      }
    }catch(err){
      console.error(err);
      showToast("Failed to delete this month's records. Please try again.", "error");
    }finally{
      if(btn) btn.disabled = false;
    }
  }

  function closeAllRowMenus(){
    registerGroups.querySelectorAll(".row-actions-menu.open").forEach(m => m.classList.remove("open"));
    registerGroups.querySelectorAll('.row-menu-btn[aria-expanded="true"]').forEach(b => b.setAttribute("aria-expanded", "false"));
  }
  document.addEventListener("click", e => {
    if(!e.target.closest(".row-actions")) closeAllRowMenus();
  });

  registerGroups.addEventListener("click", async e => {
    const menuBtn = e.target.closest(".row-menu-btn");
    if(menuBtn){
      const menu = menuBtn.nextElementSibling;
      const willOpen = !menu.classList.contains("open");
      closeAllRowMenus();
      if(willOpen){
        menu.classList.add("open");
        menuBtn.setAttribute("aria-expanded", "true");
      }
      return;
    }

    const editBtn = e.target.closest(".row-action-edit");
    if(editBtn){
      closeAllRowMenus();
      entryMember.value = editBtn.dataset.member;
      entryDate.value = editBtn.dataset.date;
      autoFillFromExisting();
      entryForm.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const deleteBtn = e.target.closest(".row-action-delete");
    if(deleteBtn){
      closeAllRowMenus();
      const ok = await askConfirm("Delete this entry?");
      if(!ok) return;
      khBounce(deleteBtn);
      try{
        await deleteDoc(doc(db, "kh_records", deleteBtn.dataset.id));
        showToast("Attendance record deleted successfully.");
      }catch(err){
        console.error(err);
        showToast("Failed to delete entry. Please try again.", "error");
      }
      return;
    }

    const monthDeleteBtn = e.target.closest(".kh-month-delete");
    if(monthDeleteBtn){
      e.preventDefault();
      e.stopPropagation();
      khBounce(monthDeleteBtn);
      await deleteMonthRecords(monthDeleteBtn.dataset.ym, monthDeleteBtn);
    }
  });

  filterMember.addEventListener("change", () => {
    const m = members.find(x => x.name === filterMember.value);
    selectedMemberId = m ? m.id : null;
    renderRegister();
    renderMembers();
  });

  downloadCsvBtn.addEventListener("click", () => {
    khBounce(downloadCsvBtn);
    const ym = currentYearMonth();
    const filter = filterMember.value;
    const monthRecords = records
      .filter(r => r.date.startsWith(ym))
      .filter(r => filter === "All" || r.member === filter)
      .slice().sort((a,b) => a.date.localeCompare(b.date));

    if(!monthRecords.length){
      alert("No records for this month yet.");
      return;
    }

    const header = ["Date","Name","Status","Hours"];
    const rows = monthRecords.map(r => [
      r.date,
      r.member,
      r.status === "duty" ? "Present" : "Leave",
      r.status === "duty" ? r.hours : ""
    ]);
    const csvContent = [header, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-report-${ym}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  downloadPdfBtn.addEventListener("click", async () => {
    if(typeof window.html2canvas === "undefined" || typeof window.jspdf === "undefined"){
      alert("PDF generation library failed to load. Please check your internet connection and try again.");
      return;
    }

    khBounce(downloadPdfBtn);
    const ym = currentYearMonth();
    const filter = filterMember.value;
    const monthRecords = records
      .filter(r => r.date.startsWith(ym))
      .filter(r => filter === "All" || r.member === filter)
      .slice().sort((a,b) => a.date.localeCompare(b.date));

    if(!monthRecords.length){
      alert("No records for this month yet.");
      return;
    }

    downloadPdfBtn.disabled = true;
    const originalLabel = downloadPdfBtn.innerHTML;
    downloadPdfBtn.innerHTML = `${ICON_SPINNER}Generating PDF...`;

    try{
      await generatePdfReport(ym, monthRecords, filter);
    }catch(err){
      console.error(err);
      alert("Failed to generate PDF. Please try again.");
    }finally{
      downloadPdfBtn.disabled = false;
      downloadPdfBtn.innerHTML = originalLabel;
    }
  });

  async function generatePdfReport(ym, monthRecords, filter){
    const byMember = {};
    monthRecords.forEach(r => {
      if(!byMember[r.member]) byMember[r.member] = { present:0, absent:0, hours:0 };
      if(r.status === "duty"){ byMember[r.member].present++; byMember[r.member].hours += (r.hours || 0); }
      else{ byMember[r.member].absent++; }
    });
    const memberNames = Object.keys(byMember).sort((a,b) => a.localeCompare(b));
    const totalHoursAll = memberNames.reduce((sum,n) => sum + byMember[n].hours, 0);

    const PDF_BLUE   = "#0F4C81";
    const PDF_INK    = "#172033";
    const PDF_MUTED  = "#667085";
    const PDF_BORDER = "#E4E7EC";
    const PDF_LIGHT  = "#F8FAFC";
    const PDF_GREEN  = "#16A085";

    function prettyDate(dateStr){
      const d = new Date(dateStr + "T00:00:00");
      return d.toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });
    }
    function dayName(dateStr){
      const d = new Date(dateStr + "T00:00:00");
      return d.toLocaleDateString("en-US", { weekday:"long" });
    }
    function money(n){
      return `RM ${(n || 0).toFixed(2)}`;
    }
    function reportIdFor(suffix){
      const clean = String(suffix || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0,3) || "GEN";
      return `WT-${ym}-${clean}`;
    }

    const singleMember = filter !== "All" ? members.find(m => m.name === filter) : null;
    const [yy, mm] = ym.split("-");
    const daysInMonth = new Date(Number(yy), Number(mm), 0).getDate();
    const periodLabel = `01 ${monthLabel(ym).split(" ")[0].slice(0,3)} ${yy} — ${String(daysInMonth).padStart(2,"0")} ${monthLabel(ym).split(" ")[0].slice(0,3)} ${yy}`;

    const kpiCard = (label, value, sub) => `
      <div style="flex:1; background:${PDF_LIGHT}; border:1px solid ${PDF_BORDER}; border-radius:8px; padding:14px 12px;">
        <div style="font-size:8.5px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; color:${PDF_MUTED};">${label}</div>
        <div style="font-size:19px; font-weight:800; color:${PDF_INK}; margin:5px 0 2px;">${value}</div>
        <div style="font-size:8.5px; color:${PDF_MUTED};">${sub}</div>
      </div>`;

    let identityBlockHtml, kpiCardsHtml, teamSummaryHtml = "", detailRowsHtml, tableColsHead, reportId, totalHoursLabelVal;

    if(singleMember){
      const stats = byMember[singleMember.name] || { present:0, absent:0, hours:0 };
      const advanceVal = typeof singleMember.advance === "number" ? singleMember.advance : 0;
      const initial = (singleMember.name || "?").trim().charAt(0).toUpperCase();
      identityBlockHtml = `
        <div style="display:flex; align-items:center; gap:14px; background:${PDF_LIGHT}; border:1px solid ${PDF_BORDER}; border-radius:10px; padding:14px 18px; margin-bottom:20px;">
          <div style="width:42px; height:42px; line-height:42px; border-radius:50%; background:${PDF_BLUE}; color:#fff; text-align:center; font-weight:800; font-size:16px; flex-shrink:0;">${escapeHtml(initial)}</div>
          <div>
            <div style="font-size:8.5px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:${PDF_MUTED};">Employee</div>
            <div style="font-size:17px; font-weight:800; color:${PDF_INK}; margin:2px 0 3px;">${escapeHtml(singleMember.name)}</div>
            <div style="font-size:9px; color:${PDF_MUTED};">Monthly Attendance Report — ${monthLabel(ym)}</div>
          </div>
        </div>`;
      kpiCardsHtml = `
        <div style="display:flex; gap:10px; margin-bottom:22px;">
          ${kpiCard("Present", toBn(stats.present), "Work Days")}
          ${kpiCard("Leave", toBn(stats.absent), "Leave Days")}
          ${kpiCard("Total Hours", toBn(stats.hours), "Hours")}
          ${kpiCard("Advance", money(advanceVal), "Total Advance")}
        </div>`;
      detailRowsHtml = monthRecords
        .filter(r => r.member === singleMember.name)
        .slice().sort((a,b) => a.date.localeCompare(b.date))
        .map(r => `
          <tr>
            <td class="pdf-td pdf-td-left">${escapeHtml(prettyDate(r.date))}</td>
            <td class="pdf-td pdf-td-left">${escapeHtml(dayName(r.date))}</td>
            <td class="pdf-td pdf-td-left">
              <span style="color:${r.status === "duty" ? PDF_GREEN : PDF_MUTED}; font-weight:700;">${r.status === "duty" ? "PRESENT" : "LEAVE"}</span>
            </td>
            <td class="pdf-td pdf-td-right">${r.status === "duty" ? toBn(r.hours) : "—"}</td>
          </tr>`).join("");
      tableColsHead = `<th class="pdf-th pdf-th-left">Date</th><th class="pdf-th pdf-th-left">Day</th><th class="pdf-th pdf-th-left">Status</th><th class="pdf-th pdf-th-right">Work Hours</th>`;
      reportId = reportIdFor(singleMember.memberId || singleMember.name);
      totalHoursLabelVal = `${toBn(stats.hours)} hrs`;
    }else{
      identityBlockHtml = `
        <div style="display:flex; align-items:center; gap:14px; background:${PDF_LIGHT}; border:1px solid ${PDF_BORDER}; border-radius:10px; padding:14px 18px; margin-bottom:20px;">
          <div>
            <div style="font-size:8.5px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:${PDF_MUTED};">Team</div>
            <div style="font-size:17px; font-weight:800; color:${PDF_INK}; margin:2px 0 3px;">All Members</div>
            <div style="font-size:9px; color:${PDF_MUTED};">Monthly Attendance Report — ${monthLabel(ym)}</div>
          </div>
        </div>`;
      const totalPresentAll = memberNames.reduce((sum,n) => sum + byMember[n].present, 0);
      const totalLeaveAll   = memberNames.reduce((sum,n) => sum + byMember[n].absent, 0);
      const totalAdvanceAll = memberNames.reduce((sum,n) => {
        const m = members.find(x => x.name === n);
        return sum + (m && typeof m.advance === "number" ? m.advance : 0);
      }, 0);
      kpiCardsHtml = `
        <div style="display:flex; gap:10px; margin-bottom:22px;">
          ${kpiCard("Present", toBn(totalPresentAll), "Work Days")}
          ${kpiCard("Leave", toBn(totalLeaveAll), "Leave Days")}
          ${kpiCard("Total Hours", toBn(totalHoursAll), "Hours")}
          ${kpiCard("Advance", money(totalAdvanceAll), "Total Advance")}
        </div>`;

      const summaryRowsHtml = memberNames.map(name => {
        const d = byMember[name];
        const m = members.find(x => x.name === name);
        const advanceVal = m && typeof m.advance === "number" ? m.advance : 0;
        return `
          <tr>
            <td class="pdf-td pdf-td-left" style="font-weight:700;">${escapeHtml(name)}</td>
            <td class="pdf-td pdf-td-center">${toBn(d.present)}</td>
            <td class="pdf-td pdf-td-center">${toBn(d.absent)}</td>
            <td class="pdf-td pdf-td-center">${toBn(d.hours)}</td>
            <td class="pdf-td pdf-td-right">${money(advanceVal)}</td>
          </tr>`;
      }).join("");
      teamSummaryHtml = `
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
          <div style="width:3px; height:16px; background:${PDF_BLUE}; border-radius:2px;"></div>
          <div style="font-size:14px; font-weight:700; color:${PDF_INK};">Per-Member Summary</div>
        </div>
        <table class="pdf-table" style="margin-bottom:24px;">
          <thead><tr>
            <th class="pdf-th pdf-th-left">Name</th>
            <th class="pdf-th">Present</th>
            <th class="pdf-th">Leave</th>
            <th class="pdf-th">Total Hours</th>
            <th class="pdf-th pdf-th-right">Advance</th>
          </tr></thead>
          <tbody>${summaryRowsHtml}</tbody>
        </table>`;
      detailRowsHtml = monthRecords
        .slice().sort((a,b) => a.date.localeCompare(b.date) || a.member.localeCompare(b.member))
        .map(r => `
          <tr>
            <td class="pdf-td pdf-td-left">${escapeHtml(prettyDate(r.date))}</td>
            <td class="pdf-td pdf-td-left">${escapeHtml(r.member)}</td>
            <td class="pdf-td pdf-td-left">
              <span style="color:${r.status === "duty" ? PDF_GREEN : PDF_MUTED}; font-weight:700;">${r.status === "duty" ? "PRESENT" : "LEAVE"}</span>
            </td>
            <td class="pdf-td pdf-td-right">${r.status === "duty" ? toBn(r.hours) : "—"}</td>
          </tr>`).join("");
      tableColsHead = `<th class="pdf-th pdf-th-left">Date</th><th class="pdf-th pdf-th-left">Name</th><th class="pdf-th pdf-th-left">Status</th><th class="pdf-th pdf-th-right">Work Hours</th>`;
      reportId = reportIdFor("ALL");
      totalHoursLabelVal = `${toBn(totalHoursAll)} hrs`;
    }

    const wrap = document.createElement("div");
    wrap.id = "pdfReportRoot";
    wrap.style.cssText = `position:fixed; left:-99999px; top:0; width:800px; background:#fff; padding:40px 34px 30px; font-family:'Inter','Hind Siliguri',sans-serif; color:${PDF_INK};`;
    wrap.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; padding-bottom:16px; border-bottom:1px solid ${PDF_BORDER}; margin-bottom:26px;">
        <div style="display:flex; align-items:center; gap:14px;">
          <img src="masum.png" style="height:42px; object-fit:contain;" crossorigin="anonymous">
          <div>
            <div style="font-size:13px; font-weight:800; color:${PDF_INK}; letter-spacing:.03em;">WORKTRACK</div>
            <div style="font-size:9px; color:${PDF_MUTED};">Attendance &amp; Workforce Management</div>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:11px; font-weight:800; color:${PDF_BLUE}; letter-spacing:.05em;">ATTENDANCE REPORT</div>
          <div style="font-size:9px; color:${PDF_MUTED}; margin-top:2px;">${monthLabel(ym)}</div>
        </div>
      </div>

      <div style="margin-bottom:22px;">
        <div style="font-size:24px; font-weight:800; color:${PDF_INK};">Attendance Report</div>
        <div style="font-size:10.5px; color:${PDF_MUTED}; margin-top:4px;">${periodLabel}</div>
      </div>

      ${identityBlockHtml}
      ${kpiCardsHtml}
      ${teamSummaryHtml}

      <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
        <div style="width:3px; height:16px; background:${PDF_BLUE}; border-radius:2px;"></div>
        <div style="font-size:14px; font-weight:700; color:${PDF_INK};">Daily Attendance Details</div>
      </div>

      <table class="pdf-table">
        <thead><tr>${tableColsHead}</tr></thead>
        <tbody>${detailRowsHtml}</tbody>
        <tfoot>
          <tr class="pdf-tfoot-row">
            <td class="pdf-td pdf-td-left" style="font-weight:800;" colspan="3">Total Work Hours</td>
            <td class="pdf-td pdf-td-right" style="font-weight:800;">${totalHoursLabelVal}</td>
          </tr>
        </tfoot>
      </table>
    `;

    const style = document.createElement("style");
    style.textContent = `
      #pdfReportRoot .pdf-table{ width:100%; border-collapse:collapse; font-size:10px; }
      #pdfReportRoot .pdf-th{
        background:${PDF_BLUE}; color:#fff; padding:9px 10px; text-align:center;
        vertical-align:middle; font-weight:600; text-transform:uppercase; font-size:8.5px; letter-spacing:.04em;
      }
      #pdfReportRoot .pdf-th-left{ text-align:left; }
      #pdfReportRoot .pdf-th-right{ text-align:right; }
      #pdfReportRoot .pdf-td{
        padding:9px 10px; text-align:center; vertical-align:middle;
        border-bottom:1px solid ${PDF_BORDER}; line-height:1.4; font-size:10px;
      }
      #pdfReportRoot .pdf-td-left{ text-align:left; }
      #pdfReportRoot .pdf-td-right{ text-align:right; }
      #pdfReportRoot .pdf-tfoot-row td{ background:${PDF_LIGHT}; border-bottom:none; border-top:1px solid ${PDF_BORDER}; }
      #pdfReportRoot tr{ height:34px; }
    `;
    document.body.appendChild(style);
    document.body.appendChild(wrap);

    const FOOTER_MARGIN_MM = 14;
    const generatedAt = new Date().toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });

    function drawFooter(pdf, pageNum, totalPages, pageWidthMM, pageHeightMM){
      const bandTop = pageHeightMM - FOOTER_MARGIN_MM - 8;
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, bandTop, pageWidthMM, pageHeightMM - bandTop, "F");
      const y = pageHeightMM - FOOTER_MARGIN_MM;
      pdf.setDrawColor(228, 231, 236);
      pdf.setLineWidth(0.2);
      pdf.line(16, y - 5, pageWidthMM - 16, y - 5);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7.5);
      pdf.setTextColor(23, 32, 51);
      pdf.text("masumcpex.com", 16, y);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(102, 112, 133);
      pdf.text("info@masumcpex.com", 16, y + 4);
      pdf.text(`Report ID: ${reportId}`, pageWidthMM / 2 - 15, y);
      const rightText1 = `Generated: ${generatedAt}`;
      const rightText2 = `Page ${pageNum} of ${totalPages}`;
      pdf.text(rightText1, pageWidthMM - 16, y, { align: "right" });
      pdf.text(rightText2, pageWidthMM - 16, y + 4, { align: "right" });
    }

    try{
      const canvas = await window.html2canvas(wrap, { scale:2, useCORS:true, backgroundColor:"#ffffff" });
      const { jsPDF } = window.jspdf;

      const A4_WIDTH_MM  = 210;
      const A4_HEIGHT_MM = 297;
      const CONTENT_HEIGHT_MM = A4_HEIGHT_MM - FOOTER_MARGIN_MM - 8;
      const imgWidthMM  = A4_WIDTH_MM;
      const imgHeightMM = (canvas.height * imgWidthMM) / canvas.width;
      const imgData = canvas.toDataURL("image/jpeg", 0.95);

      const totalPages = Math.max(1, Math.ceil(imgHeightMM / CONTENT_HEIGHT_MM));
      const pdf = new jsPDF({ orientation:"portrait", unit:"mm", format:"a4" });

      for(let page = 0; page < totalPages; page++){
        if(page > 0) pdf.addPage();
        const position = -(page * CONTENT_HEIGHT_MM);
        pdf.addImage(imgData, "JPEG", 0, position, imgWidthMM, imgHeightMM);
        drawFooter(pdf, page + 1, totalPages, A4_WIDTH_MM, A4_HEIGHT_MM);
      }
      pdf.save(`attendance-report-${ym}${singleMember ? "-" + singleMember.name : ""}.pdf`);
    }finally{
      document.body.removeChild(wrap);
      document.body.removeChild(style);
    }
  }

  function escapeHtml(str){
    return String(str)
      .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;").replace(/'/g,"&#039;");
  }

  function updateLoadingState(){
    if(membersLoaded && recordsLoaded){
      registerLoading.style.display = "none";
    }
  }

  renderMembers();
  refreshSummarySection();
  renderRegister();

  const myMembersQuery = query(membersCol, where("ownerId", "==", uid));
  const myRecordsQuery = query(recordsCol, where("ownerId", "==", uid));

  onSnapshot(myMembersQuery, snapshot => {
    members = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      .sort((a,b) => (a.name || "").localeCompare(b.name || "", "bn"));
    membersLoaded = true;
    renderMembers();
    refreshSummarySection();
    renderRegister();
    updateLoadingState();
  }, err => {
    console.error(err);
    registerLoading.textContent = "Failed to load data. Please check your internet connection.";
  });

  onSnapshot(myRecordsQuery, snapshot => {
    records = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    recordsLoaded = true;
    renderMembers();
    refreshSummarySection();
    renderRegister();
    updateLoadingState();
  }, err => {
    console.error(err);
    registerLoading.textContent = "Failed to load data. Please check your internet connection.";
  });

  const sidebarLinks = document.querySelectorAll(".kh-sidebar-link[data-section]");
  if(sidebarLinks.length){
    const sectionEls = Array.from(sidebarLinks)
      .map(a => document.getElementById(a.dataset.section))
      .filter(Boolean);
    const setActive = id => {
      sidebarLinks.forEach(a => a.classList.toggle("is-active", a.dataset.section === id));
    };
    if("IntersectionObserver" in window){
      const observer = new IntersectionObserver(entries => {
        const visible = entries.filter(e => e.isIntersecting);
        if(visible.length) setActive(visible[0].target.id);
      }, { rootMargin: "-15% 0px -70% 0px" });
      sectionEls.forEach(el => observer.observe(el));
    }
    sidebarLinks.forEach(a => a.addEventListener("click", () => setActive(a.dataset.section)));
    setActive("sectionDashboard");
  }
}

document.addEventListener("click", e => {
  const trigger = e.target.closest("#khAccountTrigger");
  const dropdown = document.getElementById("khAccountDropdown");
  if(!dropdown) return;
  if(trigger){
    dropdown.classList.toggle("is-open");
    return;
  }
  if(!e.target.closest(".kh-account-wrap")){
    dropdown.classList.remove("is-open");
  }
});
