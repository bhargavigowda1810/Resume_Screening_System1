
from app.services.resume_parser import parse_resume

from app.services.embedding_service import (
    compare_parsed_resume,
    calculate_weighted_score
)


job_description = """
Frontend Developer

Required:
React
JavaScript

Preferred:
AWS
Docker
"""

requirements = [
    "React",
    "JavaScript",
    "AWS",
    "Docker",
    "Bachelor's degree in Computer Science"
]


test_resumes = {

    "Candidate 1 - Strong Match": """
    Technical Skills
    React, JavaScript, AWS, Docker, Python

    Projects
    E-commerce Website | React, JavaScript, AWS
    Developed a responsive e-commerce application using React and JavaScript.

    Education
    B.Tech Computer Science Engineering
    ABC University

    Certifications
    AWS Certified Cloud Practitioner
    """,

    "Candidate 2 - Partial Match": """
    Technical Skills
    React, Python, HTML, CSS

    Projects
    Portfolio Website | React
    Developed a personal portfolio website using React.

    Education
    Bachelor of Commerce
    ABC College
    """,

    "Candidate 3 - Missing Mandatory Skills": """
    Technical Skills
    Python, Java, SQL

    Projects
    Library Management System | Java
    Developed a library management application using Java.

    Education
    B.Tech Computer Science Engineering
    ABC University
    """,

    "Candidate 4 - Different Education": """
    Technical Skills
    React, JavaScript, AWS

    Projects
    Frontend Dashboard | React, JavaScript
    Developed a frontend dashboard using React and JavaScript.

    Education
    Bachelor of Commerce
    XYZ University
    """,

    "Candidate 5 - Certification Only": """
    Technical Skills
    Python, Java

    Projects
    Student Management System | Python
    Developed a student management system using Python.

    Education
    B.Tech Computer Science Engineering
    ABC University

    Certifications
    AWS Certified Cloud Practitioner
    """
}


for candidate_name, resume_text in test_resumes.items():

    print("\n" + "=" * 65)
    print(candidate_name)
    print("=" * 65)

    parsed_resume = parse_resume(resume_text)

    print("EXTRACTED EDUCATION:", parsed_resume.get("education"))

    results = compare_parsed_resume(
        parsed_resume,
        requirements,
        job_description
    )

    score = calculate_weighted_score(results)

    for result in results:
        print(
            result["requirement"],
            "=>",
            result["status"],
            "| Evidence:",
            result["evidence_type"]
        )

    print("\nFINAL SCORE:", score["score"], "%")
    print("Matched:", score["matched"])
    print("Partial:", score["partial"])
    print("Not Found:", score["not_found"])
