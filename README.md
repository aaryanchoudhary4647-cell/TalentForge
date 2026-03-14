# TalentForge 🧠
### Smarter hiring. Fairer evaluation. Scalable recruitment.

> Built at **Hack & Forge 2026** | Team Code Blooded
> Anshul Kumar · Kartikeya Narayan · Aaryan Choudhary

---

## What is TalentForge?

TalentForge is an enterprise AI interview platform that replaces inconsistent, bias-prone human screening with a rigorous, data-driven interview pipeline. It doesn't just conduct interviews — it builds intelligence around them.

Most tools record interviews. TalentForge understands them.

---

## The Problem We Solved

| Problem | Our Solution |
|---|---|
| Inconsistent interviews | Standardized AI question bank per role |
| Subjective evaluation | 7-dimension unified scoring engine |
| No scalability | Unlimited concurrent AI sessions |
| Interviewer bias | AI-powered bias detector in JD analysis |
| Zero integrity checks | Anti-cheat + plagiarism + trust scoring |
| Static difficulty | Real-time adaptive difficulty calibration |

---

## Key Features

### Core Interview Pipeline
- **Smart question generation** — Feed a job description and candidate profile, get a tiered question bank (introductory → technical → advanced) instantly
- **Live adaptive interviews** — 3-tier questioning with real-time follow-up probing on weak answers
- **Difficulty calibration** — Questions get harder or easier in real time based on candidate performance

### Intelligence Layer
- **Emotion & stress detection** — Typing rhythm, response latency, and hedging language scored per question
- **Sentiment analysis** — Confidence scoring, red flag detection, behavioral observations
- **Answer consistency checker** — Flags contradictions across the interview

### Integrity Layer
- **Anti-cheat detection** — Tracks tab switches, window blur, copy-paste, and suspicious response latency
- **Plagiarism & AI detection** — Forensic linguistic analysis detects LLM-generated and forum-copied answers
- **Trust score** — Combines all integrity signals into a single 0-100 reliability verdict

### Scoring & Output
- **7-dimension unified scoring** — Technical knowledge, problem solving, communication, confidence, adaptability, role relevance, overall impression
- **AI role-fit prediction** — Predicts long-term fit with explained reasoning
- **Percentile benchmarking** — Ranks candidate against all past candidates for the same role
- **Dual-sided scoring** — Scores both candidate performance AND interviewer question quality
- **Hire / Hold / Reject signal** — One clear decision with full reasoning

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, Web Speech API |
| Backend | Next.js API Routes, REST |
| AI & NLP | Groq API (Llama 3.3 70B), Custom NLP |
| Database | Supabase / PostgreSQL |
| Auth | Supabase Auth with Row-Level Security |

---

## Architecture
```
┌─────────────────────────────────────────────┐
│              Frontend (Next.js)              │
│   Candidate UI · HR Dashboard · Reports      │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│            Backend API Layer                 │
│  12 modular REST endpoints · CORS middleware │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│          AI & Intelligence Layer             │
│  Groq LLM · Custom NLP · Scoring Engine      │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│              Data Layer                      │
│  Supabase · PostgreSQL · Row-Level Security  │
└─────────────────────────────────────────────┘
```

---

## API Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/generate-questions` | POST | Generate role-tailored question bank |
| `/api/session-evaluate` | POST | Master live interview endpoint |
| `/api/calibrate-difficulty` | POST | Dynamic next question generator |
| `/api/score-candidate` | POST | 7-dimension scoring engine |
| `/api/predict-rolefit` | POST | Long-term role fit prediction |
| `/api/benchmark` | POST | Percentile ranking vs past candidates |
| `/api/trust-score` | POST | Interview reliability verdict |
| `/api/generate-report` | POST | Final candidate report generator |
| `/api/anti-cheat` | POST | Integrity violation detector |
| `/api/plagiarism-check` | POST | AI + forum plagiarism detector |
| `/api/analyze-sentiment` | POST | Confidence + hedging analyzer |
| `/api/adaptive-followup` | POST | Single answer evaluator |

Full API documentation in [`API_DOCS.md`](./API_DOCS.md)

---

## Getting Started

### Prerequisites
- Node.js 18+
- A free [Groq API key](https://console.groq.com)
- A [Supabase](https://supabase.com) project

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/talentforge-ai.git

# Navigate into the project
cd talentforge-ai

# Install dependencies
npm install
```

### Environment Setup

Create a `.env.local` file in the root:
```
GROQ_API_KEY=your_groq_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## How It Works

### For HR
1. Enter a job description and candidate profile
2. TalentForge generates a tailored question bank automatically
3. Monitor the live interview with a real-time integrity dashboard
4. Receive a full candidate report with Hire / Hold / Reject signal

### For Candidates
1. Join the interview session via browser — no app needed
2. Answer questions via voice or text
3. AI adapts question difficulty in real time based on performance
4. Receive a detailed feedback report after the session

### Interview Flow
```
HR enters JD + candidate profile
        ↓
AI generates question bank
        ↓
Live interview begins
        ↓
After every answer:
  ├── session-evaluate  (score + sentiment + plagiarism + anti-cheat)
  └── calibrate-difficulty (next question)
        ↓
Interview ends
        ↓
score-candidate → predict-rolefit → benchmark → trust-score
        ↓
Final report generated → saved to Supabase
        ↓
HR receives Hire / Hold / Reject decision
```

---

## What Makes Us Different

### Every competitor builds the interview. We built the intelligence around it.

| Feature | TalentForge | Competitors |
|---|---|---|
| Adaptive difficulty | ✅ Real-time calibration | ❌ Static questions |
| Anti-cheat detection | ✅ Tab switch, paste, latency | ❌ None |
| AI plagiarism detection | ✅ LLM + forum pattern detection | ❌ None |
| Trust score | ✅ 0-100 reliability verdict | ❌ None |
| Dual-sided scoring | ✅ Candidate + interviewer | ❌ Candidate only |
| Percentile benchmarking | ✅ Ranked vs real candidate pool | ❌ None |
| Role-fit prediction | ✅ Explained AI reasoning | ❌ Pass/fail only |
| Emotion detection | ✅ Per question confidence scoring | ❌ None |

---

## Roadmap

| Phase | Status | Features |
|---|---|---|
| Phase 1 — MVP | ✅ Complete | Text interviews, adaptive AI, emotion detection, percentile benchmarking, role-fit prediction, anti-cheat, plagiarism detection, trust scoring |
| Phase 2 — Voice | 🔜 Next | Browser-native voice interviews, tone + pitch + pace detection, Hindi + English multilingual support |
| Phase 3 — Enterprise | 🔜 Planned | ATS integrations (Workday, SAP, Greenhouse), bulk pipelines, white-label, SOC2 compliance |
| Phase 4 — AI Maturity | 🔜 Future | Self-improving model, predictive attrition scoring, culture-fit analysis, video + facial expression layer |

---

## Team

| Name | Role |
|---|---|
| Anshul Kumar | Full-stack foundation, Supabase DB, Auth, HR dashboard, Scoring storage |
| Kartikeya Narayan | AI core, Question engine, NLP, Scoring logic, Integrity layer |
| Aaryan Choudhary | Candidate UX, Live interview UI, Voice integration, Behavioral tracking |

---

## License

MIT License — built for Hack & Forge 2026

---

> *"The more enterprises use TalentForge, the smarter it gets.
> Network effects are built into the core product."*

**Team Code Blooded | Hack & Forge 2026** 🏆
