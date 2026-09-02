import requests
from fastapi import APIRouter, HTTPException, status
from github.models import Overview

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
    return Overview(star_count=data["stargazers_count"])
