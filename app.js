const ICON_LINK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>';
const ICON_FACEBOOK = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>';
const ICON_INSTAGRAM = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><line x1="17.5" y1="6.5" x2="17.5" y2="6.5"></line></svg>';
const ICON_TELEGRAM = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"></path><path d="M22 2 15 22l-4-9-9-4z"></path></svg>';
const SOCIAL_ICONS = { Facebook: ICON_FACEBOOK, Instagram: ICON_INSTAGRAM, Telegram: ICON_TELEGRAM };

document.addEventListener("DOMContentLoaded", () => {

  const hero = SITE_DATA.hero;
  const aboutPhotoEl = document.getElementById("aboutPhoto");
  const about = SITE_DATA.about;

  if (aboutPhotoEl) { aboutPhotoEl.src = about.photo; }

  setText("heroName", hero.name);
  setText("heroRole", hero.role);
  setText("heroTagline", hero.tagline);

  setText("aboutTitle", about.title);
  if (aboutPhotoEl) { aboutPhotoEl.alt = hero.name; }

  const aboutText = document.getElementById("aboutText");
  if (aboutText) {
    aboutText.innerHTML = about.paragraphs.map(p => `<p>${escapeHTML(p)}</p>`).join("");
  }

  const statRow = document.getElementById("aboutStats");
  if (statRow) {
    if (about.stats && about.stats.length) {
      statRow.innerHTML = about.stats.map(s => `
        <div class="stat">
          <div class="stat-num">${escapeHTML(s.num)}</div>
          <div class="stat-label">${escapeHTML(s.label)}</div>
        </div>`).join("");
    } else {
      statRow.remove();
    }
  }

  renderJourney("journeyTimeline", SITE_DATA.journey);

  renderGrid("bookGrid", SITE_DATA.library, (item) => `
    <article class="card">
      <div class="card-eyebrow">Book</div>
      <h3 class="card-title">${escapeHTML(item.title)}</h3>
      <p class="card-desc">${escapeHTML(item.description || "")}</p>
      ${ctaBlock(item.url)}
    </article>
  `, "এখনও কোনো বই যোগ করা হয়নি", "নতুন বই প্রকাশ হলে এখানে দেখা যাবে।", {
    link: "https://masumcpex.com/#library",
    icon: `<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path></svg>`
  });

  renderListWithModal("journalList", SITE_DATA.journal, "journal",
    "এখনও কোনো জার্নাল এন্ট্রি নেই", "মনের কথা লিখলে এখানে যোগ হবে।");
  renderFilters("journalFilters", SITE_DATA.journal, "journalList", "journal");

  renderListWithModal("articleList", SITE_DATA.articles, "articles",
    "এখনও কোনো আর্টিকেল প্রকাশিত হয়নি", "নতুন লেখা প্রকাশ হলে এখানে দেখা যাবে।");
  renderFilters("articleFilters", SITE_DATA.articles, "articleList", "articles");

  renderGrid("projectGrid", SITE_DATA.projects, (item) => `
    <article class="card">
      <div class="card-eyebrow">${escapeHTML(item.status || "Project")}</div>
      <h3 class="card-title">${escapeHTML(item.title)}</h3>
      <p class="card-desc">${escapeHTML(item.description || "")}</p>
      ${ctaBlock(item.url)}
    </article>
  `, "এখনও কোনো প্রজেক্ট যোগ করা হয়নি", "নতুন কিছু তৈরি করলে এখানে যোগ হবে।");

  const contact = SITE_DATA.contact;
  setText("contactLocation", contact.location || "");
  const phoneEl = document.getElementById("contactPhone");
  if (phoneEl) {
    if (contact.phone) { phoneEl.textContent = contact.phone; }
    else { phoneEl.closest(".contact-info-item")?.remove(); }
  }
  const emailEl = document.getElementById("contactEmails");
  if (emailEl) {
    if (contact.emails && contact.emails.length) { emailEl.textContent = contact.emails.join(" / "); }
    else { emailEl.closest(".contact-info-item")?.remove(); }
  }
  const socialRow = document.getElementById("socialRow");
  if (socialRow) {
    if (contact.socials && contact.socials.length) {
      socialRow.innerHTML = contact.socials.map(s => `
        <a href="${escapeAttr(s.url)}" target="_blank" rel="noopener" aria-label="${escapeAttr(s.label)}">${SOCIAL_ICONS[s.label] || ICON_LINK}</a>
      `).join("");
    }
  }

  const highlights = document.getElementById("homeHighlights");
  if (highlights) {
    const latestBook = SITE_DATA.library[0];
    const latestJournal = SITE_DATA.journal[0];
    const latestArticle = SITE_DATA.articles[0];
    const featuredProject = SITE_DATA.projects[0];
    const items = [
      latestBook && { label: "সর্বশেষ বই", title: latestBook.title, link: "https://masumcpex.com/index.html#library" },
      latestJournal && { label: "সর্বশেষ জার্নাল", title: latestJournal.title, link: "#journal" },
      latestArticle && { label: "সর্বশেষ আর্টিকেল", title: latestArticle.title, link: "#articles" },
      featuredProject && { label: "ফিচার্ড প্রজেক্ট", title: featuredProject.title, link: "#projects" }
    ].filter(Boolean);

    if (items.length) {
      highlights.innerHTML = items.map(i => `
        <a class="card" href="${i.link}">
          <div class="card-eyebrow">${escapeHTML(i.label)}</div>
          <h3 class="card-title">${escapeHTML(i.title)}</h3>
        </a>
      `).join("");
    } else {
      highlights.innerHTML = `
        <div class="empty-state">
          <strong>এখনও কিছু যোগ করা হয়নি</strong>
          data.js-এ content যোগ করলে এখানে সর্বশেষ বই, জার্নাল, আর্টিকেল ও প্রজেক্ট দেখা যাবে।
        </div>`;
    }
  }

  const navLinks = document.querySelectorAll('.main-nav a[data-nav]');
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      navLinks.forEach(l => l.classList.remove("is-active"));
      link.classList.add("is-active");
      document.getElementById("mainNav")?.classList.remove("is-open");
    });
  });

  const sections = document.querySelectorAll(".page[id]");
  if ("IntersectionObserver" in window && sections.length) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(l => l.classList.toggle("is-active", l.dataset.nav === id));
        }
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    sections.forEach(s => navObserver.observe(s));
  }

  const modal = document.getElementById("readModal");
  const modalClose = document.getElementById("modalClose");
  function closeModal() {
    modal?.classList.remove("is-open");
    document.body.style.overflow = "";
  }
  modalClose?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");
  if (searchInput && searchResults) {
    const searchIndex = [
      ...SITE_DATA.library.map(i => ({ ...i, type: "বই", link: "https://masumcpex.com/index.html#library" })),
      ...SITE_DATA.journal.map(i => ({ ...i, type: "জার্নাল", link: "#journal" })),
      ...SITE_DATA.articles.map(i => ({ ...i, type: "আর্টিকেল", link: "#articles" })),
      ...SITE_DATA.projects.map(i => ({ ...i, type: "প্রজেক্ট", link: "#projects" }))
    ];
    searchInput.addEventListener("input", () => {
      const q = searchInput.value.trim().toLowerCase();
      if (!q) { searchResults.innerHTML = ""; return; }
      const matches = searchIndex.filter(i => i.title.toLowerCase().includes(q)).slice(0, 8);
      searchResults.innerHTML = matches.length
        ? matches.map(m => `<a href="${m.link}" style="display:block;padding:.4rem 0;">${escapeHTML(m.type)} · ${escapeHTML(m.title)}</a>`).join("")
        : `<p>কোনো ফলাফল পাওয়া যায়নি।</p>`;
    });
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text || "";
  }

  function renderJourney(containerId, items) {
    const el = document.getElementById(containerId);
    if (!el) return;
    if (!items || !items.length) { el.remove(); return; }
    el.innerHTML = items.map((item, idx) => `
      <div class="timeline-item ${idx % 2 === 0 ? "is-up" : "is-down"}" style="--i:${idx}">
        <div class="timeline-card">
          <h3 class="timeline-title">${escapeHTML(item.title)}</h3>
          <p class="timeline-desc">${escapeHTML(item.description)}</p>
          ${item.link ? `
          <a class="timeline-link" href="${escapeHTML(item.link)}" target="_blank" rel="noopener noreferrer">
            ${escapeHTML(item.linkText || "বইটি পড়ুন")}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
          </a>` : ""}
        </div>
        <div class="timeline-node">
          <span class="timeline-dot"></span>
          <span class="timeline-year">${escapeHTML(item.year)}</span>
        </div>
      </div>
    `).join("");
  }

  function renderGrid(containerId, items, template, emptyTitle, emptyDesc, emptyState) {
    const el = document.getElementById(containerId);
    if (!el) return;
    if (items && items.length) {
      el.innerHTML = items.map(template).join("");
    } else if (emptyState && emptyState.link) {
      el.innerHTML = `
        <a class="empty-state empty-state-linked" href="${escapeHTML(emptyState.link)}">
          <span class="empty-state-icon" aria-hidden="true">${emptyState.icon}</span>
          <strong>${escapeHTML(emptyTitle)}</strong>${escapeHTML(emptyDesc)}
        </a>`;
    } else {
      el.innerHTML = `<div class="empty-state"><strong>${escapeHTML(emptyTitle)}</strong>${escapeHTML(emptyDesc)}</div>`;
    }
  }

  function renderListWithModal(containerId, items, categoryKey, emptyTitle, emptyDesc) {
    const el = document.getElementById(containerId);
    if (!el) return;
    if (!items || !items.length) {
      el.innerHTML = `<div class="empty-state"><strong>${escapeHTML(emptyTitle)}</strong>${escapeHTML(emptyDesc)}</div>`;
      return;
    }
    el.innerHTML = items.map((item, idx) => `
      <article class="card" data-open="${categoryKey}-${idx}" tabindex="0" role="button">
        <div class="card-eyebrow">${escapeHTML(item.category || "")}</div>
        <h3 class="card-title">${escapeHTML(item.title)}</h3>
        <p class="card-desc">${escapeHTML(item.excerpt || "")}</p>
        <div class="card-date">${escapeHTML(item.date || "")}</div>
        <div class="card-cta">
          <span class="btn-view">পড়ুন →</span>
          <span class="cta-hint">এখানে ক্লিক করুন</span>
        </div>
      </article>
    `).join("");

    el.querySelectorAll("[data-open]").forEach((card, idx) => {
      const open = () => openModal(items[idx]);
      card.addEventListener("click", open);
      card.addEventListener("keydown", (e) => { if (e.key === "Enter") open(); });
    });
  }

  function renderFilters(containerId, items, listId, categoryKey) {
    const el = document.getElementById(containerId);
    if (!el || !items || !items.length) { if (el) el.remove(); return; }
    const cats = ["সব", ...new Set(items.map(i => i.category).filter(Boolean))];
    el.innerHTML = cats.map((c, i) => `<button class="chip ${i === 0 ? "is-active" : ""}" data-cat="${escapeAttr(c)}">${escapeHTML(c)}</button>`).join("");
    el.querySelectorAll(".chip").forEach(chip => {
      chip.addEventListener("click", () => {
        el.querySelectorAll(".chip").forEach(c => c.classList.remove("is-active"));
        chip.classList.add("is-active");
        const cat = chip.dataset.cat;
        const filtered = cat === "সব" ? items : items.filter(i => i.category === cat);
        renderListWithModal(listId, filtered, categoryKey, "কিছু পাওয়া যায়নি", "এই ক্যাটাগরিতে এখনও কিছু নেই।");
      });
    });
  }

  function openModal(item) {
    if (!modal) return;
    setText("modalCategory", item.category || "");
    setText("modalTitle", item.title || "");
    setText("modalDate", item.date || "");
    const contentEl = document.getElementById("modalContent");
    if (contentEl) contentEl.innerHTML = `<p>${escapeHTML(item.content || item.excerpt || "")}</p>`;
    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
    modalClose?.focus();
  }

  function ctaBlock(url) {
    if (!url) return "";
    const safeUrl = escapeAttr(url);
    return `
      <div class="card-cta">
        <a class="btn-view" href="${safeUrl}" target="_blank" rel="noopener">পড়ুন →</a>
        <a class="cta-hint" href="${safeUrl}" target="_blank" rel="noopener">এখানে ক্লিক করুন</a>
      </div>`;
  }

  function escapeHTML(str) {
    if (str === undefined || str === null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
  function escapeAttr(str) {
    return escapeHTML(str).replace(/"/g, "&quot;");
  }

});
