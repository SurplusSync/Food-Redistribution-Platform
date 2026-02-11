import fs from 'fs';
import path from 'path';

const fileMap = {
  'src/__tests__/App.test.tsx': 'App',
  'src/__tests__/layouts/DashboardLayout.test.tsx': 'DashboardLayout',
  'src/__tests__/pages/LandingPage.test.tsx': 'LandingPage',
  'src/__tests__/pages/Login.test.tsx': 'Login',
  'src/__tests__/pages/Register.test.tsx': 'Register',
  'src/__tests__/pages/dashboard/AddFood.test.tsx': 'AddFood',
  'src/__tests__/pages/dashboard/DiscoveryMap.test.tsx': 'DiscoveryMap',
  'src/__tests__/pages/dashboard/DonorHome.test.tsx': 'DonorHome',
  'src/__tests__/pages/dashboard/History.test.tsx': 'History',
  'src/__tests__/pages/dashboard/Impact.test.tsx': 'Impact',
  'src/__tests__/pages/dashboard/NGODashboard.test.tsx': 'NGODashboard',
  'src/__tests__/pages/dashboard/Notifications.test.tsx': 'Notifications',
  'src/__tests__/pages/dashboard/Profile.test.tsx': 'Profile',
  'src/__tests__/pages/dashboard/VolunteerDashboard.test.tsx': 'VolunteerDashboard'
};

Object.entries(fileMap).forEach(([filePath, _componentName]) => {
  const fullPath = path.join(process.cwd(), filePath);
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Add React import if not present
  if (!content.includes('import React')) {
    content = `import React from 'react'\n${content}`;
  }
  
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`✅ Added React import: ${filePath}`);
});

console.log('\n✅ React imports added to all test files!');
