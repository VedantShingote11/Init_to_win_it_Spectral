# SpectraX - Setup Guide

## Prerequisites Installation

### 1. Install Node.js
Download and install Node.js 18+ from https://nodejs.org/

Verify installation:
```bash
node --version
npm --version
```

### 2. Install MongoDB

**Option A: Local Installation**
- Download from https://www.mongodb.com/try/download/community
- Install and start MongoDB service

**Option B: MongoDB Atlas (Cloud)**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Get connection string

### 3. Setup Qdrant

**Option A: Docker (Recommended)**
```bash
docker pull qdrant/qdrant
docker run -p 6333:6333 qdrant/qdrant
```

**Option B: Qdrant Cloud**
- Sign up at https://cloud.qdrant.io/
- Create a cluster
- Get API URL and key

### 4. Get Groq API Key
- Sign up at https://console.groq.com/
- Create an API key
- Copy the key for later use

## Installation Steps

### Step 1: Install Backend Dependencies
```bash
cd d:/SpectraX/backend
npm install
```

### Step 2: Configure Backend Environment
```bash
# Copy the example file
copy .env.example .env

# Edit .env with your actual credentials
notepad .env
```

Required values:
- `MONGODB_URI`: Your MongoDB connection string
- `QDRANT_URL`: Qdrant endpoint (http://localhost:6333 for local)
- `QDRANT_API_KEY`: Your Qdrant API key (leave empty for local)
- `GROQ_API_KEY`: Your Groq API key

### Step 3: Create Uploads Directory
```bash
mkdir uploads
```

### Step 4: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### Step 5: Configure Frontend Environment
```bash
# Create environment file
notepad .env.local
```

Add:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Running the Application

### Terminal 1: Start Backend
```bash
cd d:/SpectraX/backend
npm run dev
```

You should see:
```
✅ Connected to MongoDB
✅ Qdrant collection initialized
🚀 Server running on port 5000
```

### Terminal 2: Start Frontend
```bash
cd d:/SpectraX/frontend
npm run dev
```

You should see:
```
ready - started server on 0.0.0.0:3000
```

### Access the Application
Open your browser to: http://localhost:3000

## Verification

### Test Backend
```bash
curl http://localhost:5000/health
```

Should return:
```json
{
  "status": "ok",
  "mongodb": "connected"
}
```

### Test Frontend
Navigate to http://localhost:3000 and you should see the SpectraX home page.

## Common Issues

### MongoDB Connection Failed
- Ensure MongoDB is running
- Check connection string format
- For Atlas, ensure IP whitelist is configured

### Qdrant Not Initialized
- Ensure Qdrant Docker container is running
- Check port 6333 is not in use
- Verify API key if using cloud

### Port Already in Use
Backend (5000):
```bash
# Change PORT in backend/.env
PORT=5001
```

Frontend (3000):
```bash
# Start on different port
npm run dev -- -p 3001
```

## Next Steps

1. Create your first project
2. Upload a sample PDF
3. Test the Q&A feature
4. Take a quiz
5. Explore performance analytics

## Production Deployment

For production deployment:
1. Set `NODE_ENV=production` in backend
2. Build frontend: `npm run build`
3. Use process manager (PM2) for backend
4. Deploy frontend to Vercel or similar
5. Use production MongoDB and Qdrant instances
6. Enable HTTPS
7. Set up proper CORS configuration

## Support

If you encounter issues:
1. Check all services are running
2. Verify environment variables
3. Check console logs for errors
4. Ensure API keys are valid
