from fastapi import APIRouter, Request, Depends, HTTPException, status
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from .. import schemas, models, database, auth

router = APIRouter(prefix="/auth", tags=["auth"])

# Obtener el token desde el header Authorization
@router.get("/verify-token")
def verify_token(request: Request):
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token no proporcionado en el encabezado Authorization"
        )

    if not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Formato del token inválido. Debe comenzar con 'Bearer '"
        )

    token = auth_header.split(" ")[1]

    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])

        user_id = payload.get("user_id")
        username = payload.get("sub")

        if user_id is None or username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido: falta información del usuario"
            )

        return {"user_id": user_id, "username": username}

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado"
        )

# Función para obtener la base de datos
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Usuario ya existe")
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(username=user.username, password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=schemas.Token)
def login(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if not db_user or not auth.verify_password(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Credenciales inválidas")
    token = auth.create_access_token({"sub": db_user.username, "user_id": db_user.id})
    return {"access_token": token, "token_type": "bearer"}
