
from sentence_transformers import SentenceTransformer

import re

# --------------------------------------------------
# MODEL INITIALIZATION
# --------------------------------------------------

MODEL_NAME = "all-MiniLM-L6-v2"

model = SentenceTransformer(MODEL_NAME)


# --------------------------------------------------
# GENERATE EMBEDDING
# --------------------------------------------------

def generate_embedding(text: str):

    if not text or not text.strip():
        raise ValueError("Text cannot be empty.")

    embedding = model.encode(
        text,
        normalize_embeddings=True
    )

    return embedding.tolist()


# --------------------------------------------------
# CALCULATE SIMILARITY
# --------------------------------------------------

def calculate_similarity(text_a: str, text_b: str) -> float:

    if not text_a or not text_a.strip():
        raise ValueError("First text cannot be empty.")

    if not text_b or not text_b.strip():
        raise ValueError("Second text cannot be empty.")

    embedding_a = generate_embedding(text_a)
    embedding_b = generate_embedding(text_b)

    similarity = sum(
        a * b
        for a, b in zip(embedding_a, embedding_b)
    )

    return float(similarity)


# --------------------------------------------------
# NORMALIZE TEXT
# --------------------------------------------------

def normalize_text(text: str) -> str:

    text = text.lower()
    text = re.sub(r"\s+", " ", text)

    return text.strip()


# --------------------------------------------------
# IDENTIFY REQUIREMENT TYPE
# --------------------------------------------------

def identify_requirement_type(requirement: str) -> str:

    text = normalize_text(requirement)

    certification_terms = [
        "certification", "certified", "certificate",
        "cissp", "ceh", "comptia"
    ]

    education_terms = [
        "degree", "bachelor", "master",
        "b.tech", "m.tech", "qualification"
    ]

    experience_terms = [
        "years of experience", "year experience",
        "professional experience", "experience in"
    ]

    soft_skill_terms = [
        "communication", "leadership",
        "teamwork", "problem solving",
        "collaboration", "adaptability"
    ]

    technical_terms = [
        "python", "java", "javascript",
        "react", "angular", "sql",
        "aws", "azure", "docker",
        "kubernetes", "linux",
        "machine learning", "deep learning",
        "cybersecurity", "siem",
        "wazuh", "splunk", "spring boot",
        "django", "flask", "api"
    ]

    if any(term in text for term in certification_terms):
        return "certification"

    if any(term in text for term in education_terms):
        return "education"

    if any(term in text for term in experience_terms):
        return "experience"

    if any(term in text for term in soft_skill_terms):
        return "soft_skill"

    if any(term in text for term in technical_terms):
        return "technical_skill"

    return "general"


# --------------------------------------------------
# DETERMINE DYNAMIC IMPORTANCE
# --------------------------------------------------


def determine_importance(requirement: str, job_description: str) -> dict:

    requirement_text = normalize_text(requirement)
    jd_text = normalize_text(job_description)

    requirement_type = identify_requirement_type(requirement)

    importance = 1.0
    reasons = []

    mandatory_terms = [
        "required", "mandatory", "must have",
        "essential", "minimum", "must"
    ]

    preferred_terms = [
        "preferred", "nice to have",
        "bonus", "good to have",
        "would be an advantage", "desirable"
    ]

    # Find the requirement's context in the original JD.
    lines = job_description.splitlines()
    active_context = ""
    requirement_contexts = []

    for line in lines:
        line_text = normalize_text(line)

        if not line_text:
            continue

        if any(term in line_text for term in mandatory_terms):
            active_context = "mandatory"

        elif any(term in line_text for term in preferred_terms):
            active_context = "preferred"

        # Check whether this line contains the requirement.
        pattern = (
            r"(?<!\w)"
            + re.escape(requirement_text)
            + r"(?!\w)"
        )

        if re.search(pattern, line_text):
            requirement_contexts.append(
                line_text + " " + active_context
            )

    context = " ".join(requirement_contexts)

    # Determine importance from the actual JD context.
    if any(term in context for term in mandatory_terms):
        importance += 2.0
        reasons.append("Mandatory requirement in job description")

    elif any(term in context for term in preferred_terms):
        importance -= 0.5
        reasons.append("Preferred requirement in job description")

    # Technical skills and experience have additional importance.
    if requirement_type in ["technical_skill", "experience"]:
        importance += 0.5
        reasons.append("Technical skill or experience requirement")

    # Repeated mentions increase importance.
    pattern = (
        r"(?<!\w)"
        + re.escape(requirement_text)
        + r"(?!\w)"
    )

    occurrences = len(re.findall(pattern, jd_text))

    if occurrences >= 2:
        bonus = min((occurrences - 1) * 0.5, 1.5)
        importance += bonus
        reasons.append("Repeated in job description")

    return {
        "type": requirement_type,
        "importance": round(max(0.5, importance), 2),
        "reasons": reasons
    }

# --------------------------------------------------
# VERIFY EXPLICIT EVIDENCE
# --------------------------------------------------


def verify_evidence(requirement: str, evidence: str) -> dict:

    if not evidence or not evidence.strip():
        return {
            "verified": False,
            "matched_keywords": []
        }

    requirement_text = normalize_text(requirement)
    evidence_text = normalize_text(evidence)

    # Exact matching with word boundaries.
    exact_pattern = (
        r"(?<!\w)"
        + re.escape(requirement_text)
        + r"(?!\w)"
    )

    exact_match = bool(
        re.search(exact_pattern, evidence_text)
    )

    keywords = [
        "python", "java", "javascript",
        "react", "angular", "sql",
        "aws", "azure", "docker",
        "kubernetes", "linux",
        "machine learning", "deep learning",
        "cybersecurity", "siem",
        "wazuh", "splunk", "spring boot",
        "django", "flask", "api"
    ]

    matched_keywords = []

    for keyword in keywords:

        pattern = (
            r"(?<!\w)"
            + re.escape(keyword)
            + r"(?!\w)"
        )

        if (
            re.search(pattern, requirement_text)
            and re.search(pattern, evidence_text)
        ):
            matched_keywords.append(keyword)

    verified = exact_match or bool(matched_keywords)

    return {
        "verified": verified,
        "matched_keywords": matched_keywords
    }



def validate_education(requirement: str, evidence: str) -> dict:

    requirement_text = normalize_text(requirement)
    evidence_text = normalize_text(evidence)

    if not evidence.startswith("EDUCATION_EVIDENCE:"):
        return {
            "verified": False,
            "reason": "No education evidence"
        }

    # Check degree level
    requires_bachelor = any(
        term in requirement_text
        for term in [
            "bachelor",
            "b.tech",
            "b.e.",
            "undergraduate"
        ]
    )

    requires_master = any(
        term in requirement_text
        for term in [
            "master",
            "m.tech",
            "m.e.",
            "postgraduate"
        ]
    )

    requires_phd = any(
        term in requirement_text
        for term in [
            "ph.d",
            "phd",
            "doctorate"
        ]
    )

    has_bachelor = any(
        term in evidence_text
        for term in [
            "bachelor",
            "b.tech",
            "b.e."
        ]
    )

    has_master = any(
        term in evidence_text
        for term in [
            "master",
            "m.tech",
            "m.e."
        ]
    )

    has_phd = any(
        term in evidence_text
        for term in [
            "ph.d",
            "phd",
            "doctorate"
        ]
    )

    degree_match = (
        not (requires_bachelor or requires_master or requires_phd)
        or (requires_bachelor and has_bachelor)
        or (requires_master and has_master)
        or (requires_phd and has_phd)
    )

    # Check field of study
    required_fields = [
        "computer science",
        "computer applications",
        "information technology",
        "engineering",
        "commerce",
        "management"
    ]

    matching_fields = [
        field for field in required_fields
        if field in requirement_text
    ]

    field_match = (
        not matching_fields
        or any(
            field in evidence_text
            for field in matching_fields
        )
    )

    verified = degree_match and field_match

    return {
        "verified": verified,
        "reason": (
            "Degree level and field match"
            if verified
            else "Degree level or field does not match"
        )
    }



# --------------------------------------------------
# CLASSIFY REQUIREMENT
# --------------------------------------------------

def classify_requirement(
    requirement: str,
    evidence: str,
    job_description: str
) -> dict:

    importance_data = determine_importance(
        requirement,
        job_description
    )

    evidence_data = verify_evidence(
        requirement,
        evidence
    )

    similarity = (
        calculate_similarity(requirement, evidence)
        if evidence and evidence.strip()
        else 0.0
    )

    evidence_type = "none"

    if evidence.startswith("SKILLS_SECTION:"):
        evidence_type = "skills_section"

    elif evidence.startswith("PROJECT_TECHNOLOGY:"):
        evidence_type = "project_technology"

    elif evidence.startswith("PROJECT_DESCRIPTION:"):
        evidence_type = "project_description"

    elif evidence.startswith("EXPERIENCE_EVIDENCE:"):
        evidence_type = "experience"

    elif evidence.startswith("EDUCATION_EVIDENCE:"):
        evidence_type = "education"

    elif evidence.startswith("CERTIFICATION_EVIDENCE:"):
        evidence_type = "certification"

    # Education-specific validation
    education_data = None

    if importance_data["type"] == "education":
        education_data = validate_education(
            requirement,
            evidence
        )

        if education_data["verified"]:
            status = "Matched"
        else:
            status = "Not Found"

    # Technical skill and other requirement validation
    elif evidence_data["verified"]:

        if evidence_type in [
            "skills_section",
            "project_technology",
            "certification"
        ]:
            status = "Partially Matched"

        elif evidence_type in [
            "project_description",
            "experience"
        ]:
            status = "Matched"

        else:
            status = "Not Found"

    else:
        status = "Not Found"

    # Education uses its own validator, not the technical keyword verifier
    evidence_verified = (
        education_data["verified"]
        if education_data is not None
        else evidence_data["verified"]
    )

    return {
        "requirement": requirement,
        "type": importance_data["type"],
        "importance": importance_data["importance"],
        "importance_reasons": importance_data["reasons"],
        "matched_evidence": evidence,
        "similarity": round(similarity, 4),
        "status": status,
        "evidence_verified": evidence_verified,
        "matched_keywords": (
            evidence_data["matched_keywords"]
            if evidence_data["verified"]
            else []
        ),
        "evidence_type": evidence_type
    }


# --------------------------------------------------
# COMPARE RESUME AND JOB REQUIREMENTS
# --------------------------------------------------

def compare_texts(
    resume_items: list,
    job_items: list,
    job_description: str = ""
) -> list:

    if not isinstance(resume_items, list) or not isinstance(job_items, list):
        raise ValueError("Both inputs must be lists.")

    results = []

    for requirement in job_items:

        if not isinstance(requirement, str) or not requirement.strip():
            continue

        best_match = ""
        best_priority = -1
        best_similarity = -1.0

        requirement_type = identify_requirement_type(requirement)

        requirement_lower = requirement.lower()

        certification_required = any(
            term in requirement_lower
            for term in ["certification", "certified", "certificate", "license"]
        )

        for evidence in resume_items:

            if not isinstance(evidence, str) or not evidence.strip():
                continue

            evidence_data = verify_evidence(
                requirement,
                evidence
            )

            verified = evidence_data["verified"]

            if requirement_type == "education":

                priority = (
                    5 if evidence.startswith("EDUCATION_EVIDENCE:") else 0
                )

            elif not verified:
                priority = 0

            elif certification_required:

                if evidence.startswith("CERTIFICATION_EVIDENCE:"):
                    priority = 5
                elif evidence.startswith("PROJECT_DESCRIPTION:"):
                    priority = 4
                elif evidence.startswith("EXPERIENCE_EVIDENCE:"):
                    priority = 4
                elif evidence.startswith("PROJECT_TECHNOLOGY:"):
                    priority = 3
                elif evidence.startswith("SKILLS_SECTION:"):
                    priority = 2
                else:
                    priority = 0

            else:

                if evidence.startswith("PROJECT_DESCRIPTION:"):
                    priority = 4
                elif evidence.startswith("EXPERIENCE_EVIDENCE:"):
                    priority = 4
                elif evidence.startswith("PROJECT_TECHNOLOGY:"):
                    priority = 3
                elif evidence.startswith("SKILLS_SECTION:"):
                    priority = 2
                elif evidence.startswith("CERTIFICATION_EVIDENCE:"):
                    priority = 1
                else:
                    priority = 0

            similarity = calculate_similarity(
                requirement,
                evidence
            )

            if (
                priority > best_priority
                or (
                    priority == best_priority
                    and priority > 0
                    and similarity > best_similarity
                )
            ):
                best_priority = priority
                best_similarity = similarity
                best_match = evidence

        if best_priority <= 0:
            best_match = ""

        result = classify_requirement(
            requirement,
            best_match,
            job_description
        )

        results.append(result)

    return results

# --------------------------------------------------
# CALCULATE WEIGHTED SCORE
# --------------------------------------------------

def calculate_weighted_score(results: list) -> dict:

    if not results:
        return {
            "score": 0,
            "matched": 0,
            "partial": 0,
            "not_found": 0
        }

    total_weight = 0
    achieved_weight = 0

    matched = 0
    partial = 0
    not_found = 0

    for result in results:

        weight = result["importance"]
        total_weight += weight

        if result["status"] == "Matched":

            matched += 1
            achieved_weight += weight

        elif result["status"] == "Partially Matched":

            partial += 1
            achieved_weight += weight * 0.5

        else:

            not_found += 1

    score = (
        achieved_weight / total_weight * 100
        if total_weight > 0 else 0
    )

    return {
        "score": round(score, 2),
        "matched": matched,
        "partial": partial,
        "not_found": not_found,
        "total_requirements": len(results)
    }


# --------------------------------------------------
# BUILD EVIDENCE FROM PARSED RESUME
# --------------------------------------------------

def build_resume_evidence(parsed_resume: dict) -> list:

    evidence = []

    # Skills listed in the resume
    for skill in parsed_resume.get("skills", []):
        evidence.append(f"SKILLS_SECTION: {skill}")

    # Project evidence: separate technology lists from descriptions
    for project in parsed_resume.get("projects", []):

        title = project.get("title", "")
        description = project.get("description", "")
        technologies = project.get("technologies", [])

        for technology in technologies:
            evidence.append(
                f"PROJECT_TECHNOLOGY: {technology} "
                f"in project {title}"
            )

        if description.strip():
            evidence.append(
                f"PROJECT_DESCRIPTION: {description} "
                f"Project: {title}"
            )

    # Professional experience
    for experience in parsed_resume.get("experience", []):

        job_title = experience.get("jobTitle", "")
        company = experience.get("company", "")
        description = experience.get("description", "")

        evidence.append(
            f"EXPERIENCE_EVIDENCE: {description} "
            f"Job title: {job_title}. Company: {company}"
        )

       # Education evidence
    for education in parsed_resume.get("education", []):

        degree = education.get("degree", "")
        field = education.get("fieldOfStudy", "")
        institution = education.get("institution", "")

        evidence.append(
            f"EDUCATION_EVIDENCE: Degree: {degree}. "
            f"Field: {field}. Institution: {institution}"
        )

        # Certifications
    for certification in parsed_resume.get("certifications", []):

        evidence.append(
            f"CERTIFICATION_EVIDENCE: {certification}"
        )

    return [
        item.strip()
        for item in evidence
        if item and item.strip()
    ]

# --------------------------------------------------
# MATCH PARSED RESUME AGAINST JOB REQUIREMENTS
# --------------------------------------------------

def compare_parsed_resume(
    parsed_resume: dict,
    job_items: list,
    job_description: str
) -> list:

    resume_evidence = build_resume_evidence(
        parsed_resume
    )

    return compare_texts(
        resume_evidence,
        job_items,
        job_description
    )

# --------------------------------------------------
# PGVECTOR CONVERSION
# --------------------------------------------------

def embedding_to_pgvector(embedding):

    return "[" + ",".join(
        str(float(value))
        for value in embedding
    ) + "]"
