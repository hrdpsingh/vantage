from datetime import UTC, datetime

from pydantic import HttpUrl


def format_date(timestamp: str | int) -> str:
    if isinstance(timestamp, str):
        formatted_date = timestamp.split("T")[0].replace("-", ".")
    else:
        formatted_date = datetime.fromtimestamp(timestamp, tz=UTC).strftime("%Y.%m.%d")

    return formatted_date


def compute_percentages(languages: dict[str, int]) -> dict[str, float]:
    total_bytes = sum(languages.values())

    percentages: dict[str, float] = {
        language: round((bytes / total_bytes) * 100.0, 3)
        for language, bytes in languages.items()
    }

    if len(percentages) > 5:
        top_languages = dict(list(percentages.items())[:5])
        top_languages["Other"] = round(100.0 - sum(top_languages.values()), 3)
        return top_languages

    return percentages


def html_url(files: dict[str, dict[str, HttpUrl] | None], key: str) -> HttpUrl | None:
    entry: dict[str, HttpUrl] | None = files.get(key)
    return entry.get("html_url") if entry else None
