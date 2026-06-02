// Shared Tree Drawing Engine for Vansh

function renderProfileCardHTML(member, relation, opts = {}) {
  const { isGhost = false, isActive = false, isHead = false, onNodeClickName = null } = opts;
  const full = getFullName(member);
  const ini = getInitials(member);
  const chk = member.verified ? '<span class="check">✓</span>' : '';
  const relString = relation ? relation.english : (isActive ? 'Self' : 'Relative');
  
  let statusText = 'Single';
  if (member.spouse) {
    const spouse = getMemberById(member.spouse);
    statusText = spouse ? `Married to ${spouse.firstName}` : 'Married';
  }
  const occupation = member.occupation || 'N/A';
  
  const onclickHtml = onNodeClickName ? `onclick="${onNodeClickName}('${member.id}')"` : '';
  const avatarStyle = member.imageUrl ? `background-image: url('${member.imageUrl}')` : '';
  
  const viewBtn = `
    <button class="pc-view-btn" onclick="window.location.href='profile.html?id=${member.id}'; event.stopPropagation();" title="View Profile">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
    </button>
  `;

  if (isHead) {
    return `
      <div class="patriarch" id="pc-${member.id}" data-id="${member.id}" ${onclickHtml}>
        <div class="patriarch-inner">
          <svg class="patriarch-arch-bg" viewBox="0 0 130 165" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="archFilig" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse"><g stroke="#a07418" stroke-width="0.35" fill="none" opacity="0.85"><path d="M5 1 Q8 4 5 7 Q2 4 5 1 Z"/><path d="M1 5 Q4 2 7 5 Q4 8 1 5 Z"/></g></pattern>
              <pattern id="archFilig2" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse"><g stroke="#8b6914" stroke-width="0.4" fill="none" opacity="0.7"><path d="M7 2 Q11 6 7 10 Q3 6 7 2 Z"/></g></pattern>
            </defs>
            <path d="M 6 165 L 6 65 Q 6 12 65 6 Q 124 12 124 65 L 124 165 Z" fill="url(#archFilig)" stroke="#8b6914" stroke-width="1.1" opacity="0.95"/>
            <path d="M 22 165 L 22 75 Q 22 26 65 22 Q 108 26 108 75 L 108 165 Z" fill="url(#archFilig2)" stroke="#8b6914" stroke-width="0.9" opacity="0.85"/>
            <path d="M 38 165 L 38 85 Q 38 42 65 38 Q 92 42 92 85 L 92 165 Z" fill="none" stroke="#8b6914" stroke-width="0.7" opacity="0.75"/>
            <circle cx="65" cy="22" r="2.5" fill="#8b6914" opacity="0.8"/>
          </svg>
          <svg class="crown" viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="crownGrad" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#fbe28a"/><stop offset="50%" stop-color="#d4af37"/><stop offset="100%" stop-color="#8b6914"/></linearGradient>
              <linearGradient id="crownBand" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#f4d772"/><stop offset="100%" stop-color="#a07418"/></linearGradient>
            </defs>
            <path d="M6 44 L74 44 L70 58 L10 58 Z" fill="url(#crownBand)" stroke="#5a4209" stroke-width="0.8"/>
            <path d="M10 50 L70 50" stroke="#5a4209" stroke-width="0.6" opacity="0.7"/>
            <path d="M6 44 L14 16 L24 36 L40 6 L56 36 L66 16 L74 44 Z" fill="url(#crownGrad)" stroke="#5a4209" stroke-width="0.8" stroke-linejoin="round"/>
            <circle cx="14" cy="18" r="3.2" fill="#c41e3a" stroke="#5a0a14" stroke-width="0.4"/>
            <circle cx="40" cy="8" r="3.8" fill="#2a9d8f" stroke="#0c4a40" stroke-width="0.4"/>
            <circle cx="66" cy="18" r="3.2" fill="#c41e3a" stroke="#5a0a14" stroke-width="0.4"/>
          </svg>
          <div class="uf-avatar" style="${avatarStyle}">${member.imageUrl ? '' : '<span class="initials">' + ini + '</span>'}</div>
          <div class="patriarch-info">
            <div class="name">${full}</div>
            <div class="role">${relString}</div>
            <div class="meta">Age: ${member.age} Yrs &middot; ${member.gender}<br>Occ: ${occupation}<br>Status: ${statusText}</div>
          </div>
          ${viewBtn}
        </div>
      </div>
    `;
  }

  const jeweled = member.isPlaceholder ? 'placeholder-node' : '';
  const gemsHtml = '';
  const fallbackSvg = member.imageUrl ? '' : `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#2a1410"/><path d="M10 100 L10 80 Q25 65 50 65 Q75 65 90 80 L90 100 Z" fill="#1a1a2e"/><ellipse cx="50" cy="42" rx="18" ry="22" fill="#d4a574"/><text x="50" y="47" font-size="16" fill="#fff" text-anchor="middle" font-family="Cinzel">${ini}</text></svg>`;

  return `
    <div class="child-card ${jeweled}" id="pc-${member.id}" data-id="${member.id}" ${onclickHtml}>
      <div class="child-inner">
        ${gemsHtml}
        <div class="photo-frame">
          <div class="photo-clip">
            <div class="photo-inner" style="${avatarStyle}">
              ${fallbackSvg}
            </div>
          </div>
        </div>
        <div class="child-info">
          <div class="child-name">${full} ${chk}</div>
          <div class="child-role">${relString}</div>
          <div class="child-meta">
            <div class="child-icons">
              ${isActive ? '<svg class="child-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M19 8c.6 0 1 .4 1 1v1c0 .6-.4 1-1 1h-1.2a6 6 0 01-.6 1.5l.9.9c.4.4.4 1 0 1.4l-.7.7c-.4.4-1 .4-1.4 0l-.9-.9a6 6 0 01-1.5.6V16c0 .6-.4 1-1 1h-1c-.6 0-1-.4-1-1v-1.2a6 6 0 01-1.5-.6l-.9.9c-.4.4-1 .4-1.4 0l-.7-.7c-.4-.4-.4-1 0-1.4l.9-.9A6 6 0 016.2 11H5c-.6 0-1-.4-1-1V9c0-.6.4-1 1-1h1.2c.1-.5.3-1 .6-1.5l-.9-.9c-.4-.4-.4-1 0-1.4l.7-.7c.4-.4 1-.4 1.4 0l.9.9c.5-.3 1-.5 1.5-.6V3c0-.6.4-1 1-1h1c.6 0 1 .4 1 1v1.2c.5.1 1 .3 1.5.6l.9-.9c.4-.4 1-.4 1.4 0l.7.7c.4.4.4 1 0 1.4l-.9.9c.3.5.5 1 .6 1.5H19zM11 12a2 2 0 100-4 2 2 0 000 4z"/></svg>' : '<svg class="child-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="15" r="6"/><path d="M9 9 L12 4 L15 9" fill="currentColor"/></svg>'}
            </div>
            <div class="child-fields">Age: ${member.age} Yrs &middot; ${member.gender}<br>Occ: ${occupation}<br>Status: ${statusText}</div>
          </div>
        </div>
        ${viewBtn}
      </div>
    </div>
  `;
}




function buildNodeHTML(m, currentPOV, onNodeClickName, isHead = false) {
  if (!m) return '';
  const rel = getSmartIndianRelation(familyMembers, currentPOV, m.id);
  const isActive = m.id === currentPOV;
  return renderProfileCardHTML(m, rel, { isActive, isHead, onNodeClickName });
}

function buildMarriageHTML(m1, m2, currentPOV, onNodeClickName, isHead = false) {
  function isDirect(id) {
     if (id === currentPOV) return true;
     const rel = getSmartIndianRelation(familyMembers, currentPOV, id);
     if (!rel) return false;
     const directs = ['Father', 'Mother', 'Son', 'Daughter', 'Brother', 'Sister', 'Husband', 'Wife', 'Self', 'Parent', 'Child', 'Spouse', 'Sibling'];
     if (!rel || !rel.english) return false;
     return directs.some(d => rel.english.toLowerCase().includes(d.toLowerCase()));
  }
  const lineStyle = 'border: none !important; background: transparent !important;';

  return `
    <div class="flex items-center gap-4" id="pair-${m1.id}-${m2.id}">
      ${buildNodeHTML(m1, currentPOV, onNodeClickName, isHead)}
      <div class="marriage-link"><div class="marriage-line" style="${lineStyle}"></div></div>
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
  
  let minTempGen = Math.min(...network.map(m => m._tempGen !== undefined ? m._tempGen : Infinity));
  if (minTempGen === Infinity) minTempGen = 10;
  
  network.forEach(m => {
    if (m._tempGen !== undefined) {
      m.gen = m._tempGen - minTempGen + 1;
    } else {
      // Fallback for orphaned/disconnected nodes caught in the visible set
      m.gen = 10 - minTempGen + 1;
    }
  });
  
  return network;
}

function toRoman(num) {
  const roman = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
  return roman[num] || num;
}

function renderTreeToContainer(containerId, canvasId, currentPOV, onNodeClickName) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.style.display = 'inline-flex';
  container.style.flexDirection = 'column';
  container.style.gap = '80px';
  container.style.alignItems = 'center';
  container.style.margin = '0 auto';
  
  const visibleMembers = getBloodlineNetwork(currentPOV);
  const validMembers = visibleMembers.filter(m => m.gen !== undefined && !isNaN(m.gen));
  if(validMembers.length === 0) {
    container.innerHTML = '<div class="text-muted">No valid network found.</div>';
    return;
  }
  
  let html = '';
  const maxGen = Math.max(...validMembers.map(m => m.gen));
  const minGen = Math.min(...validMembers.map(m => m.gen));
  
  for(let g = minGen; g <= maxGen; g++) {
    const genMembers = validMembers.filter(m => m.gen === g);
    if(genMembers.length === 0) continue;
    
    let processed = new Set();
    let rowHTML = `<div class="tree-row" id="row-gen${g}"><div class="gl">Generation ${toRoman(g)}</div>`;
    
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
  
  // Wait for DOM to render then draw connections and place gems using ResizeObserver
  if (window.sharedTreeObserver) window.sharedTreeObserver.disconnect();
  const drawTree = () => {
    drawTreeConnections(containerId, canvasId, visibleMembers, currentPOV);
    placeGemsForActiveNode(currentPOV);
  };
  window.sharedTreeObserver = new ResizeObserver(() => drawTree());
  window.sharedTreeObserver.observe(container);
  setTimeout(drawTree, 100);
}

function placeGemsForActiveNode(currentPOV) {
  const container = document.getElementById(`gems-${currentPOV}`);
  if (!container) return;
  container.innerHTML = '';
  const rect = container.getBoundingClientRect();
  const W = rect.width, H = rect.height, r = 10, spacing = 14;
  if (W === 0 || H === 0) return;
  const points = [];
  for (let x = r; x <= W - r; x += spacing) points.push([x, r]);
  for (let y = r + spacing; y <= H - r; y += spacing) points.push([W - r, y]);
  for (let x = W - r - spacing; x >= r; x -= spacing) points.push([x, H - r]);
  for (let y = H - r - spacing; y >= r + spacing; y -= spacing) points.push([r, y]);
  points.forEach((p, i) => {
    const g = document.createElement('div');
    g.className = 'gem ' + (i % 3 === 0 ? 'emerald' : 'ruby');
    g.style.left = (p[0] - 4) + 'px'; g.style.top = (p[1] - 4) + 'px';
    container.appendChild(g);
  });
}

function drawTreeConnections(containerId, canvasId, visibleMembers, currentPOV) {
  const containerWrapper = document.getElementById(containerId).parentElement;
  const svgGroup = document.getElementById('conn-group');
  const svgCanvas = document.querySelector('.connections');
  if (!svgGroup || !svgCanvas || !containerWrapper) return;
  
  // Ensure SVG covers scrollable area
  svgCanvas.style.width = containerWrapper.scrollWidth + 'px';
  svgCanvas.style.height = containerWrapper.scrollHeight + 'px';
  
  let solidPathString = '';
  let dottedPathString = '';
  let orbsString = '';
  
  function isDirect(id) {
     if (id === currentPOV) return true;
     const rel = getSmartIndianRelation(familyMembers, currentPOV, id);
     if (!rel) return false;
     const directs = ['Father', 'Mother', 'Son', 'Daughter', 'Brother', 'Sister', 'Husband', 'Wife', 'Self', 'Parent', 'Child', 'Spouse', 'Sibling'];
     if (!rel || !rel.english) return false;
     return directs.some(d => rel.english.toLowerCase().includes(d.toLowerCase()));
  }
  
  function getCenter(id, anchor='top') {
    const el = document.getElementById(`pc-${id}`);
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const cRect = containerWrapper.getBoundingClientRect();
    const x = rect.left - cRect.left + containerWrapper.scrollLeft + (rect.width / 2);
    let y = rect.top - cRect.top + containerWrapper.scrollTop;
    if(anchor==='bottom') y += rect.height;
    if(anchor==='center') y += rect.height/2;
    return { x, y, id: id };
  }
  
  function getPairCenter(id1, id2) {
    const c1 = getCenter(id1, 'center');
    const c2 = getCenter(id2, 'center');
    if(!c1 || !c2) return null;
    return { x: (c1.x + c2.x)/2, y: c1.y + 12 };
  }

  function appendForkPath(startPt, pIds, targets) {
    if(!targets || targets.length === 0) return;
    const targetCenters = targets.map(id => getCenter(id, 'top')).filter(c=>c);
    if(targetCenters.length === 0) return;
    
    const startX = startPt.x;
    const startY = startPt.y;
    
    // Bottom level of parent card (so that we always align midY relative to parent bottom)
    const parentBottomY = getCenter(pIds[0], 'bottom').y;
    const midY = parentBottomY + 40; 
    
    // Check if the source parent(s) are ALL direct
    const sourceDirect = pIds.every(pid => isDirect(pid));

    // If there are 2 parents, draw the horizontal marriage connection line and ring in SVG
    if (pIds.length === 2) {
      const c1 = getCenter(pIds[0], 'center');
      const c2 = getCenter(pIds[1], 'center');
      if (c1 && c2) {
         const isM1Direct = isDirect(pIds[0]);
         const isM2Direct = isDirect(pIds[1]);
         const isMarriageSolid = isM1Direct && isM2Direct;
         
         const marriagePath = ` M ${c1.x} ${c1.y} L ${c2.x} ${c2.y} `;
         if (isMarriageSolid) {
            solidPathString += marriagePath;
         } else {
            dottedPathString += marriagePath;
         }
         
         const midX = (c1.x + c2.x) / 2;
         const midY_m = c1.y;
         orbsString += `
           <circle cx="${midX}" cy="${midY_m}" r="12" class="gold-marriage-ring-bg" style="fill: var(--bg-card, #1a0406); stroke: var(--gold); stroke-width: 1.5;" />
           <circle cx="${midX}" cy="${midY_m}" r="9" class="gold-marriage-ring" style="fill: none; stroke: var(--gold); stroke-width: 1.5; filter: drop-shadow(0 0 4px var(--gold));" />
           <text x="${midX}" y="${midY_m + 3.5}" font-size="10" text-anchor="middle" style="fill: var(--gold); font-family: sans-serif;">💍</text>
         `;
      }
    }

    targetCenters.forEach(t => {
      const isTargetDirect = isDirect(t.id);
      const isSolid = sourceDirect && isTargetDirect;
      
      let pString = '';
      const dx = t.x - startX;
      
      if (Math.abs(dx) < 5) {
        // Straight vertical drop
        pString += ` M ${startX} ${startY} L ${t.x} ${t.y} `;
      } else {
        // Orthogonal T-shaped connector
        pString += ` M ${startX} ${startY} L ${startX} ${midY} L ${t.x} ${midY} L ${t.x} ${t.y} `;
        
        orbsString += `<circle cx="${startX}" cy="${midY}" r="4" class="gold-joint-orb" />`;
        orbsString += `<circle cx="${t.x}" cy="${midY}" r="4" class="gold-joint-orb" />`;
      }
      
      if (isSolid) {
         solidPathString += pString;
      } else {
         dottedPathString += pString;
      }
    });
  }

  const parentGroups = {};
  visibleMembers.forEach(m => {
    if(!document.getElementById(`pc-${m.id}`)) return;
    if(m.parents && m.parents.length > 0) {
      const visibleParentsSet = new Set();
      m.parents.forEach(pid => {
        if (document.getElementById(`pc-${pid}`)) {
          visibleParentsSet.add(pid);
        }
        // Force-pair with spouse if spouse is also visible
        const spouse = (typeof getSpouse === 'function') ? getSpouse(pid) : null;
        if (spouse && document.getElementById(`pc-${spouse.id}`)) {
          visibleParentsSet.add(spouse.id);
        }
      });
      const visibleParents = Array.from(visibleParentsSet);
      if(visibleParents.length > 0) {
        const key = [...visibleParents].sort().join('+');
        if(!parentGroups[key]) parentGroups[key] = [];
        parentGroups[key].push(m.id);
      }
    }
  });
  
  Object.keys(parentGroups).forEach(key => {
    const pIds = key.split('+');
    const children = parentGroups[key];
    
    let startPt = null;
    if(pIds.length === 2) {
      startPt = getPairCenter(pIds[0], pIds[1]);
    } else if(pIds.length === 1) {
      startPt = getCenter(pIds[0], 'bottom');
    }
    
    if(startPt) appendForkPath(startPt, pIds, children);
  });
  
  svgGroup.innerHTML = `
    <!-- Solid Direct Lines -->
    <path d="${solidPathString}" class="line-shadow-base" />
    <path d="${solidPathString}" class="glow-line-core" />
    <path d="${solidPathString}" class="glow-pulse-overlay" />
    
    <!-- Dotted Indirect Lines -->
    <path d="${dottedPathString}" fill="none" stroke="#f4d772" stroke-width="2.5" stroke-dasharray="6, 6" opacity="0.95" filter="drop-shadow(0 0 4px rgba(244,215,114,0.6))" />
    
    ${orbsString}
  `;
}
