import re

from .helpers import get_lines


# ============================================================
# EMAIL
# ============================================================

def extract_email(text: str):
    match = re.search(
        r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}",
        text
    )

    return match.group(0) if match else None


# ============================================================
# PHONE
# ============================================================

def extract_phone(text: str):
    patterns = [
        r"(?<!\d)(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}(?!\d)",
        r"(?<!\d)\+?\d[\d\s().-]{8,16}\d(?!\d)"
    ]

    for pattern in patterns:
        match = re.search(pattern, text)

        if match:
            value = match.group(0).strip()
            digits = re.sub(r"\D", "", value)

            if len(digits) >= 10:
                return value

    return None


# ============================================================
# PROFESSIONAL LINKS
# ============================================================

def extract_linkedin(text: str):
    patterns = [
        r"(?:https?://)?(?:www\.)?linkedin\.com/in/[A-Za-z0-9._%-]+",
        r"(?:https?://)?(?:www\.)?linkedin\.com/[A-Za-z0-9._%-]+"
    ]

    for pattern in patterns:
        match = re.search(
            pattern,
            text,
            re.IGNORECASE
        )

        if match:
            value = match.group(0).strip()

            if not value.lower().startswith(("http://", "https://")):
                value = "https://" + value

            return value.rstrip(".,;")

    return None


def extract_github(text: str):
    patterns = [
        r"(?:https?://)?(?:www\.)?github\.com/[A-Za-z0-9._-]+"
    ]

    for pattern in patterns:
        match = re.search(
            pattern,
            text,
            re.IGNORECASE
        )

        if match:
            value = match.group(0).strip()

            if not value.lower().startswith(("http://", "https://")):
                value = "https://" + value

            return value.rstrip(".,;")

    return None


def extract_portfolio(text: str):
    lines = get_lines(text)

    portfolio_patterns = [
        r"(?:https?://)?(?:www\.)?[A-Za-z0-9.-]+\.(?:com|in|dev|me|net|io)"
    ]

    ignored_domains = {
        "linkedin.com",
        "github.com",
        "gmail.com",
        "google.com",
        "yahoo.com",
        "outlook.com",
        "hotmail.com"
    }

    for line in lines:
        lower_line = line.lower()

        if "portfolio" not in lower_line and "website" not in lower_line:
            continue

        for pattern in portfolio_patterns:
            matches = re.findall(
                pattern,
                line,
                re.IGNORECASE
            )

            for match in matches:
                value = match.strip()

                domain = value.lower()

                if domain.startswith("www."):
                    domain = domain[4:]

                domain = domain.split("/")[0]

                if domain in ignored_domains:
                    continue

                if not value.lower().startswith(("http://", "https://")):
                    value = "https://" + value

                return value.rstrip(".,;")

    return None

