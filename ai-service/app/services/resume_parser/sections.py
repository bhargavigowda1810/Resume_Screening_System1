import re

from .helpers import get_lines


# ============================================================
# SECTION ALIASES
# ============================================================

SECTION_ALIASES = {
    "summary": [
        "summary", "professional summary", "profile",
        "professional profile", "career profile", "objective",
        "career objective", "career summary", "about me", "about"
    ],
    "education": [
        "education", "educational background", "academic background",
        "academic qualifications", "academic qualification",
        "educational qualifications", "qualifications", "academic details"
    ],
    "skills": [
        "skills", "technical skills", "core skills", "key skills",
        "technical competencies", "competencies", "technical expertise",
        "technologies", "technical knowledge", "skills and technologies",
        "technical proficiencies", "tools", "technical tools",
        "coursework", "soft skills", "programming languages",
        "languages", "frameworks", "libraries", "databases"
    ],
    "experience": [
        "experience", "work experience", "professional experience",
        "employment history", "work history", "career history",
        "internship", "internships", "internship experience",
        "internship experiences", "work experience and internships",
        "professional experience and internships", "employment"
    ],
    "projects": [
        "projects", "project", "academic projects", "academic project",
        "personal projects", "personal project", "key projects",
        "project experience", "major projects"
    ],
    "certifications": [
        "certifications", "certificates", "certification", "certificate",
        "professional certifications", "professional certificates",
        "licenses and certifications", "licenses & certifications",
        "certifications and courses", "courses and certifications"
    ],
    "achievements": [
        "achievements", "achievement", "awards", "award",
        "awards and achievements", "awards & achievements",
        "award and achievements", "award & achievements",
        "awards and recognition", "awards & recognition",
        "honors", "honours", "honors and awards", "honours and awards",
        "honors & awards", "honours & awards", "accomplishments",
        "accomplishment", "accomplishments and awards",
        "achievements and awards", "achievements & awards",
        "achievements / activities", "achievements & activities",
        "achievements and activities", "achievements/activities"
    ],
    "activities": [
        "activities", "activity", "extracurricular activities",
        "extra curricular activities", "extracurricular",
        "co-curricular activities", "co curricular activities",
        "co-curricular", "volunteering", "volunteer activities",
        "community activities", "leadership activities",
        "positions of responsibility"
    ],
    "hobbies": [
        "hobbies", "hobby", "interests", "personal interests"
    ],
    "declaration": [
        "declaration", "declarations"
    ],
    "references": [
        "references", "referees"
    ]
}


# ============================================================
# SECTION HEADING
# ============================================================

def normalize_heading(line: str):
    if not line:
        return ""

    line = line.strip()
    line = re.sub(r"^[\s•●▪◦○■□*]+\s*", "", line)
    line = line.rstrip(":").strip()
    line = re.sub(r"\s*&\s*", " and ", line)
    line = re.sub(r"\s*/\s*", " and ", line)
    line = re.sub(r"[-–—]", " ", line)
    line = re.sub(r"[^\w\s]", " ", line)
    line = re.sub(r"\s+", " ", line)

    return line.lower().strip()


def detect_section_heading(line: str):
    if not line:
        return None

    normalized = normalize_heading(line)

    for section_name, aliases in SECTION_ALIASES.items():
        for alias in aliases:
            if normalized == normalize_heading(alias):
                return section_name

    if "achievement" in normalized and any(
        word in normalized
        for word in ["award", "activity", "recognition"]
    ):
        return "achievements"

    if "certification" in normalized or "certificate" in normalized:
        return "certifications"

    if "internship" in normalized and (
        "experience" in normalized
        or normalized in ["internship", "internships"]
    ):
        return "experience"

    if "project" in normalized:
        return "projects"

    return None


# ============================================================
# EXTRACT SECTIONS
# ============================================================

def extract_sections(text: str):
    lines = get_lines(text)

    sections = {"header": []}
    current_section = "header"

    for line in lines:
        heading = detect_section_heading(line)

        if heading:
            current_section = heading
            sections.setdefault(current_section, [])
            continue

        sections.setdefault(current_section, []).append(line)

    result = {}

    for key, value in sections.items():
        content = "\n".join(value).strip()

        if content:
            result[key] = content

    return result


def find_section(sections, section_type):
    if not sections:
        return ""

    if section_type in sections:
        return sections[section_type]

    aliases = SECTION_ALIASES.get(section_type, [])

    normalized_aliases = {
        normalize_heading(alias)
        for alias in aliases
    }

    for key, value in sections.items():
        if normalize_heading(key) in normalized_aliases:
            return value

    for key, value in sections.items():
        normalized_key = normalize_heading(key)

        if section_type == "achievements":
            if any(
                word in normalized_key
                for word in [
                    "achievement",
                    "award",
                    "honor",
                    "honour",
                    "accomplishment"
                ]
            ):
                return value

        elif section_type == "certifications":
            if (
                "certification" in normalized_key
                or "certificate" in normalized_key
            ):
                return value

        elif section_type == "experience":
            if any(
                word in normalized_key
                for word in [
                    "experience",
                    "internship",
                    "employment"
                ]
            ):
                return value

        elif section_type == "projects":
            if "project" in normalized_key:
                return value

    return ""

