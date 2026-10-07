import re

from .helpers import clean_line, get_lines, unique_preserve_order
from .sections import extract_sections, find_section


def extract_projects(text: str):
    sections = extract_sections(text)
    section = find_section(sections, "projects")

    if not section:
        return []

    lines = get_lines(section)

    if not lines:
        return []

    projects = []
    current = None

    year_pattern = re.compile(r"\b(?:19|20)\d{2}\b")

    month_pattern = (
        r"(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|"
        r"May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|"
        r"Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|"
        r"Dec(?:ember)?)"
    )

    project_technology_pattern = re.compile(
        r"\b(?:Python|Java|JavaScript|React|React\.js|"
        r"Spring Boot|SQL|MySQL|PostgreSQL|MongoDB|Excel|"
        r"Power Query|Power BI|Pivot Table|OpenCV|TensorFlow|"
        r"Scikit-learn|Pandas|NumPy|Matplotlib|Streamlit|"
        r"HTML|CSS|Node\.js|C\+\+|C#|PHP|Django|Flask|"
        r"FastAPI|AWS|Git|GitHub)\b",
        re.IGNORECASE
    )

    def extract_year(line):
        match = year_pattern.search(line)
        return int(match.group(0)) if match else None

    def is_year_only(line):
        return bool(re.fullmatch(r"(?:19|20)\d{2}", line.strip()))

    def is_month_year_only(line):
        return bool(
            re.fullmatch(
                rf"{month_pattern}\s+\d{{4}}",
                line.strip(),
                re.IGNORECASE
            )
        )

    def looks_like_project_description(line):
        if not line:
            return False

        lower = line.lower().strip()

        starters = (
            "made ", "built ", "developed ", "designed ",
            "created ", "implemented ", "understanding ",
            "managed ", "using ", "used ", "developing ",
            "this project ", "project involved ", "the system ",
            "the application ", "worked ", "helped ", "provided ",
            "analyzed ", "analysed ", "performed ", "enabled ",
            "allowing ", "achieved ", "utilized ", "utilised ",
            "applied ", "leveraged ", "integrated "
        )

        if lower.startswith(starters):
            return True

        if line.endswith("."):
            return True

        return len(line.split()) >= 10

    def looks_like_project_title(line):
        if not line:
            return False

        value = line.strip()

        if is_year_only(value) or is_month_year_only(value):
            return False

        if looks_like_project_description(value):
            return False

        if len(value.split()) > 8:
            return False

        lower = value.lower()

        project_words = [
            "system", "application", "app", "website",
            "platform", "dashboard", "analysis", "analyzer",
            "detection", "management", "tracker", "recommendation",
            "classifier", "prediction", "portal", "project",
            "operation", "trolley", "sentiment", "library", "expense"
        ]

        if any(
            re.search(rf"\b{re.escape(word)}\b", lower)
            for word in project_words
        ):
            return True

        words = value.split()
        capitalized_count = sum(
            1 for word in words if word[:1].isupper()
        )

        return len(words) <= 6 and capitalized_count >= max(1, len(words) // 2)

    def split_project_line(line):
        value = clean_line(line)

        value = re.sub(
            r"^(?:project|project name)\s*:\s*",
            "",
            value,
            flags=re.IGNORECASE
        )

        technologies = []

        if ":-" in value:
            title, description = value.split(":-", 1)
            return clean_line(title), clean_line(description), technologies

        if "|" in value:
            parts = value.split("|", 1)
            title = clean_line(parts[0])
            tech_part = clean_line(parts[1])

            technologies = [
                clean_line(item)
                for item in re.split(r",|;|/", tech_part)
                if clean_line(item)
            ]

            return title, "", technologies

        tech_matches = list(
            project_technology_pattern.finditer(value)
        )

        if tech_matches:
            first_match = tech_matches[0]
            prefix = value[:first_match.start()].strip(" :-–—|")
            suffix = value[first_match.start():]

            tech_parts = re.split(r",|;/", suffix)

            technologies = [
                clean_line(item)
                for item in tech_parts
                if clean_line(item)
            ]

            if prefix and len(prefix.split()) <= 8:
                return clean_line(prefix), "", technologies

        if ":" in value:
            left, right = value.split(":", 1)

            if right and looks_like_project_description(right):
                return clean_line(left), clean_line(right), technologies

        return value, "", technologies

    def save_current():
        nonlocal current

        if not current:
            return

        title = clean_line(current.get("title", ""))
        description = clean_line(current.get("description", ""))
        technologies = unique_preserve_order(
            current.get("technologies", [])
        )

        if title:
            projects.append({
                "title": title,
                "technologies": technologies,
                "year": current.get("year"),
                "description": description
            })

        current = None

    i = 0

    while i < len(lines):
        line = clean_line(lines[i])

        if not line:
            i += 1
            continue

        if is_year_only(line):
            if current:
                current["year"] = int(line)
            i += 1
            continue

        if is_month_year_only(line):
            if current:
                current["year"] = extract_year(line)
            i += 1
            continue

        if i + 1 < len(lines):
            next_line = clean_line(lines[i + 1])

            if is_year_only(next_line) and looks_like_project_title(line):
                save_current()

                title, description, technologies = split_project_line(line)

                current = {
                    "title": title,
                    "technologies": technologies,
                    "year": int(next_line),
                    "description": description
                }

                i += 2
                continue

        year = extract_year(line)

        if year:
            title_without_date = re.sub(
                r"\b(?:19|20)\d{2}\b",
                "",
                line
            )

            title_without_date = clean_line(title_without_date)

            if title_without_date and looks_like_project_title(title_without_date):
                save_current()

                title, description, technologies = split_project_line(
                    title_without_date
                )

                current = {
                    "title": title,
                    "technologies": technologies,
                    "year": year,
                    "description": description
                }

                i += 1
                continue

        title, description, technologies = split_project_line(line)

        if description and looks_like_project_title(title):
            save_current()

            current = {
                "title": title,
                "technologies": technologies,
                "year": None,
                "description": description
            }

            i += 1
            continue

        if current is None:
            if looks_like_project_title(line):
                current = {
                    "title": title,
                    "technologies": technologies,
                    "year": None,
                    "description": ""
                }

            i += 1
            continue

        if looks_like_project_title(line) and current.get("description"):
            save_current()

            current = {
                "title": line,
                "technologies": [],
                "year": None,
                "description": ""
            }

            i += 1
            continue

        if current:
            if current["description"]:
                current["description"] += " " + line
            else:
                current["description"] = line

        i += 1

    save_current()

    return projects