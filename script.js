// ===== Força da Cor - Main JavaScript =====

// ===== CONFIGURATION =====
const CONFIG = {
  scrollProgress: true,
  navbarScrollThreshold: 60,
  revealThreshold: 0.1,
  revealRootMargin: '0px 0px -10% 0px',
  parallaxSpeed: 0.3,
  counterDuration: 2000,
  staggerDelay: 100,
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
};

// ===== UTILITIES =====
const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

const lerp = (start, end, factor) => start + (end - start) * factor;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const throttle = (fn, limit = 16) => {
  let inThrottle = false;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

const debounce = (fn, delay = 100) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

// ===== SCROLL PROGRESS BAR =====
function initScrollProgress() {
  const progressBar = $('#scroll-progress');
  if (!progressBar || CONFIG.reducedMotion) return;

  const updateProgress = throttle(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollTop / docHeight;
    progressBar.style.transform = `scaleX(${clamp(progress, 0, 1)})`;
  }, 16);

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
}

// ===== NAVBAR SCROLL BEHAVIOR =====
function initNavbar() {
  const navbar = $('#navbar');
  const navLinks = $$('.nav-link');
  const sections = $$('section[id]');
  let lastScroll = 0;
  let ticking = false;

  const updateNavbar = () => {
    const currentScroll = window.scrollY;
    
    // Scrolled state
    if (currentScroll > CONFIG.navbarScrollThreshold) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active link highlighting
    const scrollY = currentScroll + 120;
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      const navLink = $(`.nav-link[href="#${sectionId}"]`);
      
      if (navLink && scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach(link => link.classList.remove('active'));
        navLink.classList.add('active');
      }
    });

    lastScroll = currentScroll;
    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  updateNavbar();
}

// ===== MOBILE MENU =====
function initMobileMenu() {
  const navToggle = $('#nav-toggle');
  const navLinks = $('#nav-links');
  const navOverlay = $('#nav-overlay');

  if (!navToggle || !navLinks) return;

  const toggleMenu = (forceClose = false) => {
    const isOpen = navLinks.classList.contains('active');
    const shouldOpen = forceClose ? false : !isOpen;
    
    navToggle.classList.toggle('active', shouldOpen);
    navLinks.classList.toggle('active', shouldOpen);
    navOverlay.classList.toggle('active', shouldOpen);
    navToggle.setAttribute('aria-expanded', shouldOpen);
    navOverlay.setAttribute('aria-hidden', !shouldOpen);
    document.body.style.overflow = shouldOpen ? 'hidden' : '';
  };

  navToggle.addEventListener('click', () => toggleMenu());
  navOverlay.addEventListener('click', () => toggleMenu(true));

  // Close on link click
  $$('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      if (navLinks.classList.contains('active')) toggleMenu(true);
    });
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('active')) {
      toggleMenu(true);
    }
  });
}

// ===== SMOOTH SCROLL =====
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      const target = $(href);
      if (target) {
        e.preventDefault();
        const navbar = $('#navbar');
        const offset = navbar ? navbar.offsetHeight : 80;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
        
        window.scrollTo({
          top: targetPosition,
          behavior: CONFIG.reducedMotion ? 'auto' : 'smooth'
        });
      }
    });
  });
}

// ===== INTERSECTION OBSERVER FOR REVEAL ANIMATIONS =====
function initRevealAnimations() {
  if (CONFIG.reducedMotion) {
    $$('.reveal').forEach(el => el.classList.add('active'));
    $$('.stagger').forEach(el => el.classList.add('active'));
    return;
  }

  const revealElements = $$('.reveal:not(.active)');
  const staggerElements = $$('.stagger:not(.active)');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseInt(el.dataset.delay || '0', 10);
        
        setTimeout(() => {
          el.classList.add('active');
        }, delay);
        
        revealObserver.unobserve(el);
      }
    });
  }, {
    threshold: CONFIG.revealThreshold,
    rootMargin: CONFIG.revealRootMargin
  });

  const staggerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        staggerObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: CONFIG.revealThreshold,
    rootMargin: CONFIG.revealRootMargin
  });

  revealElements.forEach(el => revealObserver.observe(el));
  staggerElements.forEach(el => staggerObserver.observe(el));
}

// ===== PARALLAX EFFECTS =====
function initParallax() {
  if (CONFIG.reducedMotion) return;

  const heroShapes = $$('.mesh-gradient');
  const heroBg = $('.hero-background img');
  const orbs = $$('.orb');

  let ticking = false;

  const updateParallax = () => {
    const scrollY = window.scrollY;
    const hero = $('#inicio');
    if (!hero) return;

    const heroHeight = hero.offsetHeight;
    const heroBottom = hero.offsetTop + heroHeight;
    
    // Only run parallax while hero is in view
    if (scrollY < heroBottom) {
      const progress = scrollY / heroHeight;

      // Mesh gradients
      heroShapes.forEach((shape, index) => {
        const speed = (index + 1) * 0.08;
        const y = scrollY * speed;
        const x = Math.sin(progress * Math.PI * 2 + index) * 30;
        shape.style.transform = `translate(${x}px, ${y}px) scale(1)`;
      });

      // Hero background image
      if (heroBg) {
        heroBg.style.transform = `translateY(${scrollY * 0.15}px) scale(${1 + progress * 0.1})`;
      }
    }

    // Testimonial orbs
    orbs.forEach((orb, index) => {
      const speed = (index + 1) * 0.05;
      const y = scrollY * speed;
      orb.style.transform = `translateY(${y}px)`;
    });

    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  updateParallax();
}

// ===== COUNTER ANIMATION =====
function initCounters() {
  if (CONFIG.reducedMotion) {
    $$('.hero-stat .number[data-count]').forEach(el => {
      el.textContent = el.dataset.count;
    });
    return;
  }

  const counters = $$('.hero-stat .number[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
  const target = parseFloat(element.dataset.count);
  const isDecimal = element.dataset.count.includes('.');
  const hasPlus = element.dataset.count.includes('+');
  const duration = CONFIG.counterDuration;
  const startTime = performance.now();

  const animate = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    
    const current = target * eased;
    
    if (isDecimal) {
      element.textContent = current.toFixed(1) + (hasPlus ? '+' : '');
    } else {
      element.textContent = Math.floor(current) + (hasPlus ? '+' : '');
    }

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      element.textContent = element.dataset.count;
    }
  };

  requestAnimationFrame(animate);
}

// ===== SERVICE CARD TILT EFFECT =====
function initServiceCardTilt() {
  if (CONFIG.reducedMotion) return;

  const cards = $$('.service-card');
  
  cards.forEach(card => {
    let rafId = null;
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;

    const animate = () => {
      currentX = lerp(currentX, targetX, 0.15);
      currentY = lerp(currentY, targetY, 0.15);
      
      const rotateX = clamp(currentY, -10, 10);
      const rotateY = clamp(-currentX, -10, 10);
      
      card.style.transform = `translateY(-10px) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      
      if (Math.abs(currentX - targetX) > 0.1 || Math.abs(currentY - targetY) > 0.1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      targetX = x / 15;
      targetY = y / 15;
      
      if (!rafId) rafId = requestAnimationFrame(animate);
    });

    card.addEventListener('mouseleave', () => {
      targetX = 0;
      targetY = 0;
      card.style.transform = '';
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    });

    // Touch support
    card.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const rect = card.getBoundingClientRect();
        const x = touch.clientX - rect.left - rect.width / 2;
        const y = touch.clientY - rect.top - rect.height / 2;
        
        targetX = x / 20;
        targetY = y / 20;
        
        if (!rafId) rafId = requestAnimationFrame(animate);
      }
    }, { passive: true });

    card.addEventListener('touchend', () => {
      targetX = 0;
      targetY = 0;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    });
  });
}

// ===== GALLERY ITEM INTERACTIONS =====
function initGalleryInteractions() {
  const items = $$('.gallery-item');
  
  items.forEach(item => {
    // Add keyboard support
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', item.querySelector('img')?.alt || 'Imagem da galeria');

    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.click();
      }
    });
  });
}

// ===== TESTIMONIAL CARDS STAGGER =====
function initTestimonialStagger() {
  if (CONFIG.reducedMotion) {
    $$('.testimonial-card').forEach(el => el.classList.add('active'));
    return;
  }

  const cards = $$('.testimonial-card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('active');
        }, index * CONFIG.staggerDelay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  cards.forEach(card => observer.observe(card));
}

// ===== SCROLL TO TOP =====
function initScrollToTop() {
  const btn = $('#scroll-top');
  if (!btn) return;

  let ticking = false;

  const updateVisibility = throttle(() => {
    if (window.scrollY > 500) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, 100);

  window.addEventListener('scroll', updateVisibility, { passive: true });
  updateVisibility();

  btn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: CONFIG.reducedMotion ? 'auto' : 'smooth'
    });
  });
}

// ===== BUTTON RIPPLE EFFECT =====
function initButtonRipple() {
  if (CONFIG.reducedMotion) return;

  $$('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement('span');
      ripple.className = 'btn-ripple';
      ripple.style.cssText = `
        position: absolute;
        width: 20px;
        height: 20px;
        background: rgba(255,255,255,0.3);
        border-radius: 50%;
        transform: translate(-50%, -50%) scale(0);
        animation: ripple 0.6s ease-out forwards;
        pointer-events: none;
        left: ${x}px;
        top: ${y}px;
      `;

      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // Add ripple animation to CSS if not exists
  if (!document.getElementById('ripple-style')) {
    const style = document.createElement('style');
    style.id = 'ripple-style';
    style.textContent = `
      @keyframes ripple {
        to {
          transform: translate(-50%, -50%) scale(20);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

// ===== FORM ENHANCEMENTS =====
function initForms() {
  const newsletterForm = $('.footer-newsletter-form');
  if (newsletterForm) {
    const input = newsletterForm.querySelector('input');
    
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (input.value.trim()) {
        input.value = '';
        showToast('Obrigado por subscrever a nossa newsletter!');
      }
    });

    // Floating label effect
    input.addEventListener('focus', () => {
      input.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', () => {
      if (!input.value) {
        input.parentElement.classList.remove('focused');
      }
    });
  }
}

// ===== TOAST NOTIFICATION =====
function showToast(message, duration = 3000) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%) translateY(100px);
    background: var(--dark);
    color: var(--white);
    padding: 16px 28px;
    border-radius: 12px;
    box-shadow: var(--shadow-xl);
    z-index: var(--z-toast);
    opacity: 0;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    font-weight: 500;
  `;

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(100px)';
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

// ===== CURRENT YEAR =====
function initCurrentYear() {
  const yearEl = $('#year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

// ===== INITIALIZATION =====
function init() {
  // Core functionality
  initScrollProgress();
  initNavbar();
  initMobileMenu();
  initSmoothScroll();
  initRevealAnimations();
  initParallax();
  initCounters();
  initServiceCardTilt();
  initGalleryInteractions();
  initTestimonialStagger();
  initScrollToTop();
  initButtonRipple();
  initForms();
  initCurrentYear();

  // Announce load
  console.log('🌈 Força da Cor — Website carregado com sucesso!');
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Handle page visibility for performance
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pause animations if needed
  }
});