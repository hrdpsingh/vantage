from typing import Annotated

from pydantic import BaseModel, Field, HttpUrl, RootModel


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


CommitData = tuple[
    Annotated[int, Field(ge=0, le=6)],
    Annotated[int, Field(ge=0, le=23)],
    Annotated[int, Field(ge=0)],
]


class CommitPatterns(RootModel[list[CommitData]]):
    pass
