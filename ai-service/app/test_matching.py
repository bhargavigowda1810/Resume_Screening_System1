
from app.services.resume_parser import parse_resume

from app.services.embedding_service import (
    compare_parsed_resume,
    calculate_weighted_score
)
from app.services.embedding_service import (
    compare_parsed_resume,
    validate_education
)

sample_resume = """
MOULIKA K

Technical Skills
Python, Java, React, SQL, AWS, Docker

Projects

Expense Tracking Application | React, JavaScript
Developed a React expense tracking application.

Education
Bachelor's degree in Computer Science
B.Tech Computer Science Engineering
Dayananda Sagar University

Certifications

AWS Certified Cloud Practitioner
Google Data Analytics Professional Certificate
"""

job_description = """
Frontend Developer

Required:
React
JavaScript

Preferred:
AWS
Docker
"""

parsed_resume = parse_resume(sample_resume)

print("\nPARSED RESUME:")
print(parsed_resume)

requirements = [
    "React",
    "JavaScript",
    "AWS",
    "Docker",
    "Bachelor's degree in Computer Science"
]
test_evidence = (
    "EDUCATION_EVIDENCE: Degree: B.Tech Computer Science Engineering. "
    "Field: Computer Science. Institution: Dayananda Sagar University"
)

print("\nEDUCATION VALIDATION TEST:")
print(
    validate_education(
        "Bachelor's degree in Computer Science",
        test_evidence
    )
)

results = compare_parsed_resume(
    parsed_resume,
    requirements,
    job_description
)

print("\nMATCHING RESULTS:")

for result in results:
    print(result)

score = calculate_weighted_score(results)

print("\nFINAL SCORE:")
print(score)