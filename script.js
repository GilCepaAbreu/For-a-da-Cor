// ===== NAVBAR SCROLL BEHAVIOR =====
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.scrollY;
  
  if (currentScroll > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  
  lastScroll = currentScroll;
});

// ===== MOBILE MENU =====
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');
const navOverlay = document.getElementById('nav-overlay');

function toggleMenu() {
  navToggle.classList.toggle('active');
  navLinks.classList.toggle('active');
  navOverlay.classList.toggle('active');
  document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
}

navToggle.addEventListener('click', toggleMenu);
navOverlay.addEventListener('click', toggleMenu);

// Close menu on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    if (navLinks.classList.contains('active')) {
      toggleMenu();
    }
  });
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const offset = 80;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// ===== SCROLL REVEAL ANIMATIONS =====
function revealElements() {
  const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  
  reveals.forEach(element => {
    const windowHeight = window.innerHeight;
    const revealTop = element.getBoundingClientRect().top;
    const revealPoint = 120;
    
    if (revealTop < windowHeight - revealPoint) {
      element.classList.add('active');
    }
  });
}

window.addEventListener('scroll', revealElements);
window.addEventListener('load', revealElements);

// ===== SCROLL TO TOP BUTTON =====
const scrollTopBtn = document.getElementById('scroll-top');

window.addEventListener('scroll', () => {
  if (window.scrollY > 500) {
    scrollTopBtn.classList.add('visible');
  } else {
    scrollTopBtn.classList.remove('visible');
  }
});

scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

// ===== NAVBAR ACTIVE LINK HIGHLIGHT =====
const sections = document.querySelectorAll('section[id]');

function highlightNavLink() {
  const scrollY = window.scrollY + 100;
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');
    const navLink = document.querySelector(`.nav-links a[href="#${sectionId}"]`);
    
    if (navLink && scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
      document.querySelectorAll('.nav-links a').forEach(link => {
        link.style.opacity = '';
      });
      navLink.style.opacity = '1';
    }
  });
}

window.addEventListener('scroll', highlightNavLink);

// ===== COUNTER ANIMATION FOR HERO STATS =====
function animateCounters() {
  const counters = document.querySelectorAll('.hero-stat .number');
  
  counters.forEach(counter => {
    const target = counter.textContent;
    const isDecimal = target.includes('.');
    const hasPlus = target.includes('+');
    const numTarget = parseFloat(target);
    
    let current = 0;
    const increment = numTarget / 60;
    const duration = 2000;
    const stepTime = duration / 60;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= numTarget) {
        counter.textContent = target;
        clearInterval(timer);
      } else {
        if (isDecimal) {
          counter.textContent = current.toFixed(1) + (hasPlus ? '+' : '');
        } else {
          counter.textContent = Math.floor(current) + (hasPlus ? '+' : '');
        }
      }
    }, stepTime);
  });
}

// Trigger counter animation when hero is visible
const heroObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounters();
      heroObserver.disconnect();
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
  heroObserver.observe(heroStats);
}

// ===== PARALLAX EFFECT ON HERO SHAPES =====
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const shapes = document.querySelectorAll('.hero-shape');
  
  shapes.forEach((shape, index) => {
    const speed = (index + 1) * 0.15;
    shape.style.transform = `translateY(${scrollY * speed}px)`;
  });
});

// ===== SERVICE CARD TILT EFFECT =====
const serviceCards = document.querySelectorAll('.service-card');

serviceCards.forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    
    card.style.transform = `translateY(-8px) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// ===== GALLERY ITEM STAGGER ANIMATION =====
const galleryObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('active');
      }, index * 150);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.gallery-item').forEach(item => {
  galleryObserver.observe(item);
});

// ===== TESTIMONIAL CARD STAGGER =====
const testimonialObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('active');
      }, index * 200);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.testimonial-card').forEach(card => {
  testimonialObserver.observe(card);
});

console.log('🌈 Força da Cor — Website carregado com sucesso!');
