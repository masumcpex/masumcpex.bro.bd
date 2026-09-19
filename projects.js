/* ============================================================
   Projects page — renders two data-driven grids:
   1) SITE_DATA.tools    → apps/tools built on this site (Attendance, Bazar, ...)
   2) SITE_DATA.projects → other/creative projects (shown only when non-empty)
   Add a new tool or project in data.js and it appears here
   automatically — no HTML changes needed.
   ============================================================ */

const TOOL_ICONS = {
  calendar: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M9 16l2 2 4-4"></path></svg>',
  cart: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.5 3h2l2.6 12.6a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21 8H6.2"></path></svg>',
  default: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="3" width="7" height="7" rx="1.5"></rect><rect x="3" y="14" width="7" height="7" rx="1.5"></rect><rect x="14" y="14" width="7" height="7" rx="1.5"></rect></svg>',
};
const PROJ_ARROW = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>';

document.addEventListener("DOMContentLoaded", () => {
  if (typeof SITE_DATA === "undefined") return;

  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  /* ---- Apps & Tools grid ---- */
  const toolsGrid = document.getElementById("toolsGrid");
  if (toolsGrid) {
    const tools = SITE_DATA.tools || [];
    if (!tools.length) {
      toolsGrid.innerHTML = `
        <article class="card">
          <h3 class="card-title">এখনো কোনো টুল যোগ করা হয়নি</h3>
          <p class="card-desc">নতুন টুল তৈরি হলে এখানে দেখা যাবে।</p>
        </article>`;
    } else {
      toolsGrid.innerHTML = tools.map((t) => `
        <a href="${escapeHtml(t.url || "#")}" class="card tool-card">
          <div class="tool-icon-badge">${TOOL_ICONS[t.icon] || TOOL_ICONS.default}</div>
          ${t.status ? `<div class="tool-status">${escapeHtml(t.status)}</div>` : ""}
          <h3 class="card-title">${escapeHtml(t.title)}</h3>
          <p class="card-desc">${escapeHtml(t.description || "")}</p>
          <div class="card-cta">
            <span class="btn-view">খুলুন ${PROJ_ARROW}</span>
          </div>
        </a>
      `).join("");
    }
  }

  /* ---- Other Projects grid (only shown if data exists) ---- */
  const otherSection = document.getElementById("otherProjectsSection");
  const projectGrid = document.getElementById("projectGrid");
  const projects = SITE_DATA.projects || [];
  if (otherSection && projectGrid && projects.length) {
    otherSection.hidden = false;
    projectGrid.innerHTML = projects.map((item) => `
      <article class="card">
        <div class="card-eyebrow">${escapeHtml(item.status || "Project")}</div>
        <h3 class="card-title">${escapeHtml(item.title)}</h3>
        <p class="card-desc">${escapeHtml(item.description || "")}</p>
        ${item.url ? `
          <div class="card-cta">
            <a class="btn-view" href="${escapeHtml(item.url)}" target="_blank" rel="noopener">দেখুন ${PROJ_ARROW}</a>
          </div>` : ""}
      </article>
    `).join("");
  }
});
