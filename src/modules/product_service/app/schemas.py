from pydantic import BaseModel
from typing import Optional

# ===== Categoría =====

class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int

    class Config:
        orm_mode = True

# ===== Producto =====

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    size: Optional[str] = None
    weight: Optional[float] = None
    unit_price: float
    iva: float
    category_id: Optional[int] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    size: Optional[str] = None
    weight: Optional[float] = None
    unit_price: Optional[float] = None
    iva: Optional[float] = None
    category_id: Optional[int] = None

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    category: Optional[CategoryResponse] = None  # Si no quieres incluirla, puedes eliminar esta línea

    class Config:
        orm_mode = True
