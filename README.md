#  E-Commerce Store

A premium full-stack e-commerce web application inspired by the **** designer brand. Built using **React (Vite)** on the frontend, **Node.js (Express)** on the backend, and **MongoDB Atlas (Mongoose)** for data management.

---

## 🚀 Key Features

*   **Premium Visual Design**: Vibrant custom CSS, clean layouts, and smooth animations.
*   **Complete Product Catalog**: Filter by category, view detailed product pages with size options, and image gallery.
*   **Dynamic Cart Drawer**: Add, remove, and update items in the cart seamlessly.
*   **Robust Authentication**: Secure Register and Login powered by JWT & Bcrypt.
*   **Admin Dashboard**: Manage inventory, view customer contact inquiries, and track orders.
*   **Checkout & Order History**: User profile dashboard with checkout form and past order history.
*   **Multi-Currency Support**: Switch between multiple currencies (USD, INR, EUR, etc.).

---

## 🛠️ Tech Stack

### Frontend
*   **Framework**: React 19 (Vite)
*   **Icons**: Lucide React
*   **Modals & Alerts**: SweetAlert2
*   **Styling**: Pure CSS (Vanilla CSS for clean, custom animations and responsiveness)

### Backend
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: MongoDB Atlas (via Mongoose ODM)
*   **Auth**: JWT (JSON Web Tokens) & Bcrypt.js

---

## 📂 Project Structure

```text
ecommers/
├── backend/                  # Node.js Express server
│   ├── controllers/          # Business logic handlers
│   ├── routes/               # API endpoints setup
│   ├── middleware/           # Auth validation and error handler
│   ├── db.js                 # MongoDB connection helper
│   ├── seed-mongo.js         # Mock database seeder
│   └── index.js              # Server entrypoint
│
├── frontend/                 # React + Vite frontend SPA
│   ├── public/               # Public assets
│   ├── src/
│   │   ├── components/       # Shared UI components (Navbar, Footer, etc.)
│   │   ├── context/          # React Context API (Auth, Cart, Currency)
│   │   ├── pages/            # Page layouts (Home, Catalog, Checkout, Admin, etc.)
│   │   ├── App.jsx           # Component wrapper
│   │   └── main.jsx          # Entry point
│   ├── index.html            # Main HTML document
│   └── vite.config.js        # Vite build tool config
│
├── package.json              # Root project dependencies & monorepo commands
└── README.md                 # Project Documentation
```

---

## ⚙️ Local Development Setup

### Prerequisites
Make sure you have the following installed on your system:
*   [Node.js](https://nodejs.org/) (v16+ recommended)
*   [MongoDB Atlas](https://www.mongodb.com/atlas) or a local MongoDB instance

### Step 1: Install Dependencies
Open your terminal in the root directory of this repository and run:
```bash
npm run install:all
```
*This command runs `npm install` inside both the `frontend/` and `backend/` directories.*

### Step 2: Database Setup
1. Create a MongoDB database and copy its connection string.
2. Run the database seed script to populate mock products and categories:
   ```bash
   npm run seed
   ```

### Step 3: Backend Configuration
Create a `.env` file in the `backend/` folder and configure the variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

### Step 4: Run the Application
From the root directory, start both the frontend and backend concurrently:
```bash
npm start
```
*Your frontend will run at `http://localhost:5173` and backend API at `http://localhost:5000`.*

---

## ☁️ Deployment Instructions

### 1. Frontend (Vercel)
When deploying this repository to Vercel, use the following configuration:
*   **Root Directory**: Edit and select **`frontend`**.
*   **Framework Preset**: Vite
*   **Build Command**: `npm run build`
*   **Output Directory**: `dist`
*   **Environment Variables**:
    *   Add key: `VITE_API_URL`
    *   Add value: `https://your-backend-api-url.com/api` (URL of your deployed Express backend)

### 2. Backend (Render / Railway / Fly.io)
Choose a platform that supports continuous Express/Node.js hosting (e.g., Render Web Services):
1. Point your deployment root to the **`backend`** directory.
2. Select the Node.js runtime environment.
3. Configure `MONGO_URI` and `JWT_SECRET` in the production environment.
4. Use the hosted MongoDB cluster connection string from Atlas.

### 3. Fullstack on Vercel
If you deploy the whole repo to Vercel, keep the `frontend` project root and let the backend run through the `api/index.js` serverless entrypoint. Set `VITE_API_URL` to the deployed backend path or leave it unset when the frontend and API share the same domain.
