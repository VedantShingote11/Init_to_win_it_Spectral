# SpectraX - AI-Powered Adaptive Study Assistant

A comprehensive project-based learning platform with RAG-powered Q&A, adaptive quizzing, performance tracking, and memory reinforcement.

## 🌟 Features

### Core Functionality
- **Project-Based Learning**: Each project is an independent study environment
- **Multi-Format Content Processing**: PDF, DOC/DOCX, and YouTube videos with transcripts
- **RAG-Based Q&A**: Strict context-only answering from uploaded materials
- **Adaptive Quiz Engine**: Difficulty adjusts based on performance
- **Performance Analytics**: Track mastery scores, identify weak topics
- **Smart Notes**: Personalized study notes based on performance
- **Memory Reinforcement**: Automated revision reminders

### Technical Stack
- **Frontend**: Next.js, React, Recharts
- **Backend**: Node.js, Express
- **Databases**: MongoDB (metadata), Qdrant (vector embeddings)
- **AI/ML**: Groq API, LangChain

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB (local or cloud)
- Qdrant (local Docker or cloud)
- Groq API key

## 🚀 Quick Start

### 1. Clone and Setup

```bash
cd d:/SpectraX
```

### 2. Backend Setup

```bash
cd backend
npm install

# Copy environment template
copy .env.example .env

# Edit .env with your credentials:
# - MONGODB_URI
# - QDRANT_URL and QDRANT_API_KEY
# - GROQ_API_KEY
```

### 3. Start Qdrant (if using Docker)

```bash
docker run -p 6333:6333 qdrant/qdrant
```

### 4. Start Backend

```bash
npm run dev
# Server runs on http://localhost:5000
```

### 5. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
# Frontend runs on http://localhost:3000
```

## 📖 Usage Guide

### Creating a Project
1. Click "New Project" on the home page
2. Enter title, description, and optional deadline
3. Click "Create Project"

### Uploading Learning Materials
1. Open your project
2. Go to "Upload Resources" tab
3. Upload PDF/DOC files or add YouTube links
4. Wait for processing to complete

### Asking Questions
1. Go to "Ask Questions" tab
2. Type your question
3. Get answers based strictly on your materials

### Taking Quizzes
1. Go to "Take Quiz" tab
2. Click "Start Quiz"
3. Answer 10 adaptive questions
4. Review performance and weak topics

### Viewing Performance
1. Go to "Performance" tab
2. See mastery scores, trends, and AI insights
3. Identify strong and weak topics

### Generating Notes
1. Go to "Notes & Summaries" tab
2. Generate project overview or smart notes
3. Smart notes are personalized based on your weak topics

### Revision Reminders
1. Go to "Reminders" tab
2. See topics needing revision
3. Mark topics as revised after studying

## 🏗️ Architecture

### Backend Services
- **ContentProcessor**: Orchestrates PDF/DOC/YouTube extraction, chunking, and embedding
- **RAGService**: Strict context-only Q&A with Groq
- **QuizService**: Adaptive question generation and evaluation
- **PerformanceAnalyzer**: Metrics calculation and AI insights
- **SmartNotesService**: Personalized notes based on weak topics
- **ReinforcementService**: Revision reminders and memory retention

### Database Schemas
- **Project**: Title, mastery score, weak topics, revision tracking
- **Resource**: Uploaded materials with processing status
- **QuizHistory**: Quiz sessions with questions and evaluations
- **TopicMastery**: Per-topic mastery percentages and difficulty levels
- **QuizSession**: Active quiz state management

### Vector Database
- **Qdrant Collection**: Stores embeddings with project_id filtering
- **Metadata**: source_type, topic, difficulty, chunk_id, upload_date

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/spectrax
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your_key_here
GROQ_API_KEY=your_groq_key_here
GROQ_MODEL=mixtral-8x7b-32768
REVISION_THRESHOLD_DAYS=7
MASTERY_THRESHOLD_PERCENTAGE=80
MAX_QUIZ_QUESTIONS=10
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🧪 Testing

### Manual Testing Flow
1. Create a project
2. Upload a PDF and YouTube link
3. Wait for processing
4. Ask questions via chat
5. Generate summaries
6. Take a quiz
7. Review performance
8. Generate smart notes
9. Check reminders

### Verification Points
- ✅ Multi-project isolation (data doesn't mix)
- ✅ RAG hallucination prevention (only answers from materials)
- ✅ Adaptive difficulty (increases/decreases based on performance)
- ✅ Topic mastery tracking (updates after each quiz)
- ✅ Revision reminders (triggers based on time + mastery)

## 📁 Project Structure

```
SpectraX/
├── backend/
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API endpoints
│   ├── services/         # Business logic
│   │   ├── extractors/   # PDF/DOC/YouTube extractors
│   │   ├── QdrantService.js
│   │   ├── EmbeddingService.js
│   │   ├── RAGService.js
│   │   ├── QuizService.js
│   │   └── ...
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── pages/            # Next.js pages
│   ├── components/       # React components
│   ├── styles/           # CSS modules
│   ├── utils/            # API client
│   └── package.json
└── README.md
```

## 🚨 Important Notes

### Embedding Service
The current `EmbeddingService.js` uses a simplified embedding approach. For production, replace with a proper embedding model:
- Use Groq's actual embedding endpoint (when available)
- Or integrate OpenAI embeddings
- Or use HuggingFace sentence transformers

### YouTube Transcripts
Not all videos have transcripts. The system gracefully handles this with error messages.

### Rate Limits
Groq API has rate limits. The embedding service includes delays between batch requests.

## 🤝 Contributing

This is a complete implementation ready for use. To extend:
1. Add more question types (fill-in-blank, matching, etc.)
2. Implement spaced repetition algorithms
3. Add collaborative study features
4. Integrate more content sources (Notion, Google Docs, etc.)

## 📝 License

MIT License - feel free to use and modify!

## 🆘 Troubleshooting

**Issue**: "Failed to connect to MongoDB"
- **Solution**: Ensure MongoDB is running and URI is correct

**Issue**: "Qdrant initialization error"
- **Solution**: Start Qdrant Docker container or verify cloud credentials

**Issue**: "YouTube transcript not available"
- **Solution**: Choose videos with captions/transcripts enabled

**Issue**: "Groq API error"
- **Solution**: Verify API key and check rate limits

## 📞 Support

For issues or questions, check:
1. Environment variables are set correctly
2. All services (MongoDB, Qdrant) are running
3. API keys are valid
4. File upload limits are not exceeded

---

Built with ❤️ for adaptive learning
