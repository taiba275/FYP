from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import faiss
import numpy as np
import os
from pymongo import MongoClient
from dotenv import load_dotenv
import json
import pickle
import requests
import io
from bson import ObjectId
from sentence_transformers import SentenceTransformer
import uvicorn

load_dotenv()

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
index = None
id_map = []
index_dimension = 384  # MiniLM-L6-v2
FAISS_FILE = "faiss_index.pkl"
FAISS_URL = "https://drive.google.com/uc?export=download&id=1xGp2Somx1XKcshO2Ju84LoTVLBeKAPp5"

# MongoDB setup
client = MongoClient(os.getenv("MONGODB_URI"))
db = client["test"]
jobs_collection = db["PreprocessedCombinedData"]

# Load FAISS index and ID map
try:
    print("⏳ Downloading FAISS index from Google Drive...")
    response = requests.get(FAISS_URL, stream=True)
    response.raise_for_status()
    with open(FAISS_FILE, 'wb') as f:
        f.write(response.content)
    print(f"✅ FAISS index saved to {FAISS_FILE}")

    with open(FAISS_FILE, 'rb') as f:
        data = pickle.load(f)
    index = data['index']
    id_map = data['id_map']
    index_dimension = index.d
    print(f"✅ FAISS index loaded. Vectors: {index.ntotal}, Dim: {index_dimension}")
except Exception as e:
    print("❌ Failed to load FAISS index:", str(e))

# SentenceTransformer embedder
model = SentenceTransformer("all-MiniLM-L6-v2")

def embed(text):
    return model.encode([text])[0].astype("float32")

def detect_intent(message):
    msg = message.lower()
    if any(word in msg for word in ["interview", "question", "prepare"]):
        return "interview"
    if any(word in msg for word in ["salary", "perks", "remote"]):
        return "salary"
    return "search"

@app.post("/retrieve-jobs")
async def retrieve_jobs(request: Request):
    try:
        if index is None:
            return {"error": "FAISS index not loaded.", "results": []}

        body = await request.json()
        query = body.get("message", "")
        print(f"🔍 Query: {query}")

        if not query.strip():
            return {"results": []}

        query_vector = embed(query)
        top_k = 10
        D, I = index.search(np.array([query_vector]), k=top_k)

        candidates = []
        for idx in I[0]:
            if idx == -1:
                continue
            mongo_id = id_map[idx]
            job = jobs_collection.find_one({"_id": ObjectId(mongo_id)})
            if job:
                candidates.append({
                    "title": job.get("Title", ""),
                    "company": job.get("Company", ""),
                    "description": job.get("Description", ""),
                    "url": job.get("Job URL", "#"),
                    "skills": job.get("Skills", [])
                })

        if not candidates:
            return {"results": []}

        # Intent-aware prompt generation
        intent = detect_intent(query)

        job_list_for_prompt = "\n\n".join([
            f"Job {i+1}:\n- Title: {j['title']}\n- Description: {j['description']}\n- Skills: {', '.join(j['skills']) if isinstance(j['skills'], list) else ''}\n- Apply URL: [Apply Here]({j['url']})"
            for i, j in enumerate(candidates[:5])
        ])

        prompt = f"""
The user asked: \"{query}\"

Below are the most relevant job listings from our platform:

{job_list_for_prompt}

Your task is to respond to the user's query using only the above job listings. Follow these strict instructions:

1. If the user asks for job listings:
   - Return each job with:
     - A short, clear **summary of responsibilities**
     - The **key skills required**
     - The **salary** (if available)
     - A **clickable \"Apply Here\" link** using markdown: [Apply Here](job.url)

2. If the user asks for interview questions related to any job:
   - Provide a list of **realistic, role-specific interview questions** (technical + behavioral).
   - Include **model answers or best answering strategies**.
   - Suggest **online resources to prepare**, such as:
     - Specific courses (e.g., from freeCodeCamp, Udemy, Coursera)
     - GitHub repositories or articles
   - Organize the learning into a **step-by-step preparation flow** with bullet points.

3. If the user asks follow-up questions like \"salary\", \"remote\", or \"skills\":
   - Only respond using data from the listed jobs above.
   - Do NOT add any external assumptions.

4. Never invent or refer to jobs that are not explicitly listed above.
5. Use **bullet points or numbered lists** to make the response clear and scannable.
6. All links must be **clickable markdown format**, e.g., [Apply Here](job.url).

Be concise, helpful, and accurate in all responses.
"""

        # Claude via OpenRouter
        import httpx
        openrouter_api = os.getenv("OPENROUTER_API_KEY")
        response = httpx.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {openrouter_api}"
            },
            json={
                "model": "anthropic/claude-3-haiku",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.7
            }
        )
        data = response.json()
        if "choices" not in data or not data["choices"][0].get("message"):
            return {"error": "Claude returned invalid response", "results": candidates[:5]}

        return {
            "results": candidates[:5],           # actual job matches
            "choices": data["choices"]           # Claude’s response
        }

    except Exception as e:
        import traceback
        print(f"❌ Error in retrieve_jobs: {e}")
        print(traceback.format_exc())
        return {"error": "Internal server error", "results": []}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5010)
