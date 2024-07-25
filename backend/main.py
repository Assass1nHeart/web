
import os
import sys
root_path = os.getcwd()
sys.path.append(root_path)

from fastapi import FastAPI
from controller.Taskboard import router as Taskboard
from controller.User import api as User
from controller.Upload import router as Upload
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from path import Path


app = FastAPI()
@app.get("/")
def read_root():
    return {"message": "Welcome to FastAPI"}

app.include_router(Taskboard, prefix="/taskboard",tags=["taskboard"])
app.include_router(User, prefix="/user",tags=["user"])
app.include_router(Upload, prefix="/upload",tags=["upload"])

# 允许跨域请求


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
if __name__ == "__main__":
    uvicorn.run(app=f'{Path(__file__).stem}:app', port=8080,reload=False,host="127.0.0.1")



