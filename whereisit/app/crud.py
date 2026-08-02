from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from . import models, schemas
import uuid

async def get_units(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(
        select(models.StorageUnit)
        .options(selectinload(models.StorageUnit.boxes).selectinload(models.StorageBox.items).selectinload(models.Item.categories))
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

async def get_categories(db: AsyncSession):
    result = await db.execute(select(models.Category.name).order_by(models.Category.name))
    return result.scalars().all()

async def create_category(db: AsyncSession, name: str):
    existing = await db.execute(
        select(models.Category).where(models.Category.name == name)
    )
    if existing.scalar_one_or_none():
        return None  # Already exists
    db_cat = models.Category(name=name)
    db.add(db_cat)
    await db.commit()
    await db.refresh(db_cat)
    return db_cat

async def rename_category(db: AsyncSession, old_name: str, new_name: str):
    from sqlalchemy import update
    # Rename on items
    await db.execute(
        update(models.Item)
        .where(models.Item.category == old_name)
        .values(category=new_name)
    )
    # Rename in standalone table
    await db.execute(
        update(models.Category)
        .where(models.Category.name == old_name)
        .values(name=new_name)
    )
    await db.commit()

async def delete_category(db: AsyncSession, category_name: str):
    from sqlalchemy import update, delete
    # Clear from items
    await db.execute(
        update(models.Item)
        .where(models.Item.category == category_name)
        .values(category=None)
    )
    # Remove from standalone table
    await db.execute(
        delete(models.Category)
        .where(models.Category.name == category_name)
    )
    await db.commit()

async def create_unit(db: AsyncSession, unit: schemas.UnitCreate):
    existing = await db.execute(select(models.StorageUnit).where(models.StorageUnit.name == unit.name))
    if existing.scalar_one_or_none():
        return await get_unit_by_name(db, unit.name)
        
    db_unit = models.StorageUnit(name=unit.name, description=unit.description)
    db.add(db_unit)
    await db.commit()
    await db.refresh(db_unit)
    return db_unit

async def get_unit_by_name(db: AsyncSession, name: str):
    result = await db.execute(select(models.StorageUnit).where(models.StorageUnit.name == name))
    return result.scalar_one_or_none()

async def get_unit(db: AsyncSession, unit_id: int):
    result = await db.execute(
        select(models.StorageUnit)
        .options(selectinload(models.StorageUnit.boxes).selectinload(models.StorageBox.items).selectinload(models.Item.categories))
        .where(models.StorageUnit.id == unit_id)
    )
    return result.scalar_one_or_none()

async def get_boxes(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(models.StorageBox).options(selectinload(models.StorageBox.items).selectinload(models.Item.categories)).offset(skip).limit(limit))
    return result.scalars().all()

async def create_box(db: AsyncSession, box: schemas.BoxCreate):
    # Generate a random slug if not provided
    slug = box.slug or str(uuid.uuid4())
    db_box = models.StorageBox(name=box.name, description=box.description, slug=slug, unit_id=box.unit_id)
    db.add(db_box)
    await db.commit()
    await db.refresh(db_box)
    return db_box

async def get_box(db: AsyncSession, box_id: int):
    result = await db.execute(select(models.StorageBox).options(selectinload(models.StorageBox.items).selectinload(models.Item.categories)).where(models.StorageBox.id == box_id))
    return result.scalar_one_or_none()

async def get_box_by_slug(db: AsyncSession, slug: str):
    result = await db.execute(select(models.StorageBox).options(selectinload(models.StorageBox.items).selectinload(models.Item.categories)).where(models.StorageBox.slug == slug))
    return result.scalar_one_or_none()

async def create_item(db: AsyncSession, item: schemas.ItemCreate, box_id: int):
    print(f'[CREATE_ITEM] Categories received: {item.categories}')
    item_data = item.model_dump()
    categories_list = item_data.pop('categories', [])
    
    db_item = models.Item(**item_data, box_id=box_id)
    db.add(db_item)
    
    for cat_name in categories_list:
        cat_name = cat_name.strip()
        if not cat_name: continue
        
        cat_result = await db.execute(select(models.Category).where(models.Category.name == cat_name))
        db_cat = cat_result.scalars().first()
        if not db_cat:
            db_cat = models.Category(name=cat_name)
            db.add(db_cat)
        db_item.categories.append(db_cat)
    await db.commit()
    
    # Reload with categories to avoid MissingGreenlet error during serialization
    result = await db.execute(
        select(models.Item)
        .options(selectinload(models.Item.categories))
        .where(models.Item.id == db_item.id)
    )
    return result.scalar_one()

async def delete_item(db: AsyncSession, item_id: int):
    result = await db.execute(select(models.Item).where(models.Item.id == item_id))
    item = result.scalar_one_or_none()
    if item:
        await db.delete(item)
        await db.commit()
    return item

async def update_unit(db: AsyncSession, unit_id: int, unit_update: schemas.UnitUpdate):
    db_unit = await get_unit(db, unit_id)
    if db_unit:
        update_data = unit_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_unit, key, value)
        await db.commit()
        await db.refresh(db_unit)
    return db_unit

async def delete_unit(db: AsyncSession, unit_id: int):
    db_unit = await get_unit(db, unit_id)
    if db_unit:
        await db.delete(db_unit)
        await db.commit()
    return db_unit

async def update_box(db: AsyncSession, box_id: int, box_update: schemas.BoxUpdate):
    db_box = await get_box(db, box_id)
    if db_box:
        update_data = box_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_box, key, value)
        await db.commit()
        await db.refresh(db_box)
    return db_box

async def delete_box(db: AsyncSession, box_id: int):
    db_box = await get_box(db, box_id)
    if db_box:
        await db.delete(db_box)
        await db.commit()
    return db_box

async def update_item(db: AsyncSession, item_id: int, item_update: schemas.ItemUpdate):
    print(f'[UPDATE_ITEM] Categories received: {item_update.categories}')
    result = await db.execute(select(models.Item).options(selectinload(models.Item.categories)).where(models.Item.id == item_id))
    db_item = result.scalar_one_or_none()
    if db_item:
        update_data = item_update.model_dump(exclude_unset=True)
        
        if "categories" in update_data:
            categories_list = update_data.pop("categories")
            db_item.categories.clear()
            
            for cat_name in categories_list:
                cat_name = cat_name.strip()
                if not cat_name: continue
                
                cat_result = await db.execute(select(models.Category).where(models.Category.name == cat_name))
                db_cat = cat_result.scalars().first()
                if not db_cat:
                    db_cat = models.Category(name=cat_name)
                    db.add(db_cat)
                db_item.categories.append(db_cat)
                
        for key, value in update_data.items():
            setattr(db_item, key, value)
        await db.commit()
        
        # Reload with categories
        result = await db.execute(
            select(models.Item)
            .options(selectinload(models.Item.categories))
            .where(models.Item.id == db_item.id)
        )
        return result.scalar_one()
    return db_item

async def search_storage(db: AsyncSession, query: str = "", category: str = None):
    from sqlalchemy import or_
    import sqlalchemy
    
    if category:
        boxes = []
    else:
        boxes = await db.execute(
            select(models.StorageBox)
            .where(
                or_(
                    models.StorageBox.name.ilike(f"%{query}%"),
                    models.StorageBox.description.ilike(f"%{query}%")
                )
            )
        )
        boxes = boxes.scalars().all()
    
    item_query = select(models.Item).options(selectinload(models.Item.box), selectinload(models.Item.categories))
    
    conditions = []
    if category:
        item_query = item_query.join(models.Item.categories).where(models.Category.name == category)
        
    if query:
        if not category:
            item_query = item_query.outerjoin(models.Item.categories)
            
        conditions.append(
            or_(
                models.Item.name.ilike(f"%{query}%"),
                models.Item.description.ilike(f"%{query}%"),
                models.Category.name.ilike(f"%{query}%")
            )
        )
        
    if conditions:
        item_query = item_query.where(sqlalchemy.and_(*conditions))
        
    items = await db.execute(item_query)
    items = items.unique().scalars().all()
    
    return {"boxes": boxes, "items": items}
