(() => {
  "use strict";
  if (typeof SITE_DATA === "undefined") return;

  const D = SITE_DATA;
  const app = document.getElementById("app");
  const isSPA = !!app && app.dataset.page !== "legal";
  const BASE = isSPA ? "" : "index.html";
  const MAIN_TITLE = "Masum — Personal Digital Space";

  const PATHS = {
    arrow: '<line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline>',
    back: '<line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline>',
    close: '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>',
    search: '<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>',
    bars: '<line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>',
    Facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>',
    Instagram: '<rect x="2" y="2" width="20" height="20" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><line x1="17.5" y1="6.5" x2="17.5" y2="6.5"></line>',
    Telegram: '<path d="M22 2 11 13"></path><path d="M22 2 15 22l-4-9-9-4z"></path>',
    book: '<path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M9 16l2 2 4-4"></path>',
    cart: '<circle cx="9" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.5 3h2l2.6 12.6a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21 8H6.2"></path>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="3" width="7" height="7" rx="1.5"></rect><rect x="3" y="14" width="7" height="7" rx="1.5"></rect><rect x="14" y="14" width="7" height="7" rx="1.5"></rect>',
    pin: '<path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path>',
    dl: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"></path>',
    save: '<path d="M5 3h12l3 3v15H5zM8 3v6h8M8 21v-7h8v7"></path>',
    print: '<path d="M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z"></path>',
    reset: '<path d="M4 12a8 8 0 108-8M4 4v5h5"></path>',
    plus: '<path d="M12 5v14M5 12h14"></path>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"></path>',
    receipt: '<path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2zM9 8h6M9 12h6"></path>',
    quote: '<path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5"></path>',
    wallet: '<path d="M3 7h16a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2zM3 7l2-3h12M16 13h2"></path>',
    award: '<path d="M12 14a5 5 0 100-10 5 5 0 000 10zM8.5 13.5L7 21l5-3 5 3-1.5-7.5"></path>',
    user: '<path d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0"></path>',
    pen: '<path d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4"></path>',
    doc: '<path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8zM14 3v5h5M9 13h6M9 17h6"></path>',
    build: '<path d="M4 21V5a1 1 0 011-1h8a1 1 0 011 1v16M14 9h5a1 1 0 011 1v11M3 21h18M8 8h2M8 12h2M8 16h2"></path>',
    image: '<path d="M4 5h16v14H4zM8 10h.01M4 17l5-5 4 4 3-3 4 4"></path>',
    set: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M14 4v4M10 10v4M16 16v4"></path>',
    qr: '<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z"></path>',
    clock: '<path d="M12 7v5l3 2M12 21a9 9 0 100-18 9 9 0 000 18z"></path>',
    up: '<path d="M12 19V5M5 12l7-7 7 7"></path>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"></path><path d="M9 12l2 2 4-4"></path>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="M22 6 12 13 2 6"></path>'
  };

  const icon = (name, size = 18, sw = 2, cls = "") =>
    `<svg${cls ? ` class="${cls}"` : ""} width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${PATHS[name] || PATHS.link}</svg>`;

  const esc = (str) => {
    if (str === undefined || str === null) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  };
  const escAttr = (str) => esc(str).replace(/"/g, "&quot;");
  const $ = (id) => document.getElementById(id);
  const setText = (id, text) => { const el = $(id); if (el) el.textContent = text || ""; };
  const isExternal = (url) => /^https?:\/\//i.test(url);
  const routeHref = (route) => `${BASE}#/${route}`;

  const TOOL_MODULES = {};

  const emptyState = (title, desc) =>
    `<div class="empty-state"><strong>${esc(title)}</strong>${esc(desc)}</div>`;

  const navLink = (item, withArrow) => {
    const href = item.route ? routeHref(item.route) : item.href;
    const attrs = `href="${escAttr(href)}" data-nav="${escAttr(item.route || item.label.toLowerCase())}"`;
    return withArrow
      ? `<a ${attrs}><span>${esc(item.label)}</span>${icon("arrow", 16)}</a>`
      : `<a ${attrs}>${esc(item.label)}</a>`;
  };


  const LEGAL = [
    { label: "Privacy Policy", href: "legal.html#privacy-policy" },
    { label: "Terms of Service", href: "legal.html#terms" },
    { label: "Cookie Policy", href: "legal.html#cookies" },
    { label: "Disclaimer", href: "legal.html#disclaimer" }
  ];

  const footerHTML = () => {
    const c = D.contact || {};
    const email = (c.emails || [])[0] || "";
    const explore = [
      { label: "Home", href: "index.html#/home" },
      { label: "About", href: "index.html#/about" },
      { label: "Journey", href: "index.html#/journey" },
      { label: "Attendance", href: "attendance.html" },
      { label: "Tools", href: "index.html#/tools" },
      { label: "Contact", href: "index.html#/contact" }
    ];
    const more = [
      { label: "Library", href: "https://masumcpex.com/index.html#library", ext: 1 },
      { label: "Articles", href: "https://masumcpex.com/articles.html", ext: 1 },
      { label: "Finance Tracker", href: "https://masumcpex.com/Finance.html", ext: 1 },
      { label: "masumcpex.com", href: "https://masumcpex.com", ext: 1 }
    ];
    const list = (arr) => arr.map((l) => `<li><a href="${escAttr(l.href)}"${l.ext ? ' target="_blank" rel="noopener"' : ""}>${esc(l.label)}</a></li>`).join("");
    const letters = "masumcpex".split("").map((ch, i) => `<span style="--d:${i * 55}ms">${ch}</span>`).join("");
    return `
    <footer class="site-footer" id="siteFooter">
      <div class="footer-inner">
        <div class="footer-cta">
          <p class="footer-cta-text">কিছু বানাতে চান? কথা বলি।</p>
          ${email ? `<a class="footer-mail" href="mailto:${escAttr(email)}">${esc(email)} ${icon("arrow", 18, 2)}</a>` : ""}
        </div>
        <div class="footer-grid">
          <div class="footer-brand">
            <a href="index.html#/home" class="footer-logo"><img src="yellow.webp" alt="" width="40" height="40"><span>Masum <em>cpex</em></span></a>
            <p>জ্ঞান, কাজ ও সৃজনশীলতার একটি ব্যক্তিগত ডিজিটাল স্পেস।</p>
            <div class="footer-social">${(c.socials || []).map((x) => `<a href="${escAttr(x.url)}" target="_blank" rel="noopener" aria-label="${escAttr(x.label)}">${icon(x.label, 18, 1.8)}</a>`).join("")}</div>
          </div>
          <nav class="footer-col" aria-label="Explore"><h4>Explore</h4><ul>${list(explore)}</ul></nav>
          <nav class="footer-col" aria-label="More"><h4>More</h4><ul>${list(more)}</ul></nav>
          <nav class="footer-col" aria-label="Legal"><h4>Legal</h4><ul>${list(LEGAL)}</ul></nav>
        </div>
      </div>
      <div class="footer-mark" aria-hidden="true">${letters}</div>
      <div class="footer-bottom">
        <p>© ${new Date().getFullYear()} <strong>Masum Cpex</strong>. All rights reserved.</p>
        <p class="footer-bottom-links">${LEGAL.slice(0, 2).map((l) => `<a href="${escAttr(l.href)}">${esc(l.label)}</a>`).join("")}</p>
      </div>
    </footer>`;
  };

  const CONSENT_KEY = "mc_cookie_consent";
  const getConsent = () => { try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; } };
  const setConsent = (v) => { try { localStorage.setItem(CONSENT_KEY, v); } catch (e) { /* ignore */ } };

  const cookieHTML = () => `
    <div class="cookie-bar" id="cookieBar" role="dialog" aria-live="polite" aria-label="কুকি নোটিশ" hidden>
      <div class="cookie-icon">${icon("shield", 20, 1.8)}</div>
      <div class="cookie-body">
        <strong>আপনার গোপনীয়তা গুরুত্বপূর্ণ</strong>
        <p>সাইট চালাতে প্রয়োজনীয় স্টোরেজ ব্যবহার হয়। ভিজিটর পরিসংখ্যান (Google Analytics) শুধু আপনার অনুমতি পেলে চালু হবে। <a href="legal.html#cookies">বিস্তারিত</a></p>
      </div>
      <div class="cookie-actions">
        <button type="button" class="cookie-btn cookie-ghost" id="cookieDecline">না, ধন্যবাদ</button>
        <button type="button" class="cookie-btn cookie-solid" id="cookieAccept">ঠিক আছে</button>
      </div>
    </div>`;

  const chromeHTML = () => `
    <header class="site-header" id="siteHeader">
      <div class="header-inner">
        <a href="${routeHref("home")}" class="brand" data-nav="home">
          <span class="brand-mark"><img src="yellow.webp" alt="${escAttr(D.hero.name)}" width="50" height="50"></span>
          <span class="brand-name" id="brandName">${esc(D.hero.name)}</span>
        </a>
        <nav class="main-nav" id="mainNav" aria-label="প্রধান মেনু">${D.nav.map((n) => navLink(n, false)).join("")}</nav>
        <div class="header-tools">
          <a href="${routeHref("contact")}" class="header-cta" data-nav="contact">Let's Talk ${icon("arrow", 12)}</a>
          <button class="icon-btn" id="searchToggle" aria-label="সার্চ">${icon("search")}</button>
          <button class="icon-btn menu-toggle" id="menuToggle" aria-label="মেনু" aria-expanded="false">
            ${icon("bars", 18, 2, "menu-icon-bars")}${icon("close", 18, 2, "menu-icon-close")}
          </button>
        </div>
      </div>
      <div class="search-panel" id="searchPanel" role="search">
        <div class="search-panel-inner">
          <label for="searchInput" class="sr-only">বই, টুল বা পেজ খুঁজুন</label>
          <input type="text" id="searchInput" placeholder="খুঁজুন...">
          <button class="icon-btn" id="searchClose" aria-label="সার্চ বন্ধ করুন">${icon("close", 16)}</button>
        </div>
        <div class="search-results" id="searchResults" aria-live="polite"></div>
      </div>
    </header>

    <div class="mobile-menu" id="mobileMenu">
      <button class="icon-btn mobile-menu-close" id="mobileMenuClose" aria-label="মেনু বন্ধ করুন">${icon("close")}</button>
      <nav class="mobile-menu-nav" aria-label="মোবাইল মেনু">${D.nav.map((n) => navLink(n, true)).join("")}</nav>
      <div class="mobile-menu-social">
        ${(D.contact.socials || []).map((s) => `<a href="${escAttr(s.url)}" target="_blank" rel="noopener" aria-label="${escAttr(s.label)}">${icon(s.label, 18, 1.8)}</a>`).join("")}
      </div>
    </div>

    <main id="view"></main>

    <div class="modal-overlay" id="readModal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
      <div class="modal-box">
        <button class="icon-btn modal-close" id="modalClose" aria-label="বন্ধ করুন">${icon("close", 16)}</button>
        <div class="modal-eyebrow" id="modalCategory"></div>
        <h3 class="modal-title" id="modalTitle"></h3>
        <div class="modal-date" id="modalDate"></div>
        <div class="modal-content" id="modalContent"></div>
      </div>
    </div>

    ${footerHTML()}
    ${cookieHTML()}
    <button class="to-top" id="toTop" aria-label="উপরে যান">${icon("up", 18, 2.2)}</button>
    <div class="scroll-progress" id="scrollProgress" aria-hidden="true"></div>`;

  const toolHref = (t) => t.url || routeHref(`tools/${t.id}`);

  const searchIndex = () => [
    { type: "পেজ", title: "About — আমার পরিচিতি", link: routeHref("about") },
    { type: "পেজ", title: "Journey — আমার বইয়ের যাত্রা", link: routeHref("journey") },
    { type: "পেজ", title: "Contact — যোগাযোগ", link: routeHref("contact") },
    { type: "পোর্টাল", title: "Attendance — টিম হাজিরা ও কর্মঘণ্টা", link: "attendance.html" },
    { type: "লিগ্যাল", title: "Privacy Policy", link: "legal.html#privacy-policy" },
    { type: "লিগ্যাল", title: "Terms of Service", link: "legal.html#terms" },
    { type: "লিগ্যাল", title: "Cookie Policy", link: "legal.html#cookies" },
    ...(D.journey || []).filter((i) => i.link).map((i) => ({ type: "বই", title: i.title, link: i.link })),
    ...(D.tools || []).map((i) => ({ ...i, type: "টুল", link: toolHref(i) }))
  ];

  let revealObserver = null;
  const applyReveal = (scope) => {
    const els = (scope || document).querySelectorAll(".timeline-item");
    els.forEach((el) => el.classList.add("reveal"));
    if ("IntersectionObserver" in window) {
      if (!revealObserver) {
        revealObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            }
          });
        }, { threshold: 0.1 });
      }
      els.forEach((el) => revealObserver.observe(el));
    } else {
      els.forEach((el) => el.classList.add("is-visible"));
    }
  };

  const bindChrome = () => {
    const header = $("siteHeader");
    if (header) {
      const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    const menuToggle = $("menuToggle");
    const mobileMenu = $("mobileMenu");
    if (menuToggle && mobileMenu) {
      let closeTimer;
      const closeMobileMenu = (goHome) => {
        if (!mobileMenu.classList.contains("is-open")) return;
        mobileMenu.classList.add("is-closing");
        menuToggle.classList.remove("is-active");
        menuToggle.setAttribute("aria-expanded", "false");
        clearTimeout(closeTimer);
        closeTimer = setTimeout(() => {
          mobileMenu.classList.remove("is-open", "is-closing");
          document.body.style.overflow = "";
          if (goHome) {
            if (isSPA) location.hash = "#/home";
            else location.href = "index.html#/home";
          }
        }, 220);
      };
      const openMobileMenu = () => {
        clearTimeout(closeTimer);
        mobileMenu.classList.remove("is-closing");
        mobileMenu.classList.add("is-open");
        menuToggle.classList.add("is-active");
        menuToggle.setAttribute("aria-expanded", "true");
        document.body.style.overflow = "hidden";
      };
      menuToggle.addEventListener("click", () => {
        if (mobileMenu.classList.contains("is-open")) closeMobileMenu(true);
        else openMobileMenu();
      });
      $("mobileMenuClose")?.addEventListener("click", () => closeMobileMenu(true));
      mobileMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => closeMobileMenu(false)));
    }

    const searchPanel = $("searchPanel");
    const searchInput = $("searchInput");
    const searchResults = $("searchResults");
    $("searchToggle")?.addEventListener("click", () => {
      searchPanel?.classList.add("is-open");
      searchInput?.focus();
    });
    $("searchClose")?.addEventListener("click", () => searchPanel?.classList.remove("is-open"));
    if (searchInput && searchResults) {
      const index = searchIndex();
      searchInput.addEventListener("input", () => {
        const q = searchInput.value.trim().toLowerCase();
        if (!q) { searchResults.innerHTML = ""; return; }
        const matches = index.filter((i) => String(i.title || "").toLowerCase().includes(q)).slice(0, 8);
        searchResults.innerHTML = matches.length
          ? matches.map((m) => `<a href="${escAttr(m.link)}" style="display:block;padding:.4rem 0;">${esc(m.type)} · ${esc(m.title)}</a>`).join("")
          : "<p>কোনো ফলাফল পাওয়া যায়নি।</p>";
      });
      searchResults.addEventListener("click", (e) => {
        if (e.target.closest("a")) {
          searchPanel?.classList.remove("is-open");
          searchInput.value = "";
          searchResults.innerHTML = "";
        }
      });
    }

    const modal = $("readModal");
    const closeModal = () => {
      modal?.classList.remove("is-open");
      document.body.style.overflow = "";
    };
    $("modalClose")?.addEventListener("click", closeModal);
    modal?.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
  };

  const bindExtras = () => {
    const toTop = $("toTop");
    const bar = $("scrollProgress");
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
      if (toTop) toTop.classList.toggle("is-show", window.scrollY > 600);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    toTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

    const footer = $("siteFooter");
    if (footer) {
      if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver((entries) => {
          entries.forEach((en) => {
            footer.classList.toggle("is-in", en.isIntersecting);
          });
        }, { threshold: 0.35 });
        io.observe(footer.querySelector(".footer-mark") || footer);
      } else footer.classList.add("is-in");
    }

    const cookie = $("cookieBar");
    if (cookie) {
      if (!getConsent()) setTimeout(() => { cookie.hidden = false; requestAnimationFrame(() => cookie.classList.add("is-show")); }, 1200);
      const hide = () => { cookie.classList.remove("is-show"); setTimeout(() => { cookie.hidden = true; }, 300); };
      $("cookieAccept")?.addEventListener("click", () => { setConsent("granted"); hide(); initAnalytics(); });
      $("cookieDecline")?.addEventListener("click", () => { setConsent("denied"); hide(); });
    }
  };

  const openModal = (item) => {
    const modal = $("readModal");
    if (!modal) return;
    setText("modalCategory", item.category || "");
    setText("modalTitle", item.title || "");
    setText("modalDate", item.date || "");
    const contentEl = $("modalContent");
    if (contentEl) contentEl.innerHTML = `<p>${esc(item.content || item.excerpt || "")}</p>`;
    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
    $("modalClose")?.focus();
  };

  const ctaBlock = (url) => {
    if (!url) return "";
    const safe = escAttr(url);
    return `
      <div class="card-cta">
        <a class="btn-view" href="${safe}" target="_blank" rel="noopener">পড়ুন →</a>
        <a class="cta-hint" href="${safe}" target="_blank" rel="noopener">এখানে ক্লিক করুন</a>
      </div>`;
  };

  const timelineHTML = (items) => items.map((item, idx) => `
    <div class="timeline-item ${idx % 2 === 0 ? "is-up" : "is-down"}" style="--i:${idx}">
      <div class="timeline-card">
        <h3 class="timeline-title">${esc(item.title)}</h3>
        <p class="timeline-desc">${esc(item.description)}</p>
        ${item.link ? `
        <a class="timeline-link" href="${escAttr(item.link)}" target="_blank" rel="noopener noreferrer">
          ${esc(item.linkText || "বইটি পড়ুন")}
          ${icon("arrow", 12)}
        </a>` : ""}
      </div>
      <div class="timeline-node">
        <span class="timeline-dot"></span>
        <span class="timeline-year">${esc(item.year)}</span>
      </div>
    </div>`).join("");

  const listCards = (items, key) => items.map((item, idx) => `
    <article class="card" data-open="${key}-${idx}" tabindex="0" role="button">
      <div class="card-eyebrow">${esc(item.category || "")}</div>
      <h3 class="card-title">${esc(item.title)}</h3>
      <p class="card-desc">${esc(item.excerpt || "")}</p>
      <div class="card-date">${esc(item.date || "")}</div>
      <div class="card-cta">
        <span class="btn-view">পড়ুন →</span>
        <span class="cta-hint">এখানে ক্লিক করুন</span>
      </div>
    </article>`).join("");

  const mountList = (listEl, items, key, emptyTitle, emptyDesc) => {
    if (!items.length) { listEl.innerHTML = emptyState(emptyTitle, emptyDesc); return; }
    listEl.innerHTML = listCards(items, key);
    listEl.querySelectorAll("[data-open]").forEach((card, idx) => {
      const open = () => openModal(items[idx]);
      card.addEventListener("click", open);
      card.addEventListener("keydown", (e) => { if (e.key === "Enter") open(); });
    });
    applyReveal(listEl);
  };

  const toolCard = (t) => `
    <a href="${escAttr(toolHref(t))}" class="card tool-card"${isExternal(t.url || "") ? ' target="_blank" rel="noopener"' : ""}>
      <div class="tool-icon-badge">${icon(PATHS[t.icon] ? t.icon : "grid", 22)}</div>
      ${t.status ? `<div class="tool-status">${esc(t.status)}</div>` : ""}
      <h3 class="card-title">${esc(t.title)}</h3>
      <p class="card-desc">${esc(t.description || "")}</p>
      <div class="card-cta"><span class="btn-view">খুলুন ${icon("arrow", 14)}</span></div>
    </a>`;

  const bnNum = (n) => String(n).replace(/\d/g, (x) => "০১২৩৪৫৬৭৮৯"[x]);

  const groupCard = (g) => {
    const count = (D.tools || []).filter((t) => t.group === g.id).length;
    return `
      <a href="${routeHref(`tools/${g.id}`)}" class="card tool-card">
        <div class="tool-icon-badge">${icon(PATHS[g.icon] ? g.icon : "grid", 22)}</div>
        <h3 class="card-title">${esc(g.title)}</h3>
        <p class="card-desc">${esc(g.description || "")}</p>
        <div class="card-cta"><span class="btn-view">${bnNum(count)}টি টুল ${icon("arrow", 14)}</span></div>
      </a>`;
  };

  const VIEWS = {
    home: {
      title: MAIN_TITLE,
      html: () => {
        const hero = D.hero;
        const books = (D.journey || []).filter((j) => j.link);
        const toolCount = (D.tools || []).length;
        return `
          <section class="page home">
            <div class="hero2">
              <div class="hero2-copy">
                <a class="hero2-pill" href="attendance.html"><span class="live-dot"></span>Attendance পোর্টাল এখন লাইভ</a>
                <h1 class="hero2-title">শিখি, লিখি,<br>আর কাজের জিনিস বানাই।</h1>
                <p class="hero2-sub">আমি ${esc(hero.name)}। বই লিখি, ফ্রি টুলস বানাই, আর শেখা থামাই না।</p>
                <div class="hero2-cta">
                  <a class="btn btn-primary" href="${escAttr(hero.ctaLink)}" target="_blank" rel="noopener">${esc(hero.ctaText)}</a>
                  <a class="btn btn-outline" href="${routeHref("tools")}">টুলস দেখুন</a>
                </div>
              </div>
              <div class="hero2-art">
                <div class="hero2-frame"></div>
                <img class="hero2-img" src="${escAttr(hero.photo)}" alt="${escAttr(hero.name)}" width="500" height="500" loading="eager" fetchpriority="high">
                <span class="hero2-tag">${esc(hero.role)}</span>
              </div>
            </div>

            <div class="stat-strip">
              <div><strong>${bnNum(books.length)}</strong><span>প্রকাশিত বই</span></div>
              <div><strong>${bnNum(toolCount)}</strong><span>ফ্রি টুল ও জেনারেটর</span></div>
              <div><strong>${bnNum(1)}</strong><span>লাইভ Attendance পোর্টাল</span></div>
              <div><strong>${bnNum(2)}</strong><span>ওয়েবসাইট, একই ঠিকানা থেকে</span></div>
            </div>

            <div class="section-block">
              <h2 class="section-title">এখানে যা পাবেন</h2>
              <p class="section-sub">তিনটা জিনিস নিয়ে কাজ করি: ব্যবহারযোগ্য পোর্টাল, প্রতিদিনের টুলস আর লেখা।</p>
              <div class="feature-grid">
                <a class="feature feature-main" href="attendance.html">
                  <span class="feature-badge"><span class="live-dot"></span>Live</span>
                  <div class="feature-icon">${icon("calendar", 26)}</div>
                  <h3>Attendance পোর্টাল</h3>
                  <p>দলের দৈনিক হাজিরা, কর্মঘণ্টা আর মাসিক ছুটি এক জায়গায়। মাসিক ক্যালেন্ডার, সামারি আর PDF রিপোর্টসহ।</p>
                  <span class="feature-link">খুলুন ${icon("arrow", 16)}</span>
                </a>
                <a class="feature" href="${routeHref("tools")}">
                  <div class="feature-icon">${icon("grid", 24)}</div>
                  <h3>ডকুমেন্ট টুলস</h3>
                  <p>ইনভয়েস, সিভি, চিঠি, QR কোড, ছবি থেকে PDF। ব্রাউজারেই তৈরি, কোনো সাইন-আপ ছাড়া।</p>
                  <span class="feature-link">${bnNum(toolCount)}টি টুল দেখুন ${icon("arrow", 16)}</span>
                </a>
                <a class="feature" href="${escAttr(hero.ctaLink)}" target="_blank" rel="noopener">
                  <div class="feature-icon">${icon("book", 24)}</div>
                  <h3>বই ও লেখালেখি</h3>
                  <p>জীবন, অনুভূতি আর সংগ্রামের গল্প নিয়ে লেখা বই এবং প্রবন্ধ।</p>
                  <span class="feature-link">Library খুলুন ${icon("arrow", 16)}</span>
                </a>
              </div>
            </div>

            <div class="section-block">
              <h2 class="section-title">আমার বইগুলো</h2>
              <ul class="book-list">
                ${books.map((b) => `
                  <li><a href="${escAttr(b.link)}" target="_blank" rel="noopener">
                    <span class="book-year">${esc(b.year)}</span>
                    <span class="book-title">${esc(b.title)}</span>
                    <span class="book-go">${icon("arrow", 18)}</span>
                  </a></li>`).join("")}
              </ul>
            </div>

            <div class="section-block">
              <div class="cta-band">
                <div>
                  <h2>একসাথে কিছু বানাতে চান?</h2>
                  <p>প্রশ্ন, পরামর্শ বা কাজের প্রস্তাব, যেকোনো কিছু নিয়ে লিখুন।</p>
                </div>
                <div class="cta-band-actions">
                  <a class="btn btn-sun" href="${routeHref("contact")}">যোগাযোগ করুন</a>
                  <a class="btn btn-ghost-light" href="https://t.me/masumcpex" target="_blank" rel="noopener">Telegram</a>
                </div>
              </div>
            </div>
          </section>`;
      }
    },

    about: {
      title: `About | ${D.hero.name}`,
      html: () => {
        const about = D.about;
        return `
          <section class="page"><div class="page-inner narrow">
            <div class="eyebrow">পরিচিতি</div>
            <h2 class="section-title">${esc(about.title)}</h2>
            <div class="about-grid">
              <img class="about-photo" src="${escAttr(about.photo)}" alt="${escAttr(D.hero.name)}" loading="lazy">
              <div class="about-text">${about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("")}</div>
            </div>
            ${about.stats && about.stats.length ? `<div class="stat-row">${about.stats.map((s) => `
              <div class="stat">
                <div class="stat-num">${esc(s.num)}</div>
                <div class="stat-label">${esc(s.label)}</div>
              </div>`).join("")}</div>` : ""}
          </div></section>`;
      }
    },

    journey: {
      title: `Journey | ${D.hero.name}`,
      html: () => `
        <section class="page"><div class="page-inner">
          <div class="eyebrow">Journey</div>
          <h2 class="section-title">My Journey</h2>
          <p class="section-sub">Four moments that shaped my digital journey.</p>
          ${D.journey && D.journey.length ? `<div class="timeline">${timelineHTML(D.journey)}</div>` : ""}
        </div></section>`
    },

    library: {
      title: `Library | ${D.hero.name}`,
      html: () => {
        const books = D.library || [];
        return `
          <section class="page"><div class="page-inner">
            <div class="eyebrow">Library</div>
            <h2 class="section-title">বইয়ের জগতে প্রবেশ করুন</h2>
            <p class="section-sub">নিচের তালিকা থেকে বই পড়ুন বা ডাউনলোড করুন।</p>
            <div class="card-grid">
              ${books.length ? books.map((item) => `
                <article class="card">
                  <div class="card-eyebrow">Book</div>
                  <h3 class="card-title">${esc(item.title)}</h3>
                  <p class="card-desc">${esc(item.description || "")}</p>
                  ${ctaBlock(item.url)}
                </article>`).join("") : `
                <a class="empty-state empty-state-linked" href="https://masumcpex.com/#library">
                  <span class="empty-state-icon" aria-hidden="true">${icon("book", 44, 1.5)}</span>
                  <strong>এখনও কোনো বই যোগ করা হয়নি</strong>নতুন বই প্রকাশ হলে এখানে দেখা যাবে।
                </a>`}
            </div>
          </div></section>`;
      }
    },

    contact: {
      title: `Contact | ${D.hero.name}`,
      html: () => {
        const c = D.contact;
        const item = (ic, label, value) => `
          <div class="contact-info-item">
            <span class="contact-info-icon">${icon(ic, 20)}</span>
            <div class="contact-info-text"><strong>${label}</strong><span>${esc(value)}</span></div>
          </div>`;
        return `
          <section class="page"><div class="page-inner">
            <div class="contact-grid">
              <div class="contact-info">
                <div class="eyebrow">Contact</div>
                <h2 class="section-title">Get In Touch With Me</h2>
                <p class="section-sub">যেকোনো বিষয়ে সরাসরি ইমেইল, ফোন অথবা সোশ্যাল লিংকের মাধ্যমে যুক্ত হোন।</p>
                <div class="contact-info-list">
                  ${item("pin", "Location", c.location || "")}
                  ${c.phone ? item("phone", "Phone Number", c.phone) : ""}
                  ${c.emails && c.emails.length ? item("mail", "Email Address", c.emails.join(" / ")) : ""}
                </div>
                <div class="social-row">
                  ${(c.socials || []).map((s) => `<a href="${escAttr(s.url)}" target="_blank" rel="noopener" aria-label="${escAttr(s.label)}">${icon(s.label, 18, 1.8)}</a>`).join("")}
                </div>
              </div>
              <form class="contact-form-card" id="contactForm" data-to="${escAttr((c.emails || [])[0] || "")}">
                <input type="text" name="name" placeholder="আপনার নাম" autocomplete="name" required>
                <input type="email" name="email" placeholder="আপনার ইমেইল" autocomplete="email" required>
                <input type="tel" name="phone" placeholder="ফোন (ঐচ্ছিক)" autocomplete="tel">
                <textarea name="message" placeholder="আপনার বার্তা" rows="5" required></textarea>
                <button type="submit" class="contact-form-submit">বার্তা পাঠান</button>
                <p class="form-note">বোতাম চাপলে আপনার ইমেইল অ্যাপ খুলবে, সেখান থেকে পাঠাতে হবে।</p>
              </form>
            </div>
          </div></section>`;
      },
      mount: (el) => {
        const f = el.querySelector("#contactForm");
        if (!f) return;
        f.addEventListener("submit", (e) => {
          e.preventDefault();
          const v = (n) => (f.elements[n] ? f.elements[n].value.trim() : "");
          const body = `নাম: ${v("name")}\nইমেইল: ${v("email")}${v("phone") ? `\nফোন: ${v("phone")}` : ""}\n\n${v("message")}`;
          location.href = `mailto:${f.dataset.to}?subject=${encodeURIComponent("ওয়েবসাইট থেকে বার্তা — " + v("name"))}&body=${encodeURIComponent(body)}`;
        });
      }
    },

    tools: {
      title: `Tools | ${D.hero.name}`,
      html: () => {
        const groups = D.toolGroups || [];
        const featured = (D.tools || []).filter((t) => t.featured);
        return `
          <section class="page"><div class="page-inner">
            <div class="eyebrow">Tools</div>
            <h1 class="section-title">টুলস</h1>
            <p class="tools-sub">একটি বিভাগ বেছে নিন।</p>
            <div class="card-grid">${featured.length || groups.length ? featured.map(toolCard).join("") + groups.map(groupCard).join("") : emptyState("এখনো কোনো টুল যোগ করা হয়নি", "নতুন টুল তৈরি হলে এখানে দেখা যাবে।")}</div>
          </div></section>`;
      }
    }
  };

  const groupView = (id) => {
    const g = (D.toolGroups || []).find((x) => x.id === id);
    if (!g) return null;
    const list = (D.tools || []).filter((t) => t.group === id);
    return {
      title: `${g.title} | ${D.hero.name}`,
      html: () => `
        <section class="page"><div class="page-inner">
          <a class="tool-back" href="${routeHref("tools")}">${icon("back", 16)} সব বিভাগ</a>
          <h1 class="section-title">${esc(g.title)}</h1>
          <p class="tools-sub">${esc(g.description || "")}</p>
          <div class="card-grid">${list.map(toolCard).join("")}</div>
        </div></section>`
    };
  };

  let toolsLoading = null;
  let teardown = null;
  let mountTicket = 0;

  const loadToolsScript = () => {
    if (window.SiteTools) return Promise.resolve();
    if (!toolsLoading) {
      toolsLoading = new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = "tools.js?v=1";
        s.onload = resolve;
        s.onerror = () => { toolsLoading = null; s.remove(); reject(new Error("tools.js")); };
        document.head.appendChild(s);
      });
    }
    return toolsLoading;
  };

  const mountTool = (id, el) => {
    const ticket = ++mountTicket;
    const stale = () => ticket !== mountTicket || !el.isConnected;
    el.innerHTML = '<p class="tool-loading">লোড হচ্ছে...</p>';
    loadToolsScript()
      .then(() => {
        if (stale()) return null;
        if (!window.SiteTools.has(id)) { el.innerHTML = emptyState("টুলটি পাওয়া যায়নি", "লিংকটি ভুল হতে পারে।"); return null; }
        return window.SiteTools.mount(id, el, { esc, escAttr, icon, tools: D.tools || [] });
      })
      .then((stop) => {
        if (!stop) return;
        if (stale()) stop();
        else teardown = stop;
      })
      .catch(() => {
        if (stale()) return;
        el.innerHTML = `${emptyState("টুল লোড হয়নি", "ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।")}<button class="btn-view" type="button" id="toolRetry">আবার চেষ্টা করুন</button>`;
        el.querySelector("#toolRetry")?.addEventListener("click", () => mountTool(id, el));
      });
  };

  const toolView = (id) => {
    const tool = (D.tools || []).find((t) => t.id === id);
    if (!tool || tool.url) return null;
    const g = (D.toolGroups || []).find((x) => x.id === tool.group);
    const sibs = (D.tools || []).filter((t) => t.group === tool.group && !t.url);
    return {
      title: `${tool.title} | ${D.hero.name}`,
      html: () => `
        <section class="page"><div class="page-inner wide">
          <a class="tool-back" href="${routeHref(g ? `tools/${g.id}` : "tools")}">${icon("back", 16)} ${esc(g ? g.title : "সব টুল")}</a>
          <h1 class="section-title">${esc(tool.title)}</h1>
          <p class="tools-sub">${esc(tool.description || "")}</p>
          ${sibs.length > 1 ? `<div class="tool-sibs">${sibs.map((t) => `<a href="${routeHref(`tools/${t.id}`)}" class="${t.id === id ? "is-on" : ""}">${esc(t.title)}</a>`).join("")}</div>` : ""}
          <div class="tool-panel" id="toolMount"></div>
        </div></section>`,
      mount: (el) => mountTool(id, el.querySelector("#toolMount"))
    };
  };

  const notFoundView = {
    title: `404 | ${D.hero.name}`,
    html: () => `
      <div class="not-found">
        <div class="code">404</div>
        <h1 class="section-title">এই পেজটি খুঁজে পাওয়া যায়নি</h1>
        <p class="section-sub">লিংকটি ভুল হতে পারে অথবা পেজটি সরিয়ে ফেলা হয়েছে।</p>
        <a class="btn btn-primary" href="#/home">হোমপেজে ফিরে যান</a>
      </div>`
  };

  const currentPath = () => location.hash.replace(/^#\/?/, "").replace(/\/+$/, "") || "home";

  const render = () => {
    if (/^#[^/]/.test(location.hash)) {
      location.replace(`#/${location.hash.slice(1)}`);
      return;
    }
    if (teardown) { teardown(); teardown = null; }
    mountTicket++;
    const path = currentPath();
    const [name, sub] = path.split("/");
    const view = name === "tools" && sub ? groupView(sub) || toolView(sub) || notFoundView : VIEWS[name] || notFoundView;
    const host = $("view");
    host.innerHTML = view.html();
    document.title = view.title || MAIN_TITLE;
    document.querySelectorAll(".main-nav a[data-nav]").forEach((l) => l.classList.toggle("is-active", l.dataset.nav === name));
    window.scrollTo({ top: 0, behavior: "instant" });
    view.mount?.(host);
    applyReveal(host);
  };

  let analyticsStarted = false;
  const initAnalytics = async () => {
    if (analyticsStarted || getConsent() !== "granted") return;
    analyticsStarted = true;
    try {
      const [{ initializeApp }, { getAnalytics }] = await Promise.all([
        import("https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js"),
        import("https://www.gstatic.com/firebasejs/12.10.0/firebase-analytics.js")
      ]);
      getAnalytics(initializeApp({
        apiKey: "AIzaSyAg31FzmZdCUFrOIswrzmInScujCOIBQQ",
        authDomain: "masumcpex-attendance.firebaseapp.com",
        projectId: "masumcpex-attendance",
        storageBucket: "masumcpex-attendance.firebasestorage.app",
        messagingSenderId: "412146945197",
        appId: "1:412146945197:web:3b043e83d796c2f9e14a24",
        measurementId: "G-5SW3CHQJD0"
      }));
    } catch (err) {
      return;
    }
  };

  const markActive = () => {
    const file = location.pathname.split("/").pop() || "index.html";
    if (file.startsWith("attendance")) {
      document.querySelectorAll('.main-nav a[data-nav="attendance"], .mobile-menu-nav a[data-nav="attendance"]').forEach((l) => l.classList.add("is-active"));
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    if (app && app.dataset.page === "legal") {
      const tpl = document.getElementById("pageContent");
      app.innerHTML = chromeHTML();
      $("view").innerHTML = tpl ? tpl.innerHTML : "";
      document.querySelectorAll('.main-nav a[data-nav]').forEach((l) => l.classList.remove("is-active"));
      bindChrome();
      bindExtras();
      bindLegal();
      return;
    }
    if (app) {
      app.innerHTML = chromeHTML();
      bindChrome();
      bindExtras();
      window.addEventListener("hashchange", render);
      render();
      initAnalytics();
    } else {
      setText("brandName", D.hero.name);
      const oldFooter = document.querySelector("footer.site-footer");
      if (oldFooter) oldFooter.outerHTML = footerHTML() + cookieHTML() + `<button class="to-top" id="toTop" aria-label="উপরে যান">${icon("up", 18, 2.2)}</button><div class="scroll-progress" id="scrollProgress" aria-hidden="true"></div>`;
      bindChrome();
      bindExtras();
      markActive();
    }
  });

  const bindLegal = () => {
    const links = [...document.querySelectorAll(".legal-toc a")];
    const secs = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
    if (!secs.length || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) links.forEach((a) => a.classList.toggle("is-on", a.getAttribute("href") === "#" + en.target.id));
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    secs.forEach((x) => io.observe(x));
    if (location.hash) setTimeout(() => document.querySelector(location.hash)?.scrollIntoView(), 80);
  };
})();
