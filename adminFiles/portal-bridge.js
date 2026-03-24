/**
 * portal-bridge.js
 * Standardized integration for Lyra Admin modules running inside the Portal Shell.
 */
(function () {
    // ALWAYS hide the sidebar immediately to prevent any flash, regardless of shell detection.
    // This covers the race condition where the shell hasn't propagated LyraMeeting yet.
    const immediateStyle = document.createElement('style');
    immediateStyle.id = 'portal-bridge-immediate';
    immediateStyle.textContent = `
        .sidebar { display: none !important; }
        .main-content { margin-left: 0 !important; width: 100% !important; padding-top: 2rem !important; }
        .header { padding-left: 2rem !important; }
        .main-bg { left: 0 !important; width: 100% !important; }
    `;
    document.head.appendChild(immediateStyle);

    const isIframe = window.self !== window.top;
    let inShell = false;
    try {
        inShell = isIframe && window.parent && window.parent.LyraMeeting;
    } catch (e) {
        // Cross-origin access blocked, but we're still in an iframe!
        console.warn("Portal Bridge: Direct parent access blocked (Cross-Origin). Navigation will use fallback mode.");
    }

    // INTERCEPT LINKS
    if (isIframe) {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            // Ignore if no link, or if link is just an anchor / internal action
            if (link && link.href && !link.classList.contains('no-shell')) {
                const hrefAttr = link.getAttribute('href');
                if (hrefAttr === '#' || hrefAttr.startsWith('javascript:')) return;

                try {
                  const parsed = new URL(link.href);
                  const targetPage = parsed.pathname.split('/').pop();
                  
                  // Only intercept links to OTHER admin files
                  if (targetPage.includes('admin-') && !targetPage.includes('admin-shell.html')) {
                      e.preventDefault();
                      window.parent.postMessage({ type: 'NAVIGATE', page: targetPage + parsed.search }, '*');
                  }
                } catch(e) {}
            }
        });
        
        if (inShell) console.log("Portal Bridge: Shell integration active.");
    }

    if (!isIframe && !window.location.pathname.includes('admin-shell.html')) {
        // AUTO-WRAP INTO SHELL - ONLY if we are at the top level and it's an admin page.
        const page = window.location.pathname.split('/').pop();
        if (page.startsWith('admin-')) {
            window.location.href = 'admin-shell.html?p=' + page + window.location.search;
        }
    } else {
        // Restore sidebar if we are standalone or in an iframe (shell takes care of its own)
        const bridgeStyle = document.getElementById('portal-bridge-immediate');
        if (bridgeStyle) bridgeStyle.remove();
    }
})();
