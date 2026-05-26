/* ═══════════════════════════════════════════════════════════════
   VANSH (वंश) — Shared Navigation (Ivory Pivot)
   ═══════════════════════════════════════════════════════════════ */

const NAV_ICONS = {
  dashboard: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" stroke-width="1.5"/><rect x="14" y="3" width="7" height="7" rx="1" stroke-width="1.5"/><rect x="3" y="14" width="7" height="7" rx="1" stroke-width="1.5"/><rect x="14" y="14" width="7" height="7" rx="1" stroke-width="1.5"/></svg>',
  tree: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 3v6m0 0l-4 4m4-4l4 4m-8 0v4m8-4v4m-12 0h16"/></svg>',
  profile: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>',
  matchmaking: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>',
  timeline: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
  analytics: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/></svg>',
  directory: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>',
  museum: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>',
  events: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>',
  inbox: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>',
  hamburger: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h16"/></svg>',
  ventures: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>',
  trust: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
  traditions: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>',
  governance: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/></svg>',
  migration: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
};

const NAV_GROUPS = [
  {
    name: 'Network',
    items: [
      { id: 'dashboard',   label: 'Feed',               href: 'dashboard.html',   icon: NAV_ICONS.dashboard },
      { id: 'tree',        label: 'Family Dynasty',     href: 'tree.html',        icon: NAV_ICONS.tree },
      { id: 'profile',     label: 'Profiles',           href: 'profile.html',     icon: NAV_ICONS.profile },
      { id: 'matchmaking', label: 'Matchmaking',  href: 'matchmaking.html', icon: NAV_ICONS.matchmaking },
      { id: 'timeline',    label: 'Timeline',     href: 'timeline.html',    icon: NAV_ICONS.timeline },
      { id: 'analytics',   label: 'Analytics',    href: 'analytics.html',   icon: NAV_ICONS.analytics },
      { id: 'directory',   label: 'Directory',    href: 'directory.html',   icon: NAV_ICONS.directory },
      { id: 'museum',      label: 'Museum',       href: 'museum.html',      icon: NAV_ICONS.museum },
      { id: 'events',      label: 'Events',       href: 'events.html',      icon: NAV_ICONS.events },
      { id: 'inbox',       label: 'Inbox',        href: 'inbox.html',       icon: NAV_ICONS.inbox },
    ]
  },
  {
    name: 'Institution',
    items: [
      { id: 'ventures',    label: 'Ventures',     href: 'ventures.html',    icon: NAV_ICONS.ventures },
      { id: 'trust',       label: 'Family Trust', href: 'trust.html',       icon: NAV_ICONS.trust },
      { id: 'traditions',  label: 'Traditions',   href: 'traditions.html',  icon: NAV_ICONS.traditions },
      { id: 'governance',  label: 'Governance',   href: 'governance.html',  icon: NAV_ICONS.governance },
      { id: 'migration',   label: 'Migration',    href: 'migration.html',   icon: NAV_ICONS.migration },
      { id: 'admin',       label: 'Admin Portal', href: 'admin.html',       icon: NAV_ICONS.governance },
    ]
  }
];

function initNav(pageName) {
  const auth = getAuthData();
  const user = auth ? getMemberById(auth.userId) : null;
  const userName = user ? getFullName(user) : (auth?.userName || 'User');
  const userIni = user ? getInitials(user) : 'U';
  const userStyle = user ? getAvatarStyle(user) : '';

  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    let navHtml = '';
    NAV_GROUPS.forEach(group => {
      navHtml += `<div class="nav-label" style="margin-top: 16px">${group.name}</div>`;
      group.items.forEach(item => {
        navHtml += `
          <a href="${item.href}" class="nav-item ${item.id === pageName ? 'active' : ''}" id="nav-${item.id}">
            ${item.icon}
            <span>${item.label}</span>
          </a>
        `;
      });
    });

    sidebar.innerHTML = `
      <div class="sidebar-brand">
        <div class="logo">Vansh<span>.</span></div>
        <div class="sub">Family Dynasty</div>
      </div>
      <nav class="sidebar-nav">
        ${navHtml}
      </nav>
      <div class="sidebar-footer">
        <div class="pc-avatar" style="width:36px;height:36px;font-size:12px;${userStyle}">${user?.imageUrl ? '' : userIni}</div>
        <div class="sf-info">
          <div class="sf-name">${userName}</div>
          <div class="sf-role">Verified</div>
        </div>
        <button class="sf-logout" onclick="logout()">Logout</button>
      </div>
    `;
  }

  const topbar = document.getElementById('topbar');
  if (topbar) {
    let title = 'Dashboard';
    for (const group of NAV_GROUPS) {
      const found = group.items.find(n => n.id === pageName);
      if (found) { title = found.label; break; }
    }
    
    const bellIcon = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>';
    
    const invites = user ? getInvitesForUser(user.id) : [];
    const bellBadge = invites.length > 0 ? `<div style="position: absolute; top: -4px; right: -4px; width: 16px; height: 16px; background: var(--royal-red); color: white; font-size: 10px; font-weight: bold; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid var(--bg-card);">${invites.length}</div>` : '';
    
    let invitesHtml = '';
    if (invites.length === 0) {
      invitesHtml = '<div style="padding: 16px; text-align: center; color: var(--text-muted); font-size: 13px;">No pending requests</div>';
    } else {
      invites.forEach(inv => {
        const fromM = getMemberById(inv.fromUserId);
        const name = fromM ? getFullName(fromM) : 'Someone';
        const relCap = inv.relationType.charAt(0).toUpperCase() + inv.relationType.slice(1);
        invitesHtml += `
          <div style="padding: 16px; border-bottom: 1px solid var(--border-light);">
            <div style="font-size: 13px; font-weight: 600; margin-bottom: 4px;">Relationship Request</div>
            <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 12px;">${name} wants to add you as their <strong>${relCap}</strong>.</div>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-gold btn-sm" style="flex:1" onclick="acceptInvite('${inv.id}'); window.location.reload();">Accept</button>
              <button class="btn btn-outline btn-sm" style="flex:1" onclick="rejectInvite('${inv.id}'); window.location.reload();">Reject</button>
            </div>
          </div>
        `;
      });
    }

    topbar.innerHTML = `
      <div class="topbar-left" style="display:flex; align-items:center; gap:20px; flex:1; min-width:0;">
        <button class="topbar-hamburger" onclick="toggleSidebar()">${NAV_ICONS.hamburger}</button>
        <div class="topbar-breadcrumb">Vansh / <b>${title}</b></div>

        <div style="display:flex; gap:8px; align-items:center; flex-shrink:0;">
          <button onclick="openInviteExternalModal()" title="Invite Family" style="display:flex;align-items:center;gap:6px;padding:7px 14px;background:linear-gradient(135deg,var(--royal-red-dark),#AB2330);color:#fff;border:none;border-radius:10px;font-family:'Cinzel',serif;font-weight:700;font-size:11px;letter-spacing:0.5px;cursor:pointer;transition:all 0.25s;box-shadow:0 3px 10px rgba(107,21,34,0.25);" onmouseover="this.style.transform='translateY(-1px)';this.style.boxShadow='0 6px 18px rgba(107,21,34,0.35)'" onmouseout="this.style.transform='';this.style.boxShadow='0 3px 10px rgba(107,21,34,0.25)'">
            💌 Invite
          </button>
          <button onclick="window.location.href='matchmaking.html'" title="Request Alliance" style="display:flex;align-items:center;gap:6px;padding:7px 14px;background:var(--bg-elevated);color:var(--text-secondary);border:1px solid var(--border);border-radius:10px;font-family:'Cinzel',serif;font-weight:700;font-size:11px;letter-spacing:0.5px;cursor:pointer;transition:all 0.25s;" onmouseover="this.style.background='rgba(107,21,34,0.05)';this.style.borderColor='rgba(107,21,34,0.25)';this.style.color='var(--royal-red-dark)'" onmouseout="this.style.background='var(--bg-elevated)';this.style.borderColor='var(--border)';this.style.color='var(--text-secondary)'">
            👑 Alliance
          </button>
          <button onclick="window.location.href='trust.html'" title="View Estate" style="display:flex;align-items:center;gap:6px;padding:7px 14px;background:var(--bg-elevated);color:var(--text-secondary);border:1px solid var(--border);border-radius:10px;font-family:'Cinzel',serif;font-weight:700;font-size:11px;letter-spacing:0.5px;cursor:pointer;transition:all 0.25s;" onmouseover="this.style.background='rgba(107,21,34,0.05)';this.style.borderColor='rgba(107,21,34,0.25)';this.style.color='var(--royal-red-dark)'" onmouseout="this.style.background='var(--bg-elevated)';this.style.borderColor='var(--border)';this.style.color='var(--text-secondary)'">
            🏛️ Estate
          </button>
        </div>
      </div>
      
      <div class="topbar-right" style="position:relative; display:flex; align-items:center; gap:16px; flex-shrink:0;">
        <div class="universal-search-container" style="position:relative; width:240px;">
          <input type="text" id="universalSearchInput" placeholder="Search family members..." style="width:100%; padding:9px 16px 9px 38px; border-radius:12px; border:1.5px solid var(--border); background:var(--bg-elevated); font-size:13px; outline:none; transition:all 0.25s; font-family:inherit; color:var(--text);" onfocus="this.style.borderColor='var(--royal-red)'; this.style.background='#fff'" onblur="this.style.borderColor='var(--border)'; this.style.background='var(--bg-elevated)'">
          <svg style="position:absolute;left:12px;top:50%;transform:translateY(-50%);width:15px;height:15px;color:var(--text-muted);pointer-events:none;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <div id="universalSearchResults" style="position:absolute;top:calc(100% + 6px);left:0;width:340px;background:var(--bg-card);border:1px solid var(--border);border-radius:16px;box-shadow:0 16px 40px rgba(107,21,34,0.12);max-height:400px;overflow-y:auto;display:none;z-index:200;"></div>
        </div>
        
        <div style="position:relative;cursor:pointer;display:flex;align-items:center;" onclick="document.getElementById('notifDropdown').classList.toggle('active')">
          <div style="width:22px;height:22px;color:var(--text-secondary);">${bellIcon}</div>
          ${bellBadge}
        </div>
        
        <div id="notifDropdown" class="notif-dropdown">
          <div style="padding:14px 16px;border-bottom:1px solid var(--border-light);font-weight:700;font-family:'Cinzel',serif;font-size:14px;color:var(--text);">
            Relationship Requests
          </div>
          ${invitesHtml}
        </div>
        
        <div style="display:flex;align-items:center;gap:8px;padding-left:16px;border-left:1px solid var(--border-light);">
          <div class="topbar-dot" style="background:var(--royal-red);box-shadow:0 0 8px var(--royal-red-glow);"></div>
          <span class="topbar-status">Active</span>
        </div>
      </div>
    `;
    
    // Add CSS for dropdown
    if (!document.getElementById('notifCss')) {
      const style = document.createElement('style');
      style.id = 'notifCss';
      style.innerHTML = `
        .notif-dropdown { position: absolute; top: 100%; right: 0; width: 320px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-sm); box-shadow: var(--shadow-hover); margin-top: 16px; opacity: 0; pointer-events: none; transform: translateY(10px); transition: all 0.2s; z-index: 100; }
        .notif-dropdown.active { opacity: 1; pointer-events: all; transform: translateY(0); }
      `;
      document.head.appendChild(style);
    }
  }

  if (!document.getElementById('sidebarOverlay')) {
    const overlay = document.createElement('div');
    overlay.id = 'sidebarOverlay';
    overlay.className = 'sidebar-overlay';
    overlay.onclick = () => toggleSidebar(false);
    document.body.appendChild(overlay);
  }

  if (!document.querySelector('.toast-container')) {
    const toast = document.createElement('div');
    toast.className = 'toast-container';
    toast.style.cssText = 'position:fixed;bottom:24px;right:24px;background:var(--bg-card);border:1px solid var(--border);padding:20px;border-radius:var(--radius);z-index:999;transform:translateY(150%);transition:transform 0.3s;box-shadow:0 12px 40px rgba(0,0,0,0.1);display:flex;flex-direction:column;gap:4px;';
    toast.innerHTML = '<div class="toast-title" style="font-size:14px;font-weight:700;color:var(--gold);font-family:Cinzel,serif"></div><div class="toast-msg" style="font-size:13px;color:var(--text-secondary)"></div>';
    document.body.appendChild(toast);
    
    const style = document.createElement('style');
    style.innerHTML = '.toast-container.show { transform: translateY(0) !important; }';
    document.head.appendChild(style);
  }

  // Universal Search Logic
  const searchInput = document.getElementById('universalSearchInput');
  const searchResults = document.getElementById('universalSearchResults');
  if (!searchInput || !searchResults) return;

  let searchTimer = null;

  function renderSearchResults(results, query) {
    const authData = getAuthData();
    const currentUserId = authData ? authData.userId : null;

    if (results.length === 0) {
      searchResults.innerHTML = `
        <div style="padding:24px;text-align:center;">
          <div style="font-size:32px;margin-bottom:10px;">🔍</div>
          <div style="color:var(--text);font-size:14px;font-weight:700;margin-bottom:6px;">No one found for "${query}"</div>
          <div style="color:var(--text-muted);font-size:12px;margin-bottom:16px;line-height:1.5;">They might not have registered yet.</div>
          <button onclick="openInviteExternalModal()" style="padding:8px 18px;background:linear-gradient(135deg,var(--royal-red-dark),#AB2330);color:#fff;border:none;border-radius:10px;font-family:'Cinzel',serif;font-weight:700;font-size:12px;cursor:pointer;letter-spacing:0.5px;">💌 Invite to Vansh</button>
        </div>`;
      return;
    }

    let html = `<div style="padding:10px 16px 8px;font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:2px;border-bottom:1px solid var(--border-light);display:flex;align-items:center;gap:6px;">
      <span>🌐</span> ${results.length} Member${results.length > 1 ? 's' : ''} found
    </div>`;

    html += results.map(m => {
      const ava = m.imageUrl && m.imageUrl.startsWith('http')
        ? `background-image:url('${m.imageUrl}');background-size:cover;background-position:center;`
        : getAvatarStyle(m);
      const isMe = m.id === currentUserId;
      const safeName = (getFullName(m) || '').replace(/'/g, "\\'");

      const actionBtn = isMe
        ? `<span style="padding:4px 12px;background:rgba(107,21,34,0.08);color:var(--royal-red);border-radius:20px;font-size:10px;font-weight:700;font-family:'Cinzel',serif;white-space:nowrap;border:1px solid rgba(107,21,34,0.15);">You</span>`
        : `<button style="padding:6px 14px;background:linear-gradient(135deg,var(--royal-red-dark),#AB2330);color:#fff;border:none;border-radius:8px;font-family:'Cinzel',serif;font-weight:700;font-size:10px;cursor:pointer;white-space:nowrap;box-shadow:0 2px 8px rgba(107,21,34,0.2);letter-spacing:0.3px;" onclick="event.preventDefault();event.stopPropagation();openAddRelativeModal('${m.id}','${safeName}')">+ Add Relative</button>`;

      const verBadge = m.verified
        ? `<span style="color:#059669;font-size:10px;font-weight:600;">✓ Verified</span>`
        : `<span style="color:#e67e22;font-size:10px;font-weight:600;">⚠ Unverified</span>`;

      const cloudBadge = m._fromCloud
        ? `<span style="color:var(--text-muted);font-size:9px;font-weight:600;background:rgba(0,0,0,0.04);padding:1px 5px;border-radius:4px;margin-left:4px;">CLOUD</span>`
        : '';

      return `<a href="profile.html?id=${m.id}" style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid var(--border-light);text-decoration:none;transition:background 0.15s;" onmouseover="this.style.background='var(--bg-elevated)'" onmouseout="this.style.background='transparent'">
        <div style="width:42px;height:42px;border-radius:50%;border:2px solid var(--gold-border);display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;color:var(--royal-red);flex-shrink:0;${ava}">${(m.imageUrl && m.imageUrl.startsWith('http')) ? '' : getInitials(m)}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:13px;font-weight:700;color:var(--text);font-family:'Cinzel',serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${getFullName(m)}${cloudBadge}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">@${m.username || 'user'} · ${verBadge}</div>
          ${m.caste || m.gotra ? `<div style="font-size:10px;color:var(--text-muted);margin-top:1px;">${m.caste || ''}${m.gotra ? ' • ' + m.gotra + ' Gotra' : ''}</div>` : ''}
        </div>
        ${actionBtn}
      </a>`;
    }).join('');

    searchResults.innerHTML = html;
  }

  searchInput.addEventListener('input', (e) => {
    // Strip @ prefix
    let raw = e.target.value.trim();
    const query = raw.startsWith('@') ? raw.slice(1) : raw;

    if (!query) {
      searchResults.style.display = 'none';
      return;
    }

    const q = query.toLowerCase();

    // ── Step 1: Show LOCAL results immediately (fast) ──
    let localPool = [];
    try {
      const saved = localStorage.getItem('vansh_family_data_v2');
      if (saved) localPool = JSON.parse(saved);
      if (!Array.isArray(localPool)) localPool = [];
    } catch(err) { localPool = []; }

    const localResults = localPool.filter(m => {
      if (!m) return false;
      const full  = ((m.firstName || '') + ' ' + (m.lastName || '')).toLowerCase();
      const un    = (m.username || '').toLowerCase();
      const email = (m.email || '').toLowerCase();
      return full.includes(q) || un.includes(q) || email.includes(q);
    });

    // Show local results immediately
    searchResults.style.display = 'block';

    // Show loading state
    searchResults.innerHTML = `<div style="padding:14px 16px;font-size:12px;color:var(--text-muted);display:flex;align-items:center;gap:8px;">
      <span style="display:inline-block;width:12px;height:12px;border:2px solid var(--royal-red);border-top-color:transparent;border-radius:50%;animation:spin 0.7s linear infinite;"></span>
      Searching all members...
    </div>
    <style>@keyframes spin{100%{transform:rotate(360deg)}}</style>`;

    // ── Step 2: Query Supabase cloud (async, cross-device) ──
    clearTimeout(searchTimer);
    searchTimer = setTimeout(async () => {
      let cloudResults = [];
      try {
        if (typeof searchMembersCloud === 'function') {
          cloudResults = await searchMembersCloud(query);
        }
      } catch(err) {
        console.warn('Cloud search failed, using local only:', err);
      }

      // Merge: cloud results + local results, deduped by id
      const seenIds = new Set();
      const merged = [];

      // Cloud results first (they're richer, from real table)
      cloudResults.forEach(m => {
        if (!seenIds.has(m.id)) { seenIds.add(m.id); merged.push(m); }
      });

      // Add local results that aren't in cloud yet (just registered, sync pending)
      localResults.forEach(m => {
        if (!seenIds.has(m.id)) { seenIds.add(m.id); merged.push({ ...m, _fromCloud: false }); }
      });

      merged.sort((a, b) => (getFullName(a) || '').localeCompare(getFullName(b) || ''));

      renderSearchResults(merged, query);
    }, 300); // 300ms debounce
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.style.display = 'none';
    }
  });
}

function toggleSidebar(force) {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (!sidebar) return;
  const shouldOpen = force !== undefined ? force : !sidebar.classList.contains('open');
  sidebar.classList.toggle('open', shouldOpen);
  overlay?.classList.toggle('active', shouldOpen);
}

// Global Relative Request Modal Logic
function ensureAddRelativeModal() {
  if (document.getElementById('addRelativeModal')) return;
  const modalHtml = `
  <div class="modal-overlay" id="addRelativeModal">
    <div class="modal-box" style="max-width: 400px; padding: 24px;">
      <div class="modal-header" style="margin-bottom: 16px; padding: 0 0 16px 0; border-bottom: 1px solid var(--border-light); background: none;">
        <div class="modal-title" style="font-size: 18px; color: var(--text);">Send Request</div>
        <button class="modal-close" style="color: var(--text-muted);" onclick="closeAddRelativeModal()">×</button>
      </div>
      <div style="margin-bottom: 16px; font-size: 14px; color: var(--text-secondary);">
        How are you related to <strong id="relativeTargetName"></strong>?
      </div>
      <input type="hidden" id="relativeTargetId">
      <select id="relativeTypeSelect" class="form-select" style="margin-bottom: 24px;">
        <option value="">Select Relationship</option>
        <option value="papa">Papa (Father)</option>
        <option value="mummy">Mummy (Mother)</option>
        <option value="bhai">Bhai (Brother)</option>
        <option value="behen">Behen (Sister)</option>
        <option value="pati">Pati (Husband)</option>
        <option value="patni">Patni (Wife)</option>
        <option value="beta">Beta (Son)</option>
        <option value="beti">Beti (Daughter)</option>
        <option value="dada">Dada (Paternal Grandfather)</option>
        <option value="dadi">Dadi (Paternal Grandmother)</option>
        <option value="nana">Nana (Maternal Grandfather)</option>
        <option value="nani">Nani (Maternal Grandmother)</option>
        <option value="chacha">Chacha (Paternal Uncle)</option>
        <option value="bua">Bua (Paternal Aunt)</option>
        <option value="mama">Mama (Maternal Uncle)</option>
        <option value="masi">Masi (Maternal Aunt)</option>
      </select>
      <div style="display:flex; justify-content:flex-end; gap:12px;">
        <button class="btn btn-outline" onclick="closeAddRelativeModal()">Cancel</button>
        <button class="btn btn-gold" onclick="submitRelativeRequest()">Send Request</button>
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

window.openAddRelativeModal = function(id, name) {
  ensureAddRelativeModal();
  document.getElementById('relativeTargetId').value = id;
  document.getElementById('relativeTargetName').innerText = name;
  document.getElementById('relativeTypeSelect').value = '';
  
  // Close the search results UI
  const searchResults = document.getElementById('universalSearchResults');
  if (searchResults) searchResults.style.display = 'none';
  
  document.getElementById('addRelativeModal').classList.add('active');
};

window.closeAddRelativeModal = function() {
  const modal = document.getElementById('addRelativeModal');
  if (modal) modal.classList.remove('active');
};

window.submitRelativeRequest = function() {
  const authData = getAuthData();
  if (!authData || !authData.userId) return;
  
  const toUserId = document.getElementById('relativeTargetId').value;
  const relType = document.getElementById('relativeTypeSelect').value;
  
  if (!relType) {
    alert("Please select a relationship.");
    return;
  }
  
  const res = sendInvite(authData.userId, toUserId, relType);
  if (res.success) {
    if (typeof showToast === 'function') showToast('Request Sent', 'Your request has been successfully sent.', 'ok');
    else alert('Request sent successfully.');
  } else {
    if (typeof showToast === 'function') showToast('Error', res.message, 'error');
    else alert(res.message);
  }
  closeAddRelativeModal();
};

// External Invite Modal
window.openInviteExternalModal = function() {
  if (!document.getElementById('inviteExtModal')) {
    const modalHtml = `
    <div class="modal-overlay" id="inviteExtModal">
      <div class="modal-box" style="max-width: 450px; padding: 24px;">
        <div class="modal-header" style="margin-bottom: 16px; padding: 0 0 16px 0; border-bottom: 1px solid var(--border-light); background: none;">
          <div class="modal-title" style="font-size: 18px; color: var(--text);">Invite to Vansh</div>
          <button class="modal-close" style="color: var(--text-muted);" onclick="document.getElementById('inviteExtModal').classList.remove('active')">×</button>
        </div>
        <div style="margin-bottom: 24px; font-size: 14px; color: var(--text-secondary); line-height: 1.5;">
          Send an invitation link to a family member so they can register and join your dynasty network.
        </div>
        <div class="form-group" style="margin-bottom: 24px;">
          <label class="form-label" style="display:block; margin-bottom:8px; font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Email or Phone Number</label>
          <input type="text" id="extInviteInput" class="form-input" style="width:100%; padding:12px; border:1px solid var(--border); border-radius:8px;" placeholder="e.g. uncle@example.com or +91...">
        </div>
        <div style="display:flex; justify-content:flex-end; gap:12px;">
          <button class="btn btn-outline" onclick="document.getElementById('inviteExtModal').classList.remove('active')">Cancel</button>
          <button class="btn btn-gold" onclick="submitExtInvite()">Send Invitation</button>
        </div>
      </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }
  document.getElementById('extInviteInput').value = '';
  document.getElementById('inviteExtModal').classList.add('active');
};

window.submitExtInvite = function() {
  const val = document.getElementById('extInviteInput').value.trim();
  if (!val) {
    alert("Please enter an email or phone number.");
    return;
  }
  document.getElementById('inviteExtModal').classList.remove('active');
  if (typeof showToast === 'function') {
    showToast('Invitation Sent', 'An invitation link has been dispatched to ' + val, 'ok');
  } else {
    alert('Invitation sent to ' + val);
  }
};
