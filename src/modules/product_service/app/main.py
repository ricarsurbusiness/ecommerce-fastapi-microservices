from fastapi import FastAPI
from app.routers import product, category
from app import models, database
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Product Service")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(product.router)
app.include_router(category.router)
