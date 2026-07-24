# RankPilot 🚀

**RankPilot** is a full-stack SEO rank tracking platform that helps you monitor keyword rankings, analyze SERP data, and get AI-powered insights — all in one dashboard.

## ✨ Features

- 🔍 **Keyword Rank Tracking** — Track your website's search engine rankings for target keywords
- 🤖 **AI-Powered Insights** — Gemini AI integration for SEO analysis and recommendations
- 🕷️ **Automated SERP Scraping** — Real-time search results scraping via Browserbase
- ⏰ **Scheduled Rank Checks** — Automated cron jobs for periodic rank tracking
- 📊 **Dashboard & Analytics** — Clean, intuitive interface to visualize ranking trends
- 🔐 **Secure Authentication** — User authentication and protected routes

## 🛠️ Tech Stack

**Frontend**
- React (Vite + TypeScript)
- Modern component-based UI

**Backend**
- Node.js + Express
- MongoDB (Mongoose)
- Cron jobs for scheduled tasks

**Integrations**
- Browserbase — headless browser scraping for SERP data
- Google Gemini AI — AI-powered SEO analysis

**Deployment**
- Vercel (both frontend & backend)

## 📁 Project Structure

```
rankpilot/
├── backend/
│   ├── config/          # DB & environment configuration
│   ├── controllers/     # Route logic/handlers
│   ├── cron/             # Scheduled ranking jobs
│   ├── middleware/       # Auth & error handling middleware
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API route definitions
│   ├── services/         # Business logic (scraping, AI calls, etc.)
│   ├── server.js
│   └── vercel.json
│
└── frontend/
    ├── public/
    ├── src/
    ├── vite.config.ts
    └── tsconfig.json
```

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB instance)
- Browserbase API key
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vHarshita15/rankpilot.git
   cd rankpilot
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

   Create a `.env` file in the `backend` folder:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   GEMINI_API_KEY=your_gemini_api_key
   BROWSERBASE_API_KEY=your_browserbase_api_key
   BROWSERBASE_PROJECT_ID=your_browserbase_project_id
   JWT_SECRET=your_jwt_secret
   ```

   ```bash
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

   Create a `.env` file in the `frontend` folder:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   ```

   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) to view the app.

## 🚀 Deployment

Both frontend and backend are deployed on **Vercel**. Make sure to:
- Set all environment variables in the Vercel project settings
- Configure the correct **Root Directory** for each deployment (frontend/backend)
- Update `VITE_API_BASE_URL` to point to your deployed backend URL

## 🗺️ Roadmap

- [ ] Competitor rank comparison
- [ ] Email/Slack alerts for rank changes
- [ ] Historical rank trend charts
- [ ] Multi-domain support

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a PR.

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**Harshita Verma**
- GitHub: [@vHarshita15](https://github.com/vHarshita15)
- LinkedIn: [Harshita Verma](https://linkedin.com/in/harshita-453954292)
