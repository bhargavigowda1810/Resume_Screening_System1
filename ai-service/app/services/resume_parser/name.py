import re

from .helpers import get_lines


NAME_BLOCKED_WORDS = {
    "resume", "cv", "curriculum", "vitae", "linkedin", "github",
    "email", "phone", "mobile", "contact", "address", "profile",
    "summary", "objective", "education", "skills", "technical",
    "experience", "work", "professional", "projects", "project",
    "certification", "certifications", "achievement", "achievements",
    "awards", "activities", "hobbies", "interests", "declaration",
    "references", "university", "college", "school", "institute",
    "academy", "technology", "technologies", "engineering", "computer",
    "application", "applications", "science", "business", "management",
    "commerce", "degree", "bachelor", "master", "internship"
}


def looks_like_name(line: str):
    if not line:
        return False

    value = line.strip()
    value = re.sub(
        r"^[\[\(\{<]+|[\]\)\}>]+$",
        "",
        value
    ).strip()

    if "@" in value or re.search(r"\d", value):
        return False

    lower = value.lower()

    blocked_words = [
        "linkedin", "github", "http", "www.", "phone", "mobile", "email",
        "university", "college", "school", "institute", "academy",
        "education", "skills", "technical", "experience", "projects",
        "certification", "certifications", "objective", "summary",
        "declaration", "achievements", "activities", "hobbies",
        "languages", "coursework", "soft skills", "work experience",
        "internship", "references", "tools"
    ]

    if any(word in lower for word in blocked_words):
        return False

    words = value.split()

    if len(words) < 2 or len(words) > 5:
        return False

    if not re.fullmatch(r"[A-Za-z][A-Za-z .'-]*", value):
        return False

    return True


def extract_name(text: str):
    lines = get_lines(text)

    if not lines:
        return None

    declaration_pattern = re.search(
        r"(?:date|declaration)\s*[:\-]?\s*[\[\(\{<]\s*"
        r"([A-Za-z][A-Za-z .'-]{2,50})\s*[\]\)\}>]",
        text,
        re.IGNORECASE
    )

    if declaration_pattern:
        candidate = declaration_pattern.group(1).strip()

        if looks_like_name(candidate):
            return candidate

    search_lines = lines[:20] + lines[-20:]

    candidates = []

    for index, line in enumerate(search_lines):
        candidate = line.strip()

        candidate = re.sub(
            r"^[\[\(\{<]+|[\]\)\}>]+$",
            "",
            candidate
        ).strip()

        if not looks_like_name(candidate):
            continue

        words = candidate.split()

        score = 0

        if candidate.isupper():
            score += 6

        if all(
            word[0].isupper()
            for word in words
            if word and word[0].isalpha()
        ):
            score += 4

        if 2 <= len(words) <= 4:
            score += 3

        if len(candidate) <= 35:
            score += 2

        if index < 10:
            score += 3

        candidates.append((score, candidate))

    if candidates:
        candidates.sort(
            key=lambda item: item[0],
            reverse=True
        )
        return candidates[0][1]

    return None

