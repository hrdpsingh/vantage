from pydantic import BaseModel


class Overview(BaseModel):
    star_count: int
