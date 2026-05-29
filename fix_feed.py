import re

with open('dashboard.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the HTML templates for feed cards
def build_new_card(icon_svg, author_badge, time_text, title, desc, extra_html, actions_html, bg_style=""):
    return f"""
                <div class="feed-card"{bg_style}>
                  <div style="display: flex; gap: 16px; align-items: flex-start;">
                    <div class="fc-img-box" style="margin-bottom:0;">{icon_svg}</div>
                    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:2px; height: 44px;">
                      <div style="font-size:12px; font-weight:800; color:#3c1218; font-family:'Cinzel', serif; letter-spacing:1px; text-transform:uppercase;">${{getFullName(author)}} <span style="font-size:9px; color:#946941; font-family:'Outfit', sans-serif; text-transform:uppercase; margin-left:6px; font-weight:600; padding:2px 6px; background:rgba(220,179,129,0.15); border-radius:4px;">{author_badge}</span></div>
                      <div style="font-size:11px; color:#7c4c3a; font-family:'Outfit', sans-serif; font-weight:500;">{time_text}</div>
                    </div>
                    <div class="fc-avatar" style="${{avaStyle}}">${{getInitials(author)}}</div>
                  </div>
                  <div class="fc-title" style="margin-top:4px;">{title}</div>
                  <div class="fc-desc" style="flex:1;">{desc}</div>
                  {extra_html}
                  <div class="fc-actions" style="padding-left:0; margin-top:8px;">
{actions_html}
                  </div>
                </div>
              `"""


# I need to do a targeted replacement. I'll just write a script to replace the entire `feedItems.forEach(item => { ... });` block

old_block_regex = re.compile(r'feedItems\.forEach\(item => \{.*?feedContainer\.innerHTML = html;', re.DOTALL)

new_block = """feedItems.forEach(item => {
           const timeAgo = formatTimeAgo(item.time);
           let author, avaStyle;
           if (item.type === 'invite') {
              author = getMemberById(item.data.senderUserId) || { firstName: 'Someone', lastName: '' };
           } else if (item.type === 'birthday') {
              author = item.data;
           } else {
              author = getMemberById(item.data.owner_id) || { firstName: 'Family Member', lastName: '' };
           }
           avaStyle = author.imageUrl ? `background-image:url('${author.imageUrl}');color:transparent;` : '';

           if (item.type === 'invite') {
              html += `
                <div class="feed-card" style="border: 1px solid var(--gold); background: #fdfaf6;">
                  <div style="display: flex; gap: 16px; align-items: flex-start;">
                    <div class="fc-img-box" style="margin-bottom:0;"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5c-2.2 0-4 1.8-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg></div>
                    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:2px; height: 44px;">
                      <div style="font-size:11px; font-weight:800; color:#3c1218; font-family:'Cinzel', serif; letter-spacing:1px; text-transform:uppercase;">${getFullName(author)} <span style="font-size:9px; color:#946941; font-family:'Outfit', sans-serif; text-transform:uppercase; margin-left:6px; font-weight:600; padding:2px 6px; background:rgba(220,179,129,0.15); border-radius:4px;">New Request</span></div>
                      <div style="font-size:11px; color:#7c4c3a; font-family:'Outfit', sans-serif; font-weight:500;">${timeAgo}</div>
                    </div>
                    <div class="fc-avatar" style="${avaStyle}">${getInitials(author)}</div>
                  </div>
                  <div class="fc-title" style="margin-top:4px;">Pending Relationship Request</div>
                  <div class="fc-desc" style="flex:1;">Proposed relationship: <b>${item.data.relationType}</b></div>
                  <div class="fc-actions" style="padding-left:0; margin-top:8px;">
                        <button class="fc-btn primary" onclick="acceptInvite('${item.data.id}'); setTimeout(()=>location.reload(),500);">Accept</button>
                        <button class="fc-btn" onclick="rejectInvite('${item.data.id}'); setTimeout(()=>location.reload(),500);">Reject</button>
                  </div>
                </div>
              `;
           }
           else if (item.type === 'birthday') {
              html += `
                <div class="feed-card">
                  <div style="display: flex; gap: 16px; align-items: flex-start;">
                    <div class="fc-img-box" style="margin-bottom:0;"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg></div>
                    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:2px; height: 44px;">
                      <div style="font-size:11px; font-weight:800; color:#3c1218; font-family:'Cinzel', serif; letter-spacing:1px; text-transform:uppercase;">${getFullName(author)} <span style="font-size:9px; color:#946941; font-family:'Outfit', sans-serif; text-transform:uppercase; margin-left:6px; font-weight:600; padding:2px 6px; background:rgba(220,179,129,0.15); border-radius:4px;">Celebration</span></div>
                      <div style="font-size:11px; color:#7c4c3a; font-family:'Outfit', sans-serif; font-weight:500;">Upcoming on ${author.dob}</div>
                    </div>
                    <div class="fc-avatar" style="${avaStyle}">${getInitials(author)}</div>
                  </div>
                  <div class="fc-title" style="margin-top:4px;">Wish ${author.firstName} a Happy Birthday!</div>
                  <div class="fc-desc" style="flex:1;">Join the family in celebrating ${author.firstName}'s special day.</div>
                  <div class="fc-actions" style="padding-left:0; margin-top:8px;">
                        <button class="fc-btn primary" onclick="alert('Message feature coming soon')">Send Wishes</button>
                  </div>
                </div>
              `;
           }
           else if (item.type === 'museum') {
              html += `
                <div class="feed-card">
                  <div style="display: flex; gap: 16px; align-items: flex-start;">
                    <div class="fc-img-box" style="margin-bottom:0;"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg></div>
                    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:2px; height: 44px;">
                      <div style="font-size:11px; font-weight:800; color:#3c1218; font-family:'Cinzel', serif; letter-spacing:1px; text-transform:uppercase;">${getFullName(author)} <span style="font-size:9px; color:#946941; font-family:'Outfit', sans-serif; text-transform:uppercase; margin-left:6px; font-weight:600; padding:2px 6px; background:rgba(220,179,129,0.15); border-radius:4px;">Heritage</span></div>
                      <div style="font-size:11px; color:#7c4c3a; font-family:'Outfit', sans-serif; font-weight:500;">Added a new artifact • ${timeAgo}</div>
                    </div>
                    <div class="fc-avatar" style="${avaStyle}">${getInitials(author)}</div>
                  </div>
                  <div class="fc-title" style="margin-top:4px;">${item.data.title}</div>
                  <div class="fc-desc" style="flex:1;">${item.data.desc}</div>
                  ${item.data.imgUrl ? `<img src="${item.data.imgUrl}" class="fc-media" />` : ''}
                  <div class="fc-actions" style="padding-left:0; margin-top:8px;">
                        <button class="fc-btn" onclick="window.location.href='museum.html'">View in Museum</button>
                  </div>
                </div>
              `;
           }
           else if (item.type === 'event') {
              const rsvps = item.data.rsvps || [];
              const yesCount = rsvps.filter(r => r.status === 'yes').length;
              html += `
                <div class="feed-card">
                  <div style="display: flex; gap: 16px; align-items: flex-start;">
                    <div class="fc-img-box" style="margin-bottom:0;"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg></div>
                    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:2px; height: 44px;">
                      <div style="font-size:11px; font-weight:800; color:#3c1218; font-family:'Cinzel', serif; letter-spacing:1px; text-transform:uppercase;">${getFullName(author)} <span style="font-size:9px; color:#946941; font-family:'Outfit', sans-serif; text-transform:uppercase; margin-left:6px; font-weight:600; padding:2px 6px; background:rgba(220,179,129,0.15); border-radius:4px;">Event</span></div>
                      <div style="font-size:11px; color:#7c4c3a; font-family:'Outfit', sans-serif; font-weight:500;">Scheduled an event • ${timeAgo}</div>
                    </div>
                    <div class="fc-avatar" style="${avaStyle}">${getInitials(author)}</div>
                  </div>
                  <div class="fc-title" style="margin-top:4px;">${item.data.title}</div>
                  <div class="fc-desc" style="flex:1; font-weight:600; margin-bottom:4px; color:#3c1218;">📅 ${item.data.dateStr} | 📍 ${item.data.location || 'TBD'}</div>
                  <div class="fc-desc" style="flex:1;">${item.data.desc}</div>
                  <div class="rsvp-counts" style="margin-top:8px;">
                     <div class="rsvp-count">✅ ${yesCount} attending</div>
                  </div>
                  <div class="fc-actions" style="padding-left:0; margin-top:8px;">
                        <button class="fc-btn primary" onclick="window.location.href='events.html'">RSVP</button>
                  </div>
                </div>
              `;
           }
           else if (item.type === 'tradition') {
              html += `
                <div class="feed-card">
                  <div style="display: flex; gap: 16px; align-items: flex-start;">
                    <div class="fc-img-box" style="margin-bottom:0;"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg></div>
                    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:2px; height: 44px;">
                      <div style="font-size:11px; font-weight:800; color:#3c1218; font-family:'Cinzel', serif; letter-spacing:1px; text-transform:uppercase;">${getFullName(author)} <span style="font-size:9px; color:#946941; font-family:'Outfit', sans-serif; text-transform:uppercase; margin-left:6px; font-weight:600; padding:2px 6px; background:rgba(220,179,129,0.15); border-radius:4px;">Tradition</span></div>
                      <div style="font-size:11px; color:#7c4c3a; font-family:'Outfit', sans-serif; font-weight:500;">Added to ${item.data.category || 'Archive'} • ${timeAgo}</div>
                    </div>
                    <div class="fc-avatar" style="${avaStyle}">${getInitials(author)}</div>
                  </div>
                  <div class="fc-title" style="margin-top:4px;">${item.data.title}</div>
                  <div class="fc-desc" style="flex:1; white-space: pre-line;">${item.data.desc.substring(0, 150)}${item.data.desc.length > 150 ? '...' : ''}</div>
                  ${item.data.imgUrl ? `<img src="${item.data.imgUrl}" class="fc-media" />` : ''}
                  <div class="fc-actions" style="padding-left:0; margin-top:8px;">
                        <button class="fc-btn" onclick="window.location.href='traditions.html'">Read More</button>
                  </div>
                </div>
              `;
           }
           else if (item.type === 'post') {
              html += `
                <div class="feed-card">
                  <div style="display: flex; gap: 16px; align-items: flex-start;">
                    <div class="fc-img-box" style="margin-bottom:0; background: linear-gradient(135deg, #a18a7a 0%, #7c4c3a 100%);"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg></div>
                    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:2px; height: 44px;">
                      <div style="font-size:11px; font-weight:800; color:#3c1218; font-family:'Cinzel', serif; letter-spacing:1px; text-transform:uppercase;">${getFullName(author)} <span style="font-size:9px; color:#946941; font-family:'Outfit', sans-serif; text-transform:uppercase; margin-left:6px; font-weight:600; padding:2px 6px; background:rgba(220,179,129,0.15); border-radius:4px;">Update</span></div>
                      <div style="font-size:11px; color:#7c4c3a; font-family:'Outfit', sans-serif; font-weight:500;">${timeAgo}</div>
                    </div>
                    <div class="fc-avatar" style="${avaStyle}">${getInitials(author)}</div>
                  </div>
                  <div class="fc-title" style="margin-top:4px;"></div>
                  <div class="fc-desc" style="flex:1; white-space: pre-line; color:var(--text); font-size:15px;">${item.data.content}</div>
                  ${item.data.imgUrl ? `<img src="${item.data.imgUrl}" class="fc-media" />` : ''}
                  <div class="fc-actions" style="padding-left:0; margin-top:8px;">
                        <button class="fc-btn" style="border:none; padding:4px 0;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> Like</button>
                        <button class="fc-btn" style="border:none; padding:4px 0;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> Comment</button>
                  </div>
                </div>
              `;
           }
           else if (item.type === 'memory') {
              html += `
                <div class="feed-card" style="background: linear-gradient(135deg, #fdfbf7, #f5eedf);">
                  <div style="display: flex; gap: 16px; align-items: flex-start;">
                    <div class="fc-img-box" style="margin-bottom:0; background: linear-gradient(135deg, #3c1218 0%, #1a0406 100%);"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div>
                    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:2px; height: 44px;">
                      <div style="font-size:11px; font-weight:800; color:#3c1218; font-family:'Cinzel', serif; letter-spacing:1px; text-transform:uppercase;">On This Day <span style="font-size:9px; color:#fff; font-family:'Outfit', sans-serif; text-transform:uppercase; margin-left:6px; font-weight:600; padding:2px 6px; background:#dcb381; border-radius:4px;">${item.yearsAgo} Years Ago</span></div>
                      <div style="font-size:11px; color:#7c4c3a; font-family:'Outfit', sans-serif; font-weight:500;">Shared by ${getFullName(author)}</div>
                    </div>
                    <div class="fc-avatar" style="${avaStyle}">${getInitials(author)}</div>
                  </div>
                  <div class="fc-title" style="margin-top:4px;">${item.data.title}</div>
                  <div class="fc-desc" style="flex:1;">${item.data.desc || ''}</div>
                  ${item.data.imgUrl ? `<img src="${item.data.imgUrl}" class="fc-media" />` : ''}
                  <div class="fc-actions" style="padding-left:0; margin-top:8px;">
                        <button class="fc-btn primary" onclick="window.location.href='museum.html'">View in Museum</button>
                  </div>
                </div>
              `;
           }
       });

       feedContainer.innerHTML = html;"""

new_content = old_block_regex.sub(new_block, content)

with open('dashboard.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Updated dashboard.html with premium feed layout!")
