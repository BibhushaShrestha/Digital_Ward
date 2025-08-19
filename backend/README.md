# Ward Connect Nepal - Backend API

This is the Express/MongoDB backend for Ward Connect Nepal.

## Requirements
- Node.js >= 18
- MongoDB (local or Atlas)

## Setup
1. Install dependencies
```
cd backend
npm install
```

2. Configure environment
- Copy `env.sample` to `.env` and fill values
```
cp env.sample .env
```

3. Seed database (optional but recommended)
```
npm run seed
```

4. Start server
```
npm run dev
```

- API base URL: `http://localhost:5000/api`

## Key Endpoints
- Auth
  - POST `/api/auth/register`
  - POST `/api/auth/login`
  - GET `/api/auth/me` (Bearer token)
- Services
  - GET `/api/services`
  - GET `/api/services/:id`
- Applications
  - GET `/api/applications` (Bearer)
  - POST `/api/applications` (Bearer)
  - POST `/api/applications/:id/submit` (Bearer)
  - PUT `/api/applications/:id/status` (Staff/Admin)
- Complaints
  - GET `/api/complaints` (Bearer)
  - POST `/api/complaints` (Bearer)
  - PUT `/api/complaints/:id/status` (Staff/Admin)
- Analytics (Staff/Admin)
  - GET `/api/analytics/dashboard`

Auth uses Bearer JWT token in `Authorization` header.

