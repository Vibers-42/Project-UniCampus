# UniCampus API Architecture

## Base URL

```
/api/v1
```

All routes are versioned under `/api/v1`. If we ever need breaking changes, we create `/api/v2` alongside v1 — existing clients continue working.

---

## Request Lifecycle

Every request flows through this pipeline:

```
Client Request
    │
    ▼
┌─────────────────────┐
│  Parsing Middleware  │  express.json(), urlencoded()
│  Security Middleware │  cors, (future: helmet, rate-limit)
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   Route Matching     │  routes/index.js → routes/module.routes.js
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   Auth Middleware     │  verifyJWT, authorizeRoles (if protected)
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   Validator          │  (future: Joi/Zod schema validation)
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

If any layer throws an `ApiError` (or an unhandled error), the **centralized error middleware** catches it and returns a consistent error response.

---

## Current Routes

| Method | Path             | Description         | Auth |
|--------|------------------|---------------------|------|
| GET    | /api/v1/health   | Health check        | No   |

## Planned Routes

| Module         | Base Path               | Description                    |
|---------------|-------------------------|--------------------------------|
| Auth          | /api/v1/auth            | Register, login, refresh token |
| Users         | /api/v1/users           | Profiles, settings             |
| Marketplace   | /api/v1/marketplace     | Buy/sell/exchange items        |
| Events        | /api/v1/events          | Campus events CRUD             |
| Clubs         | /api/v1/clubs           | Clubs & communities            |
| Notifications | /api/v1/notifications   | User notifications             |
| Lost & Found  | /api/v1/lost-found      | Lost & found posts             |

---

## How to Add a New Module

Example: Adding an **Events** module.

### 1. Create the Model

```
src/models/event.model.js
```

Define the Mongoose schema and export the model.

### 2. Create the Service (optional but recommended)

```
src/services/event.service.js
```

Business logic: create, find, update, delete events.

### 3. Create the Controller

```
src/controllers/event.controller.js
```

Each function is an `asyncHandler`-wrapped route handler that calls the service and returns an `ApiResponse`.

### 4. Create the Route File

```
src/routes/event.routes.js
```

```js
const { Router } = require('express');
const { verifyJWT } = require('../middleware/auth.middleware');
const { createEvent, getEvents } = require('../controllers/event.controller');

const router = Router();

router.get('/', getEvents);
router.post('/', verifyJWT, createEvent);

module.exports = router;
```

### 5. Mount in Route Aggregator

In `src/routes/index.js`, uncomment or add:

```js
const eventRoutes = require('./event.routes');
router.use('/events', eventRoutes);
```

Done. The event routes are now live at `/api/v1/events`.

---

## Response Format

### Success

```json
{
  "statusCode": 200,
  "data": { ... },
  "message": "Success",
  "success": true
}
```

### Error

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "success": false,
  "errors": [
    { "field": "email", "message": "Email is required" }
  ]
}
```
