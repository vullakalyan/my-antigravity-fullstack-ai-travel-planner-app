# AI Travel Planner — Full-Stack Implementation Plan

## Overview

A production-ready AI Travel Planner with a dark, cinematic, futuristic design aesthetic (deep navy/black backgrounds, cyan/teal holographic accents, glass panels, 3D globe animations) — directly inspired by the reference animation frames provided.

**Design Language:** Deep space dark (#0a0e1a background), cyan glow (#00d4ff), gold highlights (#ffd700), glass morphism panels, particle effects, smooth GPU-accelerated animations.

---

## Phase 1: Backend (Node.js + Express + MongoDB + Claude AI)

### Folder Structure: `backend/`

#### [NEW] `backend/package.json`
Dependencies: express, mongoose, bcryptjs, jsonwebtoken, @anthropic-ai/sdk, cors, dotenv, express-validator, helmet, express-rate-limit, morgan

#### [NEW] `backend/.env.example`
All required env vars documented

#### [NEW] `backend/server.js`
Express server, middleware stack, CORS, rate limiting, error handler

#### [NEW] `backend/config/db.js`
MongoDB connection with pooling, retry logic, graceful error handling

#### [NEW] `backend/models/User.js`
Schema: email (unique), password (bcrypt 10 rounds pre-save hook), name, createdAt

#### [NEW] `backend/models/Trip.js`
Schema matching data contract: destination, numberOfDays, budget, interests, itinerary[], estimatedBudget{}, suggestedHotels[], owner (ref User), timestamps

#### [NEW] `backend/middleware/authMiddleware.js`
JWT verification via Bearer token, injects req.user = { id, email }

#### [NEW] `backend/middleware/errorHandler.js`
Centralized handler: `{ success: false, error: { message, code } }`

#### [NEW] `backend/routes/authRoutes.js`
POST /api/auth/register, POST /api/auth/login — express-validator validation

#### [NEW] `backend/routes/tripRoutes.js`
Full CRUD + POST /api/trips/generate — all protected by authMiddleware

#### [NEW] `backend/services/claudeService.js`
Claude `claude-sonnet-4-5` integration, JSON shape validation, 1 retry with corrective prompt, typed error on second failure

---

## Phase 2: Frontend (Next.js 14 + TypeScript + Tailwind CSS)

### Folder Structure: `frontend/`

JWT stored in `localStorage` (accessible to API client) with a fallback to `sessionStorage`. Rationale: Next.js App Router renders server and client components differently; httpOnly cookies would require a BFF proxy layer not specified. localStorage is standard for SPAs with short-lived tokens; the 7-day expiry and ownership checks on the backend limit exposure.

#### Key Files:
- `app/page.tsx` — redirects to landing or dashboard
- `app/login/page.tsx` — login form + zod validation
- `app/register/page.tsx` — register form + zod validation
- `app/dashboard/page.tsx` — trip form + trip list grid
- `app/trips/[id]/page.tsx` — trip detail with itinerary, budget chart, hotels
- `components/TripForm.tsx` — the full creation form
- `components/ItineraryCard.tsx` — day card with activities
- `components/HotelCard.tsx` — hotel suggestion card
- `components/AuthGuard.tsx` — redirects unauthenticated users
- `lib/api.ts` — centralized API client with JWT, timeouts, retry, 401 redirect

---

## Phase 3: Premium Landing Page

Scroll-driven canvas animation using the 208 ezgif frames (mapped to `/sequence/ezgif-frame-NNN.jpg`). 5 cinematic sections matching reference images.

---

## Verification Plan

- Run `npm install` in both backend/ and frontend/
- Start backend with `npm run dev` (nodemon)
- Start frontend with `npm run dev` (Next.js on port 3000)
- Manual test: register → login → generate → save → view → delete
- Ownership negative test: two users, cross-access attempt returns 404
