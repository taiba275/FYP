import faiss
import numpy as np
from pymongo import MongoClient
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
import os
import pickle

# Load environment
load_dotenv()
MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)
db = client["test"]
collection = db["PreprocessedCombinedData"]

# Load model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Prepare data
documents = []
id_map = []

for doc in collection.find():
    text = f"{doc.get('Title', '')} {doc.get('ExtractedRole', '')} {doc.get('Skills', '')} {doc.get('FunctionalArea', '')} {doc.get('Description', '')}"
    documents.append(text)
    id_map.append(str(doc["_id"]))

# Generate embeddings
print(f"Encoding {len(documents)} job postings...")
embeddings = model.encode(documents, normalize_embeddings=True)
embeddings = np.array(embeddings).astype("float32")

# Build FAISS index
index = faiss.IndexFlatIP(embeddings.shape[1])  # cosine similarity via normalized vectors
index.add(embeddings)

# Save index + ID map
faiss.write_index(index, "job_index.faiss")
with open("id_map.pkl", "wb") as f:
    pickle.dump(id_map, f)

print("✅ FAISS index built and saved. Search Paramter working..")
