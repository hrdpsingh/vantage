from pydantic import BaseModel


class RepositoryStarsResponse(BaseModel):
    owner: str
    repository: str
    stargazers_count: int
