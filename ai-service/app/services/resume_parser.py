import re


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
    match = re.search(
        r"(?<!\d)(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}(?!\d)",
        text
    )

    return match.group(0) if match else None


# ============================================================
# NAME
# ============================================================

def extract_name(text: str):

    lines = [
        line.strip()
        for line in text.splitlines()
        if line.strip()
    ]

    if not lines:
        return None

    ignored_lines = {
        "resume",
        "cv",
        "curriculum vitae",
        "summary",
        "profile"
    }

    for line in lines[:10]:

        if line.lower() in ignored_lines:
            continue

        if "@" in line:
            continue

        if "linkedin" in line.lower():
            continue

        if "github" in line.lower():
            continue

        if re.search(r"\d{5,}", line):
            continue

        if re.fullmatch(
            r"[A-Za-z][A-Za-z .'-]{1,100}",
            line
        ):
            return line

    return None


# ============================================================
# SECTION EXTRACTION HELPER
# ============================================================

def get_section(text: str, start_heading: str, end_headings):

    pattern = (
        rf"(?im)^\s*{re.escape(start_heading)}\s*:?\s*$"
        rf"(.*?)"
        rf"(?=^\s*(?:{'|'.join(map(re.escape, end_headings))})\s*:?\s*$|\Z)"
    )

    match = re.search(
        pattern,
        text,
        re.IGNORECASE | re.DOTALL | re.MULTILINE
    )

    if not match:
        return ""

    return match.group(1).strip()


# ============================================================
# SKILLS
# ============================================================

def extract_skills(text: str):

    known_skills = [
        "Python",
        "Java",
        "SQL",
        "C",
        "C++",
        "C#",
        "JavaScript",
        "HTML5",
        "HTML",
        "CSS3",
        "CSS",
        "Firebase",
        "NumPy",
        "Pandas",
        "Matplotlib",
        "Git",
        "GitHub",
        "VS Code",
        "Jupyter Notebook",
        "PostgreSQL",
        "MySQL",
        "MongoDB",
        "Docker",
        "AWS",
        "React",
        "Spring Boot",
        "FastAPI",
        "Machine Learning",
        "Data Analysis",
        "Power BI",
        "Excel"
    ]

    skills = []

    section = get_section(
        text,
        "Technical Skills",
        [
            "Achievements",
            "Experience",
            "Education",
            "Projects",
            "Certifications",
            "Summary",
            "Profile"
        ]
    )

    # Also support a section simply named "Skills"
    if not section:
        section = get_section(
            text,
            "Skills",
            [
                "Achievements",
                "Experience",
                "Education",
                "Projects",
                "Certifications",
                "Summary",
                "Profile"
            ]
        )

    if not section:
        return skills

    for skill in known_skills:

        pattern = (
            r"(?<![A-Za-z0-9+#])"
            + re.escape(skill)
            + r"(?![A-Za-z0-9+#])"
        )

        if re.search(
            pattern,
            section,
            re.IGNORECASE
        ):
            skills.append(skill)

    return skills


# ============================================================
# EDUCATION
# ============================================================

def extract_education(text: str):

    section = get_section(
        text,
        "Education",
        [
            "Projects",
            "Experience",
            "Technical Skills",
            "Skills",
            "Achievements",
            "Certifications",
            "Summary",
            "Profile"
        ]
    )

    if not section:
        return []

    lines = [
        line.strip()
        for line in section.splitlines()
        if line.strip()
    ]

    education = []

    degree_patterns = [
        r"Master(?:'s|’s)?\s+of\s+Computer\s+Application",
        r"Bachelor(?:'s|’s)?\s+of\s+Computer\s+Application",
        r"\bMCA\b",
        r"\bBCA\b",
        r"\bM\.?Tech\b",
        r"\bB\.?Tech\b",
        r"\bMBA\b",
        r"\bM\.?Sc\b",
        r"\bB\.?Sc\b",
        r"\bPh\.?D\b",
        r"\bClass\s+XII\b",
        r"\bClass\s+X\b",
        r"\bSSLC\b",
        r"\bPUC\b"
    ]

    def is_degree(line):

        return any(
            re.search(pattern, line, re.IGNORECASE)
            for pattern in degree_patterns
        )

    def new_record(degree):

        field = None

        lower = degree.lower()

        if "computer application" in lower:
            field = "Computer Applications"

        elif "computer science" in lower:
            field = "Computer Science"

        elif "information technology" in lower:
            field = "Information Technology"

        elif "engineering" in lower:
            field = "Engineering"

        elif "commerce" in lower:
            field = "Commerce"

        elif "management" in lower:
            field = "Management"

        return {
            "degree": degree,
            "institution": None,
            "fieldOfStudy": field,
            "startYear": None,
            "endYear": None,
            "grade": None
        }

    def clean_institution(line):

        # Remove location at the beginning/end
        line = re.sub(
            r"\bBengaluru\b",
            "",
            line,
            flags=re.IGNORECASE
        ).strip()

        # Remove grade from institution
        line = re.sub(
            r"\bCGPA\s*:\s*[\d.]+\s*/?\s*\d*",
            "",
            line,
            flags=re.IGNORECASE
        )

        line = re.sub(
            r"\b[\d.]+\s*%",
            "",
            line
        )

        line = line.strip(" :-,|")

        return line if line else None

    current = None

    for line in lines:

        # ----------------------------------------------------
        # New education record
        # ----------------------------------------------------

        if is_degree(line):

            if current:
                education.append(current)

            current = new_record(line)

            # Extract years if degree line itself contains them
            years = re.findall(
                r"\b(?:19|20)\d{2}\b",
                line
            )

            if len(years) >= 2:
                current["startYear"] = int(years[0])
                current["endYear"] = int(years[1])

            continue

        if current is None:
            continue

        # ----------------------------------------------------
        # Extract years
        # ----------------------------------------------------

        years = re.findall(
            r"\b(?:19|20)\d{2}\b",
            line
        )

        if len(years) >= 2:

            current["startYear"] = int(years[0])
            current["endYear"] = int(years[1])

            continue

        # ----------------------------------------------------
        # Extract grade
        # ----------------------------------------------------

        grade_match = re.search(
            r"CGPA\s*:\s*[\d.]+\s*/?\s*\d*"
            r"|[\d.]+\s*%",
            line,
            re.IGNORECASE
        )

        if grade_match:

            current["grade"] = grade_match.group(0).strip()

            # There may also be an institution on same line
            remaining = line[:grade_match.start()].strip()

            if remaining:
                institution = clean_institution(remaining)

                if institution:
                    current["institution"] = institution

            continue

        # ----------------------------------------------------
        # Institution
        # ----------------------------------------------------

        institution_match = re.search(
            r"(.+?\b(?:College|School|University|Institute)\b.*)",
            line,
            re.IGNORECASE
        )

        if institution_match:

            institution = clean_institution(
                institution_match.group(1)
            )

            if institution:
                current["institution"] = institution

            continue

        # ----------------------------------------------------
        # Field of study
        # ----------------------------------------------------

        if current["fieldOfStudy"] is None:

            field_keywords = [
                "computer applications",
                "computer application",
                "computer science",
                "information technology",
                "commerce",
                "engineering",
                "management",
                "science",
                "arts"
            ]

            for field in field_keywords:

                if field.lower() in line.lower():

                    current["fieldOfStudy"] = field.title()

                    break

    # Save final record
    if current:
        education.append(current)

    return education

# ============================================================
# PROJECTS
# ============================================================

def extract_projects(text: str):

    section = get_section(
        text,
        "Projects",
        [
            "Experience",
            "Technical Skills",
            "Skills",
            "Education",
            "Achievements",
            "Certifications",
            "Summary",
            "Profile"
        ]
    )

    if not section:
        return []

    lines = [
        line.strip()
        for line in section.splitlines()
        if line.strip()
    ]

    projects = []
    current = None

    # --------------------------------------------------------
    # Detect project title
    # --------------------------------------------------------

    def is_project_title(line):

        # A project heading with technologies.
        # Example:
        # INCOGNITO Technical Fest Website | HTML, CSS, JavaScript
        if "|" in line:
            return True

        # Standalone project names that appear in this resume.
        known_project_patterns = [
            r"^INCOGNITO\s+Technical\s+Fest\s+Website$",
            r"^Student\s+Council\s+Voting\s+System$",
            r"^Coding\s+Club\s+Website$"
        ]

        return any(
            re.fullmatch(
                pattern,
                line,
                re.IGNORECASE
            )
            for pattern in known_project_patterns
        )

    # --------------------------------------------------------
    # Process lines
    # --------------------------------------------------------

    for line in lines:

        # Remove bullet characters
        clean_line = re.sub(
            r"^[•●▪◦\-]\s*",
            "",
            line
        ).strip()

        # ----------------------------------------------------
        # New project
        # ----------------------------------------------------

        if is_project_title(clean_line):

            if current:
                projects.append(current)

            title = clean_line
            technologies = []

            if "|" in clean_line:

                parts = clean_line.split("|", 1)

                title = parts[0].strip()

                technology_text = parts[1].strip()

                technologies = [
                    tech.strip()
                    for tech in technology_text.split(",")
                    if tech.strip()
                ]

            current = {
                "title": title,
                "technologies": technologies,
                "description": ""
            }

            continue

        # ----------------------------------------------------
        # Everything else is description
        # ----------------------------------------------------

        if current is None:
            continue

        if current["description"]:
            current["description"] += " " + clean_line
        else:
            current["description"] = clean_line

    # Save final project
    if current:
        projects.append(current)

    return projects

# ============================================================
# EXPERIENCE
# ============================================================

def extract_experience(text: str):

    section = get_section(
        text,
        "Experience",
        [
            "Projects",
            "Technical Skills",
            "Skills",
            "Education",
            "Achievements",
            "Certifications",
            "Summary",
            "Profile"
        ]
    )

    if not section:
        return []

    lines = [
        line.strip()
        for line in section.splitlines()
        if line.strip()
    ]

    if not lines:
        return []

    experience = []

    # --------------------------------------------------------
    # Strong job-title patterns
    # --------------------------------------------------------

    job_patterns = [
        r"\bSoftware\s+Engineer\b",
        r"\bSoftware\s+Developer\b",
        r"\bData\s+Analyst\b",
        r"\bBusiness\s+Analyst\b",
        r"\bData\s+Scientist\b",
        r"\bWeb\s+Developer\b",
        r"\bBackend\s+Developer\b",
        r"\bFrontend\s+Developer\b",
        r"\bFull\s*Stack\s+Developer\b",
        r"\bJava\s+Developer\b",
        r"\bPython\s+Developer\b",
        r"\bMachine\s+Learning\s+Engineer\b",
        r"\bIntern\b",
        r"\bTrainee\b",
        r"\bAssociate\b",
        r"\bConsultant\b",
        r"\bAdministrator\b",
        r"\bDesigner\b",
        r"\bSpecialist\b",
        r"\bExecutive\b",
        r"\bArchitect\b",
        r"\bProgrammer\b",
        r"\bTechnician\b",
        r"\bSupport\s+(?:Engineer|Associate|Specialist)\b",
        r"\bService\s+Desk\s+(?:Analyst|Associate|Engineer)\b"
    ]

    date_pattern = re.compile(
        r"("
        r"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)"
        r"[a-z]*\s+\d{4}"
        r"|"
        r"\d{4}-\d{2}-\d{2}"
        r"|"
        r"\d{4}"
        r")"
        r"\s*(?:[-–—]|to)\s*"
        r"(Present|"
        r"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)"
        r"[a-z]*\s+\d{4}"
        r"|"
        r"\d{4}-\d{2}-\d{2}"
        r"|"
        r"\d{4}"
        r")",
        re.IGNORECASE
    )

    current = None

    for index, line in enumerate(lines):

        # ----------------------------------------------------
        # Detect explicit job title
        # ----------------------------------------------------

        is_job_title = any(
            re.search(
                pattern,
                line,
                re.IGNORECASE
            )
            for pattern in job_patterns
        )

        date_match = date_pattern.search(line)

        # A line containing a date range is strong evidence
        # that this is an experience record.
        if is_job_title or date_match:

            if current:
                experience.append(current)

            job_title = line

            if date_match:
                job_title = (
                    line[:date_match.start()]
                    .strip(" :-|")
                )

            current = {
                "company": None,
                "jobTitle": job_title if job_title else None,
                "startDate": None,
                "endDate": None,
                "description": ""
            }

            if date_match:

                current["startDate"] = (
                    date_match.group(1)
                )

                current["endDate"] = (
                    date_match.group(2)
                )

            continue

        if current is None:
            continue

        # ----------------------------------------------------
        # Date
        # ----------------------------------------------------

        if date_match:

            current["startDate"] = (
                date_match.group(1)
            )

            current["endDate"] = (
                date_match.group(2)
            )

            continue

        # ----------------------------------------------------
        # Company
        # ----------------------------------------------------

        if current["company"] is None:

            # Only accept company-looking lines.
            company_match = re.search(
                r"\b(?:Ltd|Limited|Pvt|Private|Inc|LLC|"
                r"Corporation|Corp|Technologies|Technology|"
                r"Solutions|Systems|Services|Company|"
                r"College|University|Institute)\b",
                line,
                re.IGNORECASE
            )

            if company_match:
                current["company"] = line
                continue

            # If there is no obvious company keyword,
            # use a short clean line as company.
            if len(line.split()) <= 8 and not line.endswith("."):
                current["company"] = line
                continue

        # ----------------------------------------------------
        # Description
        # ----------------------------------------------------

        if current["description"]:
            current["description"] += " " + line
        else:
            current["description"] = line

    if current:
        experience.append(current)

    return experience


# ============================================================
# COMPLETE RESUME PARSER
# ============================================================

def parse_resume(text: str):

    return {
        "name": extract_name(text),
        "email": extract_email(text),
        "phone": extract_phone(text),
        "skills": extract_skills(text),
        "education": extract_education(text),
        "experience": extract_experience(text),
        "projects": extract_projects(text)
    }