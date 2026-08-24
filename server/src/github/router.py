from fastapi import APIRouter
from github.models import RepositoryStarsResponse
from github.services import get_repository_stars

router = APIRouter()


@router.get(
    "/repository/{owner}/{repository}/stars", response_model=RepositoryStarsResponse
)
def get_stars(owner: str, repository: str) -> RepositoryStarsResponse:
    data = get_repository_stars(owner, repository)
    return RepositoryStarsResponse(**data)
