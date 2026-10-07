import re 
from .helpers import clean_line, get_lines, unique_preserve_order 
from .sections import extract_sections, find_section


def extract_certifications(text: str):
    sections = extract_sections(text)
    section = find_section(sections, "certifications")

    if not section:
        return []

    lines = get_lines(section)
    certifications = []
    current = None

    for line in lines:
        line = clean_line(line)

        if not line:
            continue

        line = re.sub(
            r"^(?:certification|certificate)\s*[:\-]\s*",
            "",
            line,
            flags=re.IGNORECASE
        )

        if current:
            if (
                line.lower().startswith(("http", "www", "certificate link"))
                or re.fullmatch(r"(?:19|20)\d{2}", line)
            ):
                current += " " + line
                continue

            certifications.append(current)

        current = line

    if current:
        certifications.append(current)

    return unique_preserve_order(certifications)