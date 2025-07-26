from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.database import get_db
from app.dependencies import get_current_user
import httpx
import logging

router = APIRouter(tags=["Cart"])

# URL del microservicio de productos
PRODUCT_SERVICE_URL = "http://product_service:8000/products"

@router.post("/", response_model=schemas.CartItem)
def add_to_cart(
    cart_item: schemas.CartItemCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Verificar si el producto existe y obtener su información
    try:
        product_url = f"{PRODUCT_SERVICE_URL}/{cart_item.product_id}"
        logging.info(f"Verificando producto en URL: {product_url}")

        response = httpx.get(product_url)
        logging.info(f"Respuesta del product_service - Status: {response.status_code}")

        if response.status_code != 200:
            logging.error(f"Producto no encontrado - Status: {response.status_code}, Response: {response.text}")
            raise HTTPException(status_code=404, detail="Producto no encontrado")

        product_data = response.json()
        unit_price = product_data.get("unit_price")

        if unit_price is None:
            logging.error(f"El producto no tiene precio definido: {product_data}")
            raise HTTPException(status_code=400, detail="El producto no tiene precio definido")

    except httpx.RequestError as e:
        logging.error(f"Error de conexión al verificar producto: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al verificar el producto: {str(e)}")

    # Buscar si el producto ya está en el carrito del usuario
    existing_item = db.query(models.CartItem).filter(
        models.CartItem.user_id == current_user["user_id"],
        models.CartItem.product_id == cart_item.product_id
    ).first()

    if existing_item:
        # Sumar la cantidad y actualizar el precio unitario (por si cambió)
        existing_item.quantity += cart_item.quantity
        existing_item.unit_price = unit_price
        db.commit()
        db.refresh(existing_item)
        return existing_item
    else:
        # Crear nuevo item si no existe
        db_item = models.CartItem(
            user_id=current_user["user_id"],
            product_id=cart_item.product_id,
            quantity=cart_item.quantity,
            unit_price=unit_price
        )
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item

@router.get("/", response_model=list[schemas.CartItem])
def get_cart_items(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return db.query(models.CartItem).filter(
        models.CartItem.user_id == current_user["user_id"]
    ).all()

@router.get("/summary", response_model=schemas.CartSummary)
def get_cart_summary(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Obtiene un resumen del carrito con el total general
    """
    cart_items = db.query(models.CartItem).filter(
        models.CartItem.user_id == current_user["user_id"]
    ).all()

    total_items = sum(item.quantity for item in cart_items)
    total_amount = sum(item.quantity * item.unit_price for item in cart_items)

    return {
        "user_id": current_user["user_id"],
        "total_items": total_items,
        "total_amount": total_amount,
        "items_count": len(cart_items)
    }

@router.delete("/{item_id}", response_model=dict)
def remove_cart_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    item = db.query(models.CartItem).filter(
        models.CartItem.id == item_id,
        models.CartItem.user_id == current_user["user_id"]
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Item no encontrado")

    db.delete(item)
    db.commit()
    return {"detail": "Item eliminado del carrito"}
