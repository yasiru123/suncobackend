# SunCo Server - API Documentation

Node.js + Express backend for the SunCo Sunscreen Reminder App.

## 🚀 Quick Start

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `env.example`):
```bash
cp env.example .env
```

3. Configure environment variables

4. Start server:
```bash
npm run dev    # Development
npm start      # Production
```

## 📁 Project Structure

```
server/
├── src/
│   ├── config/
│   │   └── database.js         # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js   # Authentication logic
│   │   ├── readingController.js
│   │   ├── outingController.js
│   │   └── deviceController.js
│   ├── middleware/
│   │   ├── auth.js             # JWT authentication
│   │   ├── validator.js        # Input validation
│   │   ├── rateLimiter.js      # Rate limiting
│   │   └── errorHandler.js     # Error handling
│   ├── models/
│   │   ├── User.js
│   │   ├── Reading.js
│   │   ├── Outing.js
│   │   ├── DeviceToken.js
│   │   └── NotificationLog.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── readingRoutes.js
│   │   ├── outingRoutes.js
│   │   └── deviceRoutes.js
│   ├── utils/
│   │   ├── uviService.js       # UVI fetching
│   │   └── notificationService.js
│   └── server.js               # Main entry point
├── package.json
└── env.example
```

## 🔐 Authentication

All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

### Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "skinType": 3
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "user@example.com",
      "name": "John Doe",
      "skinType": 3,
      "medValue": 350,
      "hasCompletedOnboarding": false
    },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "..."
}
```

## 📊 Readings API

### Create Reading
```http
POST /api/readings
Authorization: Bearer <token>
Content-Type: application/json

{
  "uvi": 7.5,
  "latitude": 40.7128,
  "longitude": -74.0060,
  "doseIncrement": 45.0,
  "cumulativeDose": 180.5,
  "intervalSeconds": 600,
  "source": "foreground",
  "outingId": "..."
}
```

### Get Readings
```http
GET /api/readings?from=2024-01-01&to=2024-01-31&limit=100&page=1
Authorization: Bearer <token>
```

### Get Statistics
```http
GET /api/readings/stats?from=2024-01-01&to=2024-01-31
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalReadings": 150,
      "averageUVI": 6.2,
      "maxUVI": 10.5,
      "totalDose": 4500.5,
      "notificationCount": 3
    }
  }
}
```

## 🏖️ Outings API

### Create Outing
```http
POST /api/outings
Authorization: Bearer <token>
Content-Type: application/json

{
  "plannedStartTime": "2024-10-10T14:00:00Z",
  "startLocation": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "New York, NY"
  },
  "notes": "Beach day"
}
```

### Get Current Outing
```http
GET /api/outings/active/current
Authorization: Bearer <token>
```

### Record Reapplication
```http
PATCH /api/outings/:id/reapply
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "outing": {
      "...": "...",
      "totalCumulativeDose": 0,
      "reapplicationCount": 2,
      "reapplicationTimestamps": ["...", "..."]
    }
  },
  "message": "Reapplication recorded. Cumulative dose reset to 0."
}
```

### End Outing
```http
PATCH /api/outings/:id/end
Authorization: Bearer <token>
```

## 📱 Device Tokens API

### Register Device
```http
POST /api/device/register
Authorization: Bearer <token>
Content-Type: application/json

{
  "token": "fcm-device-token",
  "platform": "android",
  "deviceInfo": {
    "deviceId": "...",
    "model": "Pixel 6",
    "osVersion": "13",
    "appVersion": "1.0.0"
  }
}
```

## 🗄️ Database Models

### User
```javascript
{
  email: String (unique),
  password: String (hashed),
  name: String,
  skinType: Number (1-6),
  medValue: Number (auto-calculated),
  spf: Number (default: 30),
  hasCompletedOnboarding: Boolean,
  currentOutingId: ObjectId (ref: Outing)
}
```

### Reading
```javascript
{
  userId: ObjectId (ref: User),
  outingId: ObjectId (ref: Outing),
  timestamp: Date,
  uvi: Number,
  latitude: Number,
  longitude: Number,
  doseIncrement: Number,
  cumulativeDose: Number,
  intervalSeconds: Number,
  triggeredNotification: Boolean,
  source: String (foreground|background|server|manual)
}
```

### Outing
```javascript
{
  userId: ObjectId (ref: User),
  plannedStartTime: Date,
  actualStartTime: Date,
  endTime: Date,
  status: String (planned|active|completed|cancelled),
  totalCumulativeDose: Number,
  medThreshold: Number,
  reapplicationCount: Number,
  reapplicationTimestamps: [Date],
  medThresholdReached: Boolean,
  peakUVI: Number,
  startLocation: {
    latitude: Number,
    longitude: Number,
    address: String
  }
}
```

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds = 10
- **JWT Tokens**: 
  - Access token: 7 days expiry
  - Refresh token: 30 days expiry
- **Rate Limiting**:
  - General API: 100 requests per 15 minutes
  - Auth endpoints: 5 requests per 15 minutes
  - Readings: 50 submissions per 10 minutes
- **Input Validation**: express-validator
- **Security Headers**: helmet
- **CORS**: Configurable origins

## 🧪 Testing

Run tests:
```bash
npm test
```

Run with coverage:
```bash
npm test -- --coverage
```

## 📝 Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sunco

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# UVI API
UVI_API_KEY=your-openuv-api-key
UVI_API_URL=https://api.openuv.io/api/v1/uv

# Push Notifications
FCM_SERVER_KEY=your-fcm-server-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🐛 Error Handling

All errors follow this format:
```json
{
  "success": false,
  "error": "Error message",
  "details": [] // Optional validation details
}
```

HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request / Validation Error
- 401: Unauthorized
- 404: Not Found
- 429: Too Many Requests
- 500: Server Error

## 📊 API Health Check

```http
GET /health
```

**Response:**
```json
{
  "success": true,
  "message": "SunCo API is running",
  "timestamp": "2024-10-10T12:00:00.000Z"
}
```

## 🚀 Deployment

### MongoDB Atlas Setup
1. Create cluster at mongodb.com
2. Create database user
3. Whitelist IP addresses
4. Get connection string

### Deploy to Heroku
```bash
heroku create sunco-api
heroku config:set MONGODB_URI=...
heroku config:set JWT_SECRET=...
git push heroku main
```

### Deploy to Railway/Render
1. Connect GitHub repository
2. Set environment variables
3. Deploy

## 📞 Support

For issues: GitHub Issues


