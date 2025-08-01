from pymongo import MongoClient
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
import os
import math

load_dotenv()
MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)
db = client["test"]
jobs_collection = db["PreprocessedCombinedData"]

model = SentenceTransformer("all-MiniLM-L6-v2")

def safe_str(value):
    try:
        if value is None:
            return ""
        if isinstance(value, float) and (math.isnan(value) or math.isinf(value)):
            return ""
        return str(value).strip().lower()
    except:
        return ""

jobs = list(jobs_collection.find({}))

for job in jobs:
    updates = {}

    # Full combined embedding (optional)
    if 'embedding' not in job:
        skills = safe_str(job.get("Skills"))
        combined = " ".join([
            skills, skills, skills,
            safe_str(job.get("Title")),
            safe_str(job.get("Description")),
            safe_str(job.get("Minimum Education"))
        ])
        if combined.strip():
            updates["embedding"] = model.encode(combined).tolist()

    # New: skills_embedding for FAISS
    if 'skills_embedding' not in job:
        skills = safe_str(job.get("Skills"))
        if skills.strip():
            updates["skills_embedding"] = model.encode(skills).tolist()

    # New: title_embedding for FAISS
    if 'title_embedding' not in job:
        title = safe_str(job.get("Title"))
        if title.strip():
            updates["title_embedding"] = model.encode(title).tolist()

    if updates:
        jobs_collection.update_one(
            {"_id": job["_id"]},
            {"$set": updates}
        )
        print(f"✅ Embedded: {job.get('Title')}")
