/* responsive.js - Global Mobile Interactions for LYRA Admin Portal */

(function() {
  function initMobileMenu() {
    if (window.innerWidth > 900) return;

    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    if (!sidebar || !mainContent) return;

    // 1. Create Mobile Header
    const mobileHeader = document.createElement('div');
    mobileHeader.className = 'mobile-header';
    
    const menuToggle = document.createElement('button');
    menuToggle.className = 'menu-toggle';
    menuToggle.innerHTML = '☰'; // Hamburger icon
    
    // Use the logo from the sidebar if possible
    const sidebarLogo = sidebar.querySelector('.brand-logo img');
    const mobileLogo = document.createElement('img');
    mobileLogo.className = 'mobile-logo';
    mobileLogo.src = sidebarLogo ? sidebarLogo.src : 'LyraEsportsLogo.png';

    // Chat Page Specific: Channel Toggle
    const isChatPage = window.location.pathname.includes('admin-chat.html');
    let channelToggle = null;
    if (isChatPage) {
      channelToggle = document.createElement('button');
      channelToggle.className = 'menu-toggle';
      channelToggle.innerHTML = '💬';
      channelToggle.style.fontSize = '1.2rem';
    }

    mobileHeader.appendChild(menuToggle);
    mobileHeader.appendChild(mobileLogo);
    if (channelToggle) mobileHeader.appendChild(channelToggle);
    else {
      const spacer = document.createElement('div');
      spacer.style.width = '40px';
      mobileHeader.appendChild(spacer);
    }

    document.body.prepend(mobileHeader);

    // 2. Create Overlay
    const overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    document.body.appendChild(overlay);

    // 3. Toggle Logic
    function toggleMenu() {
      sidebar.classList.toggle('mobile-open');
      overlay.classList.toggle('active');
      document.body.style.overflow = sidebar.classList.contains('mobile-open') ? 'hidden' : '';
    }

    menuToggle.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', () => {
       if (sidebar.classList.contains('mobile-open')) toggleMenu();
       if (isChatPage) {
         const channels = document.querySelector('.chat-channels');
         if (channels.classList.contains('mobile-open')) {
           channels.classList.remove('mobile-open');
           overlay.classList.remove('active');
         }
       }
    });

    // Chat Logic
    if (isChatPage && channelToggle) {
      const channels = document.querySelector('.chat-channels');
      channelToggle.addEventListener('click', () => {
        channels.classList.toggle('mobile-open');
        overlay.classList.toggle('active');
      });

      // Auto-close channels when a link is clicked
      channels.addEventListener('click', (e) => {
        if (e.target.closest('.channel-link')) {
          channels.classList.remove('mobile-open');
          overlay.classList.remove('active');
        }
      });
    }

    // Handle logout from mobile sidebar
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('lyra_user');
        window.location.href = 'index.html';
      });
    }
  }

  // Run on load and resize
  window.addEventListener('load', initMobileMenu);
  
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Re-init or handle state if needed
      const header = document.querySelector('.mobile-header');
      if (window.innerWidth > 900 && header) {
        header.remove();
        document.querySelector('.menu-overlay').remove();
        document.querySelector('.sidebar').classList.remove('mobile-open');
      } else if (window.innerWidth <= 900 && !header) {
        initMobileMenu();
      }
    }, 250);
  });
})();
