import requests
from fastapi import HTTPException, status


def get_repository_stars(owner: str, repository: str):
    response = requests.get(f"https://api.github.com/repos/{owner}/{repository}")

    if response.status_code == status.HTTP_404_NOT_FOUND:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Repository not found"
        )

    data = response.json()
    return {
        "owner": data["owner"]["login"],
        "repository": data["name"],
        "stargazers_count": data["stargazers_count"],
    }
