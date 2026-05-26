const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && !['index.html', 'body_dump.html', 'timeline.html'].includes(f));

const scriptBlock = `
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="js/supabase-config.js?v=12"></script>
  <script src="js/shared-auth.js?v=12"></script>
  <script src="js/shared-data.js?v=12"></script>
  <script src="js/shared-nav.js?v=12"></script>`;

files.forEach(f => {
  const p = path.join(dir, f);
  let content = fs.readFileSync(p, 'utf8');

  // Clean up
  content = content.replace(/<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase\/supabase-js@2"><\/script>\s*/g, '');
  content = content.replace(/<script src="js\/supabase-config\.js[^"]*"><\/script>\s*/g, '');
  content = content.replace(/<script src="js\/shared-auth\.js[^"]*"><\/script>\s*/g, '');
  content = content.replace(/<script src="js\/shared-data\.js[^"]*"><\/script>\s*/g, '');
  content = content.replace(/<script src="js\/shared-nav\.js[^"]*"><\/script>\s*/g, '');

  if (content.includes('<script src="js/shared-tree.js')) {
    content = content.replace(/(<script src="js\/shared-tree\.js[^"]*"><\/script>)/, scriptBlock + '\n  $1');
  } else if (content.includes('<script>')) {
    content = content.replace(/(<script>)/, scriptBlock + '\n  $1');
  } else {
    content = content.replace(/(<\/body>)/, scriptBlock + '\n$1');
  }

  fs.writeFileSync(p, content, 'utf8');
  console.log(`Updated ${f}`);
});
