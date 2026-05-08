# UniCampus Backend — Quick Start Guide

> Get the backend running in under 5 minutes.

---

## Prerequisites

- **Node.js** v18+ ([download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **MongoDB Atlas** account ([free tier](https://www.mongodb.com/atlas))
- A terminal (PowerShell, CMD, or Git Bash on Windows)

---

## Setup Steps

### 1. Clone the repo

```bash
git clone https://github.com/<your-username>/UniCampus.git
cd UniCampus/Backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
# Copy the template
cp .env.example .env
```

Open `.env` and fill in your values:

| Variable | Where to get it |
|----------|----------------|
| `MONGODB_URI` | MongoDB Atlas → Connect → Drivers → Copy connection string |
| `JWT_ACCESS_SECRET` | Run: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `JWT_REFRESH_SECRET` | Run the same command again (use a DIFFERENT value) |
| `EMAIL_HOST` | Your SMTP provider (e.g., `smtp.gmail.com`) |
| `EMAIL_USER` | Your email address |
| `EMAIL_PASS` | Your email app password |

> **Minimum required:** `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
>
> Email fields are needed for OTP delivery. Without them, registration will fail at the email step.

### 4. Start the dev server

```bash
npm run dev
```

You should see:
```
[INFO] MongoDB connected: <your-cluster>.mongodb.net
[INFO] Server running in development mode on port 5000
[INFO] Health check: http://localhost:5000/api/v1/health
```

---

## Verify It Works

### 5. Test the health endpoint

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "UniCampus API running",
  "env": "development",
  "timestamp": "2026-05-08T..."
}
```

### 6. Test auth registration

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "student@university.edu"}'
```

Expected response (if email is configured):
```json
{
  "success": true,
  "statusCode": 201,
  "data": { "message": "OTP sent to your email. Please verify to complete registration." },
  "message": "OTP sent to your email. Please verify to complete registration."
}
```

> **Note:** The email domain must end in `.edu` or `.ac.in` (institutional domain check).
> If email credentials aren't configured, you'll get an error about email not being configured.

---

## Available npm Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with nodemon (auto-restart on changes) |
| `npm start` | Start without nodemon (production) |

---

## API Route Map

| Method | Route | Auth? | Description |
|--------|-------|-------|-------------|
| GET | `/api/health` | No | Health check |
| POST | `/api/v1/auth/register` | No | Register (sends OTP) |
| POST | `/api/v1/auth/verify-otp` | No | Verify OTP → get tokens |
| POST | `/api/v1/auth/resend-otp` | No | Resend OTP |
| POST | `/api/v1/auth/refresh` | Cookie | Refresh access token |
| POST | `/api/v1/auth/logout` | JWT | Logout |
| GET | `/api/v1/users/profile` | JWT | Get own profile |
| PATCH | `/api/v1/users/profile` | JWT | Update own profile |
| GET | `/api/v1/users/search` | JWT | Search users |
| GET | `/api/v1/resources` | JWT | List resources |
| GET | `/api/v1/events` | JWT | List events |
| GET | `/api/v1/opportunities` | JWT | List opportunities |
| GET | `/api/v1/matching` | JWT | List match requests |
| GET | `/api/v1/marketplace` | JWT | List marketplace items |
| GET | `/api/v1/study-groups` | JWT | List study groups |
| POST | `/api/v1/ai-chatbot/ask` | JWT | Ask the AI assistant |
| GET | `/api/v1/notifications` | JWT | Get notifications |
| GET | `/api/v1/admin/users` | Admin | List all users |

---

## Full Auth Flow (for testing)

```bash
# 1. Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "you@university.edu"}'

# 2. Verify OTP (check your email for the 6-digit code)
curl -X POST http://localhost:5000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "you@university.edu", "otp": "123456"}'

# 3. Use the accessToken from step 2 for authenticated requests
curl http://localhost:5000/api/v1/users/profile \
  -H "Authorization: Bearer <your-access-token>"
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `MONGODB_URI is not defined` | Fill in MONGODB_URI in `.env` |
| `Email is not configured` | Fill in EMAIL_HOST, EMAIL_USER, EMAIL_PASS in `.env` |
| `institutional email address` error | Use an email ending in `.edu` or `.ac.in` |
| Port already in use | Change `PORT` in `.env` or kill the process using port 5000 |

---

## What's Next?

See **ARCHITECTURE.md** for:
- Full folder structure
- How to add new modules
- How to swap auth strategy, LLM provider, or file storage
