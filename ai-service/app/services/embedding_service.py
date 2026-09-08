from sentence_transformers import SentenceTransformer


# 384-dimensional embedding model
MODEL_NAME = "all-MiniLM-L6-v2"

model = SentenceTransformer(MODEL_NAME)


def generate_embedding(text: str):
    """
    Generate a 384-dimensional embedding for the given text.
    """

    if not text or not text.strip():
        raise ValueError("Text cannot be empty.")

    embedding = model.encode(
        text,
        normalize_embeddings=True
    )

    return embedding.tolist()


def embedding_to_pgvector(embedding):
    """
    Convert Python list of floats into PostgreSQL pgvector format.
    """

    return "[" + ",".join(
        str(float(value))
        for value in embedding
    ) + "]"