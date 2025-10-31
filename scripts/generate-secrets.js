#!/usr/bin/env node

/**
 * Generate secure random secrets for JWT tokens
 * Run this script to generate secure secrets for your environment variables
 */

const crypto = require('crypto');

function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('base64');
}

console.log('\n🔐 Generating secure secrets for SunCo Backend\n');
console.log('='.repeat(60));
console.log('\nAdd these to your Railway environment variables:\n');
console.log('─'.repeat(60));

// Generate JWT secrets
const jwtSecret = generateSecret(64);
const jwtRefreshSecret = generateSecret(64);

console.log('\n📝 REQUIRED VARIABLES:\n');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`JWT_REFRESH_SECRET=${jwtRefreshSecret}`);
console.log(`MONGODB_URI=your-mongodb-connection-string-here`);

console.log('\n\n📝 OPTIONAL VARIABLES (with defaults):\n');
console.log(`PORT=5000`);
console.log(`NODE_ENV=production`);
console.log(`JWT_EXPIRE=7d`);
console.log(`JWT_REFRESH_EXPIRE=30d`);
console.log(`UVI_API_KEY=your-openuv-api-key`);
console.log(`UVI_API_URL=https://api.openuv.io/api/v1/uv`);
console.log(`FCM_SERVER_KEY=your-firebase-cloud-messaging-server-key`);
console.log(`RATE_LIMIT_WINDOW_MS=900000`);
console.log(`RATE_LIMIT_MAX_REQUESTS=100`);

console.log('\n' + '─'.repeat(60));
console.log('\n✅ Secrets generated successfully!');
console.log('\n📋 Instructions:');
console.log('   1. Copy the JWT_SECRET and JWT_REFRESH_SECRET values above');
console.log('   2. Go to Railway dashboard → Your Service → Variables');
console.log('   3. Add each variable with its value');
console.log('   4. Make sure MONGODB_URI is set to your MongoDB connection string');
console.log('   5. Redeploy your service\n');

