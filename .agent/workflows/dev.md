---
description: Start the full EstateIQ development environment (server + client)
---

## Prerequisites
- MongoDB must be running locally (or update `MONGO_URI` in `server/.env` to point to your MongoDB Atlas cluster)
- All dependencies installed (`npm run install:all` from root)

## Steps

// turbo-all

1. Start both server and client from the project root:
```
npm run dev
```

This runs `concurrently` which starts:
- **Server** (Express/Node.js) on `http://localhost:5000` with nodemon (auto-restarts on changes)
- **Client** (Vite/React) on `http://localhost:5173` with HMR (hot module replacement)

2. To seed the database with sample data:
```
npm run seed
```

3. To install all dependencies after a fresh clone:
```
npm run install:all
```
