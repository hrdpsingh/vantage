from pydantic import BaseModel


class Overview(BaseModel):
    star_count: int
    fork_count: int
    issues: int
    last_update: str
    remaining_requests: int | None


class CommitHistory(BaseModel):
    week: int
    total: int
