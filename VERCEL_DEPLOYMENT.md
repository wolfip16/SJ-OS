# Vercel Deployment Guide for SJ OS

Deploying **SJ OS (Work Management Operating System)** to Vercel is straightforward. Follow these steps:

## 1. Prerequisites
- A Vercel Account ([vercel.com](https://vercel.com))
- Project code exported to GitHub or uploaded directly to Vercel via CLI

## 2. Vercel Project Configuration

When importing your repository in Vercel:
- **Framework Preset**: Select **Vite**
- **Root Directory**: `./` (leave default)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## 3. Single Page Application (SPA) Routing
A `vercel.json` file is included in the project root to route all subpaths back to `index.html`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 4. Environment Variables (Firebase)
If you wish to pass explicit Firebase config via environment variables, set these in Vercel **Project Settings -> Environment Variables**:

- `VITE_FIREBASE_API_KEY`: *(Optional)* Your Firebase API key
- `VITE_FIREBASE_PROJECT_ID`: `ai-studio-sjostheinvisible-3c14cc07-d2ce-456f-b9c1-e3f523cc6f35`
- `VITE_FIREBASE_APP_ID`: *(Optional)* Your Firebase App ID

*(Note: The app automatically connects to the built-in Firebase Firestore enclave with fallback local persistence if variables are not provided).*

## 5. Deployment Commands (Vercel CLI)
If deploying via command line:
```bash
npm install -g vercel
vercel
```
For production release:
```bash
vercel --prod
```
