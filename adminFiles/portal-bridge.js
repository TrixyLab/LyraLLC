/**
 * portal-bridge.js
 * Standardized integration for Lyra Admin modules running inside the Portal Shell.
 */
(function() {
    const inShell = window.self !== window.top && window.parent.LyraMeeting;
    
    if (inShell) {
        // 1. Hide local sidebar and adjust main content
        const style = document.createElement('style');
        style.textContent = `
            .sidebar { display: none !important; }
            .main-content { margin-left: 0 !important; width: 100% !important; padding-top: 2rem !important; }
            .header { padding-left: 2rem !important; }
            .main-bg { left: 0 !important; width: 100% !important; }
        `;
        document.head.appendChild(style);
        
        // 2. Intercept local links to stay within the shell
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href && link.href.includes('admin-') && !link.classList.contains('no-shell')) {
                const targetPage = link.href.split('/').pop();
                if (targetPage.startsWith('admin-')) {
                    e.preventDefault();
                    // Tell parent to navigate
                    window.parent.postMessage({ type: 'NAVIGATE', page: targetPage }, '*');
                }
            }
        });

        console.log("Portal Bridge: Shell integration active.");
    }
})();
