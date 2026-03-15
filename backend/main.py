from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.router import router as tasks_router
from contextlib import asynccontextmanager
from worker import start_worker, shutdown_worker

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    start_worker()
    yield
    # Shutdown
    shutdown_worker()

app = FastAPI(title="AI Life Admin Assistant API", version="1.0.0", lifespan=lifespan)

# Setup CORS for the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tasks_router)

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "FastAPI is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
