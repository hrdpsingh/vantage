from contextlib import asynccontextmanager

import httpx2
from fastapi import FastAPI
from routes import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.client = httpx2.AsyncClient()
    yield


app = FastAPI(lifespan=lifespan)
app.include_router(router)
