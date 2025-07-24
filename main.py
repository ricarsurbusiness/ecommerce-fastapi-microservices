import os
from dotenv import load_dotenv
from fastapi import FastAPI

# Cargar variables de entorno
load_dotenv()

from src.modules.auth_service.app.routers import user
from src.modules.auth_service.app import models, database

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Auth Service")

app.include_router(user.router)
