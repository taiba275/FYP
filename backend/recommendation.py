from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from pymongo import MongoClient
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
import os
import math
import numpy as np
import faiss
from bson import ObjectId
from fastapi import Request
from fastapi import HTTPException
from fastapi import Body
from fastapi import UploadFile, File
import fitz  # PyMuPDF
import docx
import re


# Load env
load_dotenv()
MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")

# App + DB setup
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
client = MongoClient(MONGO_URI)
db = client["test"]
jobs_collection = db["PreprocessedCombinedData"]

# Model
model = SentenceTransformer("all-MiniLM-L6-v2")
embedding_dim = 384  # based on MiniLM-L6-v2

# FAISS Globals
skills_index = None
title_index = None
job_docs = []

# Input model
class UserProfile(BaseModel):
    skills: List[str]
    qualification: str
    experience: int
    location: str

# Helper
def safe_str(value):
    try:
        if value is None:
            return ""
        if isinstance(value, float) and (math.isnan(value) or math.isinf(value)):
            return ""
        return str(value).strip()
    except:
        return ""

def normalize_vector(vec):
    vec = np.array(vec, dtype="float32")
    norm = np.linalg.norm(vec)
    return vec / norm if norm > 0 else vec

@app.on_event("startup")
def build_faiss_indices():
    global skills_index, title_index, job_docs

    print("🚀 Building FAISS indices...")

    # STEP 1: Backfill embeddings for jobs that are missing them
    jobs_to_update = list(jobs_collection.find({
        "$or": [
            {"skills_embedding": {"$exists": False}},
            {"title_embedding": {"$exists": False}}
        ]
    }))

    print(f"🛠 Backfilling {len(jobs_to_update)} jobs without embeddings...")

    for job in jobs_to_update:
        try:
            skills_text = safe_str(job.get("Skills"))
            title_text = safe_str(job.get("Title"))
            if not skills_text or not title_text:
                continue

            skills_vec = normalize_vector(model.encode(skills_text))
            title_vec = normalize_vector(model.encode(title_text))

            if len(skills_vec) != embedding_dim or len(title_vec) != embedding_dim:
                continue

            jobs_collection.update_one(
                {"_id": job["_id"]},
                {
                    "$set": {
                        "skills_embedding": skills_vec.tolist(),
                        "title_embedding": title_vec.tolist()
                    }
                }
            )

        except Exception as e:
            print(f"⚠️ Failed to backfill job {_id}: {e}")

    # STEP 2: Load jobs with embeddings into FAISS (same as before)
    jobs = list(jobs_collection.find({
        "skills_embedding": {"$exists": True},
        "title_embedding": {"$exists": True}
    }))

    if not jobs:
        print("❌ No jobs with required embeddings found.")
        return

    skills_vectors = []
    title_vectors = []
    job_docs.clear()

    for job in jobs:
        try:
            skills_vec = normalize_vector(job["skills_embedding"])
            title_vec = normalize_vector(job["title_embedding"])
            if len(skills_vec) == embedding_dim and len(title_vec) == embedding_dim:
                skills_vectors.append(skills_vec)
                title_vectors.append(title_vec)
                job_docs.append(job)
        except Exception as e:
            print(f"⚠️ Skipped a job due to vector error: {e}")

    if not skills_vectors:
        print("❌ No valid vectors to index.")
        return

    # Convert to numpy
    skills_matrix = np.array(skills_vectors, dtype="float32")
    title_matrix = np.array(title_vectors, dtype="float32")

    # Build FAISS indices
    skills_index = faiss.IndexFlatIP(embedding_dim)
    skills_index.add(skills_matrix)

    title_index = faiss.IndexFlatIP(embedding_dim)
    title_index.add(title_matrix)

    print(f"✅ FAISS indices built: {len(job_docs)} jobs loaded")


@app.post("/recommend")
def recommend_jobs(user: UserProfile):
    try:
        if not skills_index or not title_index or not job_docs:
            return JSONResponse(status_code=500, content={"error": "FAISS index not ready"})

        # Prepare user vectors
        user_skills_str = " ".join(user.skills).lower()
        user_skills_vec = normalize_vector(model.encode(user_skills_str)).reshape(1, -1)

        user_title_str = user_skills_str  # assume job intent based on skills
        user_title_vec = normalize_vector(model.encode(user_title_str)).reshape(1, -1)

        # Get top 50 from both
        _, top_skill_ids = skills_index.search(user_skills_vec, 50)
        _, top_title_ids = title_index.search(user_title_vec, 50)

        # Merge and deduplicate indices
        matched_ids = list(set(top_skill_ids[0]) | set(top_title_ids[0]))

        recommendations = []

        for idx in matched_ids:
            job = job_docs[idx]
            job['_id'] = str(job['_id'])

            # Skills similarity
            skill_sim = float(np.dot(user_skills_vec, normalize_vector(job["skills_embedding"])))
            # Title similarity
            title_sim = float(np.dot(user_title_vec, normalize_vector(job["title_embedding"])))

            # Rule-based scoring
            job_qual = safe_str(job.get("Minimum Education")).lower()
            job_city = safe_str(job.get("Job Location")).lower()

            # Safe experience parsing
            try:
                job_exp = int(safe_str(job.get("Experience")).split()[0])
            except:
                job_exp = 0

            qual_score = 1.0 if user.qualification.lower() in job_qual else 0.5 if job_qual else 0.0
            exp_score = 1.0 if abs(user.experience - job_exp) <= 2 else 0.5 if user.experience >= job_exp else 0.0
            loc_score = 1.0 if user.location.lower() in job_city else 0.0

            # Final weighted score
            final_score = (
                0.4 * skill_sim +
                0.25 * title_sim +
                0.15 * qual_score +
                0.1 * exp_score +
                0.1 * loc_score
            )

            recommendations.append({
                "Title": safe_str(job.get("Title")),
                "Company": safe_str(job.get("Company")),
                "City": safe_str(job.get("Job Location")),
                "Experience": safe_str(job.get("Experience")),
                "Job Type": safe_str(job.get("Job Type")),
                "Posting Date": safe_str(job.get("Posting Date")),
                "Apply Before": safe_str(job.get("Apply Before")),
                "Salary": safe_str(job.get("Salary")),
                "Job URL": safe_str(job.get("Job URL")),
                "Description": safe_str(job.get("Description")),
                "Skills": safe_str(job.get("Skills")),
                "score": f"{round(final_score * 100, 2)}%"
            })

        # Sort top 10
        recommendations = sorted(recommendations, key=lambda x: float(x["score"].replace("%", "")), reverse=True)[:10]

        print("✅ Recommendations:", [r["Title"] for r in recommendations])
        return recommendations

    except Exception as e:
        print("🔥 Exception:", e)
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/update-faiss")
async def update_faiss(job: dict):
    job_id = str(job.get("jobId"))
    title = job.get("title", "")
    skills = job.get("skills", "")

    title_vec = normalize_vector(model.encode(title)).tolist()
    skills_vec = normalize_vector(model.encode(skills)).tolist()

    # Store embeddings in MongoDB
    job_in_db = jobs_collection.find_one_and_update(
        {"_id": ObjectId(job_id)},
        {
            "$set": {
                "skills_embedding": skills_vec,
                "title_embedding": title_vec
            }
        },
        return_document=True,
    )

    if not job_in_db:
        raise HTTPException(status_code=404, detail="Job not found in DB")

    # Update FAISS
    job_docs.append(job_in_db)
    skills_index.add(np.array([skills_vec], dtype="float32"))
    title_index.add(np.array([title_vec], dtype="float32"))

    return {"success": True, "message": "Job embedded and indexed."}


@app.post("/delete-faiss")
async def delete_from_faiss(payload: dict = Body(...)):
    job_id = payload.get("jobId")
    if not job_id:
        raise HTTPException(status_code=400, detail="Job ID is required")

    global job_docs, skills_index, title_index

    # Find job index
    found_idx = -1
    for i, job in enumerate(job_docs):
        if str(job.get("_id")) == job_id:
            found_idx = i
            break

    if found_idx == -1:
        raise HTTPException(status_code=404, detail="Job not found in FAISS memory")

    try:
        # Remove job from FAISS memory
        job_docs.pop(found_idx)

        # Rebuild indices (FAISS doesn't support in-place delete)
        print(f"🧹 Rebuilding FAISS index after deleting job {job_id}...")
        skills_vectors = [normalize_vector(job["skills_embedding"]) for job in job_docs]
        title_vectors = [normalize_vector(job["title_embedding"]) for job in job_docs]

        skills_index = faiss.IndexFlatIP(embedding_dim)
        title_index = faiss.IndexFlatIP(embedding_dim)

        skills_index.add(np.array(skills_vectors, dtype="float32"))
        title_index.add(np.array(title_vectors, dtype="float32"))

        print(f"🗑️ Job removed from FAISS index: {job_id}")
        print(f"✅ FAISS indices built: {len(job_docs)} jobs loaded")
        return {"success": True, "message": "Job deleted from FAISS index"}
    except Exception as e:
        print(f"❌ Error while deleting from FAISS: {e}")
        raise HTTPException(status_code=500, detail="Internal error deleting job")
    
@app.post("/extract-resume")
async def extract_resume(resume: UploadFile = File(...)):
    try:
        content = ""
        if resume.filename.endswith(".pdf"):
            doc = fitz.open(stream=await resume.read(), filetype="pdf")
            content = "\n".join([page.get_text() for page in doc])
        elif resume.filename.endswith(".docx"):
            file_bytes = await resume.read()
            with open("temp.docx", "wb") as f:
                f.write(file_bytes)
            doc = docx.Document("temp.docx")
            content = "\n".join([p.text for p in doc.paragraphs])
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")

        content = content.lower()

        # Extract example skills (you can customize these)
        skills = re.findall(r"\b(?:python|react|node|html|css|django|ml|ai|seo)\b", content)

        # Qualification extraction
        qualification = "Other"
        qual_levels = ["phd", "master", "bachelor", "intermediate", "matric"]
        for q in qual_levels:
            if q in content:
                qualification = q.capitalize()
                break


        # Experience extraction
        match_exp = re.search(r"(\d+)\s*(?:years|yrs|year)", content)
        experience = match_exp.group(1) if match_exp else "0"

        # City extraction
        cities = ["karachi", "lahore", "islamabad", "rawalpindi", "multan", "peshawar", "quetta"]
        location = next((c.capitalize() for c in cities if c in content), "")

        return {
            "skills": ", ".join(set(skills)).title(),
            "qualification": qualification,
            "experience": experience,
            "location": location
        }
    except Exception as e:
        print("❌ Error parsing resume:", e)
        raise HTTPException(status_code=500, detail="Failed to parse resume")




