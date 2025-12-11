const fs = require('fs');

// Fix roles page
try {
    let rolesPage = fs.readFileSync('src/app/admin/roles/page.tsx', 'utf8');
    rolesPage = rolesPage.replace(/permission="Role\.Manage"/g, 'permission="Role.Create"');
    fs.writeFileSync('src/app/admin/roles/page.tsx', rolesPage);
    console.log('✅ Fixed src/app/admin/roles/page.tsx');
} catch (e) {
    console.error('❌ Failed to fix roles page:', e.message);
}

// Fix permissions page  
try {
    let permissionsPage = fs.readFileSync('src/app/admin/permissions/page.tsx', 'utf8');
    permissionsPage = permissionsPage.replace(/permission="Permission\.Manage"/g, 'permission="Permission.Create"');
    fs.writeFileSync('src/app/admin/permissions/page.tsx', permissionsPage);
    console.log('✅ Fixed src/app/admin/permissions/page.tsx');
} catch (e) {
    console.error('❌ Failed to fix permissions page:', e.message);
}

// Fix menus page
try {
    let menusPage = fs.readFileSync('src/app/admin/menus/page.tsx', 'utf8');
    menusPage = menusPage.replace(/permission="Permission\.Manage"/g, 'permission="Menu.Create"');
    fs.writeFileSync('src/app/admin/menus/page.tsx', menusPage);
    console.log('✅ Fixed src/app/admin/menus/page.tsx');
} catch (e) {
    console.error('❌ Failed to fix menus page:', e.message);
}

// Fix debug permissions page
try {
    let debugPage = fs.readFileSync('src/app/admin/debug-permissions/page.tsx', 'utf8');
    debugPage = debugPage.replace(/'Role\.Manage'/g, "'Role.View'");
    debugPage = debugPage.replace(/'Permission\.Manage'/g, "'Permission.View'");
    fs.writeFileSync('src/app/admin/debug-permissions/page.tsx', debugPage);
    console.log('✅ Fixed src/app/admin/debug-permissions/page.tsx');
} catch (e) {
    console.error('❌ Failed to fix debug page:', e.message);
}

console.log('\n🎉 All frontend pages fixed!');
