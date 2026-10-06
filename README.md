# Portfolio Backend

Express + MongoDB API for my portfolio site.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in your own values (never commit `.env`).
3. `npm run dev` (or `npm start`). The API runs on http://localhost:5000.

## Settings (.env)

| Setting | What it does |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Long random text used to sign login tokens (32+ characters) |
| `ADMIN_EMAILS` | Account email(s) allowed to add/edit/delete content and manage users |
| `CORS_ORIGINS` | Website(s) allowed to call the API, e.g. `https://yoursite.com` |
| `PORT` | Port to run on (default 5000) |

## Who can do what

| | Public | Signed-in user | Admin (`ADMIN_EMAILS`) |
|---|---|---|---|
| View projects & services | ✅ | ✅ | ✅ |
| Add / edit / delete projects & services | | | ✅ |
| References (contact details) | | | ✅ |
| View / edit / delete own account | | ✅ | ✅ |
| List or manage all users | | | ✅ |

Passwords are hashed with bcrypt and never returned by the API. Login attempts are rate-limited.

## Tests

`npm test` runs the API tests. They need a test database:
`MONGO_URI=mongodb://127.0.0.1:27017/portfolio_test npm test`
