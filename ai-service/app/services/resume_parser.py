import re

# ============================================================
# BASIC HELPERS
# ============================================================

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


# ============================================================
# EMAIL
# ============================================================

def extract_email(text: str):
    match = re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text)
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
        word in normalized for word in ["award", "activity", "recognition"]
    ):
        return "achievements"

    if "certification" in normalized or "certificate" in normalized:
        return "certifications"

    if "internship" in normalized and (
        "experience" in normalized or normalized in ["internship", "internships"]
    ):
        return "experience"

    if "project" in normalized:
        return "projects"

    return None


# ============================================================
# NAME
# ============================================================

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
    value = re.sub(r"^[\[\(\{<]+|[\]\)\}>]+$", "", value).strip()

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

    # 1. Look for a name inside declaration/date brackets.
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

    # 2. Check the beginning and end of the resume.
    search_lines = lines[:20] + lines[-20:]

    candidates = []

    for index, line in enumerate(search_lines):
        candidate = line.strip()

        # Remove brackets around names.
        candidate = re.sub(
            r"^[\[\(\{<]+|[\]\)\}>]+$",
            "",
            candidate
        ).strip()

        if not looks_like_name(candidate):
            continue

        words = candidate.split()
        score = 0

        # Strong signal: uppercase name.
        if candidate.isupper():
            score += 6

        # Strong signal: normal name capitalization.
        if all(
            word[0].isupper()
            for word in words
            if word and word[0].isalpha()
        ):
            score += 4

        # Typical human name length.
        if 2 <= len(words) <= 4:
            score += 3

        if len(candidate) <= 35:
            score += 2

        # Names near the beginning are preferred.
        if index < 10:
            score += 3

        candidates.append((score, candidate))

    if candidates:
        candidates.sort(key=lambda item: item[0], reverse=True)
        return candidates[0][1]

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
    normalized_aliases = {normalize_heading(alias) for alias in aliases}

    for key, value in sections.items():
        if normalize_heading(key) in normalized_aliases:
            return value

    for key, value in sections.items():
        normalized_key = normalize_heading(key)

        if section_type == "achievements":
            if any(
                word in normalized_key
                for word in ["achievement", "award", "honor", "honour", "accomplishment"]
            ):
                return value

        elif section_type == "certifications":
            if "certification" in normalized_key or "certificate" in normalized_key:
                return value

        elif section_type == "experience":
            if any(
                word in normalized_key
                for word in ["experience", "internship", "employment"]
            ):
                return value

        elif section_type == "projects":
            if "project" in normalized_key:
                return value

    return ""


# ============================================================
# SKILLS
# ============================================================

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


# ============================================================
# EDUCATION
# ============================================================

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


# ============================================================
# EXPERIENCE
# ============================================================

def extract_experience(text: str):
    sections = extract_sections(text)
    section = find_section(sections, "experience")

    if not section:
        return []

    lines = get_lines(section)

    if not lines:
        return []

    month_pattern = (
        r"(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|"
        r"May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|"
        r"Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|"
        r"Dec(?:ember)?)"
    )

    date_value_pattern = rf"(?:{month_pattern}\s+\d{{4}}|\d{{4}})"

    date_range_regex = re.compile(
        rf"(?P<start>{date_value_pattern})"
        rf"\s*(?:[-–—]|to)\s*"
        rf"(?P<end>Present|Current|Now|{date_value_pattern})",
        re.IGNORECASE
    )

    month_numbers = {
        "jan": "01", "january": "01",
        "feb": "02", "february": "02",
        "mar": "03", "march": "03",
        "apr": "04", "april": "04",
        "may": "05",
        "jun": "06", "june": "06",
        "jul": "07", "july": "07",
        "aug": "08", "august": "08",
        "sep": "09", "sept": "09", "september": "09",
        "oct": "10", "october": "10",
        "nov": "11", "november": "11",
        "dec": "12", "december": "12"
    }

    def normalize_date(value):
        if not value:
            return None

        value = value.strip()

        if value.lower() in {"present", "current", "now"}:
            return None

        match = re.fullmatch(
            rf"({month_pattern})\s+(\d{{4}})",
            value,
            re.IGNORECASE
        )

        if match:
            month = month_numbers.get(match.group(1).lower())
            if month:
                return f"{match.group(2)}-{month}-01"

        if re.fullmatch(r"(?:19|20)\d{2}", value):
            return f"{value}-01-01"

        return None

    def add_month(date_value):
        if not date_value:
            return None

        year = int(date_value[:4])
        month = int(date_value[5:7]) + 1

        if month > 12:
            month = 1
            year += 1

        return f"{year:04d}-{month:02d}-01"

    def new_experience():
        return {
            "company": None,
            "jobTitle": None,
            "startDate": None,
            "endDate": None,
            "description": []
        }

    def add_description(experience, line):
        line = clean_line(line)
        if line:
            experience["description"].append(line)

    description_starters = (
        "worked ", "developed ", "built ", "designed ",
        "created ", "implemented ", "managed ", "maintained ",
        "handled ", "responsible ", "assisted ", "supported ",
        "performed ", "analyzed ", "analysed ", "participated ",
        "collaborated ", "contributed ", "helped ", "wrote ",
        "used ", "improved ", "optimized ", "optimised ",
        "tested ", "provided ", "led ", "developing ",
        "building ", "working ", "coordinated ", "delivered ",
        "gained ", "gaining ", "fixed ", "conducted ",
        "achieved ", "deployed ", "resolved ", "configured ",
        "reviewed ", "monitored ", "prepared ", "applied ",
        "debugged ", "ensured ", "verified "
    )

    def looks_like_description(line):
        line = clean_line(line)

        if not line:
            return False

        lower = line.lower()

        if lower.startswith(description_starters):
            return True

        if line.endswith("."):
            return True

        return len(line.split()) >= 10

    role_words = [
        "intern", "engineer", "developer", "analyst",
        "designer", "manager", "consultant", "administrator",
        "specialist", "associate", "executive", "architect",
        "scientist", "lead", "director", "coordinator",
        "assistant", "trainee", "researcher", "accountant",
        "technician", "officer", "programmer", "support",
        "teacher", "professor", "tester"
    ]

    def looks_like_title(line):
        line = clean_line(line)

        if not line or looks_like_description(line):
            return False

        lower = line.lower()

        return any(
            re.search(rf"\b{re.escape(role)}\b", lower)
            for role in role_words
        )

    company_indicators = [
        "ltd", "limited", "pvt", "private", "inc", "llc",
        "corp", "corporation", "company", "technologies",
        "technology", "solutions", "systems", "services",
        "consulting", "industries", "group", "labs",
        "laboratories", "startup", "organization",
        "organisation", "university", "institute", "hospital"
    ]

    def looks_like_company(line):
        line = clean_line(line)

        if not line or looks_like_description(line):
            return False

        lower = line.lower()

        if any(
            re.search(rf"\b{re.escape(indicator)}\b", lower)
            for indicator in company_indicators
        ):
            return True

        if "|" in line:
            return True

        if re.search(r"\s[-–—]\s", line):
            return True

        if re.search(
            r",\s*(bengaluru|bangalore|chennai|mumbai|pune|"
            r"delhi|hyderabad|noida|gurugram|kolkata|india|remote)\b",
            lower
        ):
            return True

        return False

    def remove_inline_date(line):
        value = clean_line(line)

        match = date_range_regex.search(value)

        if match:
            start_date = normalize_date(match.group("start"))
            end_date = normalize_date(match.group("end"))

            if re.fullmatch(
                r"(?:Present|Current|Now)",
                match.group("end"),
                re.IGNORECASE
            ):
                end_date = None

            value = value[:match.start()] + " " + value[match.end():]
            value = re.sub(r"\s+", " ", value).strip()
            value = value.strip(":-–—|()[] ")

            return value, start_date, end_date, True

        match = re.search(
            rf"\b{month_pattern}\s+\d{{4}}\b",
            value,
            re.IGNORECASE
        )

        if match:
            start_date = normalize_date(match.group(0))
            end_date = add_month(start_date)

            value = value[:match.start()] + " " + value[match.end():]
            value = re.sub(r"\s+", " ", value).strip()
            value = value.strip(":-–—|()[] ")

            # Handle "Oct 2021 Present"
            if re.search(
                r"\b(Present|Current|Now)\b",
                value,
                re.IGNORECASE
            ):
                end_date = None
                value = re.sub(
                    r"\b(Present|Current|Now)\b",
                    "",
                    value,
                    flags=re.IGNORECASE
                ).strip()

            return value, start_date, end_date, True

        match = re.search(r"\b(?:19|20)\d{2}\b", value)

        if match:
            year = int(match.group(0))
            start_date = f"{year:04d}-01-01"
            end_date = f"{year + 1:04d}-01-01"

            value = value[:match.start()] + " " + value[match.end():]
            value = re.sub(r"\s+", " ", value).strip()
            value = value.strip(":-–—|()[] ")

            if re.search(
                r"\b(Present|Current|Now)\b",
                value,
                re.IGNORECASE
            ):
                end_date = None
                value = re.sub(
                    r"\b(Present|Current|Now)\b",
                    "",
                    value,
                    flags=re.IGNORECASE
                ).strip()

            return value, start_date, end_date, True

        return value, None, None, False

    def split_title_company(value):
        value = clean_line(value)

        if not value:
            return None, None

        match = re.match(
            r"^(.+?)\s+(?:at|@)\s+(.+)$",
            value,
            re.IGNORECASE
        )

        if match:
            return clean_line(match.group(1)), clean_line(match.group(2))

        match = re.match(
            r"^(.+?)\s+in\s+(.+)$",
            value,
            re.IGNORECASE
        )

        if match:
            left = clean_line(match.group(1))
            right = clean_line(match.group(2))

            if looks_like_title(left):
                return left, right

        match = re.match(
            r"^(.+?)\s*[-–—]\s*(.+)$",
            value
        )

        if match:
            left = clean_line(match.group(1))
            right = clean_line(match.group(2))

            if looks_like_company(left) and looks_like_title(right):
                return right, left

            if looks_like_title(left):
                return left, right

        for role in role_words:
            match = re.search(
                rf"\b{re.escape(role)}\b",
                value,
                re.IGNORECASE
            )

            if match:
                company_part = clean_line(value[:match.start()])
                title_part = clean_line(value[match.start():])

                if (
                    company_part
                    and title_part
                    and looks_like_title(title_part)
                    and looks_like_company(company_part)
                ):
                    return title_part, company_part

        return None, None

    def parse_experience_header(line):
        value = clean_line(line)

        if not value:
            return None

        value = re.sub(
            r"^\s*\d+\s*[\.\)]\s*",
            "",
            value
        )

        remaining, start_date, end_date, found_date = remove_inline_date(value)
        remaining = clean_line(remaining)

        title, company = split_title_company(remaining)

        if title or company:
            return {
                "title": title,
                "company": company,
                "startDate": start_date,
                "endDate": end_date,
                "foundDate": found_date
            }

        if looks_like_title(remaining):
            return {
                "title": remaining,
                "company": None,
                "startDate": start_date,
                "endDate": end_date,
                "foundDate": found_date
            }

        if looks_like_company(remaining):
            return {
                "title": None,
                "company": remaining,
                "startDate": start_date,
                "endDate": end_date,
                "foundDate": found_date
            }

        return None

    def parse_date_only(line):
        value = clean_line(line)
        value = value.strip("()[]{} ")

        match = date_range_regex.fullmatch(value)

        if match:
            return (
                normalize_date(match.group("start")),
                normalize_date(match.group("end"))
            )

        match = re.fullmatch(
            rf"{month_pattern}\s+\d{{4}}",
            value,
            re.IGNORECASE
        )

        if match:
            start_date = normalize_date(value)
            return start_date, add_month(start_date)

        match = re.fullmatch(r"(?:19|20)\d{2}", value)

        if match:
            year = int(value)
            return f"{year:04d}-01-01", f"{year + 1:04d}-01-01"

        return None

    location_words = {
        "bengaluru", "bangalore", "chennai", "mumbai",
        "pune", "delhi", "hyderabad", "noida", "gurugram",
        "gurgaon", "kolkata", "india", "remote", "karnataka",
        "maharashtra", "tamil nadu", "telangana", "usa", "uk"
    }

    def looks_like_location(line):
        value = clean_line(line)

        if not value:
            return False

        lower = value.lower()

        if lower in location_words:
            return True

        words = set(re.findall(r"[a-z]+", lower))
        return bool(words and words.issubset(location_words))

    experiences = []
    current = None

    def save_current():
        nonlocal current

        if not current:
            return

        description = " ".join(
            current.get("description", [])
        ).strip()

        result = {
            "company": clean_line(current.get("company") or "") or None,
            "jobTitle": clean_line(current.get("jobTitle") or "") or None,
            "startDate": current.get("startDate"),
            "endDate": current.get("endDate"),
            "description": description or None
        }

        combined = (
            f"{result['jobTitle'] or ''} "
            f"{result['company'] or ''}"
        ).lower()

        non_employment_words = [
            "science camp", "workshop", "seminar",
            "conference", "webinar", "training program",
            "competition"
        ]

        if any(word in combined for word in non_employment_words):
            current = None
            return

        if any(result.values()):
            experiences.append(result)

        current = None

    i = 0

    while i < len(lines):
        line = clean_line(lines[i])

        if not line:
            i += 1
            continue

        numbered = bool(
            re.match(r"^\s*\d+\s*[\.\)]", line)
        )

        normalized_line = re.sub(
            r"^\s*\d+\s*[\.\)]\s*",
            "",
            line
        )

        if current and looks_like_description(normalized_line) and not numbered:
            add_description(current, normalized_line)
            i += 1
            continue

        if numbered:
            save_current()

            header = parse_experience_header(normalized_line)
            current = new_experience()

            if header:
                current["jobTitle"] = header["title"]
                current["company"] = header["company"]
                current["startDate"] = header["startDate"]
                current["endDate"] = header["endDate"]
            else:
                current["jobTitle"] = normalized_line

            i += 1
            continue

        date_only = parse_date_only(normalized_line)

        if date_only:
            start_date, end_date = date_only

            if current:
                if current["startDate"] is None:
                    current["startDate"] = start_date
                if end_date is not None:
                    current["endDate"] = end_date
            else:
                current = new_experience()
                current["startDate"] = start_date
                current["endDate"] = end_date

            i += 1
            continue

        header = parse_experience_header(normalized_line)

        if header:
            title = header["title"]
            company = header["company"]
            new_entry = False

            if current:
                if title and company:
                    new_entry = True
                elif title and header["foundDate"]:
                    new_entry = True
                elif title and current.get("jobTitle") and current.get("company"):
                    new_entry = True

            if new_entry:
                save_current()

            if current is None:
                current = new_experience()

            if title:
                current["jobTitle"] = title

            if company:
                current["company"] = company

            if header["startDate"]:
                current["startDate"] = header["startDate"]

            if header["endDate"] is not None or header["foundDate"]:
                current["endDate"] = header["endDate"]

            i += 1
            continue

        if current and looks_like_location(normalized_line):
            i += 1
            continue

        if current and current["company"] is None:
            if looks_like_company(normalized_line):
                current["company"] = normalized_line
                i += 1
                continue

        if current and current["jobTitle"] is None:
            if looks_like_title(normalized_line):
                current["jobTitle"] = normalized_line
                i += 1
                continue

        if (
            current
            and current["jobTitle"]
            and current["company"] is None
            and not looks_like_description(normalized_line)
            and not looks_like_title(normalized_line)
        ):
            if len(normalized_line.split()) <= 10:
                current["company"] = normalized_line
                i += 1
                continue

        if current:
            add_description(current, normalized_line)

        i += 1

    save_current()

    return experiences


# ============================================================
# PROJECTS
# ============================================================

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


# ============================================================
# CERTIFICATIONS
# ============================================================

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


# ============================================================
# ACHIEVEMENTS
# ============================================================

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


# ============================================================
# COMPLETE RESUME PARSER
# ============================================================

def parse_resume(text: str):
    if not text or not text.strip():
        raise ValueError("Resume text cannot be empty.")

    sections = extract_sections(text)

    return {
        "name": extract_name(text),
        "email": extract_email(text),
        "phone": extract_phone(text),
        "skills": extract_skills(text),
        "education": extract_education(text),
        "experience": extract_experience(text),
        "projects": extract_projects(text),
        "certifications": extract_certifications(text),
        "achievements": extract_achievements(text),
        "sections": sections
    }

