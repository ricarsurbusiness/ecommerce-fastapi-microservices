from pydantic import BaseModel, Field, computed_field

class CartItemCreate(BaseModel):
    product_id: int = Field(..., gt=0)
    quantity: int = Field(..., gt=0)

class CartItemUpdate(BaseModel):
    quantity: int = Field(..., gt=0)

class CartItem(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    user_id: int

    @computed_field
    def total_price(self) -> float:
        return self.quantity * self.unit_price

    class Config:
        from_attributes = True

class CartSummary(BaseModel):
    user_id: int
    total_items: int
    total_amount: float
    items_count: int
