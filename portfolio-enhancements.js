(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saved = (() => { try { return localStorage.getItem("ma-theme"); } catch { return null; } })();
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const setTheme = theme => {
    document.body.dataset.theme = theme;
    document.querySelectorAll(".theme-toggle").forEach(button => {
      const dark = theme === "dark";
      button.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
      const label = button.querySelector(".theme-toggle-label");
      const isArabic = (() => { try { return localStorage.getItem("portfolio-language") === "ar"; } catch { return false; } })();
      if (label) label.textContent = isArabic ? (dark ? "فاتح" : "داكن") : (dark ? "Light" : "Dark");
      if (isArabic) button.setAttribute("aria-label", dark ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع الداكن");
      const icon = button.querySelector("[aria-hidden=true]");
      if (icon) icon.textContent = dark ? "☼" : "◐";
    });
  };
  setTheme(saved || "light");
  document.querySelectorAll(".theme-toggle").forEach(button => button.addEventListener("click", () => {
    const next = document.body.dataset.theme === "dark" ? "light" : "dark";
    setTheme(next);
    try { localStorage.setItem("ma-theme", next); } catch {}
  }));

  const year = document.querySelector("#year");
  if (year) year.textContent = new Date().getFullYear();

  // Reveal content once as it enters view.
  const revealTargets = document.querySelectorAll(".section,.contact,.case-hero,.metrics,.case-section,.visual,.case-aside,.assessment-intro-grid,.assessment-result-hero,.assessment-result-section,.assessment-next-layout,.assessment-result-cta,.project");
  revealTargets.forEach((el, i) => { el.dataset.reveal = ""; el.style.setProperty("--reveal-delay", Math.min(i % 5, 4) * 55 + "ms"); });
  if (!reduce && "IntersectionObserver" in window) {
    document.documentElement.classList.add("reveal-ready");
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
    }), {threshold:.12, rootMargin:"0px 0px -35px 0px"});
    revealTargets.forEach(el => observer.observe(el));
  } else revealTargets.forEach(el => el.classList.add("is-visible"));

  // Count key results when their strip enters view.
  const countElements = [...document.querySelectorAll("[data-count]")];
  const animateCount = el => {
    const target = Number(el.dataset.count), decimals = Number(el.dataset.decimals || 0);
    const prefix = el.dataset.prefix || "", suffix = el.dataset.suffix || "";
    const start = performance.now(), duration = 1200;
    const tick = now => {
      const p = Math.min((now - start) / duration, 1), eased = 1 - Math.pow(1 - p, 4);
      const value = target * eased;
      const locale = document.documentElement.lang === "ar" ? "ar-EG" : "en-US";
      const formatted = value.toLocaleString(locale, {minimumFractionDigits:decimals, maximumFractionDigits:decimals});
      const shownSuffix = locale === "ar-EG" ? suffix.replace(/%/g,"٪") : suffix;
      el.textContent = prefix + formatted + shownSuffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if (!reduce && "IntersectionObserver" in window) {
    const statsObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { animateCount(entry.target); statsObserver.unobserve(entry.target); }
    }), {threshold:.55});
    countElements.forEach(el => statsObserver.observe(el));
  }

  // Pointer-following card tilt and FLIP-like filter reflow on the home page.
  const cards = [...document.querySelectorAll(".project[data-categories]")];
  if (window.matchMedia("(pointer: fine)").matches) cards.forEach(card => {
    card.addEventListener("pointermove", event => {
      if (event.pointerType === "touch") return;
      const rect = card.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
      const range = reduce ? 6 : 12;
      card.style.setProperty("--tilt-x", ((.5 - y) * range).toFixed(2) + "deg");
      card.style.setProperty("--tilt-y", ((x - .5) * range).toFixed(2) + "deg");
      card.style.setProperty("--pointer-x", (x * 100).toFixed(1) + "%");
      card.style.setProperty("--pointer-y", (y * 100).toFixed(1) + "%");
    });
    card.addEventListener("pointerleave", () => ["--tilt-x","--tilt-y","--pointer-x","--pointer-y"].forEach(key => card.style.removeProperty(key)));
  });
  const filters = [...document.querySelectorAll(".work-filter")], count = document.querySelector("#work-count");
  filters.forEach(button => button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    // Update the selected state first so the control responds even if an animation fails.
    filters.forEach(item => item.setAttribute("aria-pressed", String(item === button)));
    const before = new Map(cards.map(card => [card, card.getBoundingClientRect()]));
    cards.forEach(card => {
      const show = filter === "all" || card.dataset.categories.split(" ").filter(Boolean).includes(filter);
      card.hidden = !show;
      card.removeAttribute("data-flip");
    });
    cards.forEach(card => {
      if (card.hidden) return;
      const old = before.get(card), next = card.getBoundingClientRect();
      if (old && !reduce && typeof card.animate === "function") {
        const dx = old.left - next.left, dy = old.top - next.top;
        if (dx || dy) card.animate([{transform:"translate(" + dx + "px," + dy + "px)"},{transform:"translate(0,0)"}],{duration:340,easing:"cubic-bezier(.2,.75,.25,1)"});
      }
      card.dataset.flip = "entering";
      setTimeout(() => card.removeAttribute("data-flip"), 320);
    });
    if (count) {
      const visible = cards.filter(card => !card.hidden).length;
      const arabic = (() => { try { return localStorage.getItem("portfolio-language") === "ar"; } catch { return false; } })();
      if (arabic) {
        const noun = visible === 1 ? "مشروع واحد" : visible === 2 ? "مشروعان" : visible < 11 ? "مشروعات" : "مشروعًا";
        count.textContent = new Intl.NumberFormat("ar-EG").format(visible) + " " + noun;
      } else count.textContent = visible + (visible === 1 ? " project" : " projects");
    }
  }));

  // Sticky navigation and section highlighting.
  const nav = document.querySelector(".nav,.case-nav,.site-header");
  if (nav) {
    const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 24);
    onScroll(); window.addEventListener("scroll", onScroll, {passive:true});
  }
  const links = [...document.querySelectorAll('.navlinks a[href^="#"]')];
  const sections = links.map(link => document.querySelector(link.getAttribute("href"))).filter(Boolean);
  if (sections.length && "IntersectionObserver" in window) {
    const spy = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(link => link.toggleAttribute("aria-current", link.getAttribute("href") === "#" + entry.target.id));
        links.filter(link => link.getAttribute("href") === "#" + entry.target.id).forEach(link => link.setAttribute("aria-current","location"));
      }
    }), {rootMargin:"-25% 0px -65% 0px"});
    sections.forEach(section => spy.observe(section));
  }
})();
