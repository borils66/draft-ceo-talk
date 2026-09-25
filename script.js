const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
const dialog = document.getElementById("soonDialog");
const dialogTitle = document.getElementById("dialogTitle");
const dialogText = document.getElementById("dialogText");
const closeDialog = document.getElementById("closeDialog");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const environmentSections = document.querySelectorAll("[data-environment]");
environmentSections.forEach((section, sectionIndex) => {
  const field = document.createElement("div");
  field.className = "ambient-field";
  field.setAttribute("aria-hidden", "true");

  const lineCount = window.innerWidth < 720 ? 4 : 7;
  for (let index = 0; index < lineCount; index += 1) {
    const line = document.createElement("span");
    line.className = "ambient-line";
    line.style.setProperty("--x", `${8 + ((index * 17 + sectionIndex * 9) % 88)}%`);
    line.style.setProperty("--length", `${90 + ((index + sectionIndex) % 4) * 34}px`);
    line.style.setProperty("--alpha", String(0.13 + (index % 3) * 0.05));
    line.style.setProperty("--duration", `${12 + (index % 4) * 3}s`);
    line.style.setProperty("--delay", `${-2 - index * 1.7}s`);
    field.appendChild(line);
  }

  section.prepend(field);
});

if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
  environmentSections.forEach((section) => {
    let environmentFrame = 0;
    section.addEventListener("pointermove", (event) => {
      if (environmentFrame) return;
      environmentFrame = requestAnimationFrame(() => {
        const bounds = section.getBoundingClientRect();
        section.style.setProperty("--env-x", `${((event.clientX - bounds.left) / bounds.width) * 100}%`);
        section.style.setProperty("--env-y", `${((event.clientY - bounds.top) / bounds.height) * 100}%`);
        environmentFrame = 0;
      });
    });
  });
}

if (!reduceMotion) {
  let scrollFrame = 0;
  const updateEnvironment = () => {
    environmentSections.forEach((section) => {
      const bounds = section.getBoundingClientRect();
      const offset = Math.max(-18, Math.min(18, (bounds.top + bounds.height / 2 - window.innerHeight / 2) * -0.025));
      section.style.setProperty("--section-drift", `${offset}px`);
    });
    scrollFrame = 0;
  };

  window.addEventListener("scroll", () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateEnvironment);
  }, { passive: true });
  updateEnvironment();
}

const partnerSection = document.querySelector(".partner-section");
if (partnerSection && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
  let pointerFrame = 0;
  const partnerLogos = [...partnerSection.querySelectorAll(".partner-logo")];
  partnerSection.addEventListener("pointermove", (event) => {
    if (pointerFrame) return;
    pointerFrame = requestAnimationFrame(() => {
      const bounds = partnerSection.getBoundingClientRect();
      partnerSection.style.setProperty("--spot-x", `${((event.clientX - bounds.left) / bounds.width) * 100}%`);
      partnerSection.style.setProperty("--spot-y", `${((event.clientY - bounds.top) / bounds.height) * 100}%`);
      let nearestLogo = null;
      let nearestDistance = Number.POSITIVE_INFINITY;
      partnerLogos.forEach((logo) => {
        const logoBounds = logo.getBoundingClientRect();
        const distance = Math.hypot(event.clientX - (logoBounds.left + logoBounds.width / 2), event.clientY - (logoBounds.top + logoBounds.height / 2));
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestLogo = logo;
        }
      });
      partnerLogos.forEach((logo) => logo.classList.toggle("is-near", logo === nearestLogo && nearestDistance < 190));
      pointerFrame = 0;
    });
  });
  partnerSection.addEventListener("pointerleave", () => partnerLogos.forEach((logo) => logo.classList.remove("is-near")));
}

function closeMenu() {
  mainNav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
}

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  mainNav.classList.toggle("open", !isOpen);
  document.body.classList.toggle("menu-open", !isOpen);
});

mainNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
window.addEventListener("resize", () => { if (window.innerWidth > 920) closeMenu(); });
window.addEventListener("scroll", () => header.classList.toggle("scrolled", window.scrollY > 24), { passive: true });

document.querySelectorAll("[data-modal-title]").forEach((button) => {
  button.addEventListener("click", () => {
    dialogTitle.textContent = button.dataset.modalTitle || "Coming Soon";
    dialogText.textContent = button.dataset.modalCopy || "Informasi segera tersedia.";
    if (typeof dialog.showModal === "function") dialog.showModal();
  });
});

closeDialog.addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  const bounds = dialog.getBoundingClientRect();
  const outside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
  if (outside) dialog.close();
});

const scheduleTabs = document.querySelectorAll("[data-schedule]");
scheduleTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    scheduleTabs.forEach((item) => item.setAttribute("aria-selected", String(item === tab)));
    document.querySelectorAll(".schedule-panel").forEach((panel) => {
      const active = panel.id === tab.dataset.schedule;
      panel.hidden = !active;
      panel.classList.toggle("active", active);
    });
  });
});

const eventDate = new Date("2026-11-28T08:30:00+07:00").getTime();
const countdownNodes = {
  days: document.getElementById("days"),
  hours: document.getElementById("hours"),
  minutes: document.getElementById("minutes"),
  seconds: document.getElementById("seconds")
};

function updateCountdown() {
  const distance = Math.max(0, eventDate - Date.now());
  const day = Math.floor(distance / 86400000);
  const hour = Math.floor((distance % 86400000) / 3600000);
  const minute = Math.floor((distance % 3600000) / 60000);
  const second = Math.floor((distance % 60000) / 1000);
  countdownNodes.days.textContent = String(day).padStart(2, "0");
  countdownNodes.hours.textContent = String(hour).padStart(2, "0");
  countdownNodes.minutes.textContent = String(minute).padStart(2, "0");
  countdownNodes.seconds.textContent = String(second).padStart(2, "0");
}

updateCountdown();
setInterval(updateCountdown, 1000);

const revealItems = document.querySelectorAll("[data-reveal]");
if (reduceMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("revealed"));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => revealObserver.observe(item));
}

const navLinks = [...mainNav.querySelectorAll("a")];
const navSections = navLinks.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      navLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`));
    }
  });
}, { rootMargin: "-38% 0px -52%", threshold: 0 });
navSections.forEach((section) => navObserver.observe(section));

const hero = document.querySelector(".hero");
if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
  hero.addEventListener("pointermove", (event) => {
    const bounds = hero.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 10;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 8;
    hero.style.setProperty("--poster-x", `${x}px`);
    hero.style.setProperty("--poster-y", `${y}px`);
  });
  hero.addEventListener("pointerleave", () => {
    hero.style.setProperty("--poster-x", "0px");
    hero.style.setProperty("--poster-y", "0px");
  });
}
