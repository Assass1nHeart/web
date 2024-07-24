from fastapi import APIRouter
import json
from Myuser import userinfo

api = APIRouter()


@api.post("/login")
async def validate_user(credentials: dict):
    users = None
    with open("data/userlog.json", "r", encoding="UTF-8") as file:
        users = json.load(file)

    for user in users:
        if user["username"] == credentials["username"]:
            if user["password"] == credentials["password"]:
                userinfo.update({
                    "id": user["id"],
                    "username": user["username"],
                    "password": user["password"]
                })
                return {
                    "status": "success",
                    "id": user["id"]
                }
            return {
                "status": "password error",
                "id": ""
            }

    return {
        "status": "username error",
        "id": ""
    }


@api.post("/register")
async def add_user(details: dict):
    existing_users = None
    with open("data/userlog.json", "r", encoding="UTF-8") as file:
        existing_users = json.load(file)

    for user in existing_users:
        if user["username"] == details["username"]:
            return {
                "status": "username error"
            }

    new_user = {
        "id": len(existing_users) + 1,
        "username": details["username"],
        "password": details["password"]
    }
    existing_users.append(new_user)
    with open("data/userlog.json", "w", encoding="UTF-8") as file:
        json.dump(existing_users, file)

    return {
        "status": "success"
    }
