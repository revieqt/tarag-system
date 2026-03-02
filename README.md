# TaraG

A comprehensive full-stack application featuring an admin dashboard, mobile app, and backend API with MongoDB integration.

## 🚀 Tech Stack

### Frontend (Admin Dashboard)
- **Framework**: React 18+ with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite

### Mobile Application
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: Expo Router
- **State Management**: React Query
- **Storage**: AsyncStorage

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB
- **Development**: Nodemon for hot reload

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Database**: MongoDB 7.0

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18+ and npm/yarn/pnpm
- **Docker** & **Docker Compose** (for containerized development)
- **Git** (for version control)
- **Java SDK** (for Android development via Expo)
- **Xcode Command Line Tools** (for iOS development on macOS)

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd TaraG
```

### 2. Install Dependencies

#### Using Installation Scripts (Recommended)

The easiest way to install all dependencies at once:

**Windows (PowerShell):**
```powershell
.\install-dependencies.ps1
```

**macOS/Linux (Bash):**
```bash
./install-dependencies.sh
```

These scripts will automatically:
- Install dependencies for Admin Dashboard (`apps/tarag_admin`)
- Install dependencies for Mobile App (`apps/tarag_app`)
- Install dependencies for Backend (`backend`)
- Display progress and a summary report

#### Manual Installation

If you prefer to install dependencies individually:

```bash
# Install admin dashboard dependencies
cd apps/tarag_admin
npm install
cd ../..

# Install mobile app dependencies
cd apps/tarag_app
npm install
cd ../..

# Install backend dependencies
cd backend
npm install
cd ..
```

### 3. Environment Configuration

Create `.env` files in the directory:

```bash
# backend/.env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tarag
```

```bash
# apps/tarag_app/.env
# BACKEND URL
BACKEND_URL=http://localhost:5000

# SUPPORT FORM URL
SUPPORT_FORM_URL=https://forms.gle/PPqT7Sy2JNY5NH2c6

# MAX FREE AI MESSAGES PER DAY
MAX_FREE_AI_MESSAGES_PER_DAY=5

# PRO PRICE
TRAVELLER_PRO_PRICE=249.99
```

```bash
# apps/tarag_admin/.env
# BACKEND URL
BACKEND_URL=http://localhost:5000
```

## 🏃 Running the Application

### Option 1: Using Docker Compose (Recommended)

```bash
docker-compose up -d
```

This will:
- Start the backend API on `http://localhost:5000`
- Start MongoDB on `mongodb://localhost:27017`
- Mount your local code for hot reloading

### Option 2: Manual Setup

#### Backend

```bash
cd backend
npm run dev
```

Backend will be available at `http://localhost:5000`

#### Admin Dashboard

```bash
cd apps/tarag_admin
npm run dev
```

Admin dashboard will be available at `http://localhost:5173`

#### Mobile App

```bash
cd apps/tarag_app
npm start

# Then choose:
# a - Android
# i - iOS
# w - Web
```

## 📁 Project Structure

```
TaraG/
├── apps/
│   ├── tarag_admin/          # Admin dashboard (React + Vite)
│   │   ├── src/
│   │   ├── public/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── tarag_app/            # Mobile app (React Native + Expo)
│       ├── app/              # Expo Router structure
│       ├── components/
│       ├── hooks/
│       ├── assets/
│       ├── android/
│       ├── ios/
│       ├── package.json
│       └── app.json
│
├── backend/                  # Node.js API Backend
│   ├── src/
│   ├── public/
│   ├── uploads/
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── nodemon.json
│
├── docs/                     # Documentation
├── mongo_data/               # MongoDB volume (ignored in git)
├── docker-compose.yml        # Docker Compose configuration
└── README.md
```

## 🔄 Development Workflow

### Starting Fresh

1. Clone the repository
2. Install dependencies (see Installation & Setup)
3. Create `.env` files with appropriate values
4. Run `docker-compose up` or start services manually

### Making Changes

- **Admin Dashboard**: Changes in `apps/tarag_admin/src` will hot reload
- **Mobile App**: Use Expo's development client for live reload
- **Backend**: Nodemon automatically restarts on file changes

### Building for Production

```bash
# Admin Dashboard
cd apps/tarag_admin
npm run build

# Mobile App
cd apps/tarag_app
npm run build

# Backend
cd backend
npm run build
```

## 📦 Available Scripts

### Admin Dashboard
```bash
npm run dev       # Start development server
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

### Mobile App
```bash
npm start         # Start Expo dev server
npm run android   # Run on Android
npm run ios       # Run on iOS
npm run web       # Run on web
```

### Backend
```bash
npm run dev       # Start development server
npm run build     # Compile TypeScript
npm start         # Run compiled JavaScript
```

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Stop all services
docker-compose down

# View service logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f mongodb
```

## 🧪 Testing

Testing setup can be configured per app. Add test scripts to respective `package.json` files as needed.

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Create a Pull Request

## 📝 Git Workflow

This is a monorepo with the following structure:
- Each workspace has its own `.gitignore` for specific dependencies and artifacts
- The root `.gitignore` covers common patterns and shared resources
- Ensure `.env` files are never committed (they're in `.gitignore`)

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `docker-compose logs mongodb`
- Check the connection string in `.env`

### Port Already in Use
```bash
# Change port in docker-compose.yml or your .env file
# Default ports:
# Backend: 5000
# MongoDB: 27017
# Admin: 5173
```

### Node Modules Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📧 Contact

For questions or support, please create an issue in the repository.
