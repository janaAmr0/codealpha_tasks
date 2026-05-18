/* ===== ALEX MERCER PORTFOLIO — JavaScript ===== */

(function () {
  "use strict";

  // ── CUSTOM CURSOR ─────────────────────────────────────────────────────────
  const cursor   = document.getElementById("cursor");
  const follower = document.getElementById("cursor-follower");

  if (cursor && window.matchMedia("(hover: hover)").matches) {
    let mx = 0, my = 0, fx = 0, fy = 0;

    document.addEventListener("mousemove", e => {
      mx = e.clientX; my = e.clientY;
      cursor.style.left   = mx + "px";
      cursor.style.top    = my + "px";
    });

    function animateFollower() {
      fx += (mx - fx) * 0.1;
      fy += (my - fy) * 0.1;
      follower.style.left = fx + "px";
      follower.style.top  = fy + "px";
      requestAnimationFrame(animateFollower);
    }
    animateFollower();

    // Enlarge cursor over interactive elements
    document.querySelectorAll("a, button, input, textarea, .project-card, .skill-card").forEach(el => {
      el.addEventListener("mouseenter", () => {
        cursor.style.transform   = "translate(-50%, -50%) scale(2.5)";
        follower.style.transform = "translate(-50%, -50%) scale(0.5)";
        follower.style.opacity   = "0.3";
      });
      el.addEventListener("mouseleave", () => {
        cursor.style.transform   = "translate(-50%, -50%) scale(1)";
        follower.style.transform = "translate(-50%, -50%) scale(1)";
        follower.style.opacity   = "0.5";
      });
    });
  }

  // ── STICKY NAV ────────────────────────────────────────────────────────────
  const nav = document.getElementById("nav");
  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 50);
  });

  // ── MOBILE NAV TOGGLE ─────────────────────────────────────────────────────
  const toggle   = document.getElementById("nav-toggle");
  const navLinks = document.getElementById("nav-links");
  toggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
    const spans = toggle.querySelectorAll("span");
    const isOpen = navLinks.classList.contains("open");
    spans[0].style.transform = isOpen ? "rotate(45deg) translateY(6.5px)"  : "";
    spans[1].style.opacity   = isOpen ? "0" : "1";
    spans[2].style.transform = isOpen ? "rotate(-45deg) translateY(-6.5px)" : "";
  });
  // Close nav when a link is clicked
  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      toggle.querySelectorAll("span").forEach(s => { s.style.transform = ""; s.style.opacity = "1"; });
    });
  });

  // ── SMOOTH SCROLL ─────────────────────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--nav-h"));
        window.scrollTo({ top: target.offsetTop - navH, behavior: "smooth" });
      }
    });
  });

  // ── SCROLL REVEAL (Intersection Observer) ────────────────────────────────
  const revealEls = document.querySelectorAll(".reveal");
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger children within same parent
        const siblings = Array.from(entry.target.parentElement.querySelectorAll(".reveal"));
        const idx = siblings.indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add("visible");
        }, idx * 80);
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -60px 0px" });

  revealEls.forEach(el => revealObs.observe(el));

  // ── SKILL BARS (trigger on scroll) ───────────────────────────────────────
  // The bars use the .visible class added by reveal observer above — no extra code needed.
  // But skill cards use separate observer for the fill animation
  const skillCards = document.querySelectorAll(".skill-card");
  const skillObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        skillObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  skillCards.forEach(c => skillObs.observe(c));

  // ── CONTACT FORM ─────────────────────────────────────────────────────────
  const sendBtn     = document.getElementById("send-btn");
  const formSuccess = document.getElementById("form-success");
  const nameInput   = document.getElementById("name");
  const emailInput  = document.getElementById("email");
  const msgInput    = document.getElementById("message");

  sendBtn.addEventListener("click", () => {
    const name  = nameInput.value.trim();
    const email = emailInput.value.trim();
    const msg   = msgInput.value.trim();

    if (!name || !email || !msg) {
      // Shake empty fields
      [nameInput, emailInput, msgInput].forEach(inp => {
        if (!inp.value.trim()) {
          inp.style.borderColor = "#d94f4f";
          inp.style.animation = "shake 0.4s ease";
          setTimeout(() => {
            inp.style.animation = "";
            inp.style.borderColor = "";
          }, 600);
        }
      });
      return;
    }

    // Simulate send
    sendBtn.disabled = true;
    sendBtn.querySelector("span").textContent = "Sending...";
    setTimeout(() => {
      formSuccess.classList.add("show");
      sendBtn.style.display = "none";
      nameInput.value = "";
      emailInput.value = "";
      msgInput.value = "";
    }, 1000);
  });

  // Shake keyframe
  const style = document.createElement("style");
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-6px); }
      40% { transform: translateX(6px); }
      60% { transform: translateX(-4px); }
      80% { transform: translateX(4px); }
    }
  `;
  document.head.appendChild(style);

  // ── ACTIVE NAV LINK ON SCROLL ─────────────────────────────────────────────
  const sections = document.querySelectorAll("section[id]");
  const navLinkEls = document.querySelectorAll(".nav-link");
  const activeObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinkEls.forEach(link => {
          link.style.color = link.getAttribute("href") === `#${id}` ? "var(--text)" : "";
        });
      }
    });
  }, { threshold: 0.5 });
  sections.forEach(s => activeObs.observe(s));

})();
