import re

# 1. Remove duplicate processCloudInvite from supabase-config.js
with open('js/supabase-config.js', 'r', encoding='utf-8') as f:
    supabase_code = f.read()

# We will just remove the assignment `window.processCloudInvite = processCloudInvite;` 
# and rename the function to something unused to effectively disable it.
supabase_code = re.sub(r'window\.processCloudInvite\s*=\s*processCloudInvite;', '', supabase_code)
supabase_code = re.sub(r'async function processCloudInvite\(', 'async function oldProcessCloudInvite_UNUSED(', supabase_code)

with open('js/supabase-config.js', 'w', encoding='utf-8') as f:
    f.write(supabase_code)


# 2. Add feed event generation to shared-data.js
with open('js/shared-data.js', 'r', encoding='utf-8') as f:
    shared_data = f.read()

feed_logic = """
  saveFamilyData(familyMembers);
  
  // Create a system post so it shows in the feed!
  try {
     const posts = JSON.parse(localStorage.getItem('vansh_posts_db') || '[]');
     posts.unshift({
        id: 'POST_' + Date.now() + Math.random().toString(36).substr(2,5),
        owner_id: fromUser.id,
        authorName: 'Family System',
        content: `🌟 ${fromUser.firstName} and ${toUser.firstName} are now connected in the Family Tree!`,
        created_at: Date.now(),
        likes: [],
        comments: []
     });
     localStorage.setItem('vansh_posts_db', JSON.stringify(posts));
  } catch(e) {}
  
  // Sync the updated users to cloud
"""

shared_data = shared_data.replace(
    "saveFamilyData(familyMembers);\n  \n  // Sync the updated users to cloud",
    feed_logic
)

with open('js/shared-data.js', 'w', encoding='utf-8') as f:
    f.write(shared_data)


# 3. Fix dashboard.html targetUserId -> toUserId
with open('dashboard.html', 'r', encoding='utf-8') as f:
    dashboard_html = f.read()

dashboard_html = dashboard_html.replace('i.targetUserId === myId', 'i.toUserId === myId')

with open('dashboard.html', 'w', encoding='utf-8') as f:
    f.write(dashboard_html)

print("Applied fixes for Tree rendering and Feed!")
