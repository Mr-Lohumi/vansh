const fs = require('fs');
let content = fs.readFileSync('matchmaking.html', 'utf8');
content = content.replace(/\\\$\{/g, '${');
fs.writeFileSync('matchmaking.html', content);
