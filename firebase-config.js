// firebase-config.js

const firebaseConfig = {
  apiKey: "AIzaSyCR3Z8Peo8Voda7gtz5fAc2TibQJhB63Eg",
  authDomain: "lyra-esports.firebaseapp.com",
  projectId: "lyra-esports",
  storageBucket: "lyra-esports.firebasestorage.app",
  messagingSenderId: "927531070934",
  appId: "1:927531070934:web:6c3b528c681ac8a23be077",
  measurementId: "G-LQ4Y3C57NK",
  databaseURL: "https://lyra-esports-default-rtdb.firebaseio.com"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// --- Global Chat Notification System ---
(function() {
  const currentUser = localStorage.getItem('lyra_user');
  if (!currentUser) return; // Only notify logged-in admins
  if (localStorage.getItem('lyra_notifications') === 'disabled') return;

  // Create Toast Container
  const toastContainer = document.createElement('div');
  toastContainer.style.position = 'fixed';
  toastContainer.style.bottom = '20px';
  toastContainer.style.right = '20px';
  toastContainer.style.zIndex = '99999';
  toastContainer.style.display = 'flex';
  toastContainer.style.flexDirection = 'column';
  toastContainer.style.gap = '10px';
  document.body.appendChild(toastContainer);

  const activeListeners = new Set();
  const bootTime = Date.now(); // Avoid historical alerts on refresh

  // --- Admin Presence System ---
  const myPresenceRef = db.ref('lyra_presence/' + currentUser);
  const connectedRef = db.ref('.info/connected');

  connectedRef.on('value', snap => {
    if (snap.val() === true) {
      myPresenceRef.onDisconnect().set({
        status: 'offline',
        timestamp: firebase.database.ServerValue.TIMESTAMP
      }).then(() => {
        const savedStatus = localStorage.getItem('lyra_admin_status') || 'online';
        myPresenceRef.set({
          status: savedStatus,
          timestamp: firebase.database.ServerValue.TIMESTAMP
        });
      });
    }
  });

  function handlePresenceUpdate(snap) {
    const adminId = snap.key;
    if (adminId.toLowerCase() === currentUser.toLowerCase()) return;
    const data = snap.val();
    if (data && data.status === 'online' && data.timestamp && data.timestamp > bootTime) {
      showToast('Admin Connection', adminId, 'Is now online.', '#');
    }
  }
  
  db.ref('lyra_presence').on('child_added', handlePresenceUpdate);
  db.ref('lyra_presence').on('child_changed', handlePresenceUpdate);

  db.ref('chat_channels').on('value', snap => {
    const channels = snap.val() || {};
    const allChannels = ['general', 'management', 'announcements', ...Object.keys(channels)];
    
    allChannels.forEach(ch => {
      if (!activeListeners.has(ch)) {
        activeListeners.add(ch);
        
        let isInitialLoad = true;
        db.ref('chat_messages/' + ch).limitToLast(1).on('child_added', msgSnap => {
          if (isInitialLoad) {
            isInitialLoad = false;
            return;
          }

          const msg = msgSnap.val();
          
          if (msg.timestamp && msg.timestamp < bootTime) return;
          if (msg.author && msg.author.toLowerCase() === currentUser.toLowerCase()) return;
          
          const isOnChat = window.location.pathname.includes('admin-chat.html');
          const titleEl = document.querySelector('.chat-title');
          if (isOnChat && titleEl && titleEl.innerText.includes(ch)) return;

          showToast(`New Message in #${ch}`, msg.author, msg.text, 'admin-chat.html');
        });
      }
    });
  });

  let initialAppLoad = true;
  db.ref('lyra_applications').limitToLast(1).on('child_added', snap => {
    if (initialAppLoad) {
      initialAppLoad = false;
      return;
    }
    const app = snap.val();
    if (app.timestamp && app.timestamp < bootTime) return;

    // Optional: block if looking directly at applications dashboard
    const isOnApps = window.location.pathname.includes('admin-dashboard.html') || window.location.pathname.includes('admin-access.html');
    if (isOnApps) return;

    const targetUrl = app.roleValue === 'adminAccess' ? 'admin-access.html' : 'admin-dashboard.html';
    showToast('New Application Received', app.name || 'Applicant', `Role: ${app.role || 'Member'}`, targetUrl);
  });

  function showToast(title, author, text, linkUrl) {
    // Play Notification Sound
    try {
      const audio = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVtvT19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXw==");
      audio.volume = 0.5;
      audio.play().catch(e => console.log("Audio play blocked until user interaction."));
    } catch(e) { console.error("Audio failed:", e); }

    const toast = document.createElement('div');
    toast.style.background = 'rgba(232, 0, 45, 0.9)';
    toast.style.backdropFilter = 'blur(10px)';
    toast.style.color = '#fff';
    toast.style.padding = '15px 20px';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
    toast.style.fontFamily = "'Barlow', sans-serif";
    toast.style.minWidth = '250px';
    toast.style.maxWidth = '350px';
    toast.style.transform = 'translateX(120%)';
    toast.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease';
    toast.style.opacity = '0';
    toast.style.cursor = 'pointer';

    toast.addEventListener('click', () => {  window.location.href = linkUrl; });

    toast.innerHTML = `
      <div style="font-family:'Barlow Condensed', sans-serif; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; font-size:0.8rem; margin-bottom:5px; opacity:0.8;">
        ${title}
      </div>
      <div style="font-weight:600; margin-bottom: 2px;">${author}</div>
      <div style="font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${text}</div>
    `;

    toastContainer.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(0)';
      toast.style.opacity = '1';
    });

    setTimeout(() => {
      toast.style.transform = 'translateX(120%)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 400);
    }, 5000);
  }
})();
