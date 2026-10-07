import re
from .helpers import clean_line, get_lines, unique_preserve_order 
from .sections import extract_sections, find_section



def extract_achievements(text: str):
    sections = extract_sections(text)
    section = find_section(sections, "achievements")

    if not section:
        section = find_section(sections, "activities")

    if not section:
        return []

    lines = get_lines(section)
    achievements = []
    current = ""

    for line in lines:
        line = clean_line(line)

        if not line:
            continue

        if current:
            if current.endswith(".") or len(current.split()) > 18:
                achievements.append(current)
                current = line
            else:
                current += " " + line
        else:
            current = line

    if current:
        achievements.append(current)

    return unique_preserve_order(achievements)