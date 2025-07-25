from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import user
from app import models, database

load_dotenv()

models.Base.metadata.create_all(bind=database.engine)
app = FastAPI(title="Auth Service")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Aquí tu frontend React
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user.router)
