from dotenv import load_dotenv
from fastapi import FastAPI
from app.database import Base, engine
from app.routers import cart
from fastapi.middleware.cors import CORSMiddleware

# Cargar variables de entorno
load_dotenv()

# Crear las tablas si no existen
Base.metadata.create_all(bind=engine)

# Instanciar la app FastAPI
app = FastAPI(title="Cart Service")

# Middleware para CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir las rutas del carrito
app.include_router(cart.router, prefix="/api/cart", tags=["Cart"])
