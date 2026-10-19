from datetime import UTC, datetime
from typing import Any

from pydantic import HttpUrl


def format_date(timestamp: str | int) -> str:
    if isinstance(timestamp, str):
        formatted_date = timestamp.split("T")[0].replace("-", ".")
    else:
        formatted_date = datetime.fromtimestamp(timestamp, tz=UTC).strftime("%Y.%m.%d")

    return formatted_date


def compute_percentages(languages: dict[str, int]) -> dict[str, float]:
    total_bytes = sum(languages.values())
    percentages = {
        key: round(value / total_bytes * 100, 3) for key, value in languages.items()
    }

    total = 0
    for percentage in percentages.values():
        if percentage >= 0.1:
            total += percentage

    filtered_percentages = {
        key: value for key, value in percentages.items() if value >= 0.1
    }

    other = round(100.0 - total, 3)
    filtered_percentages["Other"] = other

    return filtered_percentages


def html_url(files: dict[str, Any], key: str) -> HttpUrl | None:
    entry: dict[str, Any] | None = files.get(key)
    return entry.get("html_url") if entry else None
