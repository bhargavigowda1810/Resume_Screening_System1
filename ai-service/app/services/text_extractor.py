from pathlib import Path

import pymupdf
from docx import Document


def extract_text(file_path: str) -> str:
    """
    Extract text from TXT, PDF, or DOCX files.
    """

    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    extension = path.suffix.lower()

    if extension == ".txt":
        return path.read_text(encoding="utf-8-sig")

    if extension == ".pdf":
        return extract_pdf_text(path)

    if extension == ".docx":
        return extract_docx_text(path)

    raise ValueError(
        f"Unsupported file type: {extension}. "
        "Supported types: .txt, .pdf, .docx"
    )


def extract_pdf_text(path: Path) -> str:
    text = []

    with pymupdf.open(path) as document:
        for page in document:
            text.append(page.get_text())

    return "\n".join(text).strip()


def extract_docx_text(path: Path) -> str:
    document = Document(path)

    paragraphs = [
        paragraph.text.strip()
        for paragraph in document.paragraphs
        if paragraph.text.strip()
    ]

    return "\n".join(paragraphs)