from pydantic import BaseModel, Field, validator
from typing import List, Optional
from datetime import datetime
from enum import Enum

class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class OrderItemCreate(BaseModel):
    product_id: int = Field(..., gt=0, description="ID del producto")
    quantity: int = Field(..., gt=0, description="Cantidad del producto")
    unit_price: float = Field(..., gt=0, description="Precio unitario")
    product_name: str = Field(..., min_length=1, max_length=200, description="Nombre del producto")
    product_description: Optional[str] = Field(None, description="Descripción del producto")

    @validator('unit_price')
    def validate_unit_price(cls, v):
        if v <= 0:
            raise ValueError('El precio unitario debe ser mayor a 0')
        return round(v, 2)

class OrderCreate(BaseModel):
    shipping_address: str = Field(..., min_length=10, max_length=500, description="Dirección de envío")
    billing_address: Optional[str] = Field(None, max_length=500, description="Dirección de facturación")
    phone: str = Field(..., min_length=7, max_length=20, description="Número de teléfono")
    email: str = Field(..., description="Correo electrónico")
    notes: Optional[str] = Field(None, max_length=1000, description="Notas adicionales")

    @validator('email')
    def validate_email(cls, v):
        if '@' not in v or '.' not in v:
            raise ValueError('Formato de email inválido')
        return v.lower()

    @validator('phone')
    def validate_phone(cls, v):
        # Remove spaces and special characters
        phone_clean = ''.join(filter(str.isdigit, v))
        if len(phone_clean) < 7:
            raise ValueError('El número de teléfono debe tener al menos 7 dígitos')
        return v

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    total_price: float
    product_name: str
    product_description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    user_id: int
    total_amount: float
    status: OrderStatus
    shipping_address: str
    billing_address: Optional[str]
    phone: str
    email: str
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    estimated_delivery: Optional[datetime]
    delivered_at: Optional[datetime]
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True

class OrderSummary(BaseModel):
    id: int
    user_id: int
    total_amount: float
    status: OrderStatus
    created_at: datetime
    items_count: int
    estimated_delivery: Optional[datetime]

class OrderStatusUpdate(BaseModel):
    status: OrderStatus
    notes: Optional[str] = Field(None, max_length=500, description="Notas sobre el cambio de estado")

class OrderListResponse(BaseModel):
    orders: List[OrderSummary]
    total_orders: int
    page: int
    per_page: int
    total_pages: int

class CheckoutRequest(BaseModel):
    shipping_address: str = Field(..., min_length=10, max_length=500)
    billing_address: Optional[str] = Field(None, max_length=500)
    phone: str = Field(..., min_length=7, max_length=20)
    email: str = Field(...)
    notes: Optional[str] = Field(None, max_length=1000)
    payment_method: str = Field(default="cash_on_delivery", description="Método de pago")

    @validator('email')
    def validate_email(cls, v):
        if '@' not in v or '.' not in v:
            raise ValueError('Formato de email inválido')
        return v.lower()

class CheckoutResponse(BaseModel):
    order_id: int
    total_amount: float
    status: str
    message: str
    estimated_delivery: Optional[datetime]
