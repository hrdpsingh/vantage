import os
from typing import Annotated

import httpx2
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, status
from github.dependencies import get_http_client
from github.models import CommitHistory, Contributors, Overview
from github.services import format_date

load_dotenv()
GITHUB_PAT = os.environ["GITHUB_PAT"]

router = APIRouter()
headers = {"Authorization": f"Bearer {GITHUB_PAT}"}


@router.get("/repository/{username}/{repository}/overview", response_model=Overview)
async def get_overview(
    username: str,
    repository: str,
    client: Annotated[httpx2.AsyncClient, Depends(get_http_client)],
):
    print("checkpoint 1")
    response = await client.get(
        url=f"https://api.github.com/repos/{username}/{repository}", headers=headers
    )

    print("checkpoint 2")
    remaining_header = response.headers.get("x-ratelimit-remaining")

    print("checkpoint 3")
    if response.status_code == status.HTTP_404_NOT_FOUND:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The repository does not exist or is private.",
        )

    print("checkpoint 4")
    data = response.json()

    print("checkpoint 5")

    star_count = data["stargazers_count"]
    last_update = format_date(data["updated_at"])
    fork_count = data["forks_count"]
    issues = data["open_issues"]
    remaining_requests = int(remaining_header) if remaining_header is not None else None

    print("checkpoint 6")
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
async def get_commit_history(username: str, repository: str):
    async with httpx2.AsyncClient() as client:
        response = await client.get(
            url=f"https://api.github.com/repos/{username}/{repository}/stats/commit_activity",
            headers=headers,
        )

        if response.status_code == status.HTTP_404_NOT_FOUND:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="The repository does not exist or is private.",
            )

        data = response.json()

        for item in data:
            if "week" in item:
                item["week"] = format_date(item["week"])

        return data


@router.get(
    "/repository/{username}/{repository}/contributors",
    response_model=list[Contributors],
)
async def get_contributors(username: str, repository: str):
    async with httpx2.AsyncClient() as client:
        response = await client.get(
            url=f"https://api.github.com/repos/{username}/{repository}/stats/contributors",
            headers=headers,
            timeout=10,
        )

        data = response.json()
        return data
