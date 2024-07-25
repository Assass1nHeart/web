from fastapi import APIRouter
from fastapi.responses import FileResponse

router = APIRouter()

@router.get("/{file_name}")
async def download_file(file_name: str):
    file_path = f"upload/{file_name}"
    return FileResponse(path=file_path, filename=file_name)
