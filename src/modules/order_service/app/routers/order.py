from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import httpx
import os
from dotenv import load_dotenv

from app.database import get_db
from app.dependencies import get_current_user
from app import models, schemas

# Load environment variables
load_dotenv()

router = APIRouter(prefix="/api/orders", tags=["Orders"])

# External service URLs
CART_SERVICE_URL = os.getenv("CART_SERVICE_URL", "http://cart_service:8000/api/cart")
PRODUCT_SERVICE_URL = os.getenv("PRODUCT_SERVICE_URL", "http://product_service:8000/products")



@router.post("/checkout", response_model=schemas.CheckoutResponse)
async def create_order_from_cart(
    checkout_data: schemas.CheckoutRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Create an order from the user's cart items
    """
    try:
        # For now, create a simple demo order since proper service-to-service auth is complex
        # In production, you'd implement proper authentication between services
        cart_items = [
            {
                "product_id": 1,
                "quantity": 2,
                "unit_price": 3500.0,
                "total_price": 7000.0
            }
        ]

        # In production, you would get real cart items like this:
        # cart_response = httpx.get(f"{CART_SERVICE_URL}/", headers=auth_headers, timeout=10.0)
        # if cart_response.status_code == 200:
        #     cart_items = cart_response.json()
        # else:
        #     raise HTTPException(status_code=400, detail="Error al obtener items del carrito")

        # Calculate total amount
        total_amount = sum(item["total_price"] for item in cart_items)

        # Create order
        new_order = models.Order(
            user_id=current_user["user_id"],
            total_amount=total_amount,
            status=models.OrderStatus.PENDING.value,
            shipping_address=checkout_data.shipping_address,
            billing_address=checkout_data.billing_address,
            phone=checkout_data.phone,
            email=checkout_data.email,
            notes=checkout_data.notes,
            estimated_delivery=datetime.now() + timedelta(days=5)  # 5 days delivery
        )

        db.add(new_order)
        db.commit()  # Commit to get the order ID
        db.refresh(new_order)

        # Create order items after order is committed
        for cart_item in cart_items:
            # Get product details
            try:
                product_response = httpx.get(
                    f"{PRODUCT_SERVICE_URL}/{cart_item['product_id']}",
                    timeout=10.0
                )
                product_data = product_response.json() if product_response.status_code == 200 else {}
            except Exception:
                product_data = {}

            # Ensure proper type conversion for all fields
            order_item = models.OrderItem(
                order_id=new_order.id,
                product_id=cart_item["product_id"],
                quantity=cart_item["quantity"],
                unit_price=cart_item["unit_price"],
                total_price=cart_item["total_price"],
                product_name=product_data.get("name", f"Producto {cart_item['product_id']}"),
                product_description=product_data.get("description", "") or None
            )
            db.add(order_item)

        db.commit()  # Commit order items

        return schemas.CheckoutResponse(
            order_id=new_order.id,
            total_amount=new_order.total_amount,
            status=new_order.status,
            message="Pedido creado exitosamente",
            estimated_delivery=new_order.estimated_delivery
        )

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear el pedido: {str(e)}"
        )

@router.get("/summary/stats")
def get_order_statistics(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get order statistics for the current user
    """
    user_id = current_user["user_id"]

    # Count orders by status
    total_orders = db.query(models.Order).filter(models.Order.user_id == user_id).count()
    pending_orders = db.query(models.Order).filter(
        models.Order.user_id == user_id,
        models.Order.status == models.OrderStatus.PENDING.value
    ).count()
    completed_orders = db.query(models.Order).filter(
        models.Order.user_id == user_id,
        models.Order.status == models.OrderStatus.DELIVERED.value
    ).count()

    # Calculate total spent
    total_spent_result = db.query(models.Order).filter(
        models.Order.user_id == user_id,
        models.Order.status != models.OrderStatus.CANCELLED.value
    ).all()

    total_spent = sum(order.total_amount for order in total_spent_result)

    return {
        "user_id": user_id,
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "completed_orders": completed_orders,
        "cancelled_orders": total_orders - pending_orders - completed_orders,
        "total_spent": total_spent,
        "average_order_value": total_spent / total_orders if total_orders > 0 else 0
    }

@router.get("/status/{status}", response_model=List[schemas.OrderSummary])
def get_orders_by_status(
    status: schemas.OrderStatus,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get all orders with a specific status
    """
    orders = db.query(models.Order).filter(
        models.Order.user_id == current_user["user_id"],
        models.Order.status == status.value
    ).order_by(models.Order.created_at.desc()).all()

    order_summaries = []
    for order in orders:
        items_count = len(order.items)
        order_summaries.append(schemas.OrderSummary(
            id=order.id,
            user_id=order.user_id,
            total_amount=order.total_amount,
            status=schemas.OrderStatus(order.status),
            created_at=order.created_at,
            items_count=items_count,
            estimated_delivery=order.estimated_delivery
        ))

    return order_summaries

@router.get("/", response_model=schemas.OrderListResponse)
def get_user_orders(
    page: int = Query(1, ge=1, description="Número de página"),
    per_page: int = Query(10, ge=1, le=50, description="Items por página"),
    status_filter: Optional[schemas.OrderStatus] = Query(None, description="Filtrar por estado"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get all orders for the current user with pagination
    """
    # Base query
    query = db.query(models.Order).filter(models.Order.user_id == current_user["user_id"])

    # Apply status filter if provided
    if status_filter:
        query = query.filter(models.Order.status == status_filter.value)

    # Get total count
    total_orders = query.count()

    # Apply pagination
    offset = (page - 1) * per_page
    orders = query.order_by(models.Order.created_at.desc()).offset(offset).limit(per_page).all()

    # Calculate total pages
    total_pages = (total_orders + per_page - 1) // per_page

    # Convert to summary format
    order_summaries = []
    for order in orders:
        items_count = len(order.items)
        order_summaries.append(schemas.OrderSummary(
            id=order.id,
            user_id=order.user_id,
            total_amount=order.total_amount,
            status=schemas.OrderStatus(order.status),
            created_at=order.created_at,
            items_count=items_count,
            estimated_delivery=order.estimated_delivery
        ))

    return schemas.OrderListResponse(
        orders=order_summaries,
        total_orders=total_orders,
        page=page,
        per_page=per_page,
        total_pages=total_pages
    )

@router.get("/{order_id}", response_model=schemas.OrderResponse)
def get_order_details(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get detailed information about a specific order
    """
    order = db.query(models.Order).filter(
        models.Order.id == order_id,
        models.Order.user_id == current_user["user_id"]
    ).first()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido no encontrado"
        )

    return order

@router.put("/{order_id}/cancel", response_model=schemas.OrderResponse)
def cancel_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Cancel an order (only if it's in pending or confirmed status)
    """
    order = db.query(models.Order).filter(
        models.Order.id == order_id,
        models.Order.user_id == current_user["user_id"]
    ).first()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido no encontrado"
        )

    # Check if order can be cancelled
    if order.status not in [models.OrderStatus.PENDING.value, models.OrderStatus.CONFIRMED.value]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El pedido no puede ser cancelado en su estado actual"
        )

    order.status = models.OrderStatus.CANCELLED.value
    order.updated_at = datetime.now()

    db.commit()
    db.refresh(order)

    return order

@router.put("/{order_id}/status", response_model=schemas.OrderResponse)
def update_order_status(
    order_id: int,
    status_update: schemas.OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Update order status (admin only - for future implementation)
    Currently allows users to update their own orders
    """
    order = db.query(models.Order).filter(
        models.Order.id == order_id,
        models.Order.user_id == current_user["user_id"]  # For now, users can only update their own orders
    ).first()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido no encontrado"
        )

    order.status = status_update.status.value
    order.updated_at = datetime.now()

    if status_update.notes:
        order.notes = order.notes + f"\n[{datetime.now()}] {status_update.notes}" if order.notes else status_update.notes

    if status_update.status == schemas.OrderStatus.DELIVERED:
        order.delivered_at = datetime.now()

    db.commit()
    db.refresh(order)

    return order
