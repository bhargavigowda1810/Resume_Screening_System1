# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
# Resume Screening and Ranking System

An AI-powered **Resume Screening and Ranking System** designed to automate the process of analyzing resumes, matching candidates with job requirements, and helping recruiters identify suitable candidates efficiently.

The system combines a **React frontend, Spring Boot backend, Python AI/NLP service, and PostgreSQL with pgvector** to provide an end-to-end resume screening and ranking workflow.

---

## 🚀 Project Overview

Recruiters often need to review a large number of resumes for a single job opening. Manually comparing resumes with job requirements can be time-consuming and inconsistent.

This project aims to automate that process by:

- Allowing recruiters to create and manage job openings.
- Allowing applicants to register and upload resumes.
- Extracting text from uploaded resumes.
- Processing resume information using AI/NLP techniques.
- Comparing resumes with job descriptions and requirements.
- Generating matching information for screening and ranking.
- Storing application, resume, job, and user information in PostgreSQL.
- Providing separate workflows for recruiters and applicants.

---

## System Architecture

```text
                    ┌─────────────────────┐
                    │       Frontend      │
                    │   React + Vite      │
                    │     PrimeReact      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │       Backend       │
                    │    Spring Boot      │
                    │ Spring Security/JPA │
                    └──────────┬──────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                 ▼                           ▼
       ┌──────────────────┐       ┌──────────────────┐
       │    AI Service    │       │    PostgreSQL    │
       │ Python + FastAPI │       │    + pgvector    │
       │      NLP/AI      │       │                  │
       └────────┬─────────┘       └──────────────────┘
                │
                ▼
       ┌──────────────────┐
       │ Resume Processing│
       │ Text Extraction  │
       │ OCR / NLP /      │
       │ Embeddings       │
       └──────────────────┘
```

---

## Application Workflow

### 1. User Registration

Users can register as:

- Applicant
- Recruiter

User authentication and account information are handled by the backend.

### 2. User Login

Users log in using their registered email and password.

The system authenticates the user and provides access according to their role.

### 3. Resume Upload

Applicants can upload their resumes through the frontend.

Supported resume formats can include:

- PDF
- DOCX
- TXT

The uploaded resume is sent for processing.

### 4. Resume Text Extraction

The AI service extracts text from the uploaded resume.

The AI/NLP service can use technologies such as:

- PyMuPDF
- Apache Tika
- python-docx
- Tesseract OCR

OCR can be used when the resume contains scanned or image-based content.

### 5. Resume Processing

The extracted resume text is processed to identify relevant candidate information, such as:

- Skills
- Education
- Experience
- Contact information
- Other relevant resume information

### 6. Job Description Processing

Recruiters can create job openings containing information such as:

- Job title
- Job description
- Required skills
- Required education
- Required experience
- Location

The job requirements are used during the matching process.

### 7. Resume and Job Matching

The AI/NLP service processes the resume and job requirements to determine how well a candidate matches a particular job.

Technologies such as:

- NLP
- Sentence Transformers
- Embeddings
- AI models

can be used as part of the matching process.

### 8. Resume Screening and Ranking

Candidates can be evaluated according to their relevance to the job requirements.

The system can use the generated matching information to assist recruiters in identifying suitable candidates.

### 9. Results

Recruiters can view candidate/application information through the frontend and use the screening results to support their recruitment decisions.

---

##  User Roles

### Applicant

Applicants can:

- Register an account.
- Log in.
- Manage their profile.
- Upload resumes.
- View available jobs.
- View job requirements.
- Apply for jobs.
- Select a resume when applying.
- Track their application-related information.
- Reset their password if required.

### Recruiter

Recruiters can:

- Register an account.
- Log in.
- Manage their profile.
- Create job openings.
- Specify job requirements.
- View job applications.
- Review candidate information.
- Use resume screening and ranking results.

---

## Technologies Used

### Frontend

- React.js
- Vite
- JavaScript
- PrimeReact
- HTML
- CSS

### Backend

- Java
- Spring Boot
- Spring Security
- Spring Data JPA
- Maven
- REST APIs

### AI / NLP Service

- Python
- FastAPI
- spaCy
- Apache Tika
- Tesseract OCR
- PyMuPDF
- python-docx
- Sentence Transformers
- AI/NLP processing

### Database

- PostgreSQL
- pgvector

### Development Tools

- Visual Studio Code
- Git
- GitHub
- pgAdmin
- PostgreSQL

---

## Project Structure

```text
Resume_Screening/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       └── resources/
│   ├── pom.xml
│   └── mvnw.cmd
│
├── ai-service/
│   ├── app/
│   │   ├── main.py
│   │   └── services/
│   │       └── text_extractor.py
│   │
│   ├── tests/
│   ├── requirements.txt
│   └── venv/
│
├── .gitignore
└── README.md
```

> **Note:** `venv/`, `node_modules/`, `target/`, and other generated files should not be committed to GitHub.

---

## Database

The system uses **PostgreSQL** as the primary relational database.

The database contains information related to:

- Users
- Jobs
- Resumes
- Applications
- Password reset tokens
- Other system data

**pgvector** can be used for storing and working with vector embeddings required for semantic resume/job matching.

### Example Database

```text
resume_screening_db
```

---

## Authentication and Security

The backend uses **Spring Security** for authentication and authorization.

Passwords are stored using secure password hashing rather than plain text.

The system also supports password recovery through:

1. Forgot password request.
2. Password reset token generation.
3. Reset link sent through email.
4. Token validation.
5. New password creation.
6. Reset token removal after successful password reset.

---

## AI Service

The `ai-service` is responsible for the AI/NLP-related processing of the project.

### Basic Structure

```text
ai-service/
│
├── app/
│   ├── main.py
│   │
│   └── services/
│       └── text_extractor.py
│
├── tests/
├── requirements.txt
└── venv/
```

The service is built using **FastAPI** and provides APIs that can be consumed by the Spring Boot backend.

The AI service handles tasks related to:

- Resume text extraction
- Document processing
- OCR
- NLP processing
- Resume information extraction
- Job description processing
- Semantic matching
- Embedding generation

---

## Prerequisites

Before running the project, install the following:

### Required Software

- Node.js LTS
- npm
- Java JDK 21
- PostgreSQL
- pgvector
- Python 3.12
- Tesseract OCR
- Git

---

## ▶️ Running the Project

### 1. Clone the Repository

```bash
git clone <repository-url>
```

Navigate into the project:

```bash
cd Resume_Screening
```

---

### 2. Run the Backend

Navigate to the backend:

```bash
cd backend
```

On Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

Alternatively, if Maven is installed:

```bash
mvn spring-boot:run
```

The Spring Boot backend will start on its configured port.

---

### 3. Run the AI Service

Open another terminal and navigate to:

```bash
cd ai-service
```

Create a Python virtual environment:

```bash
python -3.12 -m venv venv
```

Activate it on Windows:

```powershell
.\venv\Scripts\activate
```

Install the required packages:

```bash
python -m pip install -r requirements.txt
```

Run the FastAPI service using the project's configured entry point.

For example:

```bash
uvicorn app.main:app --reload
```

---

### 4. Run the Frontend

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

---
