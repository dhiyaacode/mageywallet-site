// Tap a screenshot to see it full screen. Tap the picture to zoom in and out, drag to move
// around, swipe or use the arrows for the next one. Back button, Esc, ✕ or a tap outside closes.
// Without JavaScript each screenshot is a plain link to the full-size image.
(() => {
  "use strict";
  const links = Array.from(document.querySelectorAll("a.shot"));
  if (!links.length || typeof HTMLDialogElement !== "function") return;

  const dv = document.documentElement.lang === "dv";
  const touch = window.matchMedia("(pointer: coarse)").matches;
  const t = dv
    ? {
        title: "ސްކްރީން ބޮޑުކޮށް",
        close: "ބަންދުކުރޭ",
        prev: "ކުރީ ސްކްރީން",
        next: "ދެން އަންނަ ސްކްރީން",
        hint: touch
          ? "ބޮޑުކުރަން ފޮޓޯއަށް ފިއްތާ. އަނެއް ސްކްރީނަށް ދާން ކައިރިއަށް ދަމާލާ."
          : "ބޮޑުކުރަން ފޮޓޯއަށް ފިއްތާ. އަނެއް ސްކްރީނަށް ދާން ކީބޯޑުގެ އެރޯ ކީ ބޭނުންކުރޭ.",
      }
    : {
        title: "Screenshot, full size",
        close: "Close",
        prev: "Previous screen",
        next: "Next screen",
        hint: touch
          ? "Tap the picture to zoom. Swipe for the next one."
          : "Click the picture to zoom. Arrow keys for the next one.",
      };

  const icon = (d) =>
    `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  const dlg = document.createElement("dialog");
  dlg.className = "lb";
  dlg.dir = "ltr";
  dlg.setAttribute("aria-label", t.title);
  dlg.innerHTML = `
    <div class="lb-top">
      <span class="lb-count" aria-live="polite"></span>
      <button class="lb-btn lb-close" type="button" aria-label="${t.close}">${icon("M6 6l12 12M18 6L6 18")}</button>
    </div>
    <div class="lb-stage"><img class="lb-img" alt="" draggable="false"></div>
    <div class="lb-bottom">
      <button class="lb-btn lb-prev" type="button" aria-label="${t.prev}">${icon("M15 5l-7 7 7 7")}</button>
      <p class="lb-cap" lang="${dv ? "dv" : "en"}" dir="${dv ? "rtl" : "ltr"}"><span class="lb-alt"></span><span class="lb-hint">${t.hint}</span></p>
      <button class="lb-btn lb-next" type="button" aria-label="${t.next}">${icon("M9 5l7 7-7 7")}</button>
    </div>`;
  document.body.append(dlg);

  const $ = (s) => dlg.querySelector(s);
  const stage = $(".lb-stage");
  const img = $(".lb-img");
  const count = $(".lb-count");
  const alt = $(".lb-alt");

  let index = 0;
  let zoomed = false;
  let pushed = false; // a history entry was added so the phone's back button closes the viewer
  let swiped = false;

  const preload = (n) => {
    const a = links[(n + links.length) % links.length];
    new Image().src = a.href;
  };

  function unzoom() {
    zoomed = false;
    stage.classList.remove("zoomed");
    img.removeAttribute("style");
    stage.scrollTo(0, 0);
  }

  function show(n) {
    index = (n + links.length) % links.length;
    const a = links[index];
    const thumb = a.querySelector("img");
    unzoom();
    // Show the small copy at once, swap in the full-size one when it has loaded.
    img.src = thumb.currentSrc || thumb.src;
    const full = new Image();
    full.onload = () => {
      if (links[index] === a) img.src = a.href;
    };
    full.src = a.href;
    img.alt = thumb.alt;
    alt.textContent = thumb.alt;
    count.textContent = `${index + 1} / ${links.length}`;
    preload(index + 1);
    preload(index - 1);
  }

  function open(n) {
    show(n);
    dlg.showModal();
    document.documentElement.classList.add("lb-open");
    try {
      history.pushState({ lb: true }, "");
      pushed = true;
    } catch (e) {
      pushed = false;
    }
  }

  function zoomAt(x, y) {
    const r = img.getBoundingClientRect();
    const fx = Math.min(Math.max((x - r.left) / r.width, 0), 1);
    const fy = Math.min(Math.max((y - r.top) / r.height, 0), 1);
    const width = Math.max(r.width * 2.5, Math.min(stage.clientWidth, img.naturalWidth));
    zoomed = true;
    stage.classList.add("zoomed");
    img.style.width = `${Math.round(width)}px`;
    // Keep the tapped spot under the finger.
    stage.scrollLeft = img.offsetLeft + fx * img.offsetWidth - stage.clientWidth / 2;
    stage.scrollTop = img.offsetTop + fy * img.offsetHeight - stage.clientHeight / 2;
  }

  links.forEach((a, n) => {
    a.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      open(n);
    });
  });

  $(".lb-close").addEventListener("click", () => dlg.close());
  $(".lb-prev").addEventListener("click", () => show(index - 1));
  $(".lb-next").addEventListener("click", () => show(index + 1));

  img.addEventListener("click", (e) => {
    if (swiped) return;
    if (zoomed) unzoom();
    else zoomAt(e.clientX, e.clientY);
  });

  // A tap on the dark area around the picture closes, unless zoomed in.
  stage.addEventListener("click", (e) => {
    if (e.target === stage && !zoomed && !swiped) dlg.close();
  });

  dlg.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") show(index + 1);
    else if (e.key === "ArrowLeft") show(index - 1);
    else return;
    e.preventDefault();
  });

  // Swipe sideways for the next or previous screen when not zoomed in. The stage's
  // touch-action (CSS) keeps sideways drags for this script instead of the browser. Some
  // browsers end the gesture with touchcancel, so the last position seen is used.
  let sx = 0, sy = 0, lx = 0, ly = 0, tracking = false;
  stage.addEventListener("touchstart", (e) => {
    swiped = false;
    tracking = !zoomed && e.touches.length === 1;
    if (tracking) {
      sx = lx = e.touches[0].clientX;
      sy = ly = e.touches[0].clientY;
    }
  }, { passive: true });
  stage.addEventListener("touchmove", (e) => {
    if (e.touches.length > 1) { tracking = false; return; } // pinch
    lx = e.touches[0].clientX;
    ly = e.touches[0].clientY;
  }, { passive: true });
  const endSwipe = (e) => {
    if (!tracking) return;
    tracking = false;
    const p = e.changedTouches && e.changedTouches[0];
    const dx = (p ? p.clientX : lx) - sx;
    const dy = (p ? p.clientY : ly) - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      swiped = true;
      show(index + (dx < 0 ? 1 : -1));
      setTimeout(() => { swiped = false; }, 350);
    }
  };
  stage.addEventListener("touchend", endSwipe);
  stage.addEventListener("touchcancel", endSwipe);

  dlg.addEventListener("close", () => {
    document.documentElement.classList.remove("lb-open");
    unzoom();
    if (pushed) {
      pushed = false;
      history.back();
    }
    links[index].focus({ preventScroll: true });
  });

  window.addEventListener("popstate", () => {
    if (dlg.open) {
      pushed = false;
      dlg.close();
    }
  });
})();
