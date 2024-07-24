from fastapi import APIRouter, UploadFile, HTTPException
import json
import shutil
from Myuser import userinfo, issueInfo

router = APIRouter()


@router.get("/get")
async def get_taskboard():
    task_data = None
    user_file = f"data/data_{userinfo['id']}.json"
    default_file = "data/data_default.json"

    while True:
        try:
            with open(user_file, "r", encoding="utf-8") as file:
                task_data = json.load(file)
                break
        except FileNotFoundError:
            shutil.copyfile(default_file, user_file)

    return task_data


@router.post("/save")
async def save_taskboard(payload: dict):
    task_data = payload.get("data")
    if not task_data:
        raise HTTPException(status_code=400, detail="No task data provided")

    user_file = f"data/data_{userinfo['id']}.json"
    with open(user_file, "w", encoding="utf-8") as file:
        json.dump(task_data, file)

    return {"status": "success"}


@router.get("/getinfo")
async def get_userinfo():
    return userinfo


@router.post("/upload")
async def upload_file(file: UploadFile = None):
    print(userinfo)
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")

    destination = f"upload/{file.filename}"
    with open(destination, "wb") as out_file:
        shutil.copyfileobj(file.file, out_file)

    return {"status": "success"}


@router.post("/update")
async def update_issue_info(payload: dict):
    column_id = payload.get("columnId")
    issue_id = payload.get("issueId")

    if column_id is None or issue_id is None:
        raise HTTPException(status_code=400, detail="Invalid issue data")

    issueInfo["columnId"] = column_id
    issueInfo["issueId"] = issue_id

    return {"status": "updated"}
