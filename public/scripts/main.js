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
const footerForm = document.querySelector(".footer-form");
const footerNote = document.querySelector(".footer-note-form");

const showFormStatus = (noteEl, message) => {
  if (!noteEl) {
    return;
  }
  noteEl.textContent = message;
  const defaultMessage = noteEl.dataset.default;
  if (defaultMessage) {
    window.setTimeout(() => {
      noteEl.textContent = defaultMessage;
    }, 4200);
  }
};

const chartConfigs = {
  latency: {
    metric: { selector: "[data-metric='latency']", prefix: "-", suffix: "%" },
    range: { min: 22, max: 38, precision: 0 },
    bars: [0.32, 0.46, 0.58, 0.7, 0.64, 0.78, 0.86, 0.92],
  },
  conversion: {
    metric: { selector: "[data-metric='conversion']", prefix: "+", suffix: "%" },
    range: { min: 9, max: 18, precision: 0 },
    bars: [0.38, 0.44, 0.54, 0.6, 0.7, 0.8, 0.86, 0.9],
  },
  stability: {
    metric: { selector: "[data-metric='stability']", prefix: "+", suffix: "%" },
    range: { min: 14, max: 28, precision: 0 },
    bars: [0.3, 0.42, 0.56, 0.64, 0.7, 0.78, 0.86, 0.9],
  },
  response: {
    metric: { selector: "[data-metric='response']", prefix: "-", suffix: "%" },
    range: { min: 30, max: 48, precision: 0 },
    bars: [0.86, 0.78, 0.7, 0.62, 0.54, 0.46, 0.38, 0.3],
  },
  threats: {
    metric: { selector: "[data-metric='threats']", prefix: "+", suffix: "%" },
    range: { min: 12, max: 26, precision: 0 },
    bars: [0.28, 0.42, 0.54, 0.66, 0.72, 0.82, 0.88, 0.94],
  },
};

const metricConfigs = {
  coverage: { prefix: "", suffix: "%", min: 78, max: 92, precision: 0 },
  mttr: { prefix: "", suffix: " hrs", min: 24, max: 48, precision: 0 },
};

const randomBetween = (min, max, precision = 0) => {
  const value = Math.random() * (max - min) + min;
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
};

const toPath = (values, height, width) => {
  const step = (width - 8) / (values.length - 1);
  return values
    .map((value, index) => {
      const x = 4 + step * index;
      const y = 4 + (1 - value) * (height - 8);
      return `${index === 0 ? "M" : "C"} ${x} ${y}`;
    })
    .join(" ");
};

const updateBars = (bars, values) => {
  bars.forEach((bar, index) => {
    const value = values[index] ?? values[values.length - 1] ?? 0.5;
    bar.style.setProperty("--bar", value);
  });
};

const updateSparkline = (path, values) => {
  const viewBox = path.closest("svg")?.getAttribute("viewBox") || "0 0 160 48";
  const [, , width, height] = viewBox.split(" ").map(Number);
  const d = toPath(values, height, width);
  path.setAttribute("d", d);
};

const nudgeValues = (values, delta = 0.08) =>
  values.map((value) => {
    const change = (Math.random() - 0.5) * delta;
    return Math.min(0.98, Math.max(0.12, value + change));
  });

const animateChart = (chart, config) => {
  const bars = Array.from(chart.querySelectorAll("[data-bars] span"));
  const path = chart.querySelector("[data-sparkline]");
  const metricNode = chart.querySelector(config.metric.selector);
  const duration = 6000 + Math.random() * 2000;

  let values = config.bars.slice();
  const tick = () => {
    values = nudgeValues(values);
    updateBars(bars, values);
    if (path) {
      updateSparkline(path, values);
    }
    if (metricNode) {
      const value = randomBetween(config.range.min, config.range.max, config.range.precision);
      metricNode.textContent = `${config.metric.prefix}${value}${config.metric.suffix}`;
    }
  };

  updateBars(bars, values);
  if (path) {
    updateSparkline(path, values);
  }
  tick();
  window.setInterval(tick, duration);
};

const scatterOrbits = () => {
  const orbits = document.querySelectorAll("[data-orbit]");
  orbits.forEach((orbit) => {
    const dots = Array.from(orbit.querySelectorAll("span"));
    dots.forEach((dot) => {
      const x = Math.round(Math.random() * 88) + 4;
      const y = Math.round(Math.random() * 88) + 4;
      dot.style.setProperty("--orbit-x", `${x}%`);
      dot.style.setProperty("--orbit-y", `${y}%`);
      dot.style.setProperty("--orbit-delay", `${Math.random() * -6}s`);
      dot.style.setProperty("--orbit-scale", `${0.7 + Math.random() * 0.6}`);
    });
  });
};

const initCharts = () => {
  const charts = document.querySelectorAll("[data-chart]");
  charts.forEach((chart) => {
    const type = chart.getAttribute("data-chart");
    const config = chartConfigs[type];
    if (!config) {
      return;
    }
    animateChart(chart, config);
  });

  scatterOrbits();

  Object.keys(metricConfigs).forEach((key) => {
    const config = metricConfigs[key];
    const metricNode = document.querySelector(`[data-metric='${key}']`);
    if (!metricNode) {
      return;
    }
    const updateMetric = () => {
      const value = randomBetween(config.min, config.max, config.precision);
      metricNode.textContent = `${config.prefix}${value}${config.suffix}`;
    };
    updateMetric();
    window.setInterval(updateMetric, 5200 + Math.random() * 1800);
  });
};

const initMailtoSync = () => {
  const forms = document.querySelectorAll(".contact-form, .footer-form");
  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const isFooter = form.classList.contains("footer-form");
      const name = formData.get("name") || "";
      const email = formData.get("email") || "";
      const company = formData.get("company") || "";
      const message = formData.get("message") || "";

      const bodyLines = [
        "Hi Zad Team,",
        "",
        isFooter ? "Please add me to the updates list." : "Please send the requested materials.",
        "",
        name ? `Name: ${name}` : null,
        email ? `Email: ${email}` : null,
        company ? `Company size: ${company}` : null,
        message ? `Notes: ${message}` : null,
      ].filter(Boolean);

      const body = encodeURIComponent(bodyLines.join("\n"));
      const subject = encodeURIComponent(
        isFooter ? "Subscribe request from landing page" : "Resource request from landing page"
      );
      window.location.href = `mailto:m9nx11@gmail.com?subject=${subject}&body=${body}`;
      if (isFooter) {
        showFormStatus(footerNote, "Subscribed. Expect a monthly delivery update.");
        form.reset();
      } else {
        showFormStatus(formNote, "Thanks. We have your request and will respond within 24 hours.");
        form.reset();
      }
    });
  });
};

initCharts();
initMailtoSync();
