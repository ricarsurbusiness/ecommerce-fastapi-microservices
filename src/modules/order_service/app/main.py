from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routers import order

# Load environment variables
load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI application
app = FastAPI(
    title="Order Service",
    description="Microservicio para gestión de pedidos del e-commerce",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(order.router)

# Health check endpoint
@app.get("/")
def read_root():
    return {"message": "Order Service is running", "status": "healthy"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "order_service"}
