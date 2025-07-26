from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import httpx
import os

# Debe coincidir con la ruta donde está montado el login en auth_service
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# URL del endpoint que verifica el token en auth_service
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://auth_service:8000/auth/verify-token")

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        response = httpx.get(
            AUTH_SERVICE_URL,
            headers={"Authorization": f"Bearer {token}"}
        )
        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido o expirado",
            )

        return response.json()

    except httpx.RequestError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="No se pudo conectar con el servicio de autenticación",
        )
