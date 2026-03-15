# AI Life Admin Assistant

An intelligent full-stack productivity tool that handles your "life admin" tasks (bills, appointments, study, etc.) using AI.

## 🚀 Features
- **Smart Extraction**: Upload images (receipts), PDFs (reports), or Voice Notes. AI extracts tasks, details, and deadlines automatically.
- **Natural Language Deadlines**: Converts "tomorrow", "next week", etc., into standardized dates.
- **Automated Reminders**: Staggered email notifications (24h, 3h, 30m) via SMTP.
- **Dashboard**: Modern dark-mode UI with category filters and an "Upcoming Tasks" widget.
- **Full Management**: Edit, complete, or delete tasks with ease.

## 🛠️ Tech Stack
- **Frontend**: Next.js, Tailwind CSS, Lucide Icons, date-fns.
- **Backend**: FastAPI, Pydantic, APScheduler.
- **Database**: Supabase (PostgreSQL).
- **AI**: Groq (ASR), NVIDIA NIM (Llama 3.1), Tesseract (OCR).

## ⚙️ Setup
1. **Clone the repo**
2. **Backend**:
   - Install dependencies: `pip install -r backend/requirements.txt`
   - Setup `.env` with API keys (Groq, NVIDIA, OpenAI, Supabase, SMTP).
   - Run: `uvicorn main:app --reload`
3. **Frontend**:
   - Install dependencies: `npm install`
   - Run: `npm run dev`

## 📊 Database Migration
Apply `backend/schema.sql` and `backend/migration_phase2.sql` to your Supabase project.
