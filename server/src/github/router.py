import os

import requests
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, status
from github.models import CommitHistory, Overview
from github.services import format_date

load_dotenv()
GITHUB_PAT = os.environ["GITHUB_PAT"]

router = APIRouter()
headers = {"Authorization": f"Bearer {GITHUB_PAT}"}


@router.get("/repository/{username}/{repository}/overview", response_model=Overview)
def get_overview(username: str, repository: str):
    response = requests.get(
        f"https://api.github.com/repos/{username}/{repository}", headers=headers
    )

    remaining_header = response.headers.get("x-ratelimit-remaining")

    if response.status_code == status.HTTP_404_NOT_FOUND:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The repository does not exist or is private.",
        )

    data = response.json()

    star_count = data["stargazers_count"]
    last_update = format_date(data["updated_at"])
    fork_count = data["forks_count"]
    issues = data["open_issues"]
    remaining_requests = int(remaining_header) if remaining_header is not None else None

    return Overview(
        star_count=star_count,
        fork_count=fork_count,
        issues=issues,
        last_update=last_update,
        remaining_requests=remaining_requests,
    )


@router.get(
    "/repository/{username}/{repository}/commit-history",
    response_model=list[CommitHistory],
)
def get_commits(username: str, repository: str):
    response = requests.get(
        f"https://api.github.com/repos/{username}/{repository}/stats/commit_activity",
        headers=headers,
    )

    if response.status_code == status.HTTP_404_NOT_FOUND:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The repository does not exist or is private.",
        )

    data = response.json()
    return data
