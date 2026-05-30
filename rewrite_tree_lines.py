import re

def rewrite_tree_lines():
    with open('js/shared-tree.js', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Pass currentPOV to drawTreeConnections
    content = content.replace(
        "drawTreeConnections(containerId, canvasId, visibleMembers);",
        "drawTreeConnections(containerId, canvasId, visibleMembers, currentPOV);"
    )

    # 2. Modify drawTreeConnections signature
    content = content.replace(
        "function drawTreeConnections(containerId, canvasId, visibleMembers) {",
        "function drawTreeConnections(containerId, canvasId, visibleMembers, currentPOV) {"
    )

    # 3. Modify drawTreeConnections logic to handle direct/indirect line styling
    old_draw_logic = """  let pathString = '';
  let orbsString = '';
  
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

  function appendForkPath(startX, startY, targets) {
    if(!targets || targets.length === 0) return;
    const targetCenters = targets.map(id => getCenter(id, 'top')).filter(c=>c);
    if(targetCenters.length === 0) return;
    
    const midY = startY + 50; 
    const radius = 18;

    targetCenters.forEach(t => {
      // Calculate curve directions
      const dx = t.x - startX;
      
      // If directly below, just draw a straight line
      if (Math.abs(dx) < 5) {
        pathString += ` M ${startX} ${startY} L ${t.x} ${t.y} `;
        return;
      }
      
      // Right curve or left curve
      const rDir = dx > 0 ? radius : -radius;
      
      pathString += ` M ${startX} ${startY} L ${startX} ${midY - radius} `;
      pathString += ` Q ${startX} ${midY} ${startX + rDir} ${midY} `;
      pathString += ` L ${t.x - rDir} ${midY} `;
      pathString += ` Q ${t.x} ${midY} ${t.x} ${midY + radius} `;
      pathString += ` L ${t.x} ${t.y} `;
      
      // Add orbs at junctions
      orbsString += `<circle cx="${startX}" cy="${midY - radius}" r="4" class="gold-joint-orb" />`;
      orbsString += `<circle cx="${t.x}" cy="${midY}" r="4" class="gold-joint-orb" />`;
    });
  }

  // Group children by their parents
  const parentGroups = {};
  visibleMembers.forEach(m => {
    if(!document.getElementById(`pc-${m.id}`)) return;
    if(m.parents && m.parents.length > 0) {
      const visibleParents = m.parents.filter(pid => document.getElementById(`pc-${pid}`));
      if(visibleParents.length > 0) {
        const key = [...visibleParents].sort().join('+');
        if(!parentGroups[key]) parentGroups[key] = [];
        parentGroups[key].push(m.id);
      }
    }
  });
  
  // Build forks
  Object.keys(parentGroups).forEach(key => {
    const pIds = key.split('+');
    const children = parentGroups[key];
    
    let startPt = null;
    if(pIds.length === 2) {
      startPt = getPairCenterBottom(pIds[0], pIds[1]);
    } else if(pIds.length === 1) {
      startPt = getCenter(pIds[0], 'bottom');
    }
    
    if(startPt) appendForkPath(startPt.x, startPt.y, children);
  });
  
  svgGroup.innerHTML = `
    <path d="${pathString}" class="line-shadow-base" />
    <path d="${pathString}" class="glow-line-core" />
    <path d="${pathString}" class="glow-pulse-overlay" />
    ${orbsString}
  `;"""

    new_draw_logic = """  let solidPathString = '';
  let dottedPathString = '';
  let orbsString = '';
  
  function isDirect(id) {
     if (id === currentPOV) return true;
     const rel = getSmartIndianRelation(familyMembers, currentPOV, id);
     if (!rel) return false;
     const directs = ['Father', 'Mother', 'Son', 'Daughter', 'Brother', 'Sister', 'Husband', 'Wife', 'Self', 'Parent', 'Child', 'Spouse', 'Sibling'];
     return directs.includes(rel.english);
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
  
  function getPairCenterBottom(id1, id2) {
    const c1 = getCenter(id1, 'bottom');
    const c2 = getCenter(id2, 'bottom');
    if(!c1 || !c2) return null;
    return { x: (c1.x + c2.x)/2, y: c1.y };
  }

  function appendForkPath(startPt, pIds, targets) {
    if(!targets || targets.length === 0) return;
    const targetCenters = targets.map(id => getCenter(id, 'top')).filter(c=>c);
    if(targetCenters.length === 0) return;
    
    const startX = startPt.x;
    const startY = startPt.y;
    const midY = startY + 50; 
    const radius = 18;
    
    // Check if the source parent(s) are ALL direct
    const sourceDirect = pIds.every(pid => isDirect(pid));

    targetCenters.forEach(t => {
      // If source is direct AND target child is direct -> solid. Else -> dotted.
      const isTargetDirect = isDirect(t.id);
      const isSolid = sourceDirect && isTargetDirect;
      
      let pString = '';

      const dx = t.x - startX;
      
      if (Math.abs(dx) < 5) {
        pString += ` M ${startX} ${startY} L ${t.x} ${t.y} `;
      } else {
        const rDir = dx > 0 ? radius : -radius;
        pString += ` M ${startX} ${startY} L ${startX} ${midY - radius} `;
        pString += ` Q ${startX} ${midY} ${startX + rDir} ${midY} `;
        pString += ` L ${t.x - rDir} ${midY} `;
        pString += ` Q ${t.x} ${midY} ${t.x} ${midY + radius} `;
        pString += ` L ${t.x} ${t.y} `;
        
        orbsString += `<circle cx="${startX}" cy="${midY - radius}" r="4" class="gold-joint-orb" />`;
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
      const visibleParents = m.parents.filter(pid => document.getElementById(`pc-${pid}`));
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
      startPt = getPairCenterBottom(pIds[0], pIds[1]);
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
    <path d="${dottedPathString}" fill="none" stroke="var(--gold)" stroke-width="1.5" stroke-dasharray="3, 4" opacity="0.8" />
    
    ${orbsString}
  `;"""

    content = content.replace(old_draw_logic, new_draw_logic)

    # 4. We also need to fix the marriage line
    # buildMarriageHTML:
    old_marr_html = """function buildMarriageHTML(m1, m2, currentPOV, onNodeClickName, isHead = false) {
  return `
    <div class="flex items-center gap-4" id="pair-${m1.id}-${m2.id}">
      ${buildNodeHTML(m1, currentPOV, onNodeClickName, isHead)}
      <div class="marriage-link"><div class="marriage-line"></div></div>
      ${buildNodeHTML(m2, currentPOV, onNodeClickName, isHead)}
    </div>
  `;
}"""
    
    new_marr_html = """function buildMarriageHTML(m1, m2, currentPOV, onNodeClickName, isHead = false) {
  function isDirect(id) {
     if (id === currentPOV) return true;
     const rel = getSmartIndianRelation(familyMembers, currentPOV, id);
     if (!rel) return false;
     const directs = ['Father', 'Mother', 'Son', 'Daughter', 'Brother', 'Sister', 'Husband', 'Wife', 'Self', 'Parent', 'Child', 'Spouse', 'Sibling'];
     return directs.includes(rel.english);
  }
  const isSolid = isDirect(m1.id) && isDirect(m2.id);
  const lineStyle = isSolid ? 'border-top: 2px solid var(--gold);' : 'border-top: 1.5px dashed var(--gold); opacity: 0.8;';

  return `
    <div class="flex items-center gap-4" id="pair-${m1.id}-${m2.id}">
      ${buildNodeHTML(m1, currentPOV, onNodeClickName, isHead)}
      <div class="marriage-link"><div class="marriage-line" style="${lineStyle}"></div></div>
      ${buildNodeHTML(m2, currentPOV, onNodeClickName, isHead)}
    </div>
  `;
}"""
    
    content = content.replace(old_marr_html, new_marr_html)

    with open('js/shared-tree.js', 'w', encoding='utf-8') as f:
        f.write(content)

    print("Rewrote drawTreeConnections and buildMarriageHTML successfully")

rewrite_tree_lines()
