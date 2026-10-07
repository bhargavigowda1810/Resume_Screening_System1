import re

from .helpers import clean_line, get_lines
from .sections import extract_sections, find_section


def extract_education(text: str):
    sections = extract_sections(text)
    section = find_section(sections, "education")

    if not section:
        return []

    lines = get_lines(section)

    if not lines:
        return []

    degree_patterns = [
        (r"\bB\.?\s*C\.?\s*A\.?\b", "BCA"),
        (r"\bBachelor(?:'s|’s)?\s+of\s+Computer\s+Applications?\b", "BCA"),
        (r"\bM\.?\s*C\.?\s*A\.?\b", "MCA"),
        (r"\bMaster(?:'s|’s)?\s+of\s+Computer\s+Applications?\b", "MCA"),
        (r"\bB\.?\s*E\.?\b", "BE"),
        (r"\bBachelor(?:'s|’s)?\s+of\s+Engineering\b", "BE"),
        (r"\bM\.?\s*E\.?\b", "ME"),
        (r"\bMaster(?:'s|’s)?\s+of\s+Engineering\b", "ME"),
        (r"\bB\.?\s*Tech\b", "BTech"),
        (r"\bBachelor(?:'s|’s)?\s+of\s+Technology\b", "BTech"),
        (r"\bM\.?\s*Tech\b", "MTech"),
        (r"\bMaster(?:'s|’s)?\s+of\s+Technology\b", "MTech"),
        (r"\bB\.?\s*Sc\.?\b", "BSc"),
        (r"\bBachelor(?:'s|’s)?\s+of\s+Science\b", "BSc"),
        (r"\bM\.?\s*Sc\.?\b", "MSc"),
        (r"\bMaster(?:'s|’s)?\s+of\s+Science\b", "MSc"),
        (r"\bB\.?\s*Com\.?\b", "BCom"),
        (r"\bBachelor(?:'s|’s)?\s+of\s+Commerce\b", "BCom"),
        (r"\bM\.?\s*Com\.?\b", "MCom"),
        (r"\bMaster(?:'s|’s)?\s+of\s+Commerce\b", "MCom"),
        (r"\bB\.?\s*B\.?\s*A\.?\b", "BBA"),
        (r"\bBachelor(?:'s|’s)?\s+of\s+Business\s+Administration\b", "BBA"),
        (r"\bM\.?\s*B\.?\s*A\.?\b", "MBA"),
        (r"\bMaster(?:'s|’s)?\s+of\s+Business\s+Administration\b", "MBA"),
        (r"\bPh\.?\s*D\.?\b", "PhD"),
        (r"\bDiploma\b", "Diploma"),
        (r"\bAssociate(?:'s)?\b", "Associate"),
        (r"\bClass\s+XII\b", "Class XII"),
        (r"\bClass\s+X\b", "Class X"),
        (r"\b12th\b", "12th"),
        (r"\b10th\b", "10th"),
        (r"\bPUC\b", "PUC"),
        (r"\bSSLC\b", "SSLC"),
        (r"\bBachelor(?:'s|’s)?\b", "Bachelor"),
        (r"\bMaster(?:'s|’s)?\b", "Master")
    ]

    def find_degree(line):
        for pattern, normalized_degree in degree_patterns:
            if re.search(pattern, line, re.IGNORECASE):
                return normalized_degree
        return None

    def extract_years(block):
        years = []

        for line in block:
            for year in re.findall(r"\b(?:19|20)\d{2}\b", line):
                year = int(year)
                if year not in years:
                    years.append(year)

        if len(years) >= 2:
            return years[0], years[1]

        if len(years) == 1:
            return years[0], None

        return None, None

    def extract_grade(block):
        for line in block:
            match = re.search(
                r"CGPA\s*[:\-]?\s*[\d.]+\s*(?:/\s*[\d.]+)?",
                line,
                re.IGNORECASE
            )

            if match:
                return match.group(0).strip()

            match = re.search(
                r"\bGPA\s*[:\-]?\s*[\d.]+\s*(?:/\s*[\d.]+)?",
                line,
                re.IGNORECASE
            )

            if match:
                return match.group(0).strip()

            match = re.search(r"\b\d+(?:\.\d+)?\s*%", line)

            if match:
                return match.group(0).strip()

            match = re.search(
                r"Percentage\s*[:\-]?\s*(\d+(?:\.\d+)?)",
                line,
                re.IGNORECASE
            )

            if match:
                return f"Percentage: {match.group(1)}%"

        return None

    def find_institution(block):
        keywords = [
            "university", "college", "institute",
            "school", "academy"
        ]

        for line in block:
            if any(keyword in line.lower() for keyword in keywords):
                return clean_line(line)

        return None

    def extract_field(block):
        combined_text = " ".join(block).lower()

        fields = [
            ("Computer Engineering", "computer engineering"),
            ("Computer Science", "computer science"),
            ("Information Technology", "information technology"),
            ("Information Science", "information science"),
            ("Computer Applications", "computer application"),
            ("Data Science", "data science"),
            ("Artificial Intelligence", "artificial intelligence"),
            ("Machine Learning", "machine learning"),
            ("Electronics", "electronics"),
            ("Electrical Engineering", "electrical"),
            ("Mechanical Engineering", "mechanical"),
            ("Civil Engineering", "civil"),
            ("Commerce", "commerce"),
            ("Management", "management"),
            ("Business Administration", "business administration")
        ]

        for field_name, keyword in fields:
            if keyword in combined_text:
                return field_name

        return None

    degree_indices = []

    for i, line in enumerate(lines):
        if find_degree(line):
            degree_indices.append(i)

    education = []

    if degree_indices:
        for index, degree_index in enumerate(degree_indices):
            start = max(0, degree_index - 2)

            if index + 1 < len(degree_indices):
                end = degree_indices[index + 1]
            else:
                end = len(lines)

            block = lines[start:end]
            degree = find_degree(lines[degree_index])
            start_year, end_year = extract_years(block)

            education.append({
                "degree": degree,
                "institution": find_institution(block),
                "fieldOfStudy": extract_field(block),
                "startYear": start_year,
                "endYear": end_year,
                "grade": extract_grade(block)
            })

        return education

    institution_keywords = [
        "university", "college", "institute",
        "school", "academy"
    ]

    institution_indices = []

    for i, line in enumerate(lines):
        if any(keyword in line.lower() for keyword in institution_keywords):
            institution_indices.append(i)

    for index, institution_index in enumerate(institution_indices):
        start = max(0, institution_index - 2)

        if index + 1 < len(institution_indices):
            end = institution_indices[index + 1]
        else:
            end = len(lines)

        block = lines[start:end]
        degree = None

        for line in block:
            degree = find_degree(line)
            if degree:
                break

        institution = find_institution(block)

        if not degree and institution:
            lower = institution.lower()

            if "pu college" in lower or "puc" in lower:
                degree = "PUC"
            elif "school" in lower:
                degree = "School"

        start_year, end_year = extract_years(block)

        education.append({
            "degree": degree,
            "institution": institution,
            "fieldOfStudy": extract_field(block),
            "startYear": start_year,
            "endYear": end_year,
            "grade": extract_grade(block)
        })

    return education


