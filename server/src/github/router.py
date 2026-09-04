import requests
from fastapi import APIRouter, HTTPException, status
from github.models import Overview
from github.services import format_date

router = APIRouter()


@router.get("/repository/{username}/{repository}/overview", response_model=Overview)
def get_stars(username: str, repository: str) -> Overview:
    response = requests.get(f"https://api.github.com/repos/{username}/{repository}")

    if response.status_code == status.HTTP_404_NOT_FOUND:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The repository does not exist or is private.",
        )

    data = response.json()

    star_count = data["stargazers_count"]
    last_update = format_date(data["updated_at"])
    fork_count = data["forks_count"]

    return Overview(
        star_count=star_count, fork_count=fork_count, last_update=last_update
    )
