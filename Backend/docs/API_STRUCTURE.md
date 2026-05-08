# UniCampus API Architecture

## Base URL

```
/api/v1
```

All routes are versioned under `/api/v1`. If we ever need breaking changes, we create `/api/v2` alongside v1 — existing clients continue working.

---

## Architecture: Modular Monolith

```
src/
├── config/           ← Environment, database, Cloudinary setup
│   ├── env.js        ← THE ONLY file reading process.env
│   ├── db.js         ← MongoDB connection
│   ├── cloudinary.js ← Cloudinary SDK init
│   └── index.js      ← Re-exports all config
│
├── middleware/        ← Express middleware (shared across all modules)
│   ├── auth.middleware.js       ← JWT verification + role authorization
│   ├── error.middleware.js      ← Centralized error handler
│   ├── notFound.middleware.js   ← 404 for unknown routes
│   ├── rateLimit.middleware.js  ← Rate limiting presets
│   └── validation.middleware.js ← express-validator result checker
│
├── modules/           ← Feature modules (each is self-contained)
│   ├── auth/          ← Registration, login, OTP, JWT tokens
│   ├── users/         ← User profiles
│   ├── resources/     ← Academic resources (notes, PDFs)
│   ├── events/        ← Campus events + RSVP
│   ├── opportunities/ ← Jobs, internships, projects
│   ├── matching/      ← Teammate matching
│   ├── marketplace/   ← Buy/sell/exchange items
│   ├── studyGroups/   ← Study group management
│   ├── aiChatbot/     ← AI-powered chat assistant
│   ├── notifications/ ← In-app notifications
│   └── admin/         ← Dashboard stats + user management
│
├── shared/            ← Shared utilities (used by all modules)
│   ├── responses/     ← ApiResponse, ApiError
│   ├── utils/         ← catchAsync, hash, token, otp, logger
│   ├── aiService.js   ← LLM API wrapper (OpenAI/Gemini/Claude)
│   ├── notificationService.js ← Email + in-app notifications
│   └── uploadService.js       ← Cloudinary operations
│
├── routes/index.js    ← Central route aggregator
├── app.js             ← Express config + middleware
└── server.js          ← Entry point (dotenv → DB → listen)
```

### Module Structure

Every module follows the same pattern:

```
modules/<name>/
├── <name>.model.js      ← Mongoose schema + indexes
├── <name>.service.js    ← ALL business logic
├── <name>.controller.js ← Parse req → call service → send res
├── <name>.routes.js     ← URL + method + middleware chain
├── <name>.validation.js ← express-validator chains
└── <name>.constants.js  ← Module-specific enums
```

### Data Flow (non-negotiable)

```
Client → Route → [RateLimiter] → [Validator] → [Validate] → Controller → Service → Model → DB
```

---

## Request Lifecycle

```
Client Request
    │
    ▼
┌─────────────────────┐
│  Parsing Middleware  │  express.json(), urlencoded(), cookieParser()
│  Security Middleware │  cors, rate-limit
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   Route Matching     │  routes/index.js → modules/<name>/<name>.routes.js
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   Auth Middleware     │  verifyJWT, authorizeRoles (if protected)
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   Validation Rules   │  express-validator chains from *.validation.js
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   Validate MW        │  Checks validationResult(), returns 400 if errors
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   Controller         │  Thin — calls service, returns ApiResponse
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   Service Layer      │  Business logic, calls Model
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   Model (Mongoose)   │  Database queries
└─────────┴───────────┘
          │
          ▼
    JSON Response
```

---

## Route Map

### Active Routes

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | /api/v1/health | Health check | No |
| POST | /api/v1/auth/register | Register account | No |
| POST | /api/v1/auth/send-otp | Send OTP email | No |
| POST | /api/v1/auth/verify-otp | Verify OTP | No |
| POST | /api/v1/auth/login | Login | No |
| POST | /api/v1/auth/refresh-token | Refresh access token | Cookie |
| POST | /api/v1/auth/logout | Logout | Yes |
| GET | /api/v1/users/me | Get my profile | Yes |
| PATCH | /api/v1/users/me | Update my profile | Yes |
| GET | /api/v1/users/:id | View public profile | Yes |
| GET | /api/v1/resources | List resources | Yes |
| GET | /api/v1/resources/:id | Get resource | Yes |
| POST | /api/v1/resources | Create resource | Yes |
| DELETE | /api/v1/resources/:id | Delete resource | Yes |
| GET | /api/v1/events | List events | Yes |
| GET | /api/v1/events/:id | Get event | Yes |
| POST | /api/v1/events | Create event | Yes |
| POST | /api/v1/events/:id/rsvp | RSVP to event | Yes |
| DELETE | /api/v1/events/:id | Delete event | Yes |
| GET | /api/v1/opportunities | List opportunities | Yes |
| GET | /api/v1/opportunities/:id | Get opportunity | Yes |
| POST | /api/v1/opportunities | Create opportunity | Yes |
| DELETE | /api/v1/opportunities/:id | Delete opportunity | Yes |
| GET | /api/v1/matching/preferences | Get my preferences | Yes |
| PATCH | /api/v1/matching/preferences | Update preferences | Yes |
| GET | /api/v1/matching/find | Find matches | Yes |
| GET | /api/v1/marketplace | List marketplace items | Yes |
| GET | /api/v1/marketplace/:id | Get listing | Yes |
| POST | /api/v1/marketplace | Create listing | Yes |
| PATCH | /api/v1/marketplace/:id | Update listing | Yes |
| DELETE | /api/v1/marketplace/:id | Delete listing | Yes |
| GET | /api/v1/study-groups | List study groups | Yes |
| GET | /api/v1/study-groups/:id | Get study group | Yes |
| POST | /api/v1/study-groups | Create study group | Yes |
| POST | /api/v1/study-groups/:id/join | Join group | Yes |
| POST | /api/v1/study-groups/:id/leave | Leave group | Yes |
| POST | /api/v1/chatbot/message | Send chat message | Yes |
| GET | /api/v1/chatbot/sessions | List chat sessions | Yes |
| GET | /api/v1/chatbot/sessions/:id | Get chat session | Yes |
| GET | /api/v1/notifications | List notifications | Yes |
| GET | /api/v1/notifications/unread-count | Get unread count | Yes |
| PATCH | /api/v1/notifications/:id/read | Mark as read | Yes |
| PATCH | /api/v1/notifications/read-all | Mark all as read | Yes |
| GET | /api/v1/admin/stats | Dashboard stats | Admin |
| GET | /api/v1/admin/users | List all users | Admin |
| PATCH | /api/v1/admin/users/:id/role | Update user role | Admin |

---

## Response Format

### Success

```json
{
  "success": true,
  "statusCode": 200,
  "data": { ... },
  "message": "Success"
}
```

### Error

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Email is required" }
  ]
}
```

---

## How to Add a New Module

1. Create the module directory: `src/modules/<name>/`
2. Create all 6 files following the pattern (model, service, controller, routes, validation, constants)
3. Mount in `src/routes/index.js`:
   ```js
   const nameRoutes = require('../modules/<name>/<name>.routes');
   router.use('/<name>', nameRoutes);
   ```
4. Done. The routes are live at `/api/v1/<name>`.

---

## Architecture Rules

1. **process.env** — Only `config/env.js` reads it. All other files import from config.
2. **Binary files** — Backend NEVER handles binary files. Frontend uploads to Cloudinary directly. MongoDB stores only URLs.
3. **Module isolation** — Modules never import from each other. They communicate via `shared/` services.
4. **Controller thickness** — Controllers are THIN. No business logic, no DB calls. Service does all the work.
5. **Error handling** — Every async handler uses `catchAsync`. Errors flow to the centralized error middleware.
