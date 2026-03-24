// supabase-config.js

// Replace these with your actual Supabase URL and Anon Key
const SUPABASE_URL = "https://gmgsauxnyhodecdocwkz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtZ3NhdXhueWhvZGVjZG9jd2t6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMTgwODUsImV4cCI6MjA4OTg5NDA4NX0.DBGN8aVUPxQlnUR2v9qAStQ9g-gLys6D0zSbybHdPUw";

// Initialize Supabase Client (assuming CDN is loaded)
window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Global Chat Notification System ---
(function () {
  const currentUser = localStorage.getItem('lyra_user');
  if (!currentUser) return; // Only notify logged-in admins
  if (localStorage.getItem('lyra_notifications') === 'disabled') return;

  // Create Toast Container
  const toastContainer = document.createElement('div');
  toastContainer.id = 'lyra-toast-container';
  toastContainer.style.position = 'fixed';
  toastContainer.style.bottom = '20px';
  toastContainer.style.right = '20px';
  toastContainer.style.zIndex = '99999';
  toastContainer.style.display = 'flex';
  toastContainer.style.flexDirection = 'column';
  toastContainer.style.gap = '10px';
  document.body.appendChild(toastContainer);

  const activeListeners = new Set();
  const bootTime = Date.now();

  // --- Global Notification & Mention Logic ---
  const notifyBarId = 'lyra-red-notify-bar';
  function ensureNotifyBar() {
    let bar = document.getElementById(notifyBarId);
    if (!bar) {
      bar = document.createElement('div');
      bar.id = notifyBarId;
      bar.style.position = 'fixed';
      bar.style.top = '-70px';
      bar.style.left = '0';
      bar.style.width = '100%';
      bar.style.height = '60px';
      bar.style.background = 'var(--red, #E8002D)';
      bar.style.color = 'white';
      bar.style.zIndex = '10000';
      bar.style.display = 'flex';
      bar.style.alignItems = 'center';
      bar.style.justifyContent = 'space-between';
      bar.style.padding = '0 2rem';
      bar.style.fontFamily = "'Barlow Condensed', sans-serif";
      bar.style.fontWeight = '700';
      bar.style.textTransform = 'uppercase';
      bar.style.letterSpacing = '0.1em';
      bar.style.transition = 'top 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)';
      bar.style.boxShadow = '0 4px 15px rgba(232, 0, 45, 0.4)';

      bar.innerHTML = `
        <div style="display:flex; align-items:center; gap:1rem;">
          <span style="font-size:1.5rem;">🔔</span>
          <span id="lyra-notify-text">New Action Required</span>
        </div>
        <button id="lyra-close-notify" style="background:none; border:1px solid white; color:white; padding:0.3rem 0.8rem; cursor:pointer; font-size:0.8rem; border-radius:4px; font-weight:700;">DISMISS</button>
      `;
      document.body.appendChild(bar);

      document.getElementById('lyra-close-notify').onclick = (e) => {
        e.stopPropagation();
        bar.style.top = '-70px';
      };

      bar.onclick = () => {
        window.focus();
        window.location.href = 'admin-chat.html';
      };
    }
    return bar;
  }

  function triggerRedNotify(text) {
    const bar = ensureNotifyBar();
    document.getElementById('lyra-notify-text').innerText = text;
    bar.style.top = '0';
    if (!text.includes('MENTIONED')) {
      setTimeout(() => { if (bar.style.top === '0px') bar.style.top = '-70px'; }, 8000);
    }
  }

  function showToast(title, author, text, linkUrl) {
    try {
      const audio = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVtvT19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXw==");
      audio.volume = 0.5;
      audio.play().catch(() => { });
    } catch (e) { }

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body: `${author}: ${text}`, icon: 'LyraEsportsLogo.png' })
        .onclick = () => { window.focus(); window.location.href = linkUrl; };
    }

    const toast = document.createElement('div');
    toast.style = "background:rgba(232,0,45,0.9); backdrop-filter:blur(10px); color:#fff; padding:15px 20px; border-radius:8px; box-shadow:0 10px 30px rgba(0,0,0,0.5); font-family:'Barlow',sans-serif; min-width:250px; max-width:350px; transform:translateX(120%); transition:transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease; opacity:0; cursor:pointer;";
    toast.onclick = () => { window.location.href = linkUrl; };
    toast.innerHTML = `<div style="font-family:'Barlow Condensed',sans-serif; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; font-size:0.8rem; margin-bottom:5px; opacity:0.8;">${title}</div><div style="font-weight:600; margin-bottom: 2px;">${author}</div><div style="font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${text}</div>`;
    toastContainer.appendChild(toast);
    requestAnimationFrame(() => { toast.style.transform = 'translateX(0)'; toast.style.opacity = '1'; });
    setTimeout(() => { toast.style.transform = 'translateX(120%)'; toast.style.opacity = '0'; setTimeout(() => toast.remove(), 400); }, 5000);
  }

  // Permission logic - ONLY ASK ONCE per session or if not granted
  if ("Notification" in window && Notification.permission === "default") {
    if (!sessionStorage.getItem('lyra_notification_requested')) {
      document.addEventListener('click', function ask() {
        Notification.requestPermission();
        sessionStorage.setItem('lyra_notification_requested', 'true');
        document.removeEventListener('click', ask);
      }, { once: true });
    }
  }

  // --- Admin Presence System using Supabase Realtime ---
  const globalChannel = supabase.channel('lyra_global');
  globalChannel.on('presence', { event: 'sync' }, () => {
    if (typeof window.updatePresenceUI === 'function') window.updatePresenceUI();
  }).subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      const savedStatus = localStorage.getItem('lyra_admin_status') || 'online';
      await globalChannel.track({ user: currentUser, status: savedStatus });
      // Also write to DB for persistent view
      await supabase.from('lyra_presence').upsert({ id: currentUser, status: savedStatus });
    }
  });

  // Handle window closing / disconnect
  window.addEventListener('beforeunload', () => {
    // Hard to guarantee execution, but attempt to set offline
    supabase.from('lyra_presence').upsert({ id: currentUser, status: 'offline' }).then(() => { });
  });

  // --- Chat Messages Listener ---
  supabase.channel('global_chat_messages')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, payload => {
      const msg = payload.new;
      if (msg.author && msg.author.toLowerCase() === currentUser.toLowerCase()) return;

      const ch = msg.channel_id;
      let isMentioned = false;
      const msgText = (msg.text || "").toLowerCase();
      if (currentUser && (msgText.includes('@' + currentUser.toLowerCase()) || msgText.includes('@everyone'))) {
        isMentioned = true;
      }

      const title = isMentioned ? 'MENTIONED: ' + msg.author : `New Message in #${ch}`;
      const body = isMentioned ? `You were mentioned in #${ch}` : `${msg.author}: ${msg.text || "Sent an image"}`;

      showToast(title, msg.author, body, 'admin-chat.html');
      triggerRedNotify(isMentioned ? `🚨 YOU WERE MENTIONED BY ${msg.author.toUpperCase()} in #${ch.toUpperCase()}` : `💬 NEW MESSAGE IN #${ch.toUpperCase()}`);
    })
    .subscribe();

  // --- Applications Listener ---
  supabase.channel('global_applications')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'lyra_applications' }, payload => {
      const app = payload.new;
      const isOnApps = window.location.pathname.includes('admin-dashboard.html') || window.location.pathname.includes('admin-access.html');
      if (isOnApps) return;

      const targetUrl = app.rolevalue === 'adminAccess' ? 'admin-access.html' : 'admin-dashboard.html';
      showToast('New Application Received', app.name || 'Applicant', `Role: ${app.role || 'Member'}`, targetUrl);
      triggerRedNotify(`📝 NEW APPLICATION: ${app.name.toUpperCase()}`);
    })
    .subscribe();

  // --- Access Guard ---
  if (currentUser && currentUser.toLowerCase() !== 'admin') {
    // Check if user is in approved admins using REST
    supabase.from('lyra_approved_admins').select('ign').then(({ data, error }) => {
      if (error || !data) return;
      const approvedAdmins = data.map(d => d.ign.toLowerCase());
      if (!approvedAdmins.includes(currentUser.toLowerCase())) {
        localStorage.removeItem('lyra_user');
        localStorage.removeItem('lyra_admin_status');
        window.location.href = 'login.html?revoked=true';
      }
    });
  }

  // --- Admin Status Custom Dropdown ---
  function initAdminStatus() {
    const statusSelect = document.getElementById('adminStatus');
    if (!statusSelect) return;
    
    // Hide native select
    statusSelect.style.display = 'none';

    let container = document.getElementById('lyra-custom-status');
    if (!container) {
      container = document.createElement('div');
      container.id = 'lyra-custom-status';
      container.style.position = 'relative';
      container.style.width = '100%';
      statusSelect.parentNode.insertBefore(container, statusSelect.nextSibling);

      const btn = document.createElement('button');
      btn.className = 'presence-btn';
      btn.innerHTML = `<span id="s-btn-text" style="display:flex;align-items:center;gap:8px;"></span> <span style="font-size:0.8rem; color:var(--gray-600);">▼</span>`;
      
      const menu = document.createElement('div');
      menu.className = 'presence-menu';
      menu.id = 'lyra-status-menu';

      const options = [
        { val: 'online', label: 'Online', dot: 'online' },
        { val: 'away', label: 'Away', dot: 'away' },
        { val: 'dnd', label: 'Do Not Disturb', dot: 'dnd' }
      ];

      options.forEach(opt => {
        menu.innerHTML += `
          <div class="presence-item status-opt" data-val="${opt.val}" style="cursor:pointer;">
            <div class="p-dot ${opt.dot}"></div>
            <div class="p-name" style="text-transform:none;">${opt.label}</div>
          </div>
        `;
      });

      btn.onclick = (e) => {
        e.preventDefault();
        menu.classList.toggle('open');
      };

      container.appendChild(btn);
      container.appendChild(menu);

      document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) menu.classList.remove('open');
      });

      menu.addEventListener('click', async (e) => {
        const item = e.target.closest('.status-opt');
        if (item) {
          const val = item.getAttribute('data-val');
          localStorage.setItem('lyra_admin_status', val);
          menu.classList.remove('open');
          updateStatusUI(val);

          supabase.from('lyra_presence').upsert({ id: currentUser, status: val }).then(()=>{});
          try {
            await globalChannel.track({ user: currentUser, status: val });
          } catch(err) { }
        }
      });
    }

    window.addEventListener('storage', (e) => {
      if (e.key === 'lyra_admin_status') {
        const val = e.newValue;
        if (val) {
          updateStatusUI(val);
          globalChannel.track({ user: currentUser, status: val }).catch(console.error);
        }
      }
    });

    function updateStatusUI(val) {
      const btnText = document.getElementById('s-btn-text');
      if (btnText) {
        if (val === 'online') btnText.innerHTML = `<div class="p-dot online"></div> <span style="font-family:'Barlow Condensed',sans-serif; text-transform:uppercase; letter-spacing:0.1em; font-weight:700;">Online</span>`;
        else if (val === 'away') btnText.innerHTML = `<div class="p-dot away"></div> <span style="font-family:'Barlow Condensed',sans-serif; text-transform:uppercase; letter-spacing:0.1em; font-weight:700;">Away</span>`;
        else if (val === 'dnd') btnText.innerHTML = `<div class="p-dot dnd"></div> <span style="font-family:'Barlow Condensed',sans-serif; text-transform:uppercase; letter-spacing:0.1em; font-weight:700;">Do Not Disturb</span>`;
      }
    }

    const savedStatus = localStorage.getItem('lyra_admin_status') || 'online';
    updateStatusUI(savedStatus);
  }
  
  // Need to ensure the style block exists before rendering the status dropdown
  // so we call this later inside a DOMContentLoaded event or we just inject CSS manually once:
  if (!document.getElementById('lyra-presence-style')) {
    const style = document.createElement('style');
    style.id = 'lyra-presence-style';
    style.innerHTML = `
      .presence-btn { width: 100%; padding: 0.8rem 1rem; background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.1); color: var(--white); font-family: 'Barlow Condensed', sans-serif; font-size: 1rem; text-transform: uppercase; letter-spacing: 0.1em; border-radius: 4px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s ease; outline: none; }
      .presence-btn:hover { border-color: var(--red); background: rgba(232,0,45,0.1); }
      .presence-menu { position: absolute; top: calc(100% + 5px); left: 0; width: 100%; background: rgba(20,20,20,0.95); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); z-index: 1000; overflow-y: auto; max-height: 300px; opacity: 0; pointer-events: none; transform: translateY(-10px); transition: all 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28); }
      .presence-menu.open { opacity: 1; pointer-events: auto; transform: translateY(0); }
      .presence-item { padding: 0.8rem 1rem; display: flex; align-items: center; gap: 0.8rem; border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.2s; cursor: default; }
      .presence-item:last-child { border-bottom: none; }
      .presence-item:hover { background: rgba(255,255,255,0.05); }
      .p-dot { width: 8px; height: 8px; border-radius: 50%; box-shadow: 0 0 8px currentColor; }
      .p-dot.online { background: #00E85D; color: #00E85D; }
      .p-dot.away { background: #FFD700; color: #FFD700; }
      .p-dot.dnd { background: #E8002D; color: #E8002D; }
      .p-dot.offline { background: #555555; box-shadow: none; }
      .p-name { font-weight: 600; font-size: 0.9rem; flex: 1; text-transform: uppercase; letter-spacing: 0.05em; font-family: 'Barlow Condensed', sans-serif; }
      .p-status-lbl { font-size: 0.75rem; color: var(--gray-600); font-family: 'Barlow Condensed', sans-serif; text-transform: uppercase; letter-spacing: 0.1em; }
    `;
    document.head.appendChild(style);
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminStatus);
  } else {
    initAdminStatus();
  }

  // --- Active Users List Population (if element exists) ---
  // --- Active Users List Population (if element exists) ---
  let adminNamesCache = new Set();
  
  function initPresenceSystem() {
    const presenceList = document.getElementById('presenceList');
    if (!presenceList) return;

    supabase.from('lyra_approved_admins').select('ign, name').then(({ data }) => {
      if (data) {
        adminNamesCache = new Set(data.map(d => (d.ign || d.name).toLowerCase()));
      }

      // HIDE THE ORIGINAL SELECT ELEMENT
      presenceList.style.display = 'none';

      // INJECT PREMIUM UI CONTAINER
      let container = document.getElementById('lyra-custom-presence');
      if (!container) {
        container = document.createElement('div');
        container.id = 'lyra-custom-presence';
        container.style.position = 'relative';
        container.style.width = '100%';
        presenceList.parentNode.insertBefore(container, presenceList.nextSibling);

        if (!document.getElementById('lyra-presence-style')) {
           const style = document.createElement('style');
           style.id = 'lyra-presence-style';
           style.innerHTML = `
             .presence-btn { width: 100%; padding: 0.8rem 1rem; background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.1); color: var(--white); font-family: 'Barlow Condensed', sans-serif; font-size: 1rem; text-transform: uppercase; letter-spacing: 0.1em; border-radius: 4px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s ease; outline: none; }
             .presence-btn:hover { border-color: var(--red); background: rgba(232,0,45,0.1); }
             .presence-menu { position: absolute; top: calc(100% + 5px); left: 0; width: 100%; background: rgba(20,20,20,0.95); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); z-index: 1000; overflow-y: auto; max-height: 300px; opacity: 0; pointer-events: none; transform: translateY(-10px); transition: all 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28); }
             .presence-menu.open { opacity: 1; pointer-events: auto; transform: translateY(0); }
             .presence-item { padding: 0.8rem 1rem; display: flex; align-items: center; gap: 0.8rem; border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.2s; cursor: default; }
             .presence-item:last-child { border-bottom: none; }
             .presence-item:hover { background: rgba(255,255,255,0.05); }
             .p-dot { width: 8px; height: 8px; border-radius: 50%; box-shadow: 0 0 8px currentColor; }
             .p-dot.online { background: #00E85D; color: #00E85D; }
             .p-dot.away { background: #FFD700; color: #FFD700; }
             .p-dot.dnd { background: #E8002D; color: #E8002D; }
             .p-dot.offline { background: #555555; box-shadow: none; }
             .p-name { font-weight: 600; font-size: 0.9rem; flex: 1; text-transform: uppercase; letter-spacing: 0.05em; font-family: 'Barlow Condensed', sans-serif; }
             .p-status-lbl { font-size: 0.75rem; color: var(--gray-600); font-family: 'Barlow Condensed', sans-serif; text-transform: uppercase; letter-spacing: 0.1em; }
           `;
           document.head.appendChild(style);
        }

        const btn = document.createElement('button');
        btn.className = 'presence-btn';
        btn.innerHTML = `<span id="p-btn-text">View Team Online</span> <span style="font-size:0.8rem; color:var(--gray-600);">▼</span>`;
        
        const menu = document.createElement('div');
        menu.className = 'presence-menu';
        menu.id = 'lyra-presence-menu';

        btn.onclick = (e) => {
          e.preventDefault();
          menu.classList.toggle('open');
        };

        document.addEventListener('click', (e) => {
          if (!container.contains(e.target)) {
            menu.classList.remove('open');
          }
        });

        container.appendChild(btn);
        container.appendChild(menu);
      }

      window.updatePresenceUI = () => {
        const state = globalChannel.presenceState();
        let onlineCount = 0;
        const displayMap = new Map();

        adminNamesCache.forEach(name => displayMap.set(name, { status: 'offline', originalName: name }));

        Object.keys(state).forEach(key => {
          state[key].forEach(p => {
            if (p.user) {
              const normKey = p.user.toLowerCase();
              if (adminNamesCache.has(normKey) || p.user === 'Admin') {
                const currentStat = displayMap.get(normKey)?.status;
                if (currentStat !== 'dnd' && currentStat !== 'away') {
                  displayMap.set(normKey, { status: p.status, originalName: p.user });
                }
              }
            }
          });
        });

        displayMap.forEach((data, key) => {
          if (data.status !== 'offline') onlineCount++;
        });

        const sortedEntries = Array.from(displayMap.entries()).sort((a, b) => {
          const statusOrder = { online: 0, away: 1, dnd: 2, offline: 3 };
          return (statusOrder[a[1].status] || 3) - (statusOrder[b[1].status] || 3);
        });

        const btnText = document.getElementById('p-btn-text');
        if (btnText) btnText.innerHTML = `View Team <span style="color:var(--red); font-weight:700; margin-left:5px;">(${onlineCount} Online)</span>`;
        
        const menu = document.getElementById('lyra-presence-menu');
        if (menu) {
          menu.innerHTML = '';
          sortedEntries.forEach(([name, data]) => {
            const displayName = data.originalName;
            let dotClass = 'offline'; let label = 'Offline';
            if (data.status === 'online') { dotClass = 'online'; label = 'Online'; }
            else if (data.status === 'away') { dotClass = 'away'; label = 'Away'; }
            else if (data.status === 'dnd') { dotClass = 'dnd'; label = 'DND'; }
            
            menu.innerHTML += `
              <div class="presence-item">
                <div class="p-dot ${dotClass}"></div>
                <div class="p-name">${displayName}</div>
                <div class="p-status-lbl">${label}</div>
              </div>
            `;
          });
        }
      };

      if (typeof window.updatePresenceUI === 'function') window.updatePresenceUI();
    });
  }
  initPresenceSystem();

  // --- System Broadcast / Update System ---
  supabase.channel('global_broadcasts')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'lyra_system_broadcast' }, payload => {
      const data = payload.new || payload.old;
      if (!data || !data.active) {
        const existing = document.getElementById('lyra-system-update-bar');
        if (existing) existing.remove();
        return;
      }
      const lastSeen = localStorage.getItem('lyra_last_broadcast_id');
      if (lastSeen === data.id && data.dismissible !== false) return;
      showSystemUpdateBar(data);
    })
    .subscribe();

  // Initial fetch for active broadcast
  supabase.from('lyra_system_broadcast').select('*').eq('active', true).then(({ data }) => {
    if (data && data.length > 0) {
      const broadcast = data[0];
      const lastSeen = localStorage.getItem('lyra_last_broadcast_id');
      if (lastSeen === broadcast.id && broadcast.dismissible !== false) return;
      showSystemUpdateBar(broadcast);
    }
  });

  function showSystemUpdateBar(data) {
    let bar = document.getElementById('lyra-system-update-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'lyra-system-update-bar';
      bar.style = "position:fixed; top:0; left:0; width:100%; height:50px; background:linear-gradient(90deg, #E8002D, #a80020); color:white; z-index:20000; display:flex; align-items:center; justify-content:center; gap:2rem; font-family:'Barlow Condensed',sans-serif; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; box-shadow:0 4px 20px rgba(0,0,0,0.5); border-bottom:2px solid rgba(255,255,255,0.2); animation: slideDown 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.28);";
      document.body.appendChild(bar);
      document.body.style.paddingTop = '50px';
    }

    bar.innerHTML = `
      <div style="display:flex; align-items:center; gap:1rem;">
        <span style="font-size:1.2rem; animation: pulse 2s infinite;">System Update Available</span>
        <span style="opacity:0.8; font-weight:500;">${data.message || 'A new version is ready!'}</span>
      </div>
      <div style="display:flex; gap:1rem;">
        <button id="lyra-update-now" style="background:white; color:#E8002D; border:none; padding:0.4rem 1.2rem; cursor:pointer; font-weight:900; border-radius:4px; font-size:0.85rem; transition:transform 0.2s;">DOWNLOAD & UPDATE</button>
        ${data.dismissible !== false ? '<button id="lyra-dismiss-update" style="background:rgba(255,255,255,0.1); color:white; border:1px solid rgba(255,255,255,0.3); padding:0.4rem 0.8rem; cursor:pointer; font-weight:700; border-radius:4px; font-size:0.85rem;">Later</button>' : ''}
      </div>
    `;

    document.getElementById('lyra-update-now').onclick = () => {
      window.open(data.url, '_blank');
      localStorage.setItem('lyra_last_broadcast_id', data.id);
    };

    const dismissBtn = document.getElementById('lyra-dismiss-update');
    if (dismissBtn) {
      dismissBtn.onclick = () => {
        localStorage.setItem('lyra_last_broadcast_id', data.id);
        bar.style.transform = 'translateY(-100%)';
        setTimeout(() => {
          bar.remove();
          document.body.style.paddingTop = '0';
        }, 500);
      };
    }
  }

  // --- Admin Calling System ---
  window.lyraJinglePlayer = function(isIncoming) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return { pause: () => {} };
    const ctx = new AudioContext();
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    masterGain.gain.value = 0.5;
    const notes = isIncoming ? [587.33, 739.99, 880.00, 1174.66] : [587.33, 739.99]; 
    const speed = isIncoming ? 0.1 : 0.15;
    let loopInterval;
    function playCycle() {
      if (ctx.state === 'closed') return;
      const now = ctx.currentTime;
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine'; osc.frequency.value = freq;
        osc.connect(gain); gain.connect(masterGain);
        gain.gain.setValueAtTime(0, now + i * speed);
        gain.gain.linearRampToValueAtTime(1, now + i * speed + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * speed + 0.3);
        osc.start(now + i * speed); osc.stop(now + i * speed + 0.4);
      });
    }
    playCycle();
    loopInterval = setInterval(playCycle, isIncoming ? 3000 : 2000);
    return { pause: () => { clearInterval(loopInterval); ctx.close().catch(()=>{}); } };
  };

  let activeIncomingRinger = null;
  let callPopup = null;

  supabase.channel('global_calls')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'lyra_calls', filter: 'id=eq.' + currentUser }, payload => {
      const callData = payload.new;

      // If there's no call or status is not ringing, stop ringing
      if (!callData || callData.status !== 'ringing') {
        if (activeIncomingRinger) { activeIncomingRinger.pause(); activeIncomingRinger = null; }
        if (callPopup) { callPopup.remove(); callPopup = null; }
        return;
      }

      // Currently ringing!
      if (!callPopup) {
        callPopup = document.createElement('div');
        callPopup.style = "position:fixed; top:20px; left:50%; transform:translateX(-50%); background:var(--gray-900, #0D0D0D); border:2px solid var(--red, #E8002D); box-shadow:0 0 30px rgba(232,0,45,0.6); padding:20px 30px; border-radius:8px; z-index:999999; display:flex; flex-direction:column; align-items:center; gap:15px; color:white; font-family:'Barlow Condensed', sans-serif; text-transform:uppercase; letter-spacing:0.1em; animation: pulse 1s infinite;";
        callPopup.innerHTML = `
          <div style="font-size:1.5rem; font-weight:700;">Incoming Call</div>
          <div style="font-size:1.1rem; color:var(--gray-200);">${callData.from_user} is inviting you to join: <strong style="color:var(--white);">${callData.roomName}</strong></div>
          <div style="display:flex; gap:15px; margin-top:10px;">
            <button id="acceptCallBtn" style="background:#00E85D; color:black; border:none; padding:10px 20px; font-weight:700; cursor:pointer; border-radius:4px; font-family:'Barlow Condensed', sans-serif; text-transform:uppercase; letter-spacing:0.1em;">Accept</button>
            <button id="declineCallBtn" style="background:transparent; color:#E8002D; border:1px solid #E8002D; padding:10px 20px; font-weight:700; cursor:pointer; border-radius:4px; font-family:'Barlow Condensed', sans-serif; text-transform:uppercase; letter-spacing:0.1em;">Decline</button>
          </div>
        `;
        document.body.appendChild(callPopup);

        activeIncomingRinger = window.lyraJinglePlayer(true);

        document.getElementById('acceptCallBtn').onclick = () => {
          supabase.from('lyra_calls').update({ status: 'accepted' }).eq('id', currentUser).then(() => { });
          if (activeIncomingRinger) { activeIncomingRinger.pause(); activeIncomingRinger = null; }
          callPopup.remove();
          callPopup = null;

          if (window.location.pathname.includes('admin-meetings.html')) {
            // If already in a meeting, cleanly leave it first.
            const meetContainer = document.getElementById('meet-container');
            if (meetContainer && meetContainer.style.display !== 'none' && typeof window.leaveMeeting === 'function') {
              window.leaveMeeting();
            }
            const roomInput = document.getElementById('roomName');
            const startBtn = document.getElementById('startMeetBtn');
            if (roomInput && startBtn) {
              roomInput.value = callData.roomName;
              startBtn.click();
            }
          } else {
            localStorage.setItem('lyra_pending_room', callData.roomName);
            window.location.href = 'admin-meetings.html';
          }
        };

        document.getElementById('declineCallBtn').onclick = () => {
          supabase.from('lyra_calls').update({ status: 'declined' }).eq('id', currentUser).then(() => { });
          if (activeIncomingRinger) { activeIncomingRinger.pause(); activeIncomingRinger = null; }
          if (callPopup) callPopup.remove();
          callPopup = null;
        };
      }
    })
    .subscribe();

  // Initial check for calls (in case page reloads while ringing)
  supabase.from('lyra_calls').select('*').eq('id', currentUser).then(({ data }) => {
    if (data && data.length > 0 && data[0].status === 'ringing') {
      // Ideally we manually trigger the render logic above, but Realtime will pick up new ones.
    }
  });

  // Check for pending accepted call redirect
  const pendingRoom = localStorage.getItem('lyra_pending_room');
  if (pendingRoom && window.location.pathname.includes('admin-meetings.html')) {
    setTimeout(() => {
      // Create a mandatory interaction overlay to satisfy browser getUserMedia security policies
      const joinOverlay = document.createElement('div');
      joinOverlay.style = "position:fixed; inset:0; background:rgba(0,0,0,0.95); z-index:9999999; display:flex; flex-direction:column; align-items:center; justify-content:center; backdrop-filter:blur(10px);";
      joinOverlay.innerHTML = `
        <h1 style="color:var(--white); font-family:'Bebas Neue', sans-serif; font-size:4rem; margin-bottom:1rem; letter-spacing: 0.05em;">Ready to Join</h1>
        <p style="color:var(--gray-200); font-family:'Barlow Condensed', sans-serif; font-size:1.5rem; margin-bottom:3rem; text-transform: uppercase; letter-spacing: 0.1em;">Meeting Room: <strong style="color:var(--red);">${pendingRoom}</strong></p>
        <button id="confirmJoinBtn" style="background:var(--green); color:var(--black); font-family:'Barlow Condensed', sans-serif; font-weight:700; text-transform:uppercase; letter-spacing:0.15em; font-size:1.5rem; padding:1.5rem 4rem; border:none; border-radius:4px; cursor:pointer; box-shadow:0 0 30px rgba(0, 232, 93, 0.4); transition: transform 0.2s;">JOIN CONFERENCE</button>
      `;
      document.body.appendChild(joinOverlay);
      
      document.getElementById('confirmJoinBtn').onclick = () => {
        joinOverlay.remove();
        const roomInput = document.getElementById('roomName');
        const startBtn = document.getElementById('startMeetBtn');
        if (roomInput && startBtn) {
          roomInput.value = pendingRoom;
          startBtn.click();
        }
      };
      
      localStorage.removeItem('lyra_pending_room');
    }, 500);
  }
})();
