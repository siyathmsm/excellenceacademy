(() => {
  "use strict";

  const doc = document;
  const root = doc.documentElement;
  const header = doc.getElementById("siteHeader");
  const menuToggle = doc.getElementById("menuToggle");
  const navPanel = doc.getElementById("navPanel");
  const themeToggle = doc.getElementById("themeToggle");
  const backToTop = doc.getElementById("backToTop");
  const scrollProgress = doc.getElementById("scrollProgress");
  const toast = doc.getElementById("toast");

  // Theme
  const savedTheme = localStorage.getItem("excellence-theme");
  if (savedTheme) root.dataset.theme = savedTheme;
  else if (window.matchMedia("(prefers-color-scheme: light)").matches) root.dataset.theme = "light";

  themeToggle.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
    localStorage.setItem("excellence-theme", root.dataset.theme);
  });

  // Mobile navigation
  menuToggle.addEventListener("click", () => {
    const isOpen = navPanel.classList.toggle("open");
    menuToggle.classList.toggle("open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  doc.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
      navPanel.classList.remove("open");
      menuToggle.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });

  // Header state, back-to-top, active navigation, progress ring
  const sections = [...doc.querySelectorAll("main section[id]")];
  const navLinks = [...doc.querySelectorAll(".nav-links a")];
  const circumference = 2 * Math.PI * 20;

  function updateScrollUI() {
    const scrollY = window.scrollY;
    header.classList.toggle("scrolled", scrollY > 20);
    backToTop.classList.toggle("show", scrollY > 500);

    const maxScroll = doc.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? scrollY / maxScroll : 0;
    scrollProgress.style.strokeDashoffset = String(circumference * (1 - progress));

    let current = "home";
    sections.forEach(section => {
      if (scrollY >= section.offsetTop - 170) current = section.id;
    });
    navLinks.forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${current}`));
  }
  window.addEventListener("scroll", updateScrollUI, { passive: true });
  updateScrollUI();

  backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // Reveal on scroll
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.13 });
  doc.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

  // Course filters
  const courseButtons = doc.querySelectorAll(".course-filter button");
  const courseCards = doc.querySelectorAll(".course-card");
  courseButtons.forEach(button => {
    button.addEventListener("click", () => {
      courseButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      const filter = button.dataset.filter;
      courseCards.forEach(card => {
        const categories = card.dataset.category.split(" ");
        card.classList.toggle("hidden", filter !== "all" && !categories.includes(filter));
      });
    });
  });

  // Roadmap tabs
  doc.querySelectorAll(".roadmap-tabs button").forEach(button => {
    button.addEventListener("click", () => {
      doc.querySelectorAll(".roadmap-tabs button").forEach(btn => btn.classList.remove("active"));
      doc.querySelectorAll(".roadmap-panel").forEach(panel => panel.classList.remove("active"));
      button.classList.add("active");
      doc.getElementById(`roadmap-${button.dataset.roadmap}`).classList.add("active");
    });
  });

  // Animated counters
  const counters = doc.querySelectorAll("[data-count]");
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      const start = performance.now();
      const duration = 1500;

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = `${Math.round(target * eased).toLocaleString()}${suffix}`;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  }, { threshold: .55 });
  counters.forEach(counter => counterObserver.observe(counter));

  // Testimonials
  const track = doc.getElementById("testimonialTrack");
  const cards = [...track.children];
  const dots = doc.getElementById("testimonialDots");
  let slide = 0;
  let sliderTimer;

  cards.forEach((_, index) => {
    const dot = doc.createElement("button");
    dot.setAttribute("aria-label", `Show testimonial ${index + 1}`);
    dot.addEventListener("click", () => goToSlide(index));
    dots.appendChild(dot);
  });

  function goToSlide(index) {
    slide = (index + cards.length) % cards.length;
    track.style.transform = `translateX(-${slide * 100}%)`;
    [...dots.children].forEach((dot, i) => dot.classList.toggle("active", i === slide));
    restartSlider();
  }
  function restartSlider() {
    clearInterval(sliderTimer);
    sliderTimer = setInterval(() => goToSlide(slide + 1), 5500);
  }
  doc.getElementById("testimonialPrev").addEventListener("click", () => goToSlide(slide - 1));
  doc.getElementById("testimonialNext").addEventListener("click", () => goToSlide(slide + 1));
  goToSlide(0);

  // FAQ
  doc.querySelectorAll(".faq-item").forEach(item => {
    const button = item.querySelector("button");
    const answer = item.querySelector(".faq-answer");
    if (item.classList.contains("open")) answer.style.maxHeight = `${answer.scrollHeight}px`;
    button.addEventListener("click", () => {
      const open = item.classList.toggle("open");
      answer.style.maxHeight = open ? `${answer.scrollHeight}px` : "0px";
    });
  });

  // Lightweight tilt interaction
  if (!window.matchMedia("(pointer: coarse)").matches) {
    doc.querySelectorAll(".tilt-card").forEach(card => {
      card.addEventListener("mousemove", event => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        card.style.transform = `perspective(900px) rotateX(${y * -6}deg) rotateY(${x * 7}deg) translateY(-3px)`;
      });
      card.addEventListener("mouseleave", () => card.style.transform = "");
    });
  }

  // Demo forms
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 2800);
  }

  doc.getElementById("contactForm").addEventListener("submit", event => {
    event.preventDefault();
    showToast("Thank you! This demo form is ready to connect to your backend.");
    event.currentTarget.reset();
  });

  doc.getElementById("newsletterForm").addEventListener("submit", event => {
    event.preventDefault();
    showToast("Subscription captured in the demo interface.");
    event.currentTarget.reset();
  });

  // Mentora AI assistant demo
  const aiLauncher = doc.getElementById("aiLauncher");
  const aiChat = doc.getElementById("aiChat");
  const aiClose = doc.getElementById("aiClose");
  const aiForm = doc.getElementById("aiForm");
  const aiInput = doc.getElementById("aiInput");
  const aiMessages = doc.getElementById("aiMessages");

  aiLauncher.addEventListener("click", () => aiChat.classList.toggle("open"));
  aiClose.addEventListener("click", () => aiChat.classList.remove("open"));

  const answers = {
    course: "For beginners, Web Development or Python Programming are excellent starting points. Your choice depends on whether you enjoy building visual websites or solving problems with code.",
    register: "Complete the enquiry form in the Contact section or use the WhatsApp button. The admissions team can confirm schedules, fees, and available batches.",
    certificate: "Course certificates can be issued to students who satisfy the academy’s completion requirements.",
    online: "Online availability should be updated by the academy based on current schedules and delivery options."
  };

  function addAIMessage(text, type) {
    const div = doc.createElement("div");
    div.className = type === "user" ? "user-message" : "bot-message";
    div.textContent = text;
    aiMessages.appendChild(div);
    aiMessages.scrollTop = aiMessages.scrollHeight;
  }

  function respondToAI(text) {
    const lower = text.toLowerCase();
    let answer = "I’m Mentora. I can help with course recommendations, registration, certificates, and class options. For fees and schedules, please contact the admissions team.";
    if (lower.includes("recommend") || lower.includes("course")) answer = answers.course;
    if (lower.includes("register") || lower.includes("join") || lower.includes("apply")) answer = answers.register;
    if (lower.includes("certificate")) answer = answers.certificate;
    if (lower.includes("online")) answer = answers.online;
    setTimeout(() => addAIMessage(answer, "bot"), 450);
  }

  aiForm.addEventListener("submit", event => {
    event.preventDefault();
    const text = aiInput.value.trim();
    if (!text) return;
    addAIMessage(text, "user");
    aiInput.value = "";
    respondToAI(text);
  });

  doc.querySelectorAll(".quick-prompts button").forEach(button => {
    button.addEventListener("click", () => {
      const text = button.dataset.message;
      addAIMessage(text, "user");
      respondToAI(text);
    });
  });

  // Canvas particle background
  const canvas = doc.getElementById("particles");
  const ctx = canvas.getContext("2d");
  let particles = [];
  let width = 0;
  let height = 0;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(70, Math.max(28, Math.round(width / 24)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.6 + .4,
      vx: (Math.random() - .5) * .16,
      vy: (Math.random() - .5) * .16,
      alpha: Math.random() * .42 + .08
    }));
  }

  function drawParticles() {
    ctx.clearRect(0, 0, width, height);
    const isLight = root.dataset.theme === "light";
    const rgb = isLight ? "61,50,106" : "214,168,77";

    particles.forEach((p, i) => {
      if (!reducedMotion) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb},${p.alpha})`;
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 105) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(${rgb},${(1 - dist / 105) * .045})`;
          ctx.stroke();
        }
      }
    });
    if (!reducedMotion) requestAnimationFrame(drawParticles);
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
  drawParticles();
})();