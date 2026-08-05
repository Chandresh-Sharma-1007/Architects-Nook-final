/**
 * ARCHITECTS' NOOK — LUXURY MINIMALIST ARCHITECTURAL STUDIO
 * Interaction Engine & Master Controller
 * Author: Senior Creative Director & Frontend Engineer
 */

document.addEventListener('DOMContentLoaded', () => {
  renderDynamicProjectCards();
  initCustomCursor();
  initSplashScreen();
  initArchitecturalHeader();
  initNavbarDropdown();
  initProjectsCategoryFilter();
  initAboutStatsCounter();
  initTEKTProcessStepper();
  initBlueprintScrollAnimation();
  initScrollReveals();
  initSmoothScroll();
});

/* ==========================================================================
   1. CUSTOM MAGNETIC CURSOR WITH DYNAMIC TEXT BADGES
   ========================================================================== */
function initCustomCursor() {
  let cursor = document.getElementById('custom-cursor');
  if (!cursor) {
    cursor = document.createElement('div');
    cursor.id = 'custom-cursor';
    
    const labelSpan = document.createElement('span');
    labelSpan.id = 'custom-cursor-label';
    cursor.appendChild(labelSpan);
    
    document.body.appendChild(cursor);
  }

  const cursorLabel = document.getElementById('custom-cursor-label');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function renderCursor() {
    cursorX += (mouseX - cursorX) * 0.22;
    cursorY += (mouseY - cursorY) * 0.22;
    cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  document.addEventListener('mouseover', (e) => {
    const targetWithLabel = e.target.closest('[data-cursor-label]');
    if (targetWithLabel) {
      const badgeText = targetWithLabel.getAttribute('data-cursor-label');
      if (cursorLabel) cursorLabel.textContent = badgeText;
      cursor.classList.add('has-label');
    } else if (e.target.closest('a, button, input, textarea, .project-card, .client-cell, .series-card, .finish-card')) {
      cursor.classList.remove('has-label');
      cursor.style.width = '48px';
      cursor.style.height = '48px';
      cursor.style.backgroundColor = 'rgba(17, 17, 17, 0.1)';
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('[data-cursor-label]')) {
      cursor.classList.remove('has-label');
    } else if (e.target.closest('a, button, input, textarea, .project-card, .client-cell, .series-card, .finish-card')) {
      cursor.style.width = '18px';
      cursor.style.height = '18px';
      cursor.style.backgroundColor = 'rgba(17, 17, 17, 0.08)';
    }
  });
}

/* ==========================================================================
   2. SPLASH SCREEN & SESSION STORAGE CONTROLLER (PLAYS ONLY ONCE PER SESSION)
   ========================================================================== */
function initSplashScreen() {
  const splashScreen = document.getElementById('splash-screen');
  const progressBar = document.getElementById('splash-progress-bar');
  const counterText = document.getElementById('splash-counter');

  if (!splashScreen) return;

  // CHECK SESSION STORAGE: SKIP IF ALREADY PLAYED IN THIS BROWSER SESSION
  const hasPlayed = sessionStorage.getItem('architects_nook_splash_played');
  if (hasPlayed === 'true') {
    splashScreen.style.display = 'none';
    splashScreen.classList.add('completed', 'hidden-all');
    document.body.style.overflow = '';
    return;
  }

  if (!progressBar || !counterText) return;

  let progress = 0;
  const duration = 1200; // ms
  const intervalTime = 20;
  const increment = 100 / (duration / intervalTime);

  const timer = setInterval(() => {
    progress += increment;
    if (progress >= 100) {
      progress = 100;
      clearInterval(timer);
      
      progressBar.style.width = '100%';
      counterText.textContent = '100%';

      // SAVE SESSION FLAG ONCE ANIMATION IS COMPLETED
      sessionStorage.setItem('architects_nook_splash_played', 'true');

      setTimeout(() => {
        splashScreen.classList.add('completed');
        document.body.style.overflow = '';
        
        setTimeout(() => {
          splashScreen.classList.add('hidden-all');
        }, 900);
      }, 300);
    } else {
      progressBar.style.width = `${Math.floor(progress)}%`;
      counterText.textContent = `${Math.floor(progress)}%`;
    }
  }, intervalTime);
}

/* ==========================================================================
   3. REFINED ARCHITECTURAL HEADER CONTROLLER (STICKY HIDE/SHOW & MOBILE DRAWER)
   ========================================================================== */
function initArchitecturalHeader() {
  const header = document.getElementById('site-header');
  const mobileToggle = document.getElementById('mobile-toggle-btn');
  const mobileClose = document.getElementById('mobile-drawer-close');
  const mobileLinks = document.querySelectorAll('.mobile-drawer-link');

  if (!header) return;

  let lastScrollY = window.scrollY;
  const scrollThreshold = 100;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > scrollThreshold) {
      if (currentScrollY > lastScrollY) {
        header.classList.add('nav-hidden');
      } else {
        header.classList.remove('nav-hidden');
      }
    } else {
      header.classList.remove('nav-hidden');
    }

    lastScrollY = currentScrollY;
  });

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      document.body.classList.toggle('mobile-drawer-open');
    });
  }

  if (mobileClose) {
    mobileClose.addEventListener('click', () => {
      document.body.classList.remove('mobile-drawer-open');
    });
  }

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      document.body.classList.remove('mobile-drawer-open');
    });
  });
}

/* ==========================================================================
   4. ELEGANT ABOUT SECTION STATISTICS COUNTER (INTERSECTION OBSERVER + RAF)
   ========================================================================== */
function initAboutStatsCounter() {
  const statsContainer = document.querySelector('.about-stats-grid');
  const statNumbers = document.querySelectorAll('.about-stats-grid .stat-number');

  if (!statsContainer || !statNumbers.length) return;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateCounter(el) {
    const startValue = parseInt(el.getAttribute('data-start') || '0', 10);
    const targetValue = parseInt(el.getAttribute('data-target') || '0', 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = parseInt(el.getAttribute('data-duration') || '3000', 10);

    let startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      const currentValue = Math.floor(startValue + (targetValue - startValue) * easedProgress);
      el.textContent = `${currentValue}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = `${targetValue}${suffix}`;
      }
    }

    requestAnimationFrame(step);
  }

  const observerOptions = {
    root: null,
    threshold: 0.4
  };

  const statsObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        statNumbers.forEach(numEl => animateCounter(numEl));
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  statsObserver.observe(statsContainer);
}

/* ==========================================================================
   5. INTERACTIVE TEKT PROCESS STEPPER
   ========================================================================== */
function initTEKTProcessStepper() {
  const processSteps = [
    {
      step: '01',
      title: 'Groundwork & Site Consultation',
      desc: 'During an initial consultation, we learn about your vision and assess the site to determine design possibilities, costings, build timeframes, and next steps.',
      image: 'assets/Commercial/Sunshine Resort & Skyvillas,Daman, India.jpg',
      meta: 'PHASE 01 // INITIAL SITE CONSULTATION &amp; FEASIBILITY'
    },
    {
      step: '02',
      title: 'Concept & Spatial Design',
      desc: 'Select from our Urban, Rural, or Coastal Series, or opt for a custom build. Review the design package, including floor plans, elevations, and specifications ready for quoting.',
      image: 'assets/Residential/Bobby Kundra, Silvassa,.jpg',
      meta: 'PHASE 02 // ARCHITECTURAL SCHEMATIC &amp; 3D MODELING'
    },
    {
      step: '03',
      title: 'Shaping the Architectural System',
      desc: 'Through an iterative, collaborative process, we guide, refine, and resolve all design decisions to arrive at your final, considered Architects\' Nook system.',
      image: 'assets/Industrial/ATG Tires, Dahej,.jpg',
      meta: 'PHASE 03 // STRUCTURAL SPECIFICATIONS &amp; MATERIAL FINISHES'
    },
    {
      step: '04',
      title: 'Regulatory & Building Approvals',
      desc: 'We liaise with all consultants and regulators to facilitate a smooth, efficient building approval process across soil, energy, wind, fire, civil engineering, and town planning.',
      image: 'assets/Instituitional/Aadarsh Enterprise School, Kalvada, Gujarat, India.jpg',
      meta: 'PHASE 04 // MUNICIPAL COMPLIANCE &amp; STATUTORY PERMITS'
    },
    {
      step: '05',
      title: 'Considered Construction & Engineering',
      desc: 'Assembly takes place under stringent quality control. Our engineering team manages precision at every step and keeps you informed of progress with frequent updates.',
      image: 'assets/Religious/Nav Grah Temple, Uplat,.jpg',
      meta: 'PHASE 05 // STRUCTURAL EXECUTION &amp; QUALITY AUDITS'
    },
    {
      step: '06',
      title: 'Seamless Handover & Delivery',
      desc: 'We handle all logistics from studio engineering to on-site installation, including final inspection and post-handover support for complete peace of mind.',
      image: 'assets/Residential/Mohini Bunglow, Vapi,.jpg',
      meta: 'PHASE 06 // TURNKEY HANDOVER &amp; WARRANTY SUPPORT'
    }
  ];

  const stepItems = document.querySelectorAll('.process-step-item');
  const mediaImg = document.getElementById('process-active-img');
  const mediaMeta = document.getElementById('process-active-meta');
  const mediaTitle = document.getElementById('process-active-title');

  if (!stepItems.length || !mediaImg) return;

  function updateProcessStep(index) {
    const data = processSteps[index];
    if (!data) return;

    stepItems.forEach((item, i) => {
      if (i === index) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    mediaImg.style.opacity = '0';
    setTimeout(() => {
      mediaImg.src = data.image;
      if (mediaMeta) mediaMeta.innerHTML = data.meta;
      if (mediaTitle) mediaTitle.textContent = `${data.step} ${data.title}`;
      mediaImg.style.opacity = '1';
    }, 200);
  }

  stepItems.forEach((item, index) => {
    item.addEventListener('click', () => updateProcessStep(index));
    item.addEventListener('mouseenter', () => updateProcessStep(index));
  });
}

/* ==========================================================================
   6. SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
   ========================================================================== */
function initScrollReveals() {
  const revealElements = document.querySelectorAll('.reveal-item');
  if (!revealElements.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -80px 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => observer.observe(el));
}

/* ==========================================================================
   7. SMOOTH INTERNAL LINK SCROLLING
   ========================================================================== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

/* ==========================================================================
   8. SWISS EDITORIAL DROPDOWN CONTROLLER (HOVER DELAY & KEYBOARD ACCESSIBILITY)
   ========================================================================== */
function initNavbarDropdown() {
  const projectsNavCell = document.getElementById('projects-nav-cell');
  const panel = document.getElementById('projects-editorial-panel');
  let hoverTimer = null;

  if (projectsNavCell && panel) {
    const items = panel.querySelectorAll('.editorial-panel-link');

    function openMenu() {
      if (hoverTimer) {
        clearTimeout(hoverTimer);
        hoverTimer = null;
      }
      panel.classList.add('is-open');
      projectsNavCell.setAttribute('aria-expanded', 'true');
    }

    function closeMenuImmediately() {
      if (hoverTimer) clearTimeout(hoverTimer);
      panel.classList.remove('is-open');
      projectsNavCell.setAttribute('aria-expanded', 'false');
    }

    function closeMenuWithDelay() {
      if (hoverTimer) clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => {
        closeMenuImmediately();
      }, 150);
    }

    projectsNavCell.addEventListener('mouseenter', openMenu);
    projectsNavCell.addEventListener('mouseleave', closeMenuWithDelay);

    // Keyboard & Focus Accessibility
    projectsNavCell.addEventListener('focusin', openMenu);
    projectsNavCell.addEventListener('focusout', (e) => {
      if (!projectsNavCell.contains(e.relatedTarget)) {
        closeMenuWithDelay();
      }
    });

    // Keyboard Key Navigation (Escape, ArrowUp, ArrowDown)
    projectsNavCell.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeMenuImmediately();
        const mainLink = projectsNavCell.querySelector('.nav-panel-link');
        if (mainLink) mainLink.focus();
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        openMenu();
        const activeEl = document.activeElement;
        const index = Array.from(items).indexOf(activeEl);

        if (e.key === 'ArrowDown') {
          const nextIndex = index < items.length - 1 ? index + 1 : 0;
          items[nextIndex].focus();
        } else if (e.key === 'ArrowUp') {
          const prevIndex = index > 0 ? index - 1 : items.length - 1;
          items[prevIndex].focus();
        }
      }
    });
  }

  // Mobile Accordion Toggle
  const mobileHasDropdown = document.querySelector('.mobile-nav-has-dropdown');
  const mobileHeader = document.querySelector('.mobile-dropdown-header');
  
  if (mobileHeader && mobileHasDropdown) {
    mobileHeader.addEventListener('click', () => {
      mobileHasDropdown.classList.toggle('open');
    });
  }
}

/* ==========================================================================
   9. PROJECTS CATEGORY FILTER & URL PARAMETER ENGINE
   ========================================================================== */
function initProjectsCategoryFilter() {
  const categoryTabs = document.querySelectorAll('.category-tab');
  const projectCards = document.querySelectorAll('.project-card[data-category]');
  const dropdownItems = document.querySelectorAll('[data-category-link]');

  if (!categoryTabs.length && !projectCards.length && !dropdownItems.length) return;

  function filterCategory(targetCategory) {
    const normCategory = (targetCategory || 'all').toLowerCase().trim();
    const currentCards = document.querySelectorAll('.project-card[data-category]');

    // 1. Update Category Tabs active state
    categoryTabs.forEach(tab => {
      const tabTarget = (tab.getAttribute('data-category-target') || '').toLowerCase().trim();
      if (tabTarget === normCategory) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // 2. Update Nav Dropdown active state
    dropdownItems.forEach(item => {
      const itemCat = (item.getAttribute('data-category-link') || '').toLowerCase().trim();
      if (itemCat === normCategory) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // 3. Filter Project Cards
    currentCards.forEach(card => {
      const cardCategory = (card.getAttribute('data-category') || '').toLowerCase().trim();
      if (normCategory === 'all' || cardCategory === normCategory) {
        card.classList.remove('is-hidden');
      } else {
        card.classList.add('is-hidden');
      }
    });
  }

  // Check URL query params on page load
  const urlParams = new URLSearchParams(window.location.search);
  const initialCat = urlParams.get('category') || 'all';
  filterCategory(initialCat);

  // Tab button click listeners
  categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetCat = tab.getAttribute('data-category-target') || 'all';
      filterCategory(targetCat);

      // Update URL without page reload
      const newUrl = targetCat === 'all' 
        ? window.location.pathname 
        : `${window.location.pathname}?category=${encodeURIComponent(targetCat)}`;
      window.history.pushState({ category: targetCat }, '', newUrl);
    });
  });

  // Handle browser back/forward history navigation
  window.addEventListener('popstate', () => {
    const currentParams = new URLSearchParams(window.location.search);
    const popCat = currentParams.get('category') || 'all';
    filterCategory(popCat);
  });
}

/* ==========================================================================
   10. AUTOMATIC CATEGORY IMAGE LOADER & DYNAMIC CARD GENERATOR (OFFICIAL ANPL PORTFOLIO)
   ========================================================================== */
const PORTFOLIO_PROJECTS = [
  // --- INDUSTRIAL (1-10) ---
  {
    id: 1,
    title: 'SWATI INTERIORS',
    location: 'Silvassa, Dadra and Nagar Haveli, India',
    category: 'industrial',
    categoryLabel: 'INDUSTRIAL',
    folder: 'Industrial',
    filename: 'Swati Interiors, Silvassa,.jpg',
    typology: 'Industrial',
    year: '2018 - 2020',
    status: 'Under Construction',
    siteArea: '1,56,076.00 sq.ft',
    gfa: '82,927.00 sq.ft',
    scope: 'Architecture, Structural Design',
    desc: 'Designed as a warehouse for a renowned bespoke furniture manufacturer in Silvassa, it reflects the craftsmanship. The architecture moves beyond the conventional industrial typology, creating a built environment that serves as both a production facility and a representation of the brand’s identity.'
  },
  {
    id: 2,
    title: 'TUCSON HYDROCONTROLS',
    location: 'Umbergaon, Gujarat, India',
    category: 'industrial',
    categoryLabel: 'INDUSTRIAL',
    folder: 'Industrial',
    filename: 'Tucson Hydrocontrols, Umbergaon.jpg',
    typology: 'Industrial',
    year: '2018',
    status: 'Under Construction',
    siteArea: '88,554.48 sq.ft',
    gfa: '92,176.10 sq.ft',
    scope: 'Architecture, Structural Design',
    desc: 'Collaborated with Perkins Eastman Architects as the local architecture partner for the execution and detailed development of the Tucson Hydrocontrols industrial facility, bridging design intent and on-site implementation.'
  },
  {
    id: 3,
    title: 'BLUE STAR MANUFACTURING CAMPUS',
    location: 'Silvassa, Dadra and Nagar Haveli, India',
    category: 'industrial',
    categoryLabel: 'INDUSTRIAL',
    folder: 'Industrial',
    filename: 'Blue Star, Silvassa.jpg',
    typology: 'Industrial',
    year: '2024 - 2027',
    status: 'Under Construction',
    siteArea: '3,59,194.00 sq.ft',
    gfa: '2,09,380.00 sq.ft',
    scope: 'Architecture, Structural Design, Interior Design, PMC',
    desc: 'Contemporary industrial development seamlessly integrating manufacturing, research, administration, and support infrastructure within a unified architectural framework prioritized for circulation and future expansion.'
  },
  {
    id: 4,
    title: 'KRYFS POWER COMPONENTS',
    location: 'Silvassa, Dadra and Nagar Haveli, India',
    category: 'industrial',
    categoryLabel: 'INDUSTRIAL',
    folder: 'Industrial',
    filename: 'Kryfs Power Components, Silvassa.jpg',
    typology: 'Industrial',
    year: '2024 - 2026',
    status: 'In Progress',
    siteArea: '3,02,658.00 sq.ft',
    gfa: '3,02,658.00 sq.ft',
    scope: 'Architecture, Structural Design',
    desc: 'Developed for Kryfs Powercomponents, a leading transformer manufacturer, representing the fifth project delivered over a professional relationship spanning more than three decades.'
  },
  {
    id: 5,
    title: 'KARAGWAL DEVELOPERS',
    location: 'Tumbh, Gujarat, India',
    category: 'industrial',
    categoryLabel: 'INDUSTRIAL',
    folder: 'Industrial',
    filename: 'Karagwal Developers, Tumbh.jpg',
    typology: 'Industrial',
    year: '2021 - 2023',
    status: 'In Progress',
    siteArea: '4,07,003.00 sq.ft',
    gfa: '3,30,933.00 sq.ft',
    scope: 'Architecture, Structural Design',
    desc: 'Large-scale manufacturing and warehousing facility embracing simplicity, efficiency, and honest expression of industrial architecture, punctuated by continuous skylight slits for natural daylighting.'
  },
  {
    id: 6,
    title: 'INDCON PROJECT',
    location: 'Dahej, Gujarat, India',
    category: 'industrial',
    categoryLabel: 'INDUSTRIAL',
    folder: 'Industrial',
    filename: 'Indcon Project, Dahej.jpg',
    typology: 'Industrial',
    year: '2015 - 2016',
    status: 'Completed',
    siteArea: '10,71,192.00 sq.ft',
    gfa: '2,53,452.00 sq.ft',
    scope: 'Architecture, Structural Design',
    desc: 'Contemporary industrial facility demonstrating efficiency and architectural clarity within a pre-engineered building system, creating expansive column-free spaces for flexible manufacturing.'
  },
  {
    id: 7,
    title: 'LINC PEN & PLASTIC LTD',
    location: 'Umbergaon, Gujarat, India',
    category: 'industrial',
    categoryLabel: 'INDUSTRIAL',
    folder: 'Industrial',
    filename: 'Linc Pen & Plastic Ltd, Umbergaon.jpg',
    typology: 'Industrial',
    year: '2012',
    status: 'Proposed (Unbuilt)',
    siteArea: '1,12,839.00 sq.ft',
    gfa: '51,905.00 sq.ft',
    scope: 'Architecture',
    desc: 'Communicates a strong corporate identity defined by deep horizontal bands, a highly transparent façade, landscaped forecourt, and a restrained material palette.'
  },
  {
    id: 8,
    title: 'ATG TIRES',
    location: 'Dahej, Gujarat, India',
    category: 'industrial',
    categoryLabel: 'INDUSTRIAL',
    folder: 'Industrial',
    filename: 'ATG Tires, Dahej,.jpg',
    typology: 'Industrial',
    year: '2014 - 2017',
    status: 'Completed',
    siteArea: '41,00,044.00 sq.ft',
    gfa: '13,89,585.00 sq.ft',
    scope: 'Architecture, Structural Design',
    desc: 'Brings together operational efficiency and architectural clarity around a pre-engineered building system accommodating large-span manufacturing and administrative functions.'
  },
  {
    id: 9,
    title: 'MWV',
    location: 'Morai, Gujarat, India',
    category: 'industrial',
    categoryLabel: 'INDUSTRIAL',
    folder: 'Industrial',
    filename: 'MWV, Morai.jpg',
    typology: 'Industrial',
    year: '2006 - 2008',
    status: 'Completed',
    siteArea: '8,64,845.00 sq.ft',
    gfa: '95,142.00 sq.ft',
    scope: 'Architecture, Structural Design',
    desc: 'Designed as part of a larger industrial campus, establishing a distinct corporate presence while maintaining flexibility and efficiency connected to the manufacturing environment.'
  },
  {
    id: 10,
    title: 'PARAM PACKAGING PVT. LTD',
    location: 'Degam, Gujarat, India',
    category: 'industrial',
    categoryLabel: 'INDUSTRIAL',
    folder: 'Industrial',
    filename: 'Param Packaging Pvt. Ltd, Degam.jpg',
    typology: 'Industrial',
    year: '2018 - 2020',
    status: 'Proposed (Unbuilt)',
    siteArea: '1,73,452.00 sq.ft',
    gfa: '75,525.00 sq.ft',
    scope: 'Architecture, Structural Design, PMC',
    desc: 'Departs from conventional industrial expressions through fluid geometries, a sweeping roof profile, sculpted entrance, glazed surfaces, and warm stone cladding.'
  },

  // --- INSTITUTIONAL (11-17) ---
  {
    id: 11,
    title: 'AADARSH ENTERPRISE SCHOOL',
    location: 'Kalvada, Gujarat, India',
    category: 'institutional',
    categoryLabel: 'INSTITUTIONAL',
    folder: 'Instituitional',
    filename: 'Aadarsh Enterprise School, Kalvada, Gujarat, India.jpg',
    typology: 'Institutional',
    year: '2019 - 2020',
    status: 'Completed',
    siteArea: '1,49,311.00 sq.ft',
    gfa: '74,327.00 sq.ft',
    scope: 'Architecture, Structural Design',
    desc: 'Balances functionality with a warm architectural character, prioritizing clear circulation, naturally lit classrooms, and seamless indoor-outdoor learning environments.'
  },
  {
    id: 12,
    title: 'LION’S COLLEGE CAMPUS',
    location: 'Silvassa, Dadra and Nagar Haveli, India',
    category: 'institutional',
    categoryLabel: 'INSTITUTIONAL',
    folder: 'Instituitional',
    filename: 'Lion’s College, Silvassa,.jpg',
    typology: 'Institutional',
    year: '2020',
    status: 'Proposed (Unbuilt)',
    siteArea: '6,99,400.00 sq.ft',
    gfa: '6,54,469.00 sq.ft',
    scope: 'Architecture',
    desc: 'Comprehensive master plan bringing together academic blocks, administrative facilities, student amenities, and generous open spaces within a unified campus framework.'
  },
  {
    id: 13,
    title: 'SSR COLLEGE',
    location: 'Silvassa, Dadra and Nagar Haveli, India',
    category: 'institutional',
    categoryLabel: 'INSTITUTIONAL',
    folder: 'Instituitional',
    filename: 'SSR College, Silvassa,.jpg',
    typology: 'Institutional',
    year: '2020 - 2022',
    status: 'Completed',
    siteArea: '5,44,041.00 sq.ft',
    gfa: '1,27,695.00 sq.ft',
    scope: 'Architecture, Structural Design, PMC',
    desc: 'Simple architectural language characterized by clean horizontal lines, generous circulation spaces, and modular planning for economical construction and future adaptation.'
  },
  {
    id: 14,
    title: 'VEDANT SCHOOL',
    location: 'Valsad, Gujarat, India',
    category: 'institutional',
    categoryLabel: 'INSTITUTIONAL',
    folder: 'Instituitional',
    filename: 'Vedant School, Valsad,.jpg',
    typology: 'Institutional',
    year: '2015 - 2016',
    status: 'Completed',
    siteArea: '1,73,452.00 sq.ft',
    gfa: '75,525.00 sq.ft',
    scope: 'Architecture, Structural Design, PMC',
    desc: 'Conceived as carefully proportioned volumes combining clean white surfaces, exposed brick, textured stone panels, and pitched roof forms for a warm institutional character.'
  },
  {
    id: 15,
    title: 'LION’S SCHOOL',
    location: 'Silvassa, Dadra and Nagar Haveli, India',
    category: 'institutional',
    categoryLabel: 'INSTITUTIONAL',
    folder: 'Instituitional',
    filename: 'Lion’s School, Silvassa,.jpg',
    typology: 'Institutional',
    year: '2015 - 2016',
    status: 'Completed',
    siteArea: '6,99,400.00 sq.ft',
    gfa: '2,48,058.00 sq.ft',
    scope: 'Architecture, Structural Design, Interior Design, PMC',
    desc: 'Organized around a clear and repetitive planning module, creating an enduring educational environment through proportion and disciplined detailing.'
  },
  {
    id: 16,
    title: 'FELLOWSHIP MISSION SCHOOL',
    location: 'Vapi, Gujarat, India',
    category: 'institutional',
    categoryLabel: 'INSTITUTIONAL',
    folder: 'Instituitional',
    filename: 'Fellowship Mission School, Vapi,.jpg',
    typology: 'Institutional',
    year: '2014 - 2015',
    status: 'Completed',
    siteArea: '1,32,038.00 sq.ft',
    gfa: '1,17,694.00 sq.ft',
    scope: 'Architecture, Structural Design, PMC',
    desc: 'Comprehensive educational infrastructure development combining modular classrooms, administrative wings, and high-capacity assembly facilities.'
  },
  {
    id: 17,
    title: 'DR. C.J. DESAI & JASWANTIBEN DESAI HOSPITAL',
    location: 'Kolkata, West Bengal, India',
    category: 'institutional',
    categoryLabel: 'HEALTHCARE & INSTITUTIONAL',
    folder: 'Instituitional',
    filename: 'Dr. CJ Desai & Jaswantiben Desai.jpg',
    typology: 'Healthcare / Institutional',
    year: '2020 - 2022',
    status: 'In Progress',
    siteArea: '5,44,041.00 sq.ft',
    gfa: '1,27,695.00 sq.ft',
    scope: 'Architecture, Structural Design, PMC',
    desc: 'Healthcare facility designed for the Dr. C.J. Desai & Jaswantiben Desai Foundation, delivering quality patient environments while responding to stringent budgetary constraints.'
  },

  // --- RELIGIOUS (18-19) ---
  {
    id: 18,
    title: 'SHRI DIGAMBAR JAIN JINSHARANAM TIRTH',
    location: 'Uplat, Maharashtra, India',
    category: 'religious',
    categoryLabel: 'RELIGIOUS',
    folder: 'Religious',
    filename: 'Shri Digambar Jain Jinsharanam Tirth.jpg',
    typology: 'Religious',
    year: '2015 - 2016',
    status: 'Completed',
    siteArea: '2,79,890.00 sq.ft',
    gfa: '90,308.00 sq.ft',
    scope: 'Architecture',
    desc: 'Sacred space embodying serenity, simplicity, and permanence, balancing traditional Jain temple values with contemporary construction practices for community reflection.'
  },
  {
    id: 19,
    title: 'NAV GRAH TEMPLE',
    location: 'Uplat, Maharashtra, India',
    category: 'religious',
    categoryLabel: 'RELIGIOUS',
    folder: 'Religious',
    filename: 'Nav Grah Temple, Uplat,.jpg',
    typology: 'Religious',
    year: '2015 - 2016',
    status: 'Completed',
    siteArea: '6,99,400.00 sq.ft',
    gfa: '2,48,058.00 sq.ft',
    scope: 'Architecture',
    desc: 'Conceived as an extension to the Shri Digambar Jain Jinsharanam Tirth Trust, reinforcing the continuity of the temple precinct through restrained architectural language.'
  },

  // --- COMMERCIAL (20) ---
  {
    id: 20,
    title: 'SUNSHINE RESORT & SKYVILLAS',
    location: 'Daman, India',
    category: 'commercial',
    categoryLabel: 'COMMERCIAL',
    folder: 'Commercial',
    filename: 'Sunshine Resort & Skyvillas,Daman, India.jpg',
    typology: 'Commercial / Hospitality',
    year: '2020',
    status: 'Proposed (Unbuilt)',
    siteArea: '1,32,038.00 sq.ft',
    gfa: '1,17,694.00 sq.ft',
    scope: 'Architecture',
    desc: 'Hospitality destination drawing inspiration from Daman’s rich colonial architectural heritage while embracing a contemporary luxury resort design language.'
  },

  // --- RESIDENTIAL (21-32) ---
  {
    id: 21,
    title: 'SRI GIGIRAJ LADDHA RESIDENCE',
    location: 'Vapi, Gujarat, India',
    category: 'residential',
    categoryLabel: 'RESIDENTIAL',
    folder: 'Residential',
    filename: 'Sri Gigiraj Laddha, Vapi,.jpg',
    typology: 'Residential',
    year: '2012 - 2013',
    status: 'Completed',
    siteArea: '6,883.00 sq.ft',
    gfa: '5,636.00 sq.ft',
    scope: 'Structural Design',
    desc: 'Complete RCC structural engineering designed to optimize spans and maintain spatial flexibility while ensuring seismic stability and long-term durability.'
  },
  {
    id: 22,
    title: 'SMT. PADMINIBEN CHAUHAN BUNGALOW',
    location: 'Silvassa, Dadra and Nagar Haveli, India',
    category: 'residential',
    categoryLabel: 'RESIDENTIAL',
    folder: 'Residential',
    filename: 'Smt. Padminiben Chauhan , Silvassa,.jpg',
    typology: 'Residential',
    year: '2020 - 2025',
    status: 'In Progress',
    siteArea: '32,295.00 sq.ft',
    gfa: '12,610.00 sq.ft',
    scope: 'Architecture, Structural Design',
    desc: 'Private bungalow reinterpreting Neo-Classical architecture through grand colonnades, arched openings, layered cornices, and finely detailed mouldings.'
  },
  {
    id: 23,
    title: 'SHRI DEEPAK CHAUHAN RESIDENCE',
    location: 'Umbergaon, Gujarat, India',
    category: 'residential',
    categoryLabel: 'RESIDENTIAL',
    folder: 'Residential',
    filename: 'Shri Deepak Chauhan, Umbergaon.jpg',
    typology: 'Residential',
    year: '2024 - 2026',
    status: 'Under Construction',
    siteArea: '3,177.50 sq.ft',
    gfa: '5,425.00 sq.ft',
    scope: 'Architecture, Structural Design, Interior Design, PMC',
    desc: 'Contemporary interpretation of Neo-Classical architecture distilling classical elements into a restrained vocabulary tailored for modern living.'
  },
  {
    id: 24,
    title: 'GUPTA’S RESIDENCE',
    location: 'Umbergaon, Gujarat, India',
    category: 'residential',
    categoryLabel: 'RESIDENTIAL',
    folder: 'Residential',
    filename: 'Gupta’s, Umbergaon,.jpg',
    typology: 'Residential',
    year: '2023 - 2026',
    status: 'In Progress',
    siteArea: '3,522.00 sq.ft',
    gfa: '5,363.12 sq.ft',
    scope: 'Architecture, Structural Design, PMC',
    desc: 'Achieves identity through vertically proportioned stone-clad planes framing expansive glazed corners for a balanced dialogue between solidity and transparency.'
  },
  {
    id: 25,
    title: 'BOBBY KUNDRA RESIDENCE',
    location: 'Silvassa, Dadra and Nagar Haveli, India',
    category: 'residential',
    categoryLabel: 'RESIDENTIAL',
    folder: 'Residential',
    filename: 'Bobby Kundra, Silvassa,.jpg',
    typology: 'Residential',
    year: '2017 - 2018',
    status: 'Completed',
    siteArea: '3,865.00 sq.ft',
    gfa: '5,250.00 sq.ft',
    scope: 'Architecture, Structural Design, PMC',
    desc: 'Bespoke luxury residence incorporating precise structural planning, expansive living areas, and high-end residential finishes.'
  },
  {
    id: 26,
    title: 'SHRI RAMANI FARMHOUSE',
    location: 'Gujarat, India',
    category: 'residential',
    categoryLabel: 'RESIDENTIAL',
    folder: 'Residential',
    filename: 'Shri Ramani Farmhouse,.jpg',
    typology: 'Residential / Retreat',
    year: '2018 - 2020',
    status: 'Completed',
    siteArea: '2,17,800.00 sq.ft',
    gfa: '2,250.00 sq.ft',
    scope: 'Architecture, Structural Design, PMC',
    desc: 'Embraces locally sourced stone, brick, and timber with deep verandahs and shaded outdoor spaces creating a seamless relationship with the natural landscape.'
  },
  {
    id: 27,
    title: 'SHRI BHARAT TANK BUNGALOW',
    location: 'Vapi, Gujarat, India',
    category: 'residential',
    categoryLabel: 'RESIDENTIAL',
    folder: 'Residential',
    filename: 'Shri Bharat Tank, Vapi.jpg',
    typology: 'Residential',
    year: '2010 - 2012',
    status: 'Completed',
    siteArea: '3,165.00 sq.ft',
    gfa: '5,250.00 sq.ft',
    scope: 'Architecture, Interior Design',
    desc: 'Explores contemporary architecture through an orchestrated composition of intersecting volumes, contrasting pitched roof forms, and bold geometric masses.'
  },
  {
    id: 28,
    title: 'MOHINI BUNGLOW',
    location: 'Vapi, Gujarat, India',
    category: 'residential',
    categoryLabel: 'RESIDENTIAL',
    folder: 'Residential',
    filename: 'Mohini Bunglow, Vapi,.jpg',
    typology: 'Residential',
    year: '2024 - 2026',
    status: 'Under Construction',
    siteArea: '3,747.00 sq.ft',
    gfa: '6,094.98 sq.ft',
    scope: 'Architecture, Interior Design',
    desc: 'Seamless integration of architecture, landscape, and everyday living, allowing the surrounding landscape to become an integral component of the architectural experience.'
  },
  {
    id: 29,
    title: 'SKY CREST',
    location: 'Vapi, Gujarat, India',
    category: 'residential',
    categoryLabel: 'RESIDENTIAL',
    folder: 'Residential',
    filename: 'Sky Crest, Vapi,.jpg',
    typology: 'Residential',
    year: '2011 - 2013',
    status: 'Completed',
    siteArea: '16,416.00 sq.ft',
    gfa: '52,770.00 sq.ft',
    scope: 'Architecture, Structural Design',
    desc: 'Premium multi-dwelling residential development deriving character from projecting balconies and deep recesses that introduce depth and shadow across the elevation.'
  },
  {
    id: 30,
    title: 'SHRI HARSHAD RAVASHIA RESIDENCE',
    location: 'Umbergaon, Gujarat, India',
    category: 'residential',
    categoryLabel: 'RESIDENTIAL',
    folder: 'Residential',
    filename: 'Shri Harshad Ravashia, Umbergaon.jpg',
    typology: 'Residential',
    year: '2018 - 2019',
    status: 'Completed',
    siteArea: '5,537.00 sq.ft',
    gfa: '7,417.00 sq.ft',
    scope: 'Architecture, Structural Design, PMC',
    desc: 'Contemporary residence informed by classical design principles, featuring tall arched windows, subtle horizontal banding, and vertical proportions.'
  },
  {
    id: 31,
    title: 'VALENCIA LUXURY APARTMENTS',
    location: 'Vapi, Gujarat, India',
    category: 'residential',
    categoryLabel: 'RESIDENTIAL',
    folder: 'Residential',
    filename: 'Valencia, Vapi.jpg',
    typology: 'Residential',
    year: '2012 - 2014',
    status: 'Completed',
    siteArea: '13,638.00 sq.ft',
    gfa: '18,118.00 sq.ft',
    scope: 'Architecture, Interior Design',
    desc: 'Premium residential development combining natural stone cladding, recessed openings, and carefully framed windows for an experience of permanence and understated luxury.'
  },
  {
    id: 32,
    title: 'H.S ENTERPRISE MIXED-USE',
    location: 'Pardi, Gujarat, India',
    category: 'residential',
    categoryLabel: 'RESIDENTIAL / MIXED-USE',
    folder: 'Residential',
    filename: 'H.S Enterprise, Pardi,.jpg',
    typology: 'Residential / Mixed-Use',
    year: '2012 - 2014',
    status: 'Proposed (Unbuilt)',
    siteArea: '25,664.00 sq.ft',
    gfa: '58,694.00 sq.ft',
    scope: 'Architecture, Structural Design',
    desc: 'Contemporary mixed-use development combining residential apartments with ground-level retail spaces for a vibrant urban community streetscape.'
  },

  // --- INTERIOR FALLBACK (33) ---
  {
    id: 33,
    title: 'CORPORATE INTERIORS HUB',
    location: 'Vapi, Gujarat, India',
    category: 'interior',
    categoryLabel: 'INTERIOR',
    folder: 'Interior',
    filename: null,
    typology: 'Interior Design',
    year: '2024 - 2026',
    status: 'Completed',
    siteArea: '15,000.00 sq.ft',
    gfa: '12,500.00 sq.ft',
    scope: 'Interior Design, Space Planning',
    desc: 'Bespoke corporate interior design studio incorporating flexible workstation planning, custom timber acoustic panels, and architectural lighting.'
  }
];

function createProjectCardHTML(p, isHomePreview = false) {
  const imagePath = p.filename ? `assets/${p.folder}/${p.filename}` : 'assets/project-placeholder.jpg';
  const tag = isHomePreview ? 'a' : 'article';
  const hrefAttr = isHomePreview ? `href="projects.html?category=${p.category}"` : '';

  return `
    <${tag} ${hrefAttr} class="project-card reveal-item" data-category="${p.category}" data-project-id="${p.id}" data-cursor-label="VIEW" style="text-decoration: none; color: inherit;">
      <div class="project-image-container">
        <img src="${imagePath}" 
             alt="${p.title.replace(/"/g, '&quot;')}" 
             class="project-image" 
             loading="lazy" 
             decoding="async" 
             style="width: 100%; height: 100%; object-fit: cover;"
             onerror="this.onerror=null; this.src='assets/project-placeholder.jpg';">
      </div>
      <div class="project-info">
        <div class="project-meta-row">
          <span class="project-category">${p.categoryLabel}</span>
        </div>
        <h3 class="project-title">${p.title}</h3>
        <div class="project-location">${p.location.toUpperCase()}</div>
        <p class="project-card-desc">${p.desc}</p>
        <div class="project-specs-pill">
          <span>AREA: <span class="spec-tag">${p.siteArea}</span></span>
          <span>SCOPE: <span class="spec-tag">${p.scope}</span></span>
        </div>
      </div>
    </${tag}>
  `;
}

function renderDynamicProjectCards() {
  const projectsGrid = document.querySelector('.projects-grid');
  if (!projectsGrid) return;

  const pathname = window.location.pathname.toLowerCase();
  const isProjectsPage = pathname.includes('projects.html');
  const isHomePage = document.getElementById('hero') !== null || pathname.endsWith('index.html') || pathname.endsWith('/') || pathname === '';

  // 1. PROJECTS PAGE: Render all 33 ANPL Portfolio Projects
  if (isProjectsPage) {
    let allCardsHTML = '';
    PORTFOLIO_PROJECTS.forEach(project => {
      allCardsHTML += createProjectCardHTML(project, false);
    });
    projectsGrid.innerHTML = allCardsHTML;
  }
  // 2. HOMEPAGE: Show 6 representative categories
  else if (isHomePage) {
    const homeProjectsGrid = document.querySelector('#projects .projects-grid') || projectsGrid;
    if (homeProjectsGrid) {
      let homeCardsHTML = '';
      const categories = ['commercial', 'residential', 'industrial', 'institutional', 'interior', 'religious'];
      
      categories.forEach(cat => {
        const reprProject = PORTFOLIO_PROJECTS.find(p => p.category === cat) || PORTFOLIO_PROJECTS[0];
        homeCardsHTML += createProjectCardHTML(reprProject, true);
      });

      homeProjectsGrid.innerHTML = homeCardsHTML;
    }
  }

  // Initialize interactive details modal
  initProjectModal();
}

function initProjectModal() {
  let modal = document.getElementById('project-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'project-modal';
    modal.innerHTML = `
      <div class="modal-container">
        <button class="modal-close-btn" id="modal-close-btn" aria-label="Close Project Details">&times;</button>
        <div class="modal-grid">
          <div class="modal-media">
            <img id="modal-img" src="" alt="Project Image">
          </div>
          <div class="modal-content">
            <div>
              <div class="modal-header-meta" id="modal-cat-meta">TYPOLOGY</div>
              <h2 class="modal-title" id="modal-title">PROJECT TITLE</h2>
              <div class="modal-location" id="modal-location">LOCATION</div>
              <div class="modal-specs-table">
                <div>
                  <div class="spec-item-label">Typology</div>
                  <div class="spec-item-val" id="modal-typology">Industrial</div>
                </div>
                <div>
                  <div class="spec-item-label">Site Area</div>
                  <div class="spec-item-val" id="modal-site-area">1,56,076.00 sq.ft</div>
                </div>
                <div>
                  <div class="spec-item-label">Gross Floor Area</div>
                  <div class="spec-item-val" id="modal-gfa">82,927.00 sq.ft</div>
                </div>
                <div style="grid-column: span 2;">
                  <div class="spec-item-label">Architectural Scope</div>
                  <div class="spec-item-val" id="modal-scope">Architecture, Structural Design</div>
                </div>
              </div>
              <div class="modal-description" id="modal-desc">
                Project description text...
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const closeBtn = document.getElementById('modal-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.addEventListener('click', (e) => {
    const card = e.target.closest('.project-card[data-project-id]');
    if (!card) return;

    const projId = parseInt(card.getAttribute('data-project-id'), 10);
    const project = PORTFOLIO_PROJECTS.find(p => p.id === projId);
    if (!project) return;

    if (card.tagName === 'A' && card.hasAttribute('href') && !window.location.pathname.toLowerCase().includes('projects.html')) {
      return;
    }

    e.preventDefault();
    openModal(project);
  });

  function openModal(p) {
    const imgPath = p.filename ? `assets/${p.folder}/${p.filename}` : 'assets/project-placeholder.jpg';
    document.getElementById('modal-img').src = imgPath;
    document.getElementById('modal-cat-meta').textContent = `${p.typology.toUpperCase()}`;
    document.getElementById('modal-title').textContent = p.title;
    document.getElementById('modal-location').textContent = p.location;
    document.getElementById('modal-typology').textContent = p.typology;
    document.getElementById('modal-site-area').textContent = p.siteArea || 'N/A';
    document.getElementById('modal-gfa').textContent = p.gfa || 'N/A';
    document.getElementById('modal-scope').textContent = p.scope || 'Architecture';
    document.getElementById('modal-desc').textContent = p.desc;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

/* ==========================================================================
   11. BLUEPRINT TO REALITY SCROLL-TRIGGERED ANIMATION ENGINE
   ========================================================================== */
function initBlueprintScrollAnimation() {
  const bpSection = document.getElementById('blueprint-reality');
  if (!bpSection) return;

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const blueprintSteps = [
    {
      title: "01 / Concept Outline",
      desc: "Mathematical mapping and spatial drafting of the architectural foundation."
    },
    {
      title: "02 / Structural Model",
      desc: "Projecting geometric axes and weight loads into an open-air vector wireframe."
    },
    {
      title: "03 / Construction Grid",
      desc: "Injecting concrete, structural steel, and raw monolithic frames onto the site."
    },
    {
      title: "04 / Completed Masterpiece",
      desc: "The final spatial execution — where light, texture, and silence meet form."
    }
  ];

  const bpHeading = document.getElementById('blueprint-heading');
  const bpDesc = document.getElementById('blueprint-desc');

  // Hide layers 2, 3, and 4 initially using clip-path inset
  gsap.set('#bp-layer-2', { clipPath: "inset(0% 100% 0% 0%)" });
  gsap.set('#bp-layer-3', { clipPath: "inset(0% 100% 0% 0%)" });
  gsap.set('#bp-layer-4', { clipPath: "inset(0% 100% 0% 0%)" });

  // 1. Perspective tilt-in animation as the section scrolls into view
  gsap.fromTo('#blueprint-3d-wrapper', 
    { 
      rotateX: 10, 
      rotateY: -5, 
      scale: 0.94, 
      transformPerspective: 1200 
    },
    {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      scrollTrigger: {
        trigger: '#blueprint-reality',
        start: 'top bottom',
        end: 'top top',
        scrub: true
      }
    }
  );

  // 2. Smoothly update text & dot indicators between phases
  function updateBlueprintStep(stepNum) {
    const data = blueprintSteps[stepNum - 1];
    if (!data || !bpHeading || !bpDesc) return;
    
    gsap.killTweensOf([bpHeading, bpDesc]);
    gsap.timeline()
      .to([bpHeading, bpDesc], { opacity: 0, y: -8, duration: 0.18, ease: 'power1.in' })
      .add(() => {
        bpHeading.textContent = data.title;
        bpDesc.textContent = data.desc;
        
        // Update dot indicators
        document.querySelectorAll('.bp-dot').forEach((dot, idx) => {
          if (idx === stepNum - 1) {
            dot.classList.add('active');
            gsap.to(dot, { scale: 1.3, duration: 0.2, overwrite: 'auto' });
          } else {
            dot.classList.remove('active');
            gsap.to(dot, { scale: 1, duration: 0.2, overwrite: 'auto' });
          }
        });
      })
      .to([bpHeading, bpDesc], { opacity: 1, y: 0, duration: 0.25, ease: 'power1.out' });
  }

  // 3. Main pinned ScrollTrigger animation timeline
  const bpTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: '#blueprint-reality',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
    }
  });

  bpTimeline
    // Phase 1 -> 2 (Reveal Wireframe Layer)
    .set('#bp-scanline', { left: '0%', opacity: 1, backgroundColor: '#2563eb', boxShadow: '0 0 12px #2563eb' })
    .to('#bp-layer-2', { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'none' })
    .to('#bp-scanline', { left: '100%', duration: 1, ease: 'none' }, '<')
    .to('#bp-scanline', { opacity: 0, duration: 0.1 })
    .to({}, { 
      duration: 0.05, 
      onStart: () => updateBlueprintStep(2),
      onReverseComplete: () => updateBlueprintStep(1)
    }, '<')
    
    // Phase 2 -> 3 (Reveal Construction Site Layer)
    .set('#bp-scanline', { left: '0%', opacity: 1, backgroundColor: '#f97316', boxShadow: '0 0 12px #f97316' })
    .to('#bp-layer-3', { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'none' })
    .to('#bp-scanline', { left: '100%', duration: 1, ease: 'none' }, '<')
    .to('#bp-scanline', { opacity: 0, duration: 0.1 })
    .to({}, { 
      duration: 0.05, 
      onStart: () => updateBlueprintStep(3),
      onReverseComplete: () => updateBlueprintStep(2)
    }, '<')
    
    // Phase 3 -> 4 (Reveal Final Completed Layer)
    .set('#bp-scanline', { left: '0%', opacity: 1, backgroundColor: '#ffffff', boxShadow: '0 0 12px #ffffff' })
    .to('#bp-layer-4', { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'none' })
    .to('#bp-scanline', { left: '100%', duration: 1, ease: 'none' }, '<')
    .to('#bp-scanline', { opacity: 0, duration: 0.1 })
    .to({}, { 
      duration: 0.05, 
      onStart: () => updateBlueprintStep(4),
      onReverseComplete: () => updateBlueprintStep(3)
    }, '<');
}


