from datetime import datetime, timezone


def format_date(timestamp: str | int) -> str:
    if isinstance(timestamp, str):
        formatted_date = timestamp.split("T")[0].replace("-", ".")
    elif isinstance(timestamp, int):
        formatted_date = datetime.fromtimestamp(timestamp, tz=timezone.utc).strftime(
            "%Y-%m-%d"
        )

    return formatted_date
