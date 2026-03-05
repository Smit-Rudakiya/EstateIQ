# 🏠 EstateIQ — AI-Powered Real Estate Platform

**EstateIQ** is a full-stack MERN (MongoDB, Express.js, React, Node.js) web application that revolutionizes how users interact with real estate property listings and documents. The platform is built for the **Indian real estate market**, with features like INR pricing, Indian city/state data, and RERA-aware design.

> **Live Demo Credentials**: Username: `demo` | Password: `demo123`

---

## 📋 Table of Contents
1. [Project Objective](#-project-objective)
2. [Technology Stack](#-technology-stack)
3. [System Architecture](#-system-architecture)
4. [Folder Structure](#-folder-structure)
5. [Features & Pages](#-features--pages)
6. [API Endpoints](#-api-endpoints)
7. [Database Schema](#-database-schema)
8. [Design System](#-design-system)
9. [How to Run](#-how-to-run)
10. [Future Scope](#-future-scope)

---

## 🎯 Project Objective

This platform aims to simplify property management and document analysis for Indian real estate professionals. Key goals:

- **Property Listings** — List, search, filter, and view properties with photos and amenities
- **Document Management** — Upload and store property-related documents (PDF, DOC)
- **AI Document Analysis** — (Future) Extract key entities from contracts using NER
- **Smart Inquiry System** — Contact property owners directly from the listing page
- **Indian Localization** — INR pricing (Lakhs/Crores), Indian cities/states, +91 country code

---

## 🛠 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + Vite | Fast SPA with Hot Module Replacement |
| **Routing** | React Router v6 | Client-side page navigation |
| **HTTP Client** | Axios | API calls with JWT interceptor |
| **Icons** | Lucide React | 1000+ modern SVG icons |
| **Notifications** | React Hot Toast | Toast messages for user feedback |
| **Backend** | Node.js + Express.js | RESTful API server |
| **Database** | MongoDB + Mongoose | NoSQL document database with ODM |
| **Authentication** | JWT + bcryptjs | Stateless token auth with password hashing |
| **File Uploads** | Multer | Multipart form-data handling for images/docs |
| **Validation** | express-validator | Server-side input validation |
| **Styling** | Vanilla CSS | Custom design system (Ocean Breeze theme) |

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT (React + Vite)             │
│                   http://localhost:5173               │
│                                                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │   Pages  │ │Components│ │ Context  │ │Services  │ │
│  │(11 pages)│ │(Navbar,  │ │(AuthCtx) │ │(api.js   │ │
│  │          │ │ Footer)  │ │          │ │ axios)   │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
└─────────────────────┬───────────────────────────────┘
                      │ HTTP (Axios + JWT)
                      ▼
┌─────────────────────────────────────────────────────┐
│                   SERVER (Express.js)                │
│                   http://localhost:5000               │
│                                                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │  Routes  │ │Middleware│ │  Models  │ │  Config  │ │
│  │(auth,    │ │(auth.js, │ │(User,    │ │(db.js,   │ │
│  │properties│ │upload.js)│ │Property, │ │ .env)    │ │
│  │docs,etc) │ │          │ │Document) │ │          │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
└─────────────────────┬───────────────────────────────┘
                      │ Mongoose ODM
                      ▼
┌─────────────────────────────────────────────────────┐
│              MongoDB (localhost:27017)                │
│              Database: estateiq                       │
│                                                       │
│  Collections: users, properties, documents, contacts  │
└─────────────────────────────────────────────────────┘
```

---

## 📁 Folder Structure

```
estateiq/
├── client/                          # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout/
│   │   │       ├── Navbar.jsx       # Navigation with scroll effect
│   │   │       ├── Navbar.css
│   │   │       ├── Footer.jsx       # Footer with heart animation
│   │   │       └── Footer.css
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # JWT auth state management
│   │   ├── pages/
│   │   │   ├── Home.jsx             # Landing page with animations
│   │   │   ├── Marketplace.jsx      # Property search & filter
│   │   │   ├── PropertyDetail.jsx   # Single property + inquiry modal
│   │   │   ├── Dashboard.jsx        # User dashboard with stats
│   │   │   ├── MyListings.jsx       # CRUD + photo upload + amenities
│   │   │   ├── Profile.jsx          # Edit profile & change password
│   │   │   ├── Login.jsx            # User login
│   │   │   ├── Register.jsx         # Registration with country code
│   │   │   ├── DocumentUpload.jsx   # Drag-and-drop file upload
│   │   │   ├── AboutUs.jsx          # About page
│   │   │   ├── ContactUs.jsx        # Contact + Google Maps
│   │   │   └── *.css                # Page-specific styles
│   │   ├── services/
│   │   │   └── api.js               # Axios instance with JWT interceptor
│   │   ├── utils/
│   │   │   └── formatINR.js         # Indian currency formatter
│   │   ├── App.jsx                  # Routes & layout
│   │   └── index.css                # Global design system
│   ├── package.json
│   └── vite.config.js
│
├── server/                          # Backend (Express.js)
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification middleware
│   │   └── upload.js                # Multer file upload config
│   ├── models/
│   │   ├── User.js                  # User schema
│   │   ├── Property.js              # Property schema with amenities
│   │   └── Document.js              # Document schema
│   ├── routes/
│   │   ├── auth.js                  # Login, Register
│   │   ├── properties.js            # CRUD + images + search
│   │   ├── documents.js             # Document upload
│   │   ├── profile.js               # Profile update + password
│   │   └── contact.js               # Contact form + inquiries
│   ├── uploads/                     # Uploaded images (gitignored)
│   ├── seed.js                      # Demo data seeder
│   ├── server.js                    # Entry point
│   ├── .env                         # Environment variables
│   └── package.json
│
└── .gitignore
```

---

## ✨ Features & Pages

### 1. 🏠 Home Page (`/`)
- **Animated hero** with floating gradient shapes and gradient text
- **Animated counters** (2,500+ Properties, 98% Accuracy, etc.) using IntersectionObserver
- **Trust social proof** section with user avatars
- **Feature cards** with color-coded icons and hover-lift effects
- **3-step "How It Works"** section with arrow connectors
- **CTA section** with animated gradient background

### 2. 🏪 Marketplace (`/marketplace`)
- **Search bar** with text search across titles, descriptions, and locations
- **Type tabs** — All / Buy / Rent
- **Advanced filters** — City, Property Type, Price Range (min/max), Bedrooms, Sort order
- **Property cards** with image thumbnails, INR price, location, bed/bath/area info
- **Pagination** for large result sets

### 3. 🏡 Property Detail (`/properties/:id`)
- **Image gallery** with prev/next navigation, counter, and thumbnail strip
- **Property info** — title, price (INR), location, bedrooms, bathrooms, area
- **Amenities display** as styled badges
- **Contact Owner sidebar** with avatar, email, phone
- **Inline Inquiry Modal** — sends a contextual message to the owner:
  - Auto-prefills name, email, phone if logged in
  - Auto-generates a smart message with property title and price
  - Shows success animation (✅) after sending

### 4. 📊 Dashboard (`/dashboard`)
- **Welcome greeting** with gradient text and emoji
- **4 stat cards** — Properties, Documents, Alerts, Analytics (with stagger animations)
- **Recent Documents** list with file size and status badges
- **My Properties** list with links to detail pages

### 5. 📝 My Listings (`/my-listings`)
- **Add Property form** with:
  - Basic info (title, description, type, property type)
  - Pricing & details (price in ₹, area, bedrooms, bathrooms)
  - Location (address, city, state, PIN code)
  - **Inline Photo Upload** — select up to 10 photos with live previews and "Cover" badge
  - **Airbnb-style Amenities Picker** — 30 toggleable emoji chips:
    🏊 Swimming Pool · 💪 Gym · 🅿️ Parking · 🛗 Lift · ⚡ Power Backup · 🔒 Security · 📹 CCTV · 🏛️ Club House · 🌳 Garden · 🎠 Play Area · 🍳 Modular Kitchen · ❄️ AC · 🛋️ Furnished · 🐾 Pet Friendly · 🚇 Near Metro · 🏫 Near School · 🏥 Near Hospital · and more...
- **Edit/Delete** existing listings
- **Photo management** (add more photos post-listing, remove individual photos)

### 6. 👤 Profile (`/profile`)
- **Gradient hero banner** with animated gradient background
- **Avatar** with user initials
- **Two tabs** — Personal Details / Change Password
- Edit first name, last name, email, phone

### 7. 🔐 Login (`/login`)
- Username + password with eye toggle
- Demo credentials hint
- Animated gradient background

### 8. 📝 Register (`/register`)
- **Country code dropdown** (🇮🇳 +91 default, 10 countries with flag emojis)
- **Confirm password** field with real-time mismatch validation
- Eye toggle on both password fields

### 9. 📄 Document Upload (`/documents/upload`)
- **Drag and drop** zone for PDF, DOC, DOCX files
- File list with size display
- Upload status tracking (success/error badges)

### 10. ℹ️ About Us (`/about`)
- Mission statement with gradient badge
- 6 value cards with color-coded icons and hover-lift
- Stats strip (2,500+ Properties, 15K+ Documents, 98% Accuracy, 4.9★ Rating)

### 11. 📞 Contact Us (`/contact`)
- Contact form (name, email, subject, message)
- Info cards (email, phone, office address)
- **Google Maps embed** showing Marwadi University, Rajkot

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login, returns JWT token |

### Properties
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/properties` | List all (with search, filter, pagination) |
| GET | `/api/properties/my/listings` | Get logged-in user's properties |
| GET | `/api/properties/:id` | Get single property detail |
| POST | `/api/properties` | Create property (multipart, with images + amenities) |
| PUT | `/api/properties/:id` | Update property |
| DELETE | `/api/properties/:id` | Delete property |
| POST | `/api/properties/:id/images` | Upload images to existing property |
| DELETE | `/api/properties/:id/images` | Remove an image |

### Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/documents` | List user's documents |
| POST | `/api/documents/upload` | Upload a document file |

### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/api/profile` | Update user profile |
| PUT | `/api/profile/password` | Change password |

### Contact
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/contact` | Send contact form / property inquiry |

---

## 🗄 Database Schema

### User Model
```javascript
{
  firstName, lastName, username, email, phone,
  password (bcrypt hashed),
  role: 'user' | 'admin',
  createdAt
}
```

### Property Model
```javascript
{
  title, description,
  type: 'buy' | 'rent',
  propertyType: 'apartment' | 'house' | 'villa' | 'commercial' | 'land' | 'office',
  price,                          // in INR
  bedrooms, bathrooms, area,      // numeric
  location: { address, city, state, zipCode },
  images: ['/uploads/...'],       // array of file paths
  amenities: ['Swimming Pool', 'Gym', ...],  // array of strings
  owner: ObjectId (ref: User),
  status: 'active',
  createdAt
}
```

### Document Model
```javascript
{
  originalName, fileName, fileSize, mimeType, filePath,
  owner: ObjectId (ref: User),
  status: 'uploaded' | 'analyzing' | 'completed' | 'failed',
  createdAt
}
```

---

## 🎨 Design System — "Ocean Breeze"

### Color Palette
| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `#0EA5E9` | Buttons, links, accents |
| `--primary-dark` | `#0369A1` | Gradient endpoints |
| `--dark` | `#0C4A6E` | Headings |
| `--bg` | `#F0F9FF` | Page background |
| `--surface` | `#FFFFFF` | Card backgrounds |
| `--success` | `#10B981` | Positive states |
| `--warning` | `#F59E0B` | Attention states |
| `--danger` | `#EF4444` | Error states |

### Typography
- **Font**: DM Sans (Google Fonts) — weights 300-800

### Animations (12 Keyframes)
`fadeIn` · `fadeInUp` · `fadeInDown` · `slideInLeft` · `slideInRight` · `scaleIn` · `bounceIn` · `float` · `shimmer` · `gradientShift` · `spinSlow` · `countUp`

### UI Utilities
- `.gradient-text` — Gradient text coloring
- `.hover-lift` — Card hover with translateY + shadow
- `.stagger-children` — Cascading animation delays
- `.glass-card` — Glassmorphism with backdrop-filter
- `.animate-fade-in-up` — Entry animation class

---

## 🚀 How to Run

### Prerequisites
- Node.js v18+
- MongoDB (running on `localhost:27017`)

### Step 1: Clone
```bash
git clone https://github.com/Smit-Rudakiya/EstateIQ.git
cd EstateIQ
```

### Step 2: Backend Setup
```bash
cd server
npm install
```

Create `.env` file:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/estateiq
JWT_SECRET=your_secret_key_here
```

Seed demo data:
```bash
node seed.js
```

Start server:
```bash
node server.js
# → EstateIQ server running on port 5000
# → MongoDB Connected: localhost
```

### Step 3: Frontend Setup
```bash
cd client
npm install
npm run dev
# → http://localhost:5173
```

### Step 4: Open Browser
Visit `http://localhost:5173` and login with `demo` / `demo123`

---

## 🔮 Future Scope

1. **AI Document Analysis** — NER-based extraction of key entities (parties, amounts, dates, clauses) from property contracts
2. **Real-time Chat** — WebSocket-based messaging between buyers and property owners
3. **Favorites / Wishlist** — Save properties for later comparison
4. **Admin Panel** — User management, property moderation, analytics dashboard
5. **Email Notifications** — Automated alerts for new inquiries and document analysis completion
6. **Payment Integration** — Razorpay/UPI integration for booking tokens

---

## 👥 Team

**Developed by**: Smit Rudakiya  
**Institution**: Marwadi University, Rajkot, Gujarat  
**Repository**: [https://github.com/Smit-Rudakiya/EstateIQ](https://github.com/Smit-Rudakiya/EstateIQ)

---

*Built with ❤️ in India*
