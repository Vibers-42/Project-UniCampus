# UniCampus Backend — Architecture Reference

> Modular Monolith · Node.js + Express + MongoDB · Firebase Auth · CommonJS

---

## 1. Folder Structure

```
backend/
├── .env                        # Secrets (never committed)
├── .env.example                # Template for .env
├── .gitignore
├── package.json
│
└── src/
    ├── server.js               # Entry point — loads env, connects DB, starts HTTP
    ├── app.js                  # Express setup — middleware, routes, error handlers
    │
    ├── config/
    │   ├── env.js              # THE ONLY file that reads process.env
    │   ├── db.js               # MongoDB connection via Mongoose
    │   ├── cloudinary.js       # Cloudinary SDK configuration
    │   ├── firebase.js         # Firebase Admin SDK — verifyToken(), getFirebaseUser()
    │   └── index.js            # Re-exports all config from one place
    │
    ├── middleware/
    │   ├── auth.middleware.js   # protect (Firebase token verify), restrictTo (role check)
    │   ├── catchAsync.js       # Wraps async controllers — no try/catch needed
    │   ├── error.middleware.js  # Centralized error handler (Mongoose, Firebase, etc.)
    │   ├── notFound.middleware.js # 404 catcher
    │   ├── rateLimit.middleware.js # generalLimiter (100/15m), authLimiter (10/15m)
    │   └── validation.middleware.js # express-validator result checker
    │
    ├── shared/
    │   ├── responses/
    │   │   └── apiResponse.js  # sendSuccess(), sendError()
    │   ├── utils/
    │   │   ├── AppError.js     # Custom error class with statusCode
    │   │   ├── hash.js         # hashPassword(), comparePassword() [reserved]
    │   │   ├── logger.js       # Console logger with timestamps
    │   │   ├── otp.js          # generateOTP(), hashOTP(), verifyOTP() [reserved]
    │   │   ├── pagination.js   # parsePagination(), buildPaginationResult()
    │   │   └── token.js        # JWT generate/verify [reserved for future use]
    │   ├── aiService.js        # LLM wrapper (Claude, Gemini)
    │   ├── notificationService.js # Email + in-app notifications
    │   └── uploadService.js    # Cloudinary upload/delete
    │
    ├── routes/
    │   └── index.js            # Mounts all module routes under /api/v1
    │
    └── modules/
        ├── auth/               # Firebase auth orchestration (NO model)
        │   ├── auth.controller.js # login, me
        │   ├── auth.routes.js     ← only public file
        │   ├── auth.service.js    ← only public file
        │   └── auth.validation.js
        │
        ├── users/              # Unified User model + profiles
        │   ├── users.controller.js
        │   ├── users.model.js     ← THE ONLY user-related model
        │   ├── users.routes.js    ← only public file
        │   ├── users.service.js   ← only public file
        │   └── users.validation.js
        │
        ├── resources/          # Academic resource sharing
        ├── events/             # Campus events & RSVP
        ├── opportunities/      # Internships, hackathons, referrals
        ├── matching/           # Teammate finder
        ├── marketplace/        # Buy/sell listings
        ├── studyGroups/        # Study groups + messaging
        ├── aiChatbot/          # AI assistant
        ├── notifications/      # In-app notifications
        └── admin/              # Platform management (no model)
```

---

## 2. Authentication Architecture

### Firebase (External Identity Provider)

Firebase handles:
- Email/password signup and login
- Email verification
- Password reset
- Session persistence (client-side)
- Token refresh (automatic, client-side)

### Backend (Authorization + Business Logic)

Backend handles:
- Firebase ID token verification (via Firebase Admin SDK)
- MongoDB user record sync (find-or-create on first login)
- Role-based authorization
- Domain enforcement (@adityauniversity.in only)
- Business logic for all modules

### Auth Flow

```
Frontend                           Backend
   │                                  │
   ├─ Firebase signup/login           │
   ├─ Firebase email verification     │
   ├─ Get Firebase ID token           │
   │                                  │
   ├─ POST /auth/login ──────────────▶│─ verifyFirebaseToken middleware
   │   (Bearer token in header)       │─ Verify token via Firebase Admin SDK
   │                                  │─ Find or create MongoDB user
   │                                  │─ Return { user, isProfileComplete }
   │◀─────────────────────────────────┤
   │                                  │
   ├─ GET /auth/me ──────────────────▶│─ protect middleware
   │   (Bearer token in header)       │─ Verify token + lookup MongoDB user
   │                                  │─ Return full user profile
   │◀─────────────────────────────────┤
```

### req.user Contract

After `protect` middleware, `req.user` is guaranteed to contain:

```js
req.user.id    // MongoDB _id — used for internal relationships
req.user.email // User's email — used for cross-module identity
req.user.role  // 'student' | 'clubAdmin' | 'admin'
```

All modules depend on this contract. No module references `firebaseUid` directly.

---

## 3. Module Isolation Rules

### What CAN be imported outside a module
| File | Who can import it |
|------|-------------------|
| `<module>.routes.js` | `routes/index.js` only |
| `<module>.service.js` | Other module services (if absolutely needed) |

### What CANNOT be imported outside a module
| File | Reason |
|------|--------|
| `<module>.controller.js` | Only routes.js calls it |
| `<module>.model.js` | Only the module's own service uses it |
| `<module>.validation.js` | Only routes.js uses it |

### Special cases
- **Admin module**: Cross-imports models from users, resources, and events. This is documented and justified because admin performs platform-wide operations that span module boundaries.
- **Auth module**: Imports `users.service.js` (cross-module service call). This is allowed by the architecture rules — auth has no model of its own and needs to find/create user records.

---

## 4. Request Flow

```
Client Request
    │
    ▼
app.js (parsing, CORS, rate limiter)
    │
    ▼
routes/index.js → module.routes.js
    │
    ▼
[authLimiter]  (auth routes only)
    │
    ▼
[validation chain]  (express-validator rules)
    │
    ▼
validation.middleware.js  (checks results)
    │
    ▼
[protect]  (Firebase token verify → req.user)
    │
    ▼
[restrictTo('admin')]  (role check, optional)
    │
    ▼
controller.js  (parses req, calls service, sends response)
    │      │
    │      ▼
    │  service.js  (business logic, DB queries)
    │      │
    │      ▼
    │  model.js  (Mongoose schema)
    │
    ▼
catchAsync catches errors → error.middleware.js → JSON response
```

---

## 5. How to Add a New Module

1. **Create the folder**: `src/modules/<name>/`

2. **Create files** following the naming convention:
   ```
   <name>.model.js       — Mongoose schema (timestamps: true)
   <name>.service.js      — Business logic (no req/res)
   <name>.controller.js   — catchAsync + sendSuccess wrappers
   <name>.validation.js   — express-validator chains
   <name>.routes.js       — Router with protect middleware
   ```

3. **Mount in `routes/index.js`**:
   ```js
   const fooRoutes = require('../modules/foo/foo.routes');
   router.use('/foo', fooRoutes);
   ```

4. **Controller pattern** (every function):
   ```js
   const catchAsync = require('../../middleware/catchAsync');
   const { sendSuccess } = require('../../shared/responses/apiResponse');

   const getItems = catchAsync(async (req, res) => {
     const items = await service.getAll();
     sendSuccess(res, items, 'Items fetched');
   });
   ```

---

## 6. Unified User Model

There is exactly ONE user model in the entire codebase: `users/users.model.js`.

It stores:
- **Auth mapping**: `firebaseUid` (unique, indexed — auth use only)
- **Core identity**: `email` (unique), `role`
- **Profile data**: name, department, skills, bio, social links, avatar URL
- **Status**: `isProfileComplete`, `lastLogin`

Firebase handles all credential storage. MongoDB stores zero passwords, zero OTPs, zero refresh tokens.

---

## 7. Environment Variables

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `PORT` | No | 5000 | Server port |
| `NODE_ENV` | No | development | Environment mode |
| `MONGODB_URI` | **Yes** | — | MongoDB Atlas connection string |
| `CLIENT_URL` | No | http://localhost:5173 | CORS allowed origin |
| `JWT_ACCESS_SECRET` | No | — | Reserved for future internal JWT needs |
| `JWT_REFRESH_SECRET` | No | — | Reserved for future internal JWT needs |
| `JWT_ACCESS_EXPIRES` | No | 15m | Reserved |
| `JWT_REFRESH_EXPIRES` | No | 7d | Reserved |
| `CLOUDINARY_CLOUD_NAME` | No | — | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | No | — | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | No | — | Cloudinary API secret |
| `FIREBASE_PROJECT_ID` | **Yes** | — | Firebase Admin SDK project ID |
| `FIREBASE_CLIENT_EMAIL` | **Yes** | — | Firebase Admin SDK service account email |
| `FIREBASE_PRIVATE_KEY` | **Yes** | — | Firebase Admin SDK private key |
| `EMAIL_HOST` | No | — | SMTP host for notifications |
| `EMAIL_PORT` | No | 587 | SMTP port |
| `EMAIL_USER` | No | — | SMTP username |
| `EMAIL_PASS` | No | — | SMTP password |
| `LLM_PROVIDER` | No | — | AI provider (claude/gemini) |
| `LLM_API_KEY` | No | — | AI API key |

---

## 8. API Response Shape

### Success
```json
{
  "success": true,
  "statusCode": 200,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation error details"
}
```

Stack traces are included in `development` mode only, never in production.

---

## 9. Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Files | camelCase with dot separator | `auth.service.js` |
| Folders (modules) | camelCase | `aiChatbot/`, `studyGroups/` |
| Routes | kebab-case | `/api/v1/study-groups`, `/api/v1/ai-chatbot` |
| Models | PascalCase (Mongoose) | `User` |
| Functions | camelCase | `getProfile`, `sendSuccess` |
| Constants | UPPER_SNAKE_CASE | `ALLOWED_DOMAIN` |
| Env vars | UPPER_SNAKE_CASE | `FIREBASE_PROJECT_ID` |
| DB collections | Mongoose default (lowercase plural) | `users`, `events` |
