/* ===== LUMINA GALLERY — JavaScript (Minimal Redesign) ===== */

(function () {
  "use strict";

  // ── DATA ──────────────────────────────────────────────────────────────────
  const items     = document.querySelectorAll(".gallery-item");
  const countEl   = document.getElementById("count");
  const filterBtns = document.querySelectorAll(".filter-btn");

  // Lightbox elements
  const lightbox    = document.getElementById("lightbox");
  const lbImg       = document.getElementById("lb-img");
  const lbTitle     = document.getElementById("lb-title");
  const lbCat       = document.getElementById("lb-cat");
  const lbCurrent   = document.getElementById("lb-current");
  const lbTotal     = document.getElementById("lb-total");
  const lbClose     = document.getElementById("lb-close");
  const lbPrev      = document.getElementById("lb-prev");
  const lbNext      = document.getElementById("lb-next");
  const lbFilterSel = document.getElementById("lb-filter-select");
  const backdrop    = document.querySelector(".lightbox-backdrop");

  let currentFilter = "all";
  let visibleItems  = [];
  let currentIndex  = 0;
  let isOpen        = false;

  // ── FADE-IN ANIMATION ────────────────────────────────────────────────────
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(styleSheet);

  // ── FILTER LOGIC ─────────────────────────────────────────────────────────
  function applyFilter(filter) {
    currentFilter = filter;

    filterBtns.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.filter === filter);
    });

    visibleItems = [];
    let delay = 0;
    items.forEach(item => {
      const cat  = item.dataset.category;
      const show = filter === "all" || cat === filter;
      if (show) {
        item.classList.remove("hidden");
        item.style.animation = "none";
        void item.offsetWidth;
        item.style.animation = `fadeIn 0.5s ease ${delay}ms both`;
        visibleItems.push(item);
        delay += 40;
      } else {
        item.classList.add("hidden");
      }
    });

    countEl.textContent = visibleItems.length;
  }

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => applyFilter(btn.dataset.filter));
  });

  applyFilter("all");

  // ── LIGHTBOX ─────────────────────────────────────────────────────────────
  function buildVisibleItems() {
    visibleItems = Array.from(items).filter(i => !i.classList.contains("hidden"));
  }

  function openLightbox(itemEl) {
    buildVisibleItems();
    currentIndex = visibleItems.indexOf(itemEl);
    showImage(currentIndex);
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
    isOpen = true;
    lbFilterSel.value = "none";
  }

  function closeLightbox() {
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
    isOpen = false;
    lbImg.className = "";
  }

  function showImage(index) {
    buildVisibleItems();
    if (!visibleItems.length) return;
    currentIndex = (index + visibleItems.length) % visibleItems.length;

    const item  = visibleItems[currentIndex];
    const img   = item.querySelector("img");
    const title = item.querySelector(".img-title").textContent;
    const cat   = item.querySelector(".img-cat").textContent;

    lbImg.style.opacity = "0";
    setTimeout(() => {
      lbImg.src = img.src.replace(/w=\d+/, "w=1400");
      lbImg.alt = img.alt;
      lbImg.style.opacity = "1";
    }, 200);

    lbTitle.textContent   = title;
    lbCat.textContent     = cat;
    lbCurrent.textContent = currentIndex + 1;
    lbTotal.textContent   = visibleItems.length;

    lbImg.className = "";
    lbFilterSel.value = "none";
  }

  items.forEach(item => {
    item.addEventListener("click", () => openLightbox(item));
  });

  lbPrev.addEventListener("click", e => { e.stopPropagation(); showImage(currentIndex - 1); });
  lbNext.addEventListener("click", e => { e.stopPropagation(); showImage(currentIndex + 1); });

  lbClose.addEventListener("click", closeLightbox);
  backdrop.addEventListener("click", closeLightbox);

  lbFilterSel.addEventListener("change", () => {
    const val = lbFilterSel.value;
    lbImg.className = "";
    if (val !== "none") lbImg.classList.add("f-" + val);
  });

  // ── KEYBOARD NAVIGATION ──────────────────────────────────────────────────
  document.addEventListener("keydown", e => {
    if (!isOpen) return;
    if (e.key === "ArrowLeft"  || e.key === "ArrowUp")   showImage(currentIndex - 1);
    if (e.key === "ArrowRight" || e.key === "ArrowDown") showImage(currentIndex + 1);
    if (e.key === "Escape") closeLightbox();
  });

  // ── SWIPE SUPPORT ────────────────────────────────────────────────────────
  let touchStartX = 0;
  lightbox.addEventListener("touchstart", e => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) showImage(dx < 0 ? currentIndex + 1 : currentIndex - 1);
  }, { passive: true });

  // ── SCROLL REVEAL ────────────────────────────────────────────────────────
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  items.forEach((item, i) => {
    item.style.opacity = "0";
    item.style.transform = "translateY(16px)";
    item.style.transition = `opacity 0.6s ease ${i * 30}ms, transform 0.6s ease ${i * 30}ms`;
    observer.observe(item);
  });

})();
