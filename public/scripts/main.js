const revealTargets = document.querySelectorAll("[data-reveal]");

const revealElement = (element) => {
  element.classList.add("is-visible");
  element.style.opacity = "1";
  element.style.transform = "translateY(0) scale(1)";
};

const revealIfVisible = (element) => {
  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

  if (rect.top < viewportHeight * 0.85 && rect.bottom > 0) {
    revealElement(element);
  }
};

if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
  revealTargets.forEach(revealElement);
} else {
  revealTargets.forEach(revealIfVisible);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          revealElement(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
    }
  );

  revealTargets.forEach((element) => observer.observe(element));
}

const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("#primary-nav");
const navLinks = nav ? nav.querySelectorAll(".nav-link") : [];

const navIndicator = nav ? nav.querySelector(".nav-indicator") : null;
const navPillLinks = nav ? Array.from(nav.querySelectorAll(".nav-link")) : [];

const setNavIndicator = (link) => {
  if (!navIndicator || !nav || !link) {
    return;
  }

  const navRect = nav.getBoundingClientRect();
  const linkRect = link.getBoundingClientRect();
  const x = linkRect.left - navRect.left;

  navIndicator.style.width = `${linkRect.width}px`;
  navIndicator.style.transform = `translate(${x}px, -50%)`;
  navIndicator.style.opacity = "1";
};

const setActiveNavLink = (link) => {
  if (!navPillLinks.length) {
    return;
  }
  navPillLinks.forEach((item) => item.classList.remove("is-active"));
  link.classList.add("is-active");
  setNavIndicator(link);
};

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      nav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.focus();
    }
  });
}

if (nav && navIndicator && navPillLinks.length) {
  const initialLink = nav.querySelector("a.is-active") || navPillLinks[0];
  setNavIndicator(initialLink);

  navPillLinks.forEach((link) => {
    link.addEventListener("mouseenter", () => setNavIndicator(link));
    link.addEventListener("focus", () => setNavIndicator(link));
    link.addEventListener("click", () => setActiveNavLink(link));
  });

  nav.addEventListener("mouseleave", () => {
    const activeLink = nav.querySelector("a.is-active") || initialLink;
    setNavIndicator(activeLink);
  });

  window.addEventListener("resize", () => {
    const activeLink = nav.querySelector("a.is-active") || initialLink;
    setNavIndicator(activeLink);
  });
}

const contactForm = document.querySelector(".contact-form");
const formNote = document.querySelector(".form-note");

if (contactForm && formNote) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    formNote.textContent = "Thanks. We have your request and will respond within 24 hours.";
    contactForm.reset();
  });
}
