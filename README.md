# Clothing Exchange Platform (SCEP)

A full-stack prototype for a community clothing exchange: a Flask + MySQL backend (REST API) and a React + Vite frontend. The platform supports user registration, item listings, exchanges, donations, eco-points and messaging between users.

---

## Key features ✅

- User authentication (register, login, refresh tokens)
- Add, update, list, and delete clothing items
- Create exchange requests (items or eco-points) and accept/reject flows
- Donation flow with eco-points reward
- Eco-points ledger and transaction history
- Private messaging / conversations between users
- React frontend (Vite + Tailwind) that consumes the API

---

## Tech stack 🔧

- Backend: Python, Flask, MySQL (mysql-connector-python)
- Frontend: React (Vite), Tailwind CSS
- Auth: JWT access + refresh tokens
- Dev tooling: Vite, ESLint

---

## Quick start — development (Windows) ⚡

### Backend

1. Create and activate a virtual environment

```powershell
python -m venv backend/.venv
backend\.venv\Scripts\Activate.ps1  # PowerShell
# or backend\.venv\Scripts\activate.bat (cmd)
```

2. Install dependencies

```powershell
pip install -r backend/requirements.txt
```

3. Configure environment

- The project currently connects to MySQL in `backend/config.py`. For development, either update `config.py` to use your local credentials, or replace it with environment variables.
- Recommended env vars: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET_KEY
- Example (PowerShell):

```powershell
$env:DB_HOST = 'localhost'
$env:DB_USER = 'root'
$env:DB_PASSWORD = 'your-db-password'
$env:DB_NAME = 'scep_db'
$env:JWT_SECRET_KEY = 'replace-with-secure-secret'
```



4. Create the database and tables

- This repository does not include automated migrations. Create a MySQL database named `scep_db` (or the DB name you configured) and run the schema scripts you maintain.

5. Run the server

```powershell
python backend/app.py
```

The API will be available at: `http://127.0.0.1:5000/`

### Frontend

1. Install dependencies

```bash
cd frontend/my-react-app
npm install
```

2. Start dev server

```bash
npm run dev
```

The frontend dev server (Vite) typically runs at `http://localhost:5173` and talks to the API at `http://127.0.0.1:5000/api` by default (see `src/services/api.js`).

---

## API overview (highlighted endpoints) 🧭

- Authentication

  - POST /api/users/register — register new user
  - POST /api/users/login — login (returns access + refresh token)
  - POST /api/users/refresh — refresh access token
  - GET /api/users/me — get current user (requires Bearer token)

- Items / Clothes

  - POST /api/add_cloth — add item (auth)
  - GET /api/clothes — list items (filters: category, search, size, item_status)
  - GET /api/cloth/:item_id — get item detail
  - PUT /api/update_cloth/:item_id — update item (auth)
  - DELETE /api/cloth/:item_id — delete item (auth)

- Exchanges / Donations / Eco points

  - POST /api/exchange — create exchange request (auth)
  - POST /api/exchange/:id/accept — accept exchange (auth)
  - POST /api/donations — create donation (auth)
  - GET /api/eco_points — get your eco points (auth)

- Messaging
  - GET /api/messages?list=1 or ?conversation_id=... — list conversations or messages
  - POST /api/messages — send message (auth)

See route handlers in `backend/routes/` for more details and parameters.

---

## Usage examples ✨

Register a new user:

```bash
curl -X POST http://127.0.0.1:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"secret"}'
```

Authentication-protected requests require an Authorization header, e.g. `Authorization: Bearer <ACCESS_TOKEN>`.

Get available clothes:

```bash
curl http://127.0.0.1:5000/api/clothes
```

---

## Development notes & recommendations 💡

- Move DB credentials and JWT secret into environment variables or a `.env` file and load them in `backend/config.py` (use python-dotenv).
- Add database migrations (e.g., Alembic or Flask-Migrate) or provide SQL schema files for easy setup.
- Add automated tests and a CI workflow (GitHub Actions) for PR validation.
- Add a LICENSE and `docs/CONTRIBUTING.md` to clarify contribution process.

---

## Where to get help / contribute 📬

- Open issues in this repository for bugs and feature requests.
- Submit PRs and follow any contributor guidelines in `docs/CONTRIBUTING.md` (if present).

---

## Who maintains this project

- **Maintainers**: Please add maintainer contact information (GitHub handle / email) here.

If you'd like to contribute, please open an issue or a pull request. Short, well-scoped PRs and clear issue descriptions speed review and help onboard contributors.

---

Thank you for checking out the Clothing Exchange Platform! 🎉

<!-- TODO: Add LICENSE, CONTRIBUTING.md, database schema, and CI status badges -->
