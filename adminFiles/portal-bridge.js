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

    const inShell = window.self !== window.top && window.parent.LyraMeeting;

    if (inShell) {
        // Intercept local links to stay within the shell
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href && !link.classList.contains('no-shell')) {
                const url = new URL(link.href);
                const targetPage = url.pathname.split('/').pop();
                if (targetPage.includes('admin-') && !targetPage.includes('admin-shell.html')) {
                    e.preventDefault();
                    // Tell parent to navigate
                    window.parent.postMessage({ type: 'NAVIGATE', page: targetPage + url.search }, '*');
                }
            }
        });

        console.log("Portal Bridge: Shell integration active.");
    } else if (!window.location.pathname.includes('admin-shell.html')) {
        // AUTO-WRAP INTO SHELL
        const page = window.location.pathname.split('/').pop();
        if (page.startsWith('admin-')) {
            window.location.href = 'admin-shell.html?p=' + page + window.location.search;
        }
    } else {
        // Running standalone (not in shell, not an admin page) - restore sidebar
        const bridgeStyle = document.getElementById('portal-bridge-immediate');
        if (bridgeStyle) bridgeStyle.remove();
    }
})();
