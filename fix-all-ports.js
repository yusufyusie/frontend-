/**
 * Find and fix ALL remaining port 3000 references in frontend
 */

const fs = require('fs');
const path = require('path');

function searchAndReplace(dir) {
    const files = fs.readdirSync(dir);
    let fixed = 0;

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            if (!file.startsWith('.') && file !== 'node_modules') {
                fixed += searchAndReplace(filePath);
            }
        } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
            let content = fs.readFileSync(filePath, 'utf8');
            if (content.includes('localhost:3000')) {
                content = content.replace(/localhost:3000/g, 'localhost:3001');
                fs.writeFileSync(filePath, content);
                console.log(`✅ Fixed: ${filePath}`);
                fixed++;
            }
        }
    });

    return fixed;
}

const srcDir = path.join(__dirname, 'src');
const fixed = searchAndReplace(srcDir);

console.log(`\n✅ Fixed ${fixed} files with port 3000 → 3001`);
