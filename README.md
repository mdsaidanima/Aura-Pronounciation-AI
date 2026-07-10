# Aura Pronunciation AI - Pronunciation Assessment Platform

Aura Pronunciation AI is a premium, production-ready AI Pronunciation Assessment Platform built using React (Vite) and Node.js (Express). The application allows users to upload or record 30-45s audio files of English speech, obtain instant transcription and pronunciation metrics via OpenAI's Whisper and GPT APIs, monitor progress trends with charts, and export PDF reports under strict compliance with India's **Digital Personal Data Protection (DPDP) Act 2023**.

---

## Key Features

- **Premium SaaS UX/UI**: Clean dark mode support, glassmorphism layouts, custom skeleton loading states, and toast notifications.
- **Dual Voice Capture**: Upload pre-recorded audio files (`.mp3`, `.wav`, `.ogg`, `.m4a`) or record voice live in the browser using the HTML5 `MediaRecorder` API.
- **Strict Audio Validation**: Limits audio clips strictly to 30–45 seconds. Client-side validation reads file metadata immediately, and server-side validation uses `music-metadata` to block bypasses.
- **Word-Level Highlighting & Tooltips**: The transcribed speech highlights mispronounced words. Hovering over a flagged word opens an interactive overlay displaying the specific phonetic issue, severity tier, and correction suggestion.
- **Multi-Dimension Progress Metrics**: Circular progress meters and Recharts (Radar, Line, Bar, Pie) map your average scores, accuracy, fluency, clarity, and weak sound categories.
- **PDF Report Generation**: Server-side report compilation using `pdfkit` delivers printable documents including score cards, mistake tables, and bulleted accent tips.
- **DPDP 2023 Compliance**: Clear data processing consent checkboxes. Audio files are processed transiently and **deleted from local files immediately** after transcription. Users maintain the right of absolute report erasure.

---

## Project Architecture

```
                               +-----------------------------+
                               |     React Client (Vite)     |
                               +-----------------------------+
                                      |               ^
                   POST /api/upload   |               |   JSON Assessment &
                  (DPDP Consent check)|               |   PDF Report Streams
                                      v               |
                               +-----------------------------+
                               |    Express API (Node.js)    |
                               +-----------------------------+
                                      |               |
                   Audio Transcription|               |  Linguistic assessment
                     (Whisper API)    v               v  & JSON configuration (GPT)
                               +-----------------------------+
                               |         OpenAI APIs         |
                               +-----------------------------+
```

---

## Folder Structure

```
ai-pronunciation-assessment/
├── client/                     # Frontend Vite + React + Tailwind
│   ├── public/
│   ├── src/
│   │   ├── components/         # Sidebar, Navbar, Charts, WordHighlighters
│   │   ├── context/            # AuthContext, ThemeContext
│   │   ├── hooks/              # useToast notification wrappers
│   │   ├── pages/              # Landing, Auth, Dashboard, Upload, Details, History, Analytics
│   │   ├── services/           # Axios wrapper api.js
│   │   ├── App.jsx             # Router definition and route guards
│   │   └── main.jsx
│   ├── tailwind.config.js      # Custom theme colors and float animations
│   ├── vite.config.js          # API proxy settings
│   └── package.json
├── server/                     # Backend Node + Express + Mongoose
│   ├── config/                 # DB connections db.js
│   ├── controllers/            # Auth, Profile, Report, Upload handlers
│   ├── docs/                   # Architecture markdown documentation
│   ├── middleware/             # JWT auth, Multer configurations, Express Validators
│   ├── models/                 # Mongoose schemas (User.js, Report.js)
│   ├── routes/                 # Express routes (auth, profile, reports, uploads)
│   ├── scratch/                # Backend regression check script test_api.js
│   ├── services/               # aiService.js (OpenAI Whisper/GPT), pdfService.js (PDFKit)
│   ├── uploads/                # Temporary directory for voice processing
│   ├── server.js               # Entrypoint file (cors, helmet, rate-limiters)
│   └── package.json
├── package.json                # Master package.json running monorepo commands
└── README.md
```

---

## Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (Version >= 18.0.0)
- [MongoDB](https://www.mongodb.com/try/download/community) running locally (Default port `27017`) or a MongoDB Atlas connection string.

### 1. Installation
Run the master installer script in the root directory to fetch packages for both the client and server:
```bash
npm run install-all
```

### 2. Configure Environment Variables
Create a `.env` file in the `server/` directory:
```bash
cd server
copy .env.example .env
```
Open `server/.env` and update the following settings:
```ini
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/ai-pronunciation
JWT_SECRET=super_secret_jwt_key_change_me_in_production
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```
> **Note**: If `OPENAI_API_KEY` is left blank, the server automatically operates in **Mock Demo mode**. It will validate audio file durations and output realistic, simulated pronunciation assessments, allowing full testing of charts, history, profiles, and PDF compilation without charges. Real Whisper-based transcription and language detection require a valid OpenAI API key; without one, the app uses the built-in mock pipeline instead.

### 3. Run Development Servers
Open two terminal windows or run scripts concurrently from the root directory:

**To run the Backend Server:**
```bash
npm run server-dev
```
The API server starts on `http://localhost:5000`.

**To run the React Frontend:**
```bash
npm run client
```
The React development server starts on `http://localhost:5173`. Open this URL in your web browser.

---

## Running Backend Integration Tests
You can run automated checks (verifying database connectivity, model creation, password hashing, and PDF compilation layouts) by executing:
```bash
node server/scratch/test_api.js
```
The script compiles a local verification report at `server/scratch/sample_report.pdf` which you can view to inspect the layout structure.

---

## Deployment Configuration

### Frontend (Vercel)
The React client is fully configured for Vercel. 
1. Build the production package: `npm run build-client`.
2. Deploy the `client/` folder. The `client/vercel.json` rewrite configuration handles route redirects for SPAs.

### Backend (Render)
1. Set the root directory of your Render service to `server/`.
2. Set the build command to `npm install`.
3. Set the start command to `node server.js`.
4. Register environment variables (`MONGODB_URI`, `JWT_SECRET`, `OPENAI_API_KEY`, `NODE_ENV=production`) inside the Render dashboard.
