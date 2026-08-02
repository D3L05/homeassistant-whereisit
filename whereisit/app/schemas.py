from pydantic import BaseModel, field_validator
from typing import List, Optional
from datetime import datetime

class ItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    quantity: int = 1
    categories: List[str] = []
    photo_path: Optional[str] = None

    @field_validator('categories', mode='before')
    def extract_category_names(cls, v):
        if not v: return []
        if isinstance(v, list) and len(v) > 0 and hasattr(v[0], 'name'):
            return [c.name for c in v]
        return v

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

class BoxSummary(BoxBase):
    id: int
    unit_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Box(BoxSummary):
    items: List[Item] = []

    class Config:
        from_attributes = True

class ItemWithBox(ItemBase):
    """Item schema for search results - includes a shallow box reference."""
    id: int
    box_id: int
    box: Optional[BoxSummary] = None

    class Config:
        from_attributes = True

class SearchResponse(BaseModel):
    boxes: List[BoxSummary] = []
    items: List[ItemWithBox] = []

class UnitBase(BaseModel):
    name: str
    description: Optional[str] = None

class UnitCreate(UnitBase):
    pass

class UnitUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class Unit(UnitBase):
    id: int
    boxes: List[Box] = []

    class Config:
        from_attributes = True

class UnitResponse(UnitBase):
    id: int

    class Config:
        from_attributes = True

class BoxUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    slug: Optional[str] = None
    unit_id: Optional[int] = None

class ItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    quantity: Optional[int] = None
    categories: Optional[List[str]] = None
    photo_path: Optional[str] = None
    box_id: Optional[int] = None

class CategoryCreate(BaseModel):
    name: str
