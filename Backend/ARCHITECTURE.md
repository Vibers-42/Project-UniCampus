# UniCampus Backend — Architecture Reference

> Modular Monolith · Node.js + Express + MongoDB · CommonJS

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
    │   └── index.js            # Re-exports all config from one place
    │
    ├── middleware/
    │   ├── auth.middleware.js   # protect (JWT verify), restrictTo (role check)
    │   ├── catchAsync.js       # Wraps async controllers — no try/catch needed
    │   ├── error.middleware.js  # Centralized error handler (Mongoose, JWT, etc.)
    │   ├── notFound.middleware.js # 404 catcher
    │   ├── rateLimit.middleware.js # generalLimiter (100/15m), authLimiter (10/15m)
    │   └── validation.middleware.js # express-validator result checker
    │
    ├── shared/
    │   ├── responses/
    │   │   └── apiResponse.js  # sendSuccess(), sendError()
    │   ├── utils/
    │   │   ├── hash.js         # hashPassword(), comparePassword()
    │   │   ├── logger.js       # Console logger with timestamps
    │   │   ├── otp.js          # generateOTP(), hashOTP(), verifyOTP()
    │   │   └── token.js        # JWT generate/verify (access + refresh)
    │   ├── aiService.js        # LLM wrapper (Claude, Gemini)
    │   ├── notificationService.js # Email + in-app notifications
    │   └── uploadService.js    # Cloudinary upload/delete
    │
    ├── routes/
    │   └── index.js            # Mounts all module routes under /api/v1
    │
    └── modules/
        ├── auth/               # Authentication (OTP, JWT, refresh tokens)
        │   ├── auth.constants.js
        │   ├── auth.controller.js
        │   ├── auth.model.js
        │   ├── auth.routes.js     ← only public file
        │   ├── auth.service.js    ← only public file
        │   └── auth.validation.js
        │
        ├── users/              # User profiles
        │   ├── users.controller.js
        │   ├── users.model.js
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

## 2. Module Isolation Rules

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
| `<module>.constants.js` | Internal to the module |

### Special case: Admin module
Admin is the only module that cross-imports models from other modules (auth, resources, events). This is documented and justified because admin performs platform-wide operations that span module boundaries.

---

## 3. Request Flow

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
[protect]  (JWT verify → req.user)
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

## 4. How to Add a New Module

1. **Create the folder**: `src/modules/<name>/`

2. **Create 5 files** following the naming convention:
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

## 5. How to Swap Auth Strategy

**Current:** OTP-based (passwordless)

**To switch to password-based:**

1. Add `password` field to `auth.model.js` (select: false)
2. Rewrite `auth.service.js`:
   - `register()` → hash password instead of OTP
   - Add `login(email, password)` → compare hash, issue tokens
   - Remove OTP-specific functions (or keep both)
3. Update `auth.validation.js` with password rules
4. Update `auth.routes.js` with new route

**Nothing else changes.** No middleware, no shared files, no other modules.

---

## 6. How to Swap LLM Provider

1. Open `.env`
2. Change `LLM_PROVIDER=claude` → `LLM_PROVIDER=gemini` (or vice versa)
3. Set the correct `LLM_API_KEY`
4. Restart server

**That's it.** `aiService.js` routes to the correct provider internally.

---

## 7. How to Swap File Storage

1. Open `shared/uploadService.js`
2. Replace Cloudinary SDK calls with your new provider (S3, Azure Blob, etc.)
3. Keep the same export interface: `uploadFile(buffer, folder, type)`, `deleteFile(id)`

**No module code changes.** Only `uploadService.js` and `config/cloudinary.js`.

---

## 8. Environment Variables

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `PORT` | No | 5000 | Server port |
| `NODE_ENV` | No | development | Environment mode |
| `MONGODB_URI` | **Yes** | — | MongoDB Atlas connection string |
| `CLIENT_URL` | No | http://localhost:5173 | CORS allowed origin |
| `JWT_ACCESS_SECRET` | **Yes** | — | Access token signing secret |
| `JWT_REFRESH_SECRET` | **Yes** | — | Refresh token signing secret |
| `JWT_ACCESS_EXPIRES` | No | 15m | Access token TTL |
| `JWT_REFRESH_EXPIRES` | No | 7d | Refresh token TTL |
| `CLOUDINARY_CLOUD_NAME` | No | — | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | No | — | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | No | — | Cloudinary API secret |
| `EMAIL_HOST` | No | — | SMTP host for OTP delivery |
| `EMAIL_PORT` | No | 587 | SMTP port |
| `EMAIL_USER` | No | — | SMTP username |
| `EMAIL_PASS` | No | — | SMTP password |
| `LLM_PROVIDER` | No | — | AI provider (claude/gemini) |
| `LLM_API_KEY` | No | — | AI API key |

---

## 9. API Response Shape

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

## 10. Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Files | camelCase with dot separator | `auth.service.js` |
| Folders (modules) | camelCase | `aiChatbot/`, `studyGroups/` |
| Routes | kebab-case | `/api/v1/study-groups`, `/api/v1/ai-chatbot` |
| Models | PascalCase (Mongoose) | `AuthModel`, `UsersModel` |
| Functions | camelCase | `getProfile`, `sendSuccess` |
| Constants | UPPER_SNAKE_CASE | `OTP_EXPIRY_MINUTES` |
| Env vars | UPPER_SNAKE_CASE | `JWT_ACCESS_SECRET` |
| DB collections | Mongoose default (lowercase plural) | `users`, `events` |
