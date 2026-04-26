# AI Election Assistant

Initial project scaffold for a web app with:

- `frontend/`: React + Vite
- `backend/`: FastAPI

## Frontend

Install and run:

```bash
cd frontend
npm install
npm run dev
```

## Backend

Create a virtual environment, then install and run:

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## API

- `GET /health`
- `POST /chat`
