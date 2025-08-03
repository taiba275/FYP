from fastapi import FastAPI, Request
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import faiss
import pickle
import numpy as np
import uvicorn

app = FastAPI()

# Load model, FAISS, and ID map
model = SentenceTransformer("all-MiniLM-L6-v2")
index = faiss.read_index("job_index.faiss")
with open("id_map.pkl", "rb") as f:
    id_map = pickle.load(f)

class SearchRequest(BaseModel):
    query: str
    top_k: int = 20

@app.post("/semantic-search")
async def semantic_search(body: SearchRequest):
    embedding = model.encode(body.query, normalize_embeddings=True)
    embedding = np.array([embedding]).astype("float32")
    D, I = index.search(embedding, body.top_k)
    matched_ids = [id_map[i] for i in I[0] if i < len(id_map)]
    return { "ids": matched_ids }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5001)
