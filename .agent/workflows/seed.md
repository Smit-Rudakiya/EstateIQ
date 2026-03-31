---
description: Seed the EstateIQ database with sample data
---

## Prerequisites
- MongoDB must be running and `MONGO_URI` in `server/.env` must be configured

## Steps

// turbo-all

1. Run the seed script from the project root:
```
npm run seed
```

This runs `server/seed.js` which populates the database with sample properties, users, and documents.
