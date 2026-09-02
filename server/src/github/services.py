def format_date(timestamp: str):
    formatted_date = timestamp.split("T")[0].replace("-", ".")
    return formatted_date
