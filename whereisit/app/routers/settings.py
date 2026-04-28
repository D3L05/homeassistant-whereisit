from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
import shutil
import zipfile
import os
from pathlib import Path

router = APIRouter()

DATA_DIR = Path("/data")
DB_PATH = DATA_DIR / "whereisit.db"
PHOTOS_DIR = DATA_DIR / "photos"
BACKUP_ARCHIVE = "/tmp/whereisit_backup.zip"

@router.get("/backup")
async def create_backup():
    try:
        # Create a zip file containing the database and photos directory
        with zipfile.ZipFile(BACKUP_ARCHIVE, 'w', zipfile.ZIP_DEFLATED) as zipf:
            if DB_PATH.exists():
                zipf.write(DB_PATH, arcname="whereisit.db")
            
            if PHOTOS_DIR.exists():
                for root, dirs, files in os.walk(PHOTOS_DIR):
                    for file in files:
                        file_path = Path(root) / file
                        arcname = file_path.relative_to(DATA_DIR)
                        zipf.write(file_path, arcname=arcname)
        
        return FileResponse(
            path=BACKUP_ARCHIVE, 
            filename="whereisit_backup.zip", 
            media_type="application/zip",
            headers={"Content-Disposition": "attachment; filename=whereisit_backup.zip"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Backup failed: {str(e)}")

@router.post("/restore")
async def restore_backup(file: UploadFile = File(...)):
    if not file.filename.endswith('.zip'):
        raise HTTPException(status_code=400, detail="Uploaded file must be a .zip archive")
        
    restore_zip_path = "/tmp/uploaded_restore.zip"
    extract_dir = "/tmp/whereisit_restore"
    
    try:
        # Save uploaded file
        with open(restore_zip_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Extract to temporary directory
        if os.path.exists(extract_dir):
            shutil.rmtree(extract_dir)
        os.makedirs(extract_dir)
        
        with zipfile.ZipFile(restore_zip_path, 'r') as zipf:
            zipf.extractall(extract_dir)
            
        # Validate contents
        extracted_db = Path(extract_dir) / "whereisit.db"
        if not extracted_db.exists():
            raise HTTPException(status_code=400, detail="Invalid backup file: missing whereisit.db")
            
        # Replace actual files
        if DB_PATH.exists():
            DB_PATH.unlink()
        shutil.copy2(extracted_db, DB_PATH)
        
        extracted_photos = Path(extract_dir) / "photos"
        if extracted_photos.exists() and extracted_photos.is_dir():
            if PHOTOS_DIR.exists():
                shutil.rmtree(PHOTOS_DIR)
            shutil.copytree(extracted_photos, PHOTOS_DIR)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Restore failed: {str(e)}")
    finally:
        # Cleanup
        if os.path.exists(restore_zip_path):
            os.remove(restore_zip_path)
        if os.path.exists(extract_dir):
            shutil.rmtree(extract_dir)
            
    # Trigger restart by exiting the process. 
    # s6-overlay or the Docker container manager will automatically restart the process.
    os._exit(1)
