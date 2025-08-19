# Registration Troubleshooting Guide

## Quick Steps to Fix Registration

### Step 1: Check Backend Status
1. Open a new terminal
2. Navigate to backend directory: `cd backend`
3. Check if server is running: `npm run dev`
4. You should see: `🚀 Server running on port 9005`

### Step 2: Check MongoDB
1. Make sure MongoDB is running
2. Test connection: `mongo --eval "db.runCommand('ping')"`
3. If MongoDB is not running, start it:
   - **Windows**: Start MongoDB service or run `mongod`
   - **macOS**: `brew services start mongodb-community`
   - **Linux**: `sudo systemctl start mongod`

### Step 3: Create Environment File
Create `.env` file in `backend` directory:
```env
NODE_ENV=development
PORT=9005
FRONTEND_URL=http://localhost:8080
MONGODB_URI=mongodb://localhost:27017/ward-connect-nepal
JWT_SECRET=super-secret-change-me-in-production
JWT_EXPIRE=30d
```

### Step 4: Test API Directly
Open browser console and run:
```javascript
// Test backend health
fetch('http://localhost:9005/api/health')
  .then(res => res.json())
  .then(data => console.log('Health:', data))
  .catch(err => console.error('Error:', err));

// Test registration
fetch('http://localhost:9005/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstName: "Test",
    lastName: "User",
    citizenshipNumber: "01-0001-00001",
    mobileNumber: "+9779812345678",
    password: "password123",
    dateOfBirth: "1990-01-01",
    gender: "other",
    address: {
      province: "Bagmati",
      district: "Kathmandu",
      municipality: "KMC",
      ward: 1,
      streetAddress: "Test Address"
    }
  })
})
.then(res => res.json())
.then(data => console.log('Registration:', data))
.catch(err => console.error('Error:', err));
```

### Step 5: Use Debug Script
1. Open browser console
2. Copy and paste the content of `debug-registration.js`
3. Run: `runAllTests()`

## Common Issues and Solutions

### Issue 1: "Cannot connect to backend"
**Symptoms**: Network error, CORS error
**Solution**:
- Make sure backend is running on port 9005
- Check if port 9005 is not blocked by firewall
- Restart backend server

### Issue 2: "MongoDB connection failed"
**Symptoms**: Database connection error in backend logs
**Solution**:
- Install MongoDB if not installed
- Start MongoDB service
- Check MongoDB connection string in `.env`

### Issue 3: "Validation failed"
**Symptoms**: Specific validation error messages
**Solutions**:
- Citizenship format: `XX-XXXX-XXXXX` (e.g., `01-0001-00001`)
- Mobile format: `+977XXXXXXXXX` (e.g., `+9779812345678`)
- Password: minimum 6 characters
- All required fields must be filled

### Issue 4: "User already exists"
**Symptoms**: Error about existing user
**Solution**:
- Use different citizenship number or mobile number
- Check if you're trying to register with existing credentials

### Issue 5: "JWT_SECRET not defined"
**Symptoms**: JWT signing error
**Solution**:
- Add `JWT_SECRET=your-secret-key` to `.env` file
- Restart backend server

## Debugging Steps

### 1. Check Browser Console
1. Open Developer Tools (F12)
2. Go to Console tab
3. Try to register
4. Look for error messages

### 2. Check Backend Logs
1. Look at terminal where backend is running
2. Check for error messages
3. Look for database connection issues

### 3. Test API Endpoints
```bash
# Test health endpoint
curl http://localhost:9005/api/health

# Test registration endpoint
curl -X POST http://localhost:9005/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "citizenshipNumber": "01-0001-00001",
    "mobileNumber": "+9779812345678",
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

## Expected Behavior

### Successful Registration
- User gets created in database
- JWT token is returned
- Success message is shown
- User is redirected to home page

### Failed Registration
- Clear error message is shown
- Form validation prevents invalid data
- Network errors are handled gracefully

## Still Having Issues?

1. **Check all logs**: Browser console + backend terminal
2. **Verify environment**: All required environment variables set
3. **Test step by step**: Use the debug script to isolate the issue
4. **Check network**: Ensure no firewall/proxy blocking requests
5. **Restart services**: Backend, MongoDB, and frontend

## Contact Support

If you're still experiencing issues after following this guide:
1. Collect all error messages
2. Note the exact steps that cause the issue
3. Check if the issue occurs with the test data provided
4. Provide backend and frontend logs

