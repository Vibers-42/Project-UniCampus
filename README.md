# UniCampus

A campus collaboration platform exclusively for **Aditya University** students.

Built with a modular monolith architecture: one backend application with internally isolated modules, shared infrastructure, and strict module boundaries.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, Tailwind CSS v3, React Router v7 |
| **Backend** | Express 5, MongoDB (Mongoose), Firebase Admin SDK |
| **Auth** | Firebase Authentication (Email/Password) |
| **Storage** | Cloudinary (avatar/media uploads) |
| **Database** | MongoDB Atlas |

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v18+ installed
- [MongoDB Atlas](https://www.mongodb.com/atlas) account (free tier works)
- [Firebase](https://console.firebase.google.com/) project created
- [Git](https://git-scm.com/) installed

### 1. Clone the Repository

```bash
git clone https://github.com/VijayChikkala06/Project-UniCampus.git
cd Project-UniCampus
```

### 2. Setup Backend

```bash
cd Backend
npm install
cp .env.example .env
```

Fill in your `.env` values (see [Backend Environment Variables](#backend-environment-variables) below).

### 3. Setup Frontend

```bash
cd ../frontend
npm install
cp .env.example .env
```

Fill in your `.env` values (see [Frontend Environment Variables](#frontend-environment-variables) below).

### 4. Run the Project

**Terminal 1 — Backend:**
```bash
cd Backend
npm run dev
```
Backend runs at: `http://localhost:5000`

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs at: `http://localhost:5173`

---

## Environment Variables

### Backend Environment Variables

Create `Backend/.env` from `Backend/.env.example`:

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | ✅ | Server port (default: `5000`) |
| `NODE_ENV` | ✅ | `development` or `production` |
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string |
| `CLIENT_URL` | ✅ | Frontend URL for CORS (default: `http://localhost:5173`) |
| `FIREBASE_PROJECT_ID` | ✅ | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | ✅ | Firebase service account email |
| `FIREBASE_PRIVATE_KEY` | ✅ | Firebase private key (one line, `\n` escaped) |
| `CLOUDINARY_CLOUD_NAME` | ⬚ | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | ⬚ | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ⬚ | Cloudinary API secret |
| `EMAIL_HOST` | ⬚ | SMTP host for notifications |
| `EMAIL_PORT` | ⬚ | SMTP port (default: `587`) |
| `EMAIL_USER` | ⬚ | SMTP username |
| `EMAIL_PASS` | ⬚ | SMTP password |

### Frontend Environment Variables

Create `frontend/.env` from `frontend/.env.example`:

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_FIREBASE_API_KEY` | ✅ | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | ✅ | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | ✅ | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | ✅ | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ✅ | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | ✅ | Firebase app ID |
| `VITE_API_URL` | ✅ | Backend API URL (default: `http://localhost:5000/api/v1`) |

---

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. **Enable Email/Password authentication:**
   - Authentication → Sign-in method → Email/Password → Enable
4. **Get Frontend config:**
   - Project Settings → General → Your Apps → Web app → Config
   - Copy values to `frontend/.env`
5. **Get Backend credentials:**
   - Project Settings → Service Accounts → Generate New Private Key
   - Copy `project_id`, `client_email`, and `private_key` to `Backend/.env`
   - **⚠️ The private key must be on ONE LINE** with literal `\n` characters, wrapped in double quotes

---

## MongoDB Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create a database user (username + password)
4. Whitelist your IP address (or use `0.0.0.0/0` for development)
5. Get the connection string → paste into `Backend/.env` as `MONGODB_URI`

---

## Project Structure

```
Project-UniCampus/
├── Backend/
│   └── src/
│       ├── config/           # Environment, Firebase Admin, Cloudinary, DB
│       ├── middleware/        # Auth, error handling, rate limiting, validation
│       ├── modules/           # Feature modules (auth, users, events, etc.)
│       │   ├── auth/          # Firebase auth sync (POST /auth/sync, GET /auth/me)
│       │   ├── users/         # Unified user model + onboarding
│       │   ├── events/        # Campus events
│       │   ├── resources/     # Study resources
│       │   ├── studyGroups/   # Study group management
│       │   └── ...            # Other modules
│       ├── routes/            # Route index (mounts all modules)
│       ├── shared/            # Shared utilities (AppError, apiResponse, logger)
│       ├── app.js             # Express app setup
│       └── server.js          # Server entry point
│
├── frontend/
│   └── src/
│       ├── components/        # Reusable components (ProtectedRoute, AuthLayout, etc.)
│       ├── config/            # Firebase client, Axios API instance
│       ├── contexts/          # AuthContext (global auth state)
│       ├── pages/             # Page components (auth, dashboard, onboarding)
│       ├── App.jsx            # Root component with routing
│       ├── main.jsx           # Entry point
│       └── index.css          # Tailwind CSS design system
│
├── .gitignore
└── README.md
```

---

## Architecture Rules

- **Route → Controller → Service → Model** (never skip layers)
- **Firebase is the identity provider** — backend never stores passwords
- **MongoDB stores app data** — user profiles, events, resources, etc.
- **Business modules are Firebase-agnostic** — they only see `req.user.id`, `req.user.email`, `req.user.role`
- **Only `@adityauniversity.in` emails are allowed** — enforced at middleware + service layers

---

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/sync` | Firebase Token | Sync Firebase user with MongoDB |
| GET | `/api/v1/auth/me` | Protected | Get current user's full profile |

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/users/profile` | Protected | Get own profile |
| PATCH | `/api/v1/users/profile` | Protected | Update own profile |
| PATCH | `/api/v1/users/avatar` | Protected | Update avatar URL |
| POST | `/api/v1/users/onboarding` | Protected | Complete onboarding |
| POST | `/api/v1/users/onboarding/skip` | Protected | Skip onboarding |
| GET | `/api/v1/users/search` | Protected | Search users |
| GET | `/api/v1/users/:email` | Protected | View user's public profile |

### Health
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | None | Health check |

---

## Scripts

### Backend
```bash
npm run dev    # Start with nodemon (hot-reload)
npm start      # Start for production
```

### Frontend
```bash
npm run dev    # Start Vite dev server
npm run build  # Production build
npm run preview # Preview production build
npm run lint   # Run ESLint
```

---

## License

ISC
