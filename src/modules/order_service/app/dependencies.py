from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import httpx
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# URL del endpoint que verifica el token en auth_service
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://auth_service:8000/auth/verify-token")

def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Dependency to get current authenticated user by verifying JWT token
    with the auth_service microservice
    """
    try:
        response = httpx.get(
            AUTH_SERVICE_URL,
            headers={"Authorization": f"Bearer {token}"},
            timeout=10.0
        )

        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido o expirado",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user_data = response.json()
        return user_data

    except httpx.RequestError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="No se pudo conectar con el servicio de autenticación",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Error al validar el token",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_active_user(current_user: dict = Depends(get_current_user)):
    """
    Dependency to ensure the user is active (can be extended for user status checks)
    """
    return current_user
