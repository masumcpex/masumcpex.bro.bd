document.addEventListener("DOMContentLoaded", () => {

  const header = document.getElementById("siteHeader");
  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  if (menuToggle && mobileMenu) {
    let closeTimer;
    const closeMobileMenu = (goHome = false) => {
      if (!mobileMenu.classList.contains("is-open")) return;
      mobileMenu.classList.add("is-closing");
      menuToggle.classList.remove("is-active");
      menuToggle.setAttribute("aria-expanded", "false");
      clearTimeout(closeTimer);
      closeTimer = setTimeout(() => {
        mobileMenu.classList.remove("is-open", "is-closing");
        document.body.style.overflow = "";
        if (goHome) window.location.hash = "home";
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
      if (mobileMenu.classList.contains("is-open")) {
        closeMobileMenu(true);
      } else {
        openMobileMenu();
      }
    });
    mobileMenu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => closeMobileMenu(false));
    });
  }

  const searchToggle = document.getElementById("searchToggle");
  const searchPanel = document.getElementById("searchPanel");
  const searchClose = document.getElementById("searchClose");
  const searchInput = document.getElementById("searchInput");
  if (searchToggle && searchPanel) {
    searchToggle.addEventListener("click", () => {
      searchPanel.classList.add("is-open");
      searchInput?.focus();
    });
  }
  searchClose?.addEventListener("click", () => searchPanel?.classList.remove("is-open"));

  const revealEls = document.querySelectorAll(".card, .section-title, .hero, .timeline-item");
  revealEls.forEach(el => el.classList.add("reveal"));

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add("is-visible"));
  }

});
