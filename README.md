# Designer Perfume Store

A full-stack perfume e-commerce experience built with React, Vite, Express, Prisma, and SQLite.

This project combines a visual storefront with a working backend for authentication, favorites, orders, and profile management. The UI is designed around an immersive coverflow-style browsing experience, while the backend exposes a clean REST API with cookie-based sessions.

## Overview

Designer Perfume Store is a modern shopping experience for browsing, saving, and ordering perfumes. The application supports both a connected backend mode and a local fallback mode, so the front end remains usable even if the API is offline.

## Features

- 3D-style perfume coverflow with mouse, touch, wheel, and keyboard support
- Product collections for home, men, and women
- Search by perfume name
- Product details page with recommendations
- Favorites system for signed-in users
- Cart drawer with quantity updates and instant totals
- Checkout flow with cash, card, and PayPal-style demo options
- Account area with profile editing, favorites, and order history
- Cookie-based authentication with signup, login, logout, and session restore
- Backend-powered favorites and orders
- Local fallback mode using `localStorage` when the backend is unavailable
- Responsive layout with mobile menu, theme toggle, and toast feedback

## Tech Stack

Frontend:

- React 18
- Vite
- React Router
- Context API
- Custom CSS

Backend:

- Node.js
- Express
- Prisma
- SQLite
- JWT
- Cookie-based sessions

Tooling:

- Nodemon
- Concurrently
- Postman collection

## Project Structure

```text
.
|-- postman/
|   `-- designer-api.postman_collection.json
|-- prisma/
|   |-- dev.db
|   |-- schema.prisma
|   `-- seed.js
|-- public/
|   `-- products/
|-- scripts/
|   `-- smoke-backend.mjs
|-- server/
|   `-- src/
|-- src/
|   |-- components/
|   |-- context/
|   |-- lib/
|   `-- pages/
`-- package.json
```

## Main User Flows

1. Browse the collection from the home, men, or women pages.
2. Search for a perfume by name.
3. Open a product page and add the item to the cart.
4. Create an account or sign in.
5. Save favorites to the account.
6. Complete checkout with one of the supported payment flows.
7. Review profile data, favorites, and order history from the account page.

## API Modules

The backend currently includes:

- `GET /api/health`
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PATCH /api/auth/profile`
- `POST /api/auth/logout`
- `GET /api/favorites`
- `PUT /api/favorites/:productId`
- `DELETE /api/favorites/:productId`
- `POST /api/orders`
- `GET /api/orders/me`

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm

### Installation

```bash
npm install
```

### Environment

Create a local `.env` file from `.env.example`.

Example:

```env
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
DATABASE_URL="file:./dev.db"
JWT_SECRET=replace-with-a-long-random-secret
COOKIE_NAME=designer_session
```

### Database Setup

```bash
npm run prisma:push
npm run prisma:seed
```

### Run the App

Run the full stack:

```bash
npm run dev:full
```

Run only the front end:

```bash
npm run dev
```

Run only the backend:

```bash
npm run dev:server
```

## Available Scripts

- `npm run dev` starts the Vite front end
- `npm run dev:server` starts the Express API with Nodemon
- `npm run dev:full` starts front end and backend together
- `npm run build` builds the front end for production
- `npm run preview` previews the production build
- `npm run prisma:generate` generates the Prisma client
- `npm run prisma:push` syncs the Prisma schema to the local database
- `npm run prisma:seed` seeds the catalog into the database
- `npm run smoke:server` runs an end-to-end smoke test for the backend

## Testing the Backend

API resources included in the repo:

- Postman collection: [postman/designer-api.postman_collection.json](./postman/designer-api.postman_collection.json)

Quick health check:

```bash
curl http://localhost:4000/api/health
```

Automated smoke test:

```bash
npm run smoke:server
```

## Notes

- The card and PayPal flows are demo checkout experiences and do not connect to real payment gateways.
- The app gracefully falls back to local data when the backend is not available.
- `HashRouter` is used to make static deployment easier.

## What I Focused On

- Building a polished shopping flow instead of isolated pages
- Keeping the front end usable with or without the backend
- Connecting account, favorites, and checkout into one consistent experience
- Creating a backend that is easy to test with Postman and scripted smoke checks

## Possible Next Steps

- Add admin product management
- Add image uploads and cloud storage
- Integrate real payment providers
- Add unit and integration tests
- Add deployment configuration for production
