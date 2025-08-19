# Registration Issue Fix - Setup Instructions

## Problem
The registration is failing because of missing environment configuration and potential database connection issues.

## Solution Steps

### 1. Create Environment File
Create a `.env` file in the `backend` directory with the following content:

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:8080

# Database
MONGODB_URI=mongodb://localhost:27017/ward-connect-nepal

# JWT
JWT_SECRET=super-secret-change-me-in-production
JWT_EXPIRE=30d

# Email (Optional - for email verification)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Ward Connect Nepal

# SMS (Optional - for SMS verification)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

### 2. Install MongoDB (if not already installed)
- **Windows**: Download and install MongoDB Community Server from https://www.mongodb.com/try/download/community
- **macOS**: `brew install mongodb-community`
- **Linux**: Follow MongoDB installation guide for your distribution

### 3. Start MongoDB
- **Windows**: Start MongoDB service from Services or run `mongod`
- **macOS/Linux**: `brew services start mongodb-community` or `sudo systemctl start mongod`

### 4. Install Backend Dependencies
```bash
cd backend
npm install
```

### 5. Start Backend Server
```bash
cd backend
npm run dev
```

### 6. Start Frontend
```bash
cd Frontend
npm install
npm run dev
```

### 7. Test Registration
1. Open http://localhost:8080 in your browser
2. Go to the Register tab
3. Fill in the form with valid data:
   - Citizenship Number: `01-0001-00001` (format: XX-XXXX-XXXXX)
   - Mobile Number: `+9779812345678` (Nepali format)
   - Email: `test@example.com` (optional)
   - Password: `password123` (minimum 6 characters)

## What Was Fixed

### Frontend Changes:
1. **Added client-side validation** for required fields
2. **Improved error handling** with better error messages
3. **Enhanced form UI** with helpful placeholders and validation hints
4. **Fixed registration payload** to use actual form data instead of hardcoded values

### Backend Changes:
1. **Made email/SMS verification optional** - registration won't fail if these services aren't configured
2. **Added error handling** for external service failures
3. **Improved error messages** for better debugging

## Troubleshooting

### If registration still fails:

1. **Check MongoDB connection**:
   ```bash
   # Test if MongoDB is running
   mongo --eval "db.runCommand('ping')"
   ```

2. **Check backend logs**:
   - Look for error messages in the terminal where you started the backend
   - Common issues: database connection, missing environment variables

3. **Test API directly**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "firstName": "Test",
       "lastName": "User",
       "citizenshipNumber": "01-0001-00001",
       "mobileNumber": "+9779812345678",
       "email": "test@example.com",
       "password": "password123",
       "dateOfBirth": "1990-01-01",
       "gender": "other",
       "address": {
         "province": "Bagmati",
         "district": "Kathmandu",
         "municipality": "KMC",
         "ward": 1,
         "streetAddress": "Test Address"
       }
     }'
   ```

4. **Check browser console**:
   - Open Developer Tools (F12)
   - Look for network errors or JavaScript errors

## Notes
- Email and SMS verification are now optional and won't prevent registration
- The system will work without email/SMS configuration for development
- For production, configure proper email and SMS services
