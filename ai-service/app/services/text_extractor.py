from pathlib import Path

import pymupdf
import pytesseract
from PIL import Image
from docx import Document


# Tesseract executable path on Windows
TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH


def extract_text(file_path: str) -> str:
    """
    Extract text from TXT, PDF, or DOCX files.

    For PDFs:
    1. Try normal text extraction using PyMuPDF.
    2. If little/no text is extracted, use OCR with Tesseract.
    """

    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    extension = path.suffix.lower()

    if extension == ".txt":
        return path.read_text(encoding="utf-8-sig").strip()

    if extension == ".pdf":
        return extract_pdf_text(path)

    if extension == ".docx":
        return extract_docx_text(path)

    raise ValueError(
        f"Unsupported file type: {extension}. "
        "Supported types: .txt, .pdf, .docx"
    )


def extract_pdf_text(path: Path) -> str:
    """
    Extract text from a PDF.

    Uses PyMuPDF first. If the PDF appears to be scanned
    or contains very little extractable text, OCR is used.
    """

    text = []

    with pymupdf.open(path) as document:
        for page in document:
            page_text = page.get_text().strip()

            if page_text:
                text.append(page_text)

    extracted_text = "\n".join(text).strip()

    # If enough text was extracted, return it normally.
    if len(extracted_text) >= 50:
        return extracted_text

    # Otherwise, use OCR.
    return extract_pdf_text_with_ocr(path)


def extract_pdf_text_with_ocr(path: Path) -> str:
    """
    Extract text from scanned/image-based PDF using Tesseract OCR.
    """

    ocr_text = []

    with pymupdf.open(path) as document:
        for page in document:

            # Render PDF page as an image
            pix = page.get_pixmap(matrix=pymupdf.Matrix(2, 2))

            # Convert Pixmap to PIL Image
            image = Image.frombytes(
                "RGB",
                [pix.width, pix.height],
                pix.samples
            )

            # Run OCR
            page_text = pytesseract.image_to_string(image)

            if page_text.strip():
                ocr_text.append(page_text.strip())

    return "\n".join(ocr_text).strip()


def extract_docx_text(path: Path) -> str:
    """
    Extract text from DOCX files.
    """

    document = Document(path)

    paragraphs = [
        paragraph.text.strip()
        for paragraph in document.paragraphs
        if paragraph.text.strip()
    ]

    return "\n".join(paragraphs).strip()