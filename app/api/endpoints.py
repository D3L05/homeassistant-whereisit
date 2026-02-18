from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from .. import crud, schemas, database, utils

router = APIRouter()

@router.get("/boxes/{box_id}/qrcode")
async def get_box_qrcode(box_id: int, db: AsyncSession = Depends(database.get_db)):
    db_box = await crud.get_box(db, box_id=box_id)
    if db_box is None:
        raise HTTPException(status_code=404, detail="Box not found")
    
    # URL structure: /api/hassio_ingress/{slug}/#/box/{slug}
    # Note: Ingress path handling might require adjustment based on actual deployment
    # For now, we generate a relative URL or a full URL if domain is known
    # Using the box slug for the URL
    qr_data = f"/hassio/ingress/whereisit/#/box/{db_box.slug}" 
    
    img_bytes = utils.generate_qr_code(qr_data)
    return Response(content=img_bytes, media_type="image/png")

@router.post("/units/", response_model=schemas.Unit)
async def create_unit(unit: schemas.UnitCreate, db: AsyncSession = Depends(database.get_db)):
    return await crud.create_unit(db=db, unit=unit)

@router.get("/units/", response_model=List[schemas.Unit])
async def read_units(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(database.get_db)):
    return await crud.get_units(db, skip=skip, limit=limit)

@router.get("/units/{unit_id}", response_model=schemas.Unit)
async def read_unit(unit_id: int, db: AsyncSession = Depends(database.get_db)):
    db_unit = await crud.get_unit(db, unit_id=unit_id)
    if db_unit is None:
        raise HTTPException(status_code=404, detail="Unit not found")
    return db_unit

@router.post("/boxes/", response_model=schemas.Box)
async def create_box(box: schemas.BoxCreate, db: AsyncSession = Depends(database.get_db)):
    return await crud.create_box(db=db, box=box)

@router.get("/boxes/{box_id}", response_model=schemas.Box)
async def read_box(box_id: int, db: AsyncSession = Depends(database.get_db)):
    db_box = await crud.get_box(db, box_id=box_id)
    if db_box is None:
        raise HTTPException(status_code=404, detail="Box not found")
    return db_box

@router.get("/boxes/slug/{slug}", response_model=schemas.Box)
async def read_box_by_slug(slug: str, db: AsyncSession = Depends(database.get_db)):
    db_box = await crud.get_box_by_slug(db, slug=slug)
    if db_box is None:
        raise HTTPException(status_code=404, detail="Box not found")
    return db_box

@router.post("/boxes/{box_id}/items/", response_model=schemas.Item)
async def create_item(box_id: int, item: schemas.ItemCreate, db: AsyncSession = Depends(database.get_db)):
    return await crud.create_item(db=db, item=item, box_id=box_id)
