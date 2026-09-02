from pydantic import BaseModel


class Overview(BaseModel):
    star_count: int
    last_update: str
