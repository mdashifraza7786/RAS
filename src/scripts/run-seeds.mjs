#!/usr/bin/env node

import { execSync } from 'child_process';

console.log('Starting database seeding process...');

try {
  console.log('\n=== Seeding Users ===');
  execSync('npm run seed-users', { stdio: 'inherit' });
  
  console.log('\n=== Seeding Application Data ===');
  execSync('npm run seed-data', { stdio: 'inherit' });
  
  console.log('\n✅ All data seeded successfully!');
} catch (error) {
  console.error('\n❌ Seeding failed:', error.message);
  process.exit(1);
} 