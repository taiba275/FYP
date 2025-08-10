# faiss_job_search.py
# FastAPI service for job retrieval with FAISS + MongoDB + persistent chat history per user
# (TTL: messages & last job results expire after 1 hour)

from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv
from pymongo import MongoClient, ASCENDING
from bson import ObjectId
import uvicorn
import os
import re
import faiss
import pickle
import numpy as np
import requests
from sentence_transformers import SentenceTransformer
from datetime import datetime, timedelta

# =========================
# Config
# =========================
load_dotenv()

app = FastAPI(title="FAISS Job Search", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://fyp-e7ifx8lyj-mtti-bc46b27f.vercel.app", "http://localhost:3000"],  # tighten in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGO_DB_NAME", "test")
COLL_NAME = os.getenv("MONGO_COLL_NAME", "PreprocessedCombinedData")
CHAT_COLL_NAME = "chat_history"
LAST_JOBS_COLL_NAME = "last_job_results"

FAISS_FILE = os.getenv("FAISS_FILE", "faiss_index.pkl")
FAISS_URL = os.getenv(
    "FAISS_URL",
    "https://drive.google.com/uc?export=download&id=1xGp2Somx1XKcshO2Ju84LoTVLBeKAPp5",
)
EMBED_MODEL_NAME = os.getenv("EMBED_MODEL_NAME", "all-MiniLM-L6-v2")

mongo_client: MongoClient = MongoClient(MONGO_URI)
db = mongo_client[DB_NAME]
jobs_collection = db[COLL_NAME]
chat_collection = db[CHAT_COLL_NAME]
last_jobs_collection = db[LAST_JOBS_COLL_NAME]

# --- TTL indexes (auto-expire after 1 hour) ---
chat_collection.create_index("timestamp", expireAfterSeconds=3600)
chat_collection.create_index([("user_id", ASCENDING), ("timestamp", ASCENDING)])
last_jobs_collection.create_index("timestamp", expireAfterSeconds=3600)
last_jobs_collection.create_index([("user_id", ASCENDING), ("timestamp", ASCENDING)])

embedder: Optional[SentenceTransformer] = None
index: Optional[faiss.Index] = None
id_map: List[str] = []

# =========================
# Helpers
# =========================
def stream_download(url: str, dst_path: str, chunk: int = 1 << 20):
    with requests.get(url, stream=True, timeout=120) as r:
        r.raise_for_status()
        with open(dst_path, "wb") as f:
            for ch in r.iter_content(chunk_size=chunk):
                if ch:
                    f.write(ch)

def load_faiss_pickle(pkl_path: str):
    with open(pkl_path, "rb") as f:
        data = pickle.load(f)

    if isinstance(data, dict):
        if "index" in data and hasattr(data["index"], "search"):
            return data["index"], list(data["id_map"])
        if "index_bytes" in data and isinstance(data["index_bytes"], (bytes, bytearray)):
            idx = faiss.deserialize_index(data["index_bytes"])
            return idx, list(data["id_map"])
    raise ValueError("Invalid FAISS pickle. Expect 'index' or 'index_bytes' with 'id_map'.")

def safe_text(x: Any, default: str = "") -> str:
    if not x:
        return default
    s = str(x).strip()
    return s or default

def clean_text(s: Any, max_chars: int = 350) -> str:
    t = safe_text(s)
    t = re.sub(r"\s+", " ", t).strip()
    if len(t) > max_chars:
        t = t[: max_chars - 1].rstrip() + "…"
    return t

def as_skills_list(x: Any) -> List[str]:
    if x is None:
        return []
    if isinstance(x, list):
        return [str(i).strip() for i in x if str(i).strip()]
    if isinstance(x, str):
        parts = re.split(r"[;,]", x)
        return [p.strip() for p in parts if p.strip()]
    return [str(x).strip()]

def skills_line(skills: List[str], max_count: int = 8) -> str:
    if not skills:
        return "Not specified"
    short = skills[:max_count]
    extra = len(skills) - len(short)
    return f"{', '.join(short)} (+{extra} more)" if extra > 0 else ", ".join(short)

def extract_responsibilities(description: str) -> List[str]:
    if not description:
        return []
    text = re.sub(r"\s+", " ", str(description)).strip()
    bullets = re.findall(r"(?:^|[•\-\u2022])\s*([^•\-\n]{6,120})", text)
    bullets = [b.strip(" .") for b in bullets if b.strip()]
    if bullets:
        return bullets[:6]
    sents = re.split(r"(?<=[.!?])\s+", text)
    sents = [s.strip() for s in sents if len(s.strip()) > 10]
    return sents[:5]

def format_job_list_markdown(jobs: List[Dict[str, Any]]) -> str:
    lines = ["Here are the top job matches:", ""]
    for j in jobs:
        idx = j.get("result_index") or "?"
        title = j.get("title") or "Untitled Role"
        company = j.get("company") or ""
        where = j.get("location") or ""
        desc = j.get("summary") or ""
        skills = skills_line(j.get("skills") or [])
        salary = j.get("salary") or "Not specified"
        url = j.get("url") or "#"

        header = f"{idx}. {title}"
        if company or where:
            header += f" — {company}{', ' if (company and where) else ''}{where}"

        lines.extend([
            header,
            f"Responsibilities: {desc}",
            f"Key Skills: {skills}",
            f"Salary: {salary}",
            f"Apply Here: {url}",
            "",
        ])
    return "\n".join(lines).strip()

def format_job_details_markdown(job: Dict[str, Any]) -> str:
    title = job.get("title") or "Untitled Role"
    company = job.get("company") or ""
    where = job.get("location") or ""
    header = f"{title}"
    if company or where:
        header += f" — {company}{', ' if (company and where) else ''}{where}"

    responsibilities = job.get("responsibilities") or []
    resp_md = "- " + "\n- ".join(responsibilities) if responsibilities else "Not specified"

    skills = skills_line(job.get("skills") or [])
    salary = job.get("salary") or "Not specified"
    url = job.get("url") or "#"
    desc = job.get("full_description") or job.get("summary") or ""

    return f"""
{header}

Summary:
{desc}

Responsibilities:
{resp_md}

Key Skills: {skills}

Salary: {salary}

Apply Here: {url}
""".strip()

def build_presentable_job(doc: Dict[str, Any]) -> Dict[str, Any]:
    title = safe_text(doc.get("Title") or doc.get("title"), "Untitled Role")
    company = safe_text(doc.get("Company") or doc.get("company"))
    location = safe_text(doc.get("City") or doc.get("Location") or doc.get("location"))
    url = safe_text(doc.get("Job URL") or doc.get("URL") or doc.get("url"), "#")
    description = safe_text(doc.get("Description") or doc.get("description"))
    skills = as_skills_list(doc.get("Skills"))

    salary_lower = doc.get("salary_lower") or doc.get("SalaryLower") or doc.get("Salary")
    salary_upper = doc.get("salary_upper") or doc.get("SalaryUpper")
    currency = safe_text(doc.get("Currency") or doc.get("currency")) or None
    if salary_lower and salary_upper:
        salary = f"{salary_lower} - {salary_upper}" + (f" {currency}" if currency else "")
    else:
        salary = "Not specified" if not salary_lower and not salary_upper else f"{salary_lower or salary_upper} {currency or ''}"

    return {
        "mongo_id": str(doc.get("_id")) if doc.get("_id") else None,
        "title": title,
        "company": company,
        "location": location,
        "url": url,
        "skills": skills,
        "salary": salary,
        "summary": clean_text(description, 250),
        "full_description": clean_text(description, 1200),
        "responsibilities": extract_responsibilities(description),
    }

def embed(text: str) -> np.ndarray:
    if not embedder:
        raise RuntimeError("Embedding model not loaded.")
    v = embedder.encode([text])[0].astype("float32")
    return v

# Chat + Last Jobs Persistence
def save_chat(user_id: str, sender: str, message: str):
    """Save a chat message with proper structure"""
    doc = {
        "user_id": user_id,
        "sender": sender,
        "message": message,
        "timestamp": datetime.utcnow()
    }
    print(f"💾 Saving message: {doc}")  # Add this
    result = chat_collection.insert_one(doc)
    print(f"Saved with ID: {result.inserted_id}")  # Add this
    return result

def save_last_jobs(user_id: str, jobs: list):
    last_jobs_collection.update_one(
        {"user_id": user_id},
        {"$set": {"jobs": jobs, "timestamp": datetime.utcnow()}},
        upsert=True
    )

def get_last_jobs_for_user(user_id: str):
    doc = last_jobs_collection.find_one({"user_id": user_id})
    if doc and "jobs" in doc:
        return doc["jobs"]
    return []

def _wipe_user_chat(user_id: str) -> Dict[str, int]:
    msg_res = chat_collection.delete_many({"user_id": user_id})
    jobs_res = last_jobs_collection.delete_one({"user_id": user_id})
    return {
        "messages_deleted": msg_res.deleted_count,
        "last_jobs_deleted": 1 if jobs_res.acknowledged and jobs_res.deleted_count else 0,
    }

# =========================
# Startup
# =========================
print("⏳ Initializing services...")
try:
    embedder = SentenceTransformer(EMBED_MODEL_NAME)
    print(f"✅ Loaded embedder: {EMBED_MODEL_NAME}")
except Exception as e:
    print("❌ Failed to load SentenceTransformer:", e)
    embedder = None

try:
    if not os.path.exists(FAISS_FILE):
        print("⏳ Downloading FAISS index...")
        stream_download(FAISS_URL, FAISS_FILE)
    idx, mapping = load_faiss_pickle(FAISS_FILE)
    index = idx
    id_map = list(mapping)
    print(f"✅ FAISS loaded: vectors={index.ntotal}, dim={index.d}")
except Exception as e:
    print("❌ Failed to load FAISS index:", e)
    index = None
    id_map = []

# =========================
# Models
# =========================
class RetrieveRequest(BaseModel):
    user_id: str
    message: str
    top_k: Optional[int] = 10

class FollowupRequest(BaseModel):
    user_id: str
    message: str

# =========================
# Endpoints
# =========================
@app.get("/chat/history/{user_id}")
def get_chat_history(user_id: str, minutes: Optional[int] = 60):
    """Return only the last `minutes` of messages (default 60)."""
    try:
        mins = int(minutes or 60)
    except Exception:
        mins = 60
    cutoff = datetime.utcnow() - timedelta(minutes=mins)
    q = {"user_id": user_id, "timestamp": {"$gte": cutoff}}
    chats = list(chat_collection.find(q).sort("timestamp", 1))
    for c in chats:
        c["_id"] = str(c["_id"])
    print(f"Found {len(chats)} messages for {user_id}")  # Add this
    return chats

@app.get("/last-jobs/{user_id}")
def get_last_jobs(user_id: str):
    doc = last_jobs_collection.find_one({"user_id": user_id})
    if not doc:
        return {"jobs": []}
    return {"jobs": doc.get("jobs", [])}

@app.post("/retrieve-jobs")
async def retrieve_jobs(payload: RetrieveRequest):
    if index is None:
        raise HTTPException(status_code=500, detail="FAISS index not loaded.")
    query = (payload.message or "").strip()
    if not query:
        return {"results": [], "display_markdown": "No query provided."}

    save_chat(payload.user_id, "user", query)

    qv = embed(query)
    D, I = index.search(np.array([qv]), k=payload.top_k)

    candidates = []
    for faiss_idx in I[0]:
        if faiss_idx == -1 or faiss_idx >= len(id_map):
            continue
        mongo_id = id_map[faiss_idx]
        doc = jobs_collection.find_one({"_id": ObjectId(mongo_id)})
        if doc:
            candidates.append(build_presentable_job(doc))

    visible = candidates[:payload.top_k]
    save_last_jobs(payload.user_id, visible)
    for i, j in enumerate(visible, start=1):
        j["result_index"] = i

    display = format_job_list_markdown(visible)
    save_chat(payload.user_id, "bot", display)

    return {"results": visible, "display_markdown": display}

@app.get("/job-details/{index}")
def job_details(index: int, user_id: str):
    """Return markdown details for a 1-based job index from the user's last list."""
    jobs = get_last_jobs_for_user(user_id)
    if not jobs or index < 1 or index > len(jobs):
        return {"display_markdown": "No details found."}
    details = format_job_details_markdown(jobs[index - 1])
    save_chat(user_id, "bot", details)
    return {"display_markdown": details}

@app.post("/followup")
async def followup(payload: FollowupRequest):
    save_chat(payload.user_id, "user", payload.message)
    m = re.search(r"(?:job\s+)?(\d{1,2})", payload.message.lower())
    if m:
        idx = int(m.group(1))
        jobs = get_last_jobs_for_user(payload.user_id)
        if 0 < idx <= len(jobs):
            details = format_job_details_markdown(jobs[idx - 1])
            save_chat(payload.user_id, "bot", details)
            return {"display_markdown": details}
    msg = "Try: 'details for job 1'."
    save_chat(payload.user_id, "bot", msg)
    return {"display_markdown": msg}

# ---- Chat management (New Chat / Delete Chat) ----
@app.post("/chat/new")
def start_new_chat(payload: Dict[str, str] = Body(...)):
    print(f"🆕 New chat requested for {payload.get('user_id')}")  # Add this
    user_id = (payload.get("user_id") or "").strip()
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id required")
    result = _wipe_user_chat(user_id)
    return {"status": "ok", "action": "new_session", **result}

@app.delete("/chat/history/{user_id}")
def delete_chat(user_id: str):
    user_id = (user_id or "").strip()
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id required")
    result = _wipe_user_chat(user_id)
    return {"status": "ok", "action": "delete_chat", **result}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5010)