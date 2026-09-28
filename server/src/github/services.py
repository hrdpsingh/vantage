from datetime import datetime, timezone


def format_date(timestamp: str | int) -> str:
    if isinstance(timestamp, str):
        formatted_date = timestamp.split("T")[0].replace("-", ".")
    elif isinstance(timestamp, int):
        formatted_date = datetime.fromtimestamp(timestamp, tz=timezone.utc).strftime(
            "%Y-%m-%d"
        )

    return formatted_date


def compute_percentages(languages: dict[str, int]) -> dict[str, float]:
    total = sum(languages.values())
    percentages = {
        key: round(value / total * 100, 3) for key, value in languages.items()
    }

    total = 0
    for percentage in percentages.values():
        if percentage >= 0.1:
            total += percentage

    filtered_percentages = {
        key: value for key, value in percentages.items() if value >= 0.1
    }

    other = round(100.0 - total, 3)
    filtered_percentages["other"] = other

    return filtered_percentages
