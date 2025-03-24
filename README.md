# Training Hub v2

A comprehensive training and certification platform built with React, Vite, and Supabase.

## 📋 Project Overview

Training Hub is a web application for delivering training materials, study guides, and assessments. The application consists of a public-facing study area and a protected admin interface for content management.

## 🚀 Getting Started

### Prerequisites

- Node.js (version 18+)
- npm or yarn
- Supabase account (for authentication and database)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Training-Hub
   ```

2. Navigate to the v2 directory:
   ```bash
   cd v2
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

5. Update the `.env` file with your Supabase credentials.

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:3000.

### Building for Production

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## 🏗️ Project Structure

```
v2/
├── public/               # Static assets
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── auth/         # Authentication components
│   │   └── layout/       # Layout components
│   ├── config/           # Configuration files
│   ├── contexts/         # React contexts (auth, etc.)
│   ├── pages/            # Application pages
│   │   └── admin/        # Admin pages
│   ├── services/         # API services
│   ├── utils/            # Utility functions
│   ├── App.jsx           # Main application component
│   ├── index.css         # Global styles
│   └── main.jsx          # Application entry point
├── .env.example          # Example environment variables
├── index.html            # HTML entry point
├── package.json          # Project dependencies
└── vite.config.js        # Vite configuration
```

## 🔐 Authentication

The application uses Supabase Authentication for admin login. The authentication flow is managed by the `AuthContext` which provides the following features:

- User sign-in with email/password
- Session management
- Protected routes for admin pages
- Sign-out functionality

## 🌐 Deployment

This project is configured for deployment to GitHub Pages using GitHub Actions. The deployment workflow is defined in `.github/workflows/deploy.yml`.

To deploy:

1. Push changes to the `main` branch.
2. The GitHub Actions workflow will automatically build and deploy the application.
3. The application will be available at your GitHub Pages URL.

## 💻 Development Guidelines

- Use the `replace_in_file` tool for targeted edits to specific parts of files.
- Keep components small and focused on a single responsibility.
- Use the auth context for user authentication and session management.
- Follow the existing project structure and naming conventions.
