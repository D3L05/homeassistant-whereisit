import asyncio
from database import AsyncSessionLocal, engine, Base
from models import StorageUnit, StorageBox
import crud
import schemas

async def test():
    print("Connecting to DB...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async with AsyncSessionLocal() as db:
        print("Creating unit...")
        try:
            unit = await crud.create_unit(db, schemas.UnitCreate(name="Unit Test DB 2"))
            print("Unit ID:", unit.id)
        except Exception as e:
            print("Unit exists:", e)
        
        print("Creating box...")
        try:
            box = await crud.create_box(db, schemas.BoxCreate(name="Box Test DB 2", unit_id=1, description="Test"))
            print("Box created! ID:", box.id)
        except Exception as e:
            print("FAIL! Error creating box:")
            import traceback
            traceback.print_exc()

print("Starting async test...")
asyncio.run(test())
