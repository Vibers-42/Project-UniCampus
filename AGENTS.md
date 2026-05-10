# AI Agent Instructions for UniCampus

## Architecture Context
- **Pattern:** Modular Monolith
- **Stack:** Node.js, Express.js, MongoDB (Mongoose)
- **Design Rule:** Strict adherence to the `route → controller → service → model` pattern. Modules should remain independent to avoid cross-module coupling.

## Verification & Testing
Before submitting any Pull Request, you MUST verify your work using the following commands in the `Backend` directory:
1. **Install Dependencies:** `npm install`
2. **Run Linter:** `npm run lint` (ensure no syntax/style errors)
3. **Run Tests:** `npm run test` 

## Coding Standards
- Use ES Modules or CommonJS consistently (project currently uses CommonJS).
- Always use `express-validator` for input validation in the route layer.
- Never commit actual secrets; always refer to `.env` variables (e.g., `process.env.MONGODB_URI`).
