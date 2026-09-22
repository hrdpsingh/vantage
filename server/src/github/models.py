from pydantic import BaseModel, HttpUrl


class Overview(BaseModel):
    star_count: int
    fork_count: int
    issues: int
    last_update: str
    remaining_requests: int | None


class CommitHistory(BaseModel):
    week: str
    total: int


class Author(BaseModel):
    login: str
    avatar_url: HttpUrl


class Contributors(BaseModel):
    total: int
    author: Author | None
