# Railway Deployment Setup Guide

This guide will help you set up all required environment variables for your SunCo Backend on Railway.

## 🚀 Quick Setup

### Step 1: Generate Secrets

Run the secret generator script:

```bash
node scripts/generate-secrets.js
```

This will output secure random secrets that you can copy and paste into Railway.

### Step 2: Set Environment Variables in Railway

1. Go to your Railway project dashboard
2. Click on your `suncobackend` service
3. Navigate to the **Variables** tab
4. Click **+ New Variable** for each variable below

### Step 3: Required Variables

**⚠️ These are REQUIRED - your app won't start without them:**

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | Secret key for signing JWT access tokens | Generate with: `node scripts/generate-secrets.js` |
| `JWT_REFRESH_SECRET` | Secret key for signing JWT refresh tokens | Generate with: `node scripts/generate-secrets.js` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/sunco?retryWrites=true&w=majority` |

### Step 4: Optional Variables (Recommended)

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `PORT` | `5000` | Server port (Railway usually sets this automatically) |
| `NODE_ENV` | `development` | Set to `production` for production |
| `JWT_EXPIRE` | `7d` | Access token expiration time |
| `JWT_REFRESH_EXPIRE` | `30d` | Refresh token expiration time |
| `UVI_API_KEY` | - | API key for OpenUV service |
| `UVI_API_URL` | `https://api.openuv.io/api/v1/uv` | UVI API endpoint |
| `FCM_SERVER_KEY` | - | Firebase Cloud Messaging server key for push notifications |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window (15 minutes) |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Max requests per window |

## 🔐 Generating Secure Secrets

### Option 1: Use the Generator Script (Recommended)

```bash
node scripts/generate-secrets.js
```

### Option 2: Use OpenSSL

```bash
# Generate JWT_SECRET
openssl rand -base64 64

# Generate JWT_REFRESH_SECRET
openssl rand -base64 64
```

### Option 3: Use Node.js

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

## 📋 Step-by-Step Railway Setup

1. **Navigate to Variables Tab**
   - Open your Railway project
   - Click on your service (`suncobackend`)
   - Click on the **Variables** tab

2. **Add JWT_SECRET**
   - Click **+ New Variable**
   - Name: `JWT_SECRET`
   - Value: (paste generated secret)
   - Click **Add**

3. **Add JWT_REFRESH_SECRET**
   - Click **+ New Variable**
   - Name: `JWT_REFRESH_SECRET`
   - Value: (paste generated secret)
   - Click **Add**

4. **Add MONGODB_URI**
   - Click **+ New Variable**
   - Name: `MONGODB_URI`
   - Value: Your MongoDB Atlas connection string
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`
   - Click **Add**

5. **Add Optional Variables** (as needed)
   - Follow the same process for optional variables

6. **Redeploy**
   - Railway will automatically redeploy when you add variables
   - Check the **Deployments** tab to see the deployment status
   - Check logs to verify the server starts successfully

## ✅ Verification

After setting the variables, check your deployment logs. You should see:

```
╔═══════════════════════════════════════╗
║   SunCo Server Running                ║
║   Port: 5000                          ║
║   Environment: production             ║
╚═══════════════════════════════════════╝
```

If you see an error about missing environment variables, double-check that:
- Variable names are spelled correctly (case-sensitive)
- No extra spaces in variable names or values
- Values are properly set (not empty)

## 🧪 Test Your API

Once deployed, test the health endpoint:

```bash
curl https://suncobackend-production.up.railway.app/health
```

Expected response:
```json
{
  "success": true,
  "message": "SunCo API is running",
  "timestamp": "2024-10-31T09:00:00.000Z"
}
```

## 🔧 Troubleshooting

### Error: "Missing required environment variables"
- **Solution**: Make sure `JWT_SECRET`, `JWT_REFRESH_SECRET`, and `MONGODB_URI` are all set in Railway

### Error: "secretOrPrivateKey must have a value"
- **Solution**: JWT_SECRET is not set or is empty. Check Railway variables.

### Error: MongoDB connection failed
- **Solution**: 
  - Verify your `MONGODB_URI` is correct
  - Check MongoDB Atlas IP whitelist (add `0.0.0.0/0` for Railway)
  - Verify database user credentials

### Variables not updating
- **Solution**: 
  - Save variables in Railway
  - Trigger a redeploy manually if needed
  - Check that you're editing the correct service

## 📞 Need Help?

- Check Railway logs in the **Deployments** tab
- Verify all required variables are set
- Ensure MongoDB Atlas allows connections from Railway's IPs

