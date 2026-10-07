import re

from .helpers import clean_line, get_lines
from .sections import extract_sections, find_section


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