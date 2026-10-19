import os
from typing import Any

import httpx2
from dotenv import load_dotenv
from fastapi import APIRouter, Request
from models import (
    CommitActivity,
    Contributors,
    Languages,
    Overview,
    Profile,
    PunchCard,
    WeekActivity,
)
from services import compute_percentages, format_date, html_url

router = APIRouter()

load_dotenv()
GITHUB_PAT = os.environ["GITHUB_PAT"]
headers = {"Authorization": f"Bearer {GITHUB_PAT}"}

timeout = 20


@router.get("/{username}/{repository}/overview", response_model=Overview)
async def get_overview(request: Request, username: str, repository: str):
    client: httpx2.AsyncClient = request.app.state.client
    response = await client.get(
        f"https://api.github.com/repos/{username}/{repository}",
        headers=headers,
        timeout=timeout,
    )
    data = response.json()

    return data


@router.get("/{username}/{repository}/commit-activity", response_model=CommitActivity)
async def get_commit_activity(request: Request, username: str, repository: str):
    client: httpx2.AsyncClient = request.app.state.client
    response = await client.get(
        f"https://api.github.com/repos/{username}/{repository}/stats/commit_activity",
        headers=headers,
        timeout=timeout,
    )
    data = response.json()

    return CommitActivity(
        root=[
            WeekActivity(
                week_start_date=format_date(item["week"]), daywise_commits=item["days"]
            )
            for item in data
        ]
    )


@router.get("/{username}/{repository}/contributors", response_model=Contributors)
async def get_contributors(request: Request, username: str, repository: str):
    client: httpx2.AsyncClient = request.app.state.client
    response = await client.get(
        f"https://api.github.com/repos/{username}/{repository}/stats/contributors",
        headers=headers,
        timeout=timeout,
    )
    data = response.json()

    return data


@router.get("/{username}/{repository}/languages", response_model=Languages)
async def get_languages(request: Request, username: str, repository: str):
    client: httpx2.AsyncClient = request.app.state.client
    response = await client.get(
        f"https://api.github.com/repos/{username}/{repository}/languages",
        headers=headers,
        timeout=timeout,
    )
    data = compute_percentages(response.json())

    return data


@router.get("/{username}/{repository}/punch-card", response_model=PunchCard)
async def get_punch_card(request: Request, username: str, repository: str):
    client: httpx2.AsyncClient = request.app.state.client
    response = await client.get(
        f"https://api.github.com/repos/{username}/{repository}/stats/punch_card",
        headers=headers,
        timeout=timeout,
    )
    data = response.json()
    keys = ["day", "hour", "count"]
    result = [dict(zip(keys, item)) for item in data]

    return result


@router.get("/{username}/{repository}/profile", response_model=Profile)
async def get_profile(request: Request, username: str, repository: str):
    client: httpx2.AsyncClient = request.app.state.client
    response = await client.get(
        f"https://api.github.com/repos/{username}/{repository}/community/profile",
        headers=headers,
        timeout=timeout,
    )
    data = response.json()

    files: dict[str, Any] = data.get("files") or {}

    return Profile(
        documentation=data.get("documentation"),
        code_of_conduct=html_url(files, "code_of_conduct"),
        license=html_url(files, "license"),
        readme=html_url(files, "readme"),
        issue_template=html_url(files, "issue_template"),
        pull_request_template=html_url(files, "pull_request_template"),
    )
