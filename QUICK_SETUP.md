# 🚀 Quick Setup for Railway

## Step 1: Generate Secrets

Run this command to generate secure secrets:

```bash
npm run generate-secrets
```

Copy the generated `JWT_SECRET` and `JWT_REFRESH_SECRET` values.

## Step 2: Set Variables in Railway

Go to Railway → Your Service → **Variables** tab and add:

### Required Variables:

1. **JWT_SECRET**
   - Value: (from generated secrets)

2. **JWT_REFRESH_SECRET**
   - Value: (from generated secrets)

3. **MONGODB_URI**
   - Value: Your MongoDB Atlas connection string
   - Example: `mongodb+srv://user:pass@cluster.mongodb.net/sunco?retryWrites=true&w=majority`

### Optional Variables:

- `NODE_ENV=production`
- `PORT=5000` (Railway sets this automatically)
- `JWT_EXPIRE=7d`
- `JWT_REFRESH_EXPIRE=30d`

## Step 3: Deploy

Railway will automatically redeploy when you add variables. Check the logs to verify it starts successfully.

## ✅ Verify

Test your API:
```bash
curl https://suncobackend-production.up.railway.app/health
```

For detailed instructions, see [RAILWAY_SETUP.md](./RAILWAY_SETUP.md)

