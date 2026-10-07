import re


def clean_line(line: str) -> str:
    if not line:
        return ""
    line = re.sub(r"^[\s•●▪◦○■□*]+\s*", "", line)
    line = re.sub(r"\s+", " ", line)
    return line.strip()


def get_lines(text: str):
    return [clean_line(line) for line in text.splitlines() if clean_line(line)]


def unique_preserve_order(items):
    result = []
    seen = set()

    for item in items:
        if not item:
            continue

        item = item.strip()

        if not item:
            continue

        key = item.lower()

        if key not in seen:
            seen.add(key)
            result.append(item)

    return result
