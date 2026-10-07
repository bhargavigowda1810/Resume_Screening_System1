import re

from .helpers import clean_line, unique_preserve_order
from .sections import extract_sections, find_section


def extract_skills(text: str):
    sections = extract_sections(text)
    section = find_section(sections, "skills")

    if not section:
        return []

    skills = []

    for line in section.splitlines():
        line = clean_line(line)

        if not line:
            continue

        line = re.sub(
            r"^[A-Za-z][A-Za-z /&+.-]{0,40}:\s*",
            "",
            line
        )

        if not line:
            continue

        parts = re.split(r",|\||;|•|·", line)

        for part in parts:
            skill = part.strip()

            if not skill:
                continue

            if len(skill.split()) > 8:
                continue

            if skill.lower() in {
                "tools", "coursework", "soft skills", "languages",
                "frameworks", "libraries", "databases",
                "programming languages", "technical tools"
            }:
                continue

            skills.append(skill)

    return unique_preserve_order(skills)