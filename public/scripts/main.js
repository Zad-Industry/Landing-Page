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
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
    metric: { selector: "[data-metric='response']", prefix: "+", suffix: "%" },
    range: { min: 30, max: 48, precision: 0 },
    bars: [0.32, 0.44, 0.56, 0.68, 0.72, 0.8, 0.88, 0.94],
  },
};

const metricConfigs = {
  coverage: { prefix: "", suffix: "%", min: 78, max: 92, precision: 0 },
  mttr: { prefix: "", suffix: "%", min: 1, max: 4, precision: 1 },
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

const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);

const formatMetric = (value, prefix, suffix, precision) => {
  const numeric = precision === 0 ? Math.round(value) : Number(value).toFixed(precision);
  const numericValue = Number(numeric);
  const safePrefix = numericValue === 0 ? "" : prefix;
  return `${safePrefix}${numeric}${suffix}`;
};

const readMetricValue = (node) => {
  const dataValue = node?.dataset?.value;
  if (dataValue) {
    const parsed = Number(dataValue);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  const raw = node?.textContent || "";
  const parsed = Number.parseFloat(raw.replace(/[^0-9.-]/g, ""));
  return Number.isNaN(parsed) ? 0 : parsed;
};

const setMetricValue = (node, value, prefix, suffix, precision) => {
  if (!node) {
    return;
  }
  node.dataset.value = String(value);
  node.textContent = formatMetric(value, prefix, suffix, precision);
};

const animateMetricValue = (node, fromValue, toValue, config, duration = 1200) => {
  if (!node) {
    return;
  }
  if (prefersReducedMotion) {
    setMetricValue(node, toValue, config.prefix, config.suffix, config.precision || 0);
    return;
  }
  const start = performance.now();
  const tick = (now) => {
    const progress = Math.min(1, (now - start) / duration);
    const eased = easeOutCubic(progress);
    const value = fromValue + (toValue - fromValue) * eased;
    setMetricValue(node, value, config.prefix, config.suffix, config.precision || 0);
    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };
  requestAnimationFrame(tick);
};

const animateSeries = (fromValues, toValues, duration, onUpdate, onComplete) => {
  if (prefersReducedMotion) {
    onUpdate(toValues);
    if (onComplete) {
      onComplete();
    }
    return;
  }
  const start = performance.now();
  const tick = (now) => {
    const progress = Math.min(1, (now - start) / duration);
    const eased = easeOutCubic(progress);
    const values = toValues.map((value, index) => {
      const from = fromValues[index] ?? 0;
      return from + (value - from) * eased;
    });
    onUpdate(values);
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else if (onComplete) {
      onComplete();
    }
  };
  requestAnimationFrame(tick);
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

  const targetValue = randomBetween(config.range.min, config.range.max, config.range.precision);
  const metricConfig = {
    prefix: config.metric.prefix,
    suffix: config.metric.suffix,
    precision: config.range.precision,
  };

  let values = config.bars.slice();
  const baseValues = values.map(() => 0.05);
  const applyValues = (nextValues) => {
    updateBars(bars, nextValues);
    if (path) {
      updateSparkline(path, nextValues);
    }
  };

  const runTick = () => {
    const nextValues = nudgeValues(values);
    animateSeries(values, nextValues, 1200, applyValues, () => {
      values = nextValues;
    });
    if (metricNode) {
      const nextValue = randomBetween(config.range.min, config.range.max, config.range.precision);
      const currentValue = readMetricValue(metricNode);
      animateMetricValue(metricNode, currentValue, nextValue, metricConfig, 1200);
    }
  };

  applyValues(baseValues);
  if (metricNode) {
    setMetricValue(metricNode, 0, metricConfig.prefix, metricConfig.suffix, metricConfig.precision);
  }

  animateSeries(baseValues, values, 1300, applyValues, () => {
    if (metricNode) {
      animateMetricValue(metricNode, 0, targetValue, metricConfig, 1200);
    }
    if (!prefersReducedMotion) {
      window.setInterval(runTick, duration);
    }
  });
};

const primeChart = (chart, config) => {
  const bars = Array.from(chart.querySelectorAll("[data-bars] span"));
  const path = chart.querySelector("[data-sparkline]");
  const metricNode = chart.querySelector(config.metric.selector);
  const baseValues = config.bars.map(() => 0.05);
  updateBars(bars, baseValues);
  if (path) {
    updateSparkline(path, baseValues);
  }
  if (metricNode) {
    setMetricValue(metricNode, 0, config.metric.prefix, config.metric.suffix, config.range.precision);
  }
};

const primeMetrics = () => {
  Object.keys(metricConfigs).forEach((key) => {
    const config = metricConfigs[key];
    const metricNode = document.querySelector(`[data-metric='${key}']`);
    if (!metricNode) {
      return;
    }
    setMetricValue(metricNode, 0, config.prefix, config.suffix, config.precision);
  });
};

const scatterOrbits = () => {
  const orbits = document.querySelectorAll("[data-orbit]");
  orbits.forEach((orbit) => {
    const dots = Array.from(orbit.querySelectorAll("span"));
    dots.forEach((dot) => {
      const edge = Math.floor(Math.random() * 4);
      const offset = Math.round(Math.random() * 88) + 4;
      const x = edge === 0 ? 4 : edge === 1 ? 96 : offset;
      const y = edge === 2 ? 4 : edge === 3 ? 96 : offset;
      dot.style.setProperty("--orbit-x", `${x}%`);
      dot.style.setProperty("--orbit-y", `${y}%`);
      dot.style.setProperty("--orbit-delay", `${Math.random() * -6}s`);
      dot.style.setProperty("--orbit-scale", `${0.7 + Math.random() * 0.6}`);
    });
  });
};

const initMetricObserver = () => {
  const metrics = document.querySelectorAll("[data-metric='coverage'], [data-metric='mttr']");
  if (!metrics.length) {
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        const node = entry.target;
        if (node.dataset.animated === "true") {
          return;
        }
        node.dataset.animated = "true";
        const key = node.getAttribute("data-metric");
        const config = metricConfigs[key];
        if (!config) {
          return;
        }
        const target = randomBetween(config.min, config.max, config.precision);
        animateMetricValue(node, 0, target, config, 1200);
        if (!prefersReducedMotion) {
          window.setInterval(() => {
            const nextValue = randomBetween(config.min, config.max, config.precision);
            const currentValue = readMetricValue(node);
            animateMetricValue(node, currentValue, nextValue, config, 1200);
          }, 5200 + Math.random() * 1800);
        }
        observer.unobserve(node);
      });
    },
    { threshold: 0.4 }
  );

  metrics.forEach((node) => observer.observe(node));
};

const initCharts = () => {
  const charts = document.querySelectorAll("[data-chart]");
  if (!charts.length) {
    return;
  }
  charts.forEach((chart) => {
    const type = chart.getAttribute("data-chart");
    const config = chartConfigs[type];
    if (config) {
      primeChart(chart, config);
    }
  });
  primeMetrics();
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    charts.forEach((chart) => {
      const type = chart.getAttribute("data-chart");
      const config = chartConfigs[type];
      if (!config) {
        return;
      }
      animateChart(chart, config);
    });
    scatterOrbits();
    initMetricObserver();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        const chart = entry.target;
        if (chart.dataset.animated === "true") {
          return;
        }
        chart.dataset.animated = "true";
        const type = chart.getAttribute("data-chart");
        const config = chartConfigs[type];
        if (config) {
          animateChart(chart, config);
        }
        observer.unobserve(chart);
      });
    },
    { threshold: 0.35 }
  );

  charts.forEach((chart) => observer.observe(chart));
  scatterOrbits();
  initMetricObserver();
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
      const launch = formData.get("launch") || "";
      const message = formData.get("message") || "";

      const bodyLines = [
        "Hi Zad Industry team,",
        "",
        isFooter ? "Please add me to the updates list." : "Please send the requested materials.",
        "",
        name ? `Name: ${name}` : null,
        email ? `Email: ${email}` : null,
        company ? `Company size: ${company}` : null,
        launch ? `Launch date: ${launch}` : null,
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
