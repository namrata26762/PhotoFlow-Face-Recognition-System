# 📸 Photoflow Face Recognition System IT — AI Photo Management
> **BCA Semester-5 Project** | MERN Stack (MongoDB, Express.js, React.js, Node.js) + Bootstrap 5 + AI Face Recognition

---

## 🌟 Key Features
- **👤 User Panel**:
  - Registration & Login with JWT authentication
  - User Dashboard with live summary metrics
  - Create, edit, and manage Photo Albums with cover images
  - Multi-file drag-and-drop Photo Upload with automated face indexing
  - Full-resolution Photo Gallery with search and album filtering
  - **AI Face Recognition Search**: Upload an image or use live **Webcam** capture to find every photo of that person across your albums
  - Sensitivity slider to adjust Euclidean distance matching threshold (0.35 to 0.80)
  - Match confidence percentage scoring (e.g., 98.4% Match)
  - Face recognition search history log
  - Profile management (avatar upload, name, password update)
  - Direct photo download and delete capabilities

- **🔐 Admin Panel**:
  - Dedicated Admin Login and Dashboard
  - System-wide metrics (Total Users, Total Photos, Total Albums, Total Face Scans)
  - Manage Users (search, view statistics, toggle active/blocked status, delete account)
  - Moderate & Delete inappropriate photos across the platform
  - Manage all platform albums
  - Audit logs of all facial recognition queries executed
  - Reports & Analytics breakdown for project evaluation
  - Admin settings & master password management

- **📑 Complete BCA Project Documentation**:
  - Complete 28-chapter project report in `DOCUMENTATION.md`
  - System Architecture Diagram, Use Case Diagram, DFD Level 0 & 1, ER Diagram, Data Dictionaries, Test Cases, and Viva Q&A!

---

## 🔑 Default Demo Credentials

For instant evaluation and viva demonstration, pre-seeded accounts are provided:

| Role | Email | Password |
| :--- | :--- | :--- |
| **👑 Admin** | `admin@photoflow.com` | `admin123` |
| **👤 Demo User** | `user@photoflow.com` | `user123` |

*(Quick 1-click buttons are also built directly into the Login page!)*

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** running locally on default port `27017` (MongoDB Server is already running as a Windows service on your machine).

---

### 2. Run Database Seeder (One-Time Setup)
Initialize the admin account, demo user account, and sample albums:

```bash
cd PhotoFlow/backend
npm run seed
```

---

### 3. Start the Backend Server
```bash
cd PhotoFlow/backend
npm run dev
# Or: node server.js
```
*Backend runs on:* **`http://localhost:5000`**

---

### 4. Start the Frontend Application
Open a second terminal:
```bash
cd PhotoFlow/frontend
npm run dev
```
*Frontend runs on:* **`http://localhost:5001`**

---

## 📁 Project Structure

```
PhotoFlow/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Auth logic (login, register)
│   │   ├── userController.js     # Profile management
│   │   ├── photoController.js    # Photo upload & CRUD
│   │   ├── albumController.js    # Album CRUD
│   │   ├── faceController.js     # Facial recognition & history
│   │   └── adminController.js    # Admin moderation & stats
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification
│   │   ├── adminMiddleware.js    # Role check
│   │   └── uploadMiddleware.js   # Multer file storage
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Photo.js              # Photo schema
│   │   ├── Album.js              # Album schema
│   │   ├── FaceRecord.js         # 128-D vector descriptors
│   │   └── RecognitionResult.js  # Face scan results log
│   ├── routes/                   # REST API routes
│   ├── services/
│   │   └── faceRecognitionService.js # Euclidean distance matching
│   ├── scripts/
│   │   └── seed.js               # Database initializer
│   ├── uploads/                  # Uploaded photo files
│   ├── .env                      # Environment config
│   ├── server.js                 # Express server
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/           # Navbar, Sidebar, PhotoCard, PhotoModal, etc.
│   │   ├── context/              # AuthContext & useAuth hook
│   │   ├── layouts/              # MainLayout & AdminLayout
│   │   ├── pages/
│   │   │   ├── Home.jsx          # Landing page
│   │   │   ├── Login.jsx         # Sign in with 1-click demo buttons
│   │   │   ├── Register.jsx      # Sign up
│   │   │   ├── user/             # Dashboard, Upload, Albums, Gallery, Face Search
│   │   │   └── admin/            # Dashboard, Users, Photos, Albums, Face Scans, Reports
│   │   ├── services/             # Axios API service modules
│   │   ├── App.jsx               # React Router configuration
│   │   ├── App.css               # Modern custom styling + glassmorphism
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js            # Vite proxy configuration
│   └── package.json
│
├── DOCUMENTATION.md              # 28-Chapter BCA Project Report with Diagrams
└── README.md
```

---

## 🧠 Face Recognition Concept
```
User uploads/captures Face Image
             ↓
    [128-D Feature Vector]
             ↓
  Euclidean Distance Formula:
    d = √(∑(aᵢ - bᵢ)²)
             ↓
Search MongoDB FaceRecords (d ≤ threshold)
             ↓
   Rank by Confidence %
             ↓
Display Matching Photos Grid + Instant Download
```

---
*Developed for BCA Sem-5 Final Project Presentation.*
