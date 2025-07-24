from dotenv import load_dotenv
from fastapi import FastAPI
from app.routers import user
from app import models, database

load_dotenv()



models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Auth Service")
app.include_router(user.router)
