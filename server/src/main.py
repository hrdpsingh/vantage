from fastapi import FastAPI
from github.router import router as github_router

app = FastAPI()

app.include_router(github_router)
