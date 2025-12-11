/**
 * Fix menu.service.ts to use api instead of axios
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/services/menu.service.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Replace all axios calls with api
content = content.replace(/axios\./g, 'api.');
content = content.replace(/axios</g, 'api<');

fs.writeFileSync(filePath, content);
console.log('✅ Fixed menu.service.ts');
