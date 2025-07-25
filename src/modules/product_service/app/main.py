from fastapi import FastAPI
from app.routers import product, category
from app import models, database
from dotenv import load_dotenv

load_dotenv()
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Product Service")
app.include_router(product.router)
app.include_router(category.router)
