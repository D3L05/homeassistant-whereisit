from pydantic import BaseModel
from typing import List, Optional

class ItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    quantity: int = 1

class ItemCreate(ItemBase):
    pass

class Item(ItemBase):
    id: int
    box_id: int

    class Config:
        from_attributes = True

class BoxBase(BaseModel):
    name: str
    description: Optional[str] = None
    slug: Optional[str] = None

class BoxCreate(BoxBase):
    unit_id: int

class Box(BoxBase):
    id: int
    unit_id: int
    items: List[Item] = []

    class Config:
        from_attributes = True

class UnitBase(BaseModel):
    name: str
    description: Optional[str] = None

class UnitCreate(UnitBase):
    pass

class Unit(UnitBase):
    id: int
    boxes: List[Box] = []

    class Config:
        from_attributes = True
