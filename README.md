# Ward Connect Nepal - Full Stack

This repository contains both frontend (Vite + React + TypeScript + shadcn) and backend (Express + MongoDB) for Ward Connect Nepal.

## Quick Start

### Backend
```
cd backend
npm install
cp env.sample .env
npm run seed
npm run dev
```
- API will run on `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`

### Frontend
```
cd Frontend
npm install
npm run dev
```
- App runs on `http://localhost:8080`
- Vite proxy forwards `/api/*` to backend

## Auth Flow
- Register: POST `/api/auth/register`
- Login: POST `/api/auth/login`
- Token is stored in `localStorage` under `wc_token` and sent as `Authorization: Bearer <token>`

## Features Wired
- Login/Register integrated with backend
- Services page fetches services from backend
- Application submission posts to `/api/applications`
- Complaints page lists and files complaints via backend

## Seeding Services
Run `npm run seed` inside `backend` to populate sample services that match the frontend UI.

## Environment
- Edit `backend/.env` based on `backend/env.sample`
- Vite dev proxy is configured in `Frontend/vite.config.ts`
















