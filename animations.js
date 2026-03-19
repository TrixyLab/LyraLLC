// animations.js - IntersectionObserver for smooth scroll reveals

document.addEventListener('DOMContentLoaded', () => {
  // Page Transition Fade-Out on link clicks
  document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function(e) {
      if (this.target === '_blank' || this.getAttribute('href').startsWith('#')) return;
      
      const destination = this.href;
      if (destination && destination.startsWith(window.location.origin)) {
        e.preventDefault();
        document.body.classList.add('fade-out');
        setTimeout(() => {
          window.location.href = destination;
        }, 300); // match transition duration
      }
    });
  });

  // Select all major sections and specific cards/elements that should animate
  const targets = document.querySelectorAll(`
    section, 
    .player-card, 
    .game-card, 
    .news-item, 
    .news-featured,
    .merch-inner, 
    .page-title, 
    .roster-header,
    .hero-content,
    .auth-container,
    .admin-container,
    .dashboard-grid
  `);
  
  // Add base class
  targets.forEach(el => {
    el.classList.add('animate-on-scroll');
  });

  // Setup the observer
  const observerOptions = {
    threshold: 0.1, // Trigger when 10% visible
    rootMargin: '0px 0px -50px 0px' // Trigger slightly before coming into view
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, observerOptions);

  // Group elements tightly by proximity to stagger their deployment
  let delayCounter = 0;
  
  targets.forEach((target, index) => {
    if (target.matches('.player-card, .game-card, .news-item')) {
      target.style.transitionDelay = `${delayCounter}ms`;
      delayCounter += 75;
      
      if (delayCounter > 600) delayCounter = 0;
    } else {
      delayCounter = 0;
    }
    
    observer.observe(target);
  });
});
