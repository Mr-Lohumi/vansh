// Shared Tree Drawing Engine for Vansh

function renderProfileCardHTML(member, relation, opts = {}) {
  const { isGhost = false, isActive = false, isHead = false } = opts;
  const full = getFullName(member);
  const ini = getInitials(member);
  const ghost = isGhost ? 'ghost' : '';
  const active = isActive ? 'active' : '';
  const dec = member.deceased ? 'deceased' : '';
  const chk = member.verified ? '<span class="pc-check">✓</span>' : '';
  
  const headStyle = isHead ? 'box-shadow: 0 0 0 2px var(--gold), 0 16px 40px rgba(212,175,55,0.3); border-color: var(--gold); background: linear-gradient(to bottom, #ffffff, #fdfaf0);' : '';
  const crownHTML = isHead ? `
    <div style="position: absolute; top: -6px; left: 24px; width: 22px; height: 22px; z-index: 10; transform: rotate(-15deg); pointer-events: none;">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:100%; filter: drop-shadow(0 2px 4px rgba(212,175,55,0.8));">
        <path d="M2 19h20v-2H2v2zm2-4l2-8 4 4 4-6 4 6 4-4 2 8H4z" fill="url(#goldGradient)" stroke="#b89327" stroke-width="0.8" stroke-linejoin="round"/>
        <defs>
          <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ffe89c"/>
            <stop offset="50%" stop-color="#f5cf5d"/>
            <stop offset="100%" stop-color="#c99e28"/>
          </linearGradient>
        </defs>
      </svg>
    </div>` : '';
  
  const relString = relation ? relation.english : (isActive ? 'Patriarch / Self' : 'Relative');
  
  let statusText = 'Single';
  if (member.spouse) {
    const spouse = getMemberById(member.spouse);
    statusText = spouse ? `Married to ${spouse.firstName}` : 'Married';
  }
  
  const occupation = member.occupation || 'N/A';

  return `<div class="profile-card ${ghost} ${active} ${dec}" id="pc-${member.id}" data-id="${member.id}" style="${headStyle}">
    ${crownHTML}
    <div class="pc-avatar" style="${getAvatarStyle(member)}">${member.imageUrl ? '' : ini}</div>
    <div class="pc-details" style="display:flex; flex-direction:column; gap:2px; flex:1; min-width:0;">
      <div class="pc-name-row" style="display:flex; align-items:center; gap:4px;"><span class="pc-name" style="font-size:13px; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-family:'Cinzel',serif; color:var(--text);">${full}</span>${chk}</div>
      <div class="pc-rel" style="font-size:10px; color:var(--gold); font-weight:600; text-transform:uppercase; letter-spacing:1px;">${relString}</div>
      <div class="pc-meta" style="margin-top:4px; display:flex; flex-direction:column; gap:1px;">
        <span class="pc-meta-line" style="font-size:10px; color:var(--text-secondary);"><b>Age:</b> ${member.age} Yrs · ${member.gender}</span>
        <span class="pc-meta-line" style="font-size:10px; color:var(--text-secondary);"><b>Occ:</b> ${occupation}</span>
        <span class="pc-meta-line" style="font-size:10px; color:var(--text-secondary);"><b>Status:</b> ${statusText}</span>
      </div>
    </div>
  </div>`;
}

function buildNodeHTML(m, currentPOV, onNodeClickName, isHead = false) {
  if (!m) return '';
  const rel = getSmartIndianRelation(familyMembers, currentPOV, m.id);
  const isActive = m.id === currentPOV;
  let html = renderProfileCardHTML(m, rel, { isActive, isHead });
  if (onNodeClickName) {
    html = html.replace('class="profile-card', `onclick="${onNodeClickName}('${m.id}')" style="cursor:pointer" class="profile-card`);
  }
  return html;
}

function buildMarriageHTML(m1, m2, currentPOV, onNodeClickName, isHead = false) {
  return `
    <div class="flex items-center gap-4" id="pair-${m1.id}-${m2.id}">
      ${buildNodeHTML(m1, currentPOV, onNodeClickName, isHead)}
      <div class="marriage-link"><div class="marriage-line"></div></div>
      ${buildNodeHTML(m2, currentPOV, onNodeClickName, isHead)}
    </div>
  `;
}

function getBloodlineNetwork(currentPOV) {
  const pov = getMemberById(currentPOV);
  if (!pov) return [];
  
  // Bloodline: Self, Parents, Siblings, Children, Grandchildren (if applicable), and Spouses of these.
  // CRITICAL FIX: Do NOT include in-laws' parents in the main view to keep the hierarchy clean.
  
  const visible = new Set();
  visible.add(currentPOV);
  if (pov.spouse) visible.add(pov.spouse);
  
  // Add Parents
  if (pov.parents) {
    pov.parents.forEach(pid => {
      visible.add(pid);
      const p = getMemberById(pid);
      if(p && p.spouse) visible.add(p.spouse);
    });
  }
  
  // Add Siblings (shared parents)
  familyMembers.forEach(m => {
    if (m.id === currentPOV) return;
    if (!m.parents || !pov.parents) return;
    const isSibling = m.parents.some(pid => pov.parents.includes(pid));
    if (isSibling) {
      visible.add(m.id);
      if (m.spouse) visible.add(m.spouse);
    }
  });
  
  // Add Children
  familyMembers.forEach(m => {
    if (m.parents && (m.parents.includes(currentPOV) || (pov.spouse && m.parents.includes(pov.spouse)))) {
      visible.add(m.id);
      if (m.spouse) visible.add(m.spouse);
    }
  });
  
  let network = Array.from(visible).map(id => getMemberById(id)).filter(m => m);
  
  // Dynamically assign correct generations relative to POV
  network.forEach(m => m._tempGen = undefined);
  pov._tempGen = 10; // Start at 10 to avoid negative generations
  
  let queue = [pov];
  while(queue.length > 0) {
    let curr = queue.shift();
    
    // Parents
    if (curr.parents) {
      curr.parents.forEach(pid => {
        let p = network.find(m => m.id === pid);
        if (p && p._tempGen === undefined) {
          p._tempGen = curr._tempGen - 1;
          queue.push(p);
        }
      });
    }
    
    // Children
    let children = network.filter(m => m.parents && m.parents.includes(curr.id));
    children.forEach(c => {
      if (c._tempGen === undefined) {
        c._tempGen = curr._tempGen + 1;
        queue.push(c);
      }
    });
    
    // Spouse
    if (curr.spouse) {
      let s = network.find(m => m.id === curr.spouse);
      if (s && s._tempGen === undefined) {
        s._tempGen = curr._tempGen;
        queue.push(s);
      }
    }
  }
  
  network.forEach(m => {
    if (m._tempGen !== undefined) m.gen = m._tempGen;
  });
  
  return network;
}

function renderTreeToContainer(containerId, canvasId, currentPOV, onNodeClickName) {
  const container = document.getElementById(containerId);
  const canvas = document.getElementById(canvasId);
  if (!container || !canvas) return;
  
  container.style.display = 'inline-flex';
  container.style.flexDirection = 'column';
  container.style.gap = '70px';
  container.style.alignItems = 'center';
  container.style.margin = '0 auto';
  
  const visibleMembers = getBloodlineNetwork(currentPOV);
  if(visibleMembers.length === 0) {
    container.innerHTML = '<div class="text-muted">No network found.</div>';
    return;
  }
  
  let html = '';
  const maxGen = Math.max(...visibleMembers.map(m => m.gen));
  const minGen = Math.min(...visibleMembers.map(m => m.gen));
  
  for(let g = minGen; g <= maxGen; g++) {
    const genMembers = visibleMembers.filter(m => m.gen === g);
    if(genMembers.length === 0) continue;
    
    let processed = new Set();
    let rowHTML = `<div class="tree-row" id="row-gen${g}"><div class="gl">Generation ${g}</div>`;
    
    genMembers.forEach(m => {
      if (processed.has(m.id)) return;
      
      // Handle marriages within the same generation
      if (m.spouse) {
        const spouse = getMemberById(m.spouse);
        if (spouse && spouse.gen === g && visibleMembers.find(v => v.id === spouse.id)) {
          const m1 = m.gender === 'M' ? m : spouse;
          const m2 = m.gender === 'M' ? spouse : m;
          rowHTML += buildMarriageHTML(m1, m2, currentPOV, onNodeClickName, g === minGen);
          processed.add(m.id);
          processed.add(spouse.id);
          return;
        }
      }
      rowHTML += buildNodeHTML(m, currentPOV, onNodeClickName, g === minGen);
      processed.add(m.id);
    });
    
    rowHTML += `</div>`;
    html += rowHTML;
  }
  
  container.innerHTML = html;
  
  // Wait for DOM to render then draw connections
  setTimeout(() => drawTreeConnections(containerId, canvasId, visibleMembers), 150);
}

function drawTreeConnections(containerId, canvasId, visibleMembers) {
  const containerWrapper = document.getElementById(containerId).parentElement;
  const container = document.getElementById(containerId);
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext('2d');
  
  // Ensure canvas dimensions match the scrollable area perfectly
  canvas.width = containerWrapper.scrollWidth;
  canvas.height = containerWrapper.scrollHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#d4af37'; // Hardcoded hex for canvas compatibility
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  function getCenter(id, anchor='top') {
    const el = document.getElementById(`pc-${id}`);
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const cRect = containerWrapper.getBoundingClientRect();
    const x = rect.left - cRect.left + containerWrapper.scrollLeft + (rect.width / 2);
    let y = rect.top - cRect.top + containerWrapper.scrollTop;
    if(anchor==='bottom') y += rect.height;
    if(anchor==='center') y += rect.height/2;
    return { x, y };
  }
  
  function getPairCenterBottom(id1, id2) {
    const c1 = getCenter(id1, 'bottom');
    const c2 = getCenter(id2, 'bottom');
    if(!c1 || !c2) return null;
    return { x: (c1.x + c2.x)/2, y: c1.y };
  }
  
  function drawForkLine(startX, startY, targets) {
    if(!targets || targets.length === 0) return;
    const targetCenters = targets.map(id => getCenter(id, 'top')).filter(c=>c);
    if(targetCenters.length === 0) return;
    
    const midY = startY + 50; // The horizontal spine
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX, midY); // Draw down to spine
    
    const minX = Math.min(startX, ...targetCenters.map(t=>t.x));
    const maxX = Math.max(startX, ...targetCenters.map(t=>t.x));
    
    // Draw horizontal spine connecting the parent drop and all children
    ctx.moveTo(minX, midY);
    ctx.lineTo(maxX, midY); 
    
    targetCenters.forEach(t => {
      ctx.moveTo(t.x, midY);
      ctx.lineTo(t.x, t.y); // Draw down to child
    });
    ctx.stroke();
  }
  
  // Group children by their parents
  const parentGroups = {};
  visibleMembers.forEach(m => {
    if(!document.getElementById(`pc-${m.id}`)) return; // Skip if not rendered
    
    if(m.parents && m.parents.length > 0) {
      const visibleParents = m.parents.filter(pid => document.getElementById(`pc-${pid}`));
      if(visibleParents.length > 0) {
        const key = [...visibleParents].sort().join('+');
        if(!parentGroups[key]) parentGroups[key] = [];
        parentGroups[key].push(m.id);
      }
    }
  });
  
  // Draw forks
  Object.keys(parentGroups).forEach(key => {
    const pIds = key.split('+');
    const children = parentGroups[key];
    
    let startPt = null;
    if(pIds.length === 2) {
      startPt = getPairCenterBottom(pIds[0], pIds[1]); // Draw from marriage line center
    } else if(pIds.length === 1) {
      startPt = getCenter(pIds[0], 'bottom'); // Draw from single parent bottom
    }
    
    if(startPt) drawForkLine(startPt.x, startPt.y, children);
  });
}
