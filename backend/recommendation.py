from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from pymongo import MongoClient
from fastapi.middleware.cors import CORSMiddleware
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import os
from dotenv import load_dotenv

# Load .env file if it exists
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Enable CORS for frontend dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Connection
MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)
db = client["test"]  # Use 'test' as per your DB
jobs_collection = db["PreprocessedCombinedData"]

# Input schema
class UserProfile(BaseModel):
    skills: List[str]
    qualification: str
    experience: int
    location: str

# Job Recommendation Endpoint
@app.post("/recommend")
def recommend_jobs(user: UserProfile):
    all_jobs = list(jobs_collection.find({}))
    if not all_jobs:
        return []

    # Build combined text for each job
    for job in all_jobs:
        job['combined'] = (
            job.get('Skills', '') + " " +
            job.get('Minimum Education', '') + " " +
            job.get('Job Location', '') + " " +
            str(job.get('Experience', ''))
        )

    # Create TF-IDF matrix for jobs
    corpus = [job['combined'] for job in all_jobs]
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(corpus)

    # Vectorize user profile
    user_input = (
        " ".join(user.skills) + " " +
        user.qualification + " " +
        user.location + " " +
        str(user.experience)
    )
    user_vector = vectorizer.transform([user_input])
    similarities = cosine_similarity(user_vector, tfidf_matrix)[0]

    # Get top 10 job matches
    top_indices = similarities.argsort()[::-1][:10]
    recommendations = []

    for i in top_indices:
        job = all_jobs[i]
        job['_id'] = str(job['_id'])  # Convert ObjectId for frontend use
        # recommendations.append({
        #     "title": job.get("Title", ""),
        #     "location": job.get("Job Location", ""),
        #     "description": job.get("Description", ""),
        #     "score": round(float(similarities[i]), 3)

        recommendations.append({
            "Title": job.get("Title", ""),
            "Company": job.get("Company", ""),
            "City": job.get("Job Location", ""),
            "Experience": job.get("Experience", "Not mentioned"),
            "Job Type": job.get("Job Type", ""),
            "Posting Date": job.get("Posting Date", ""),
            "Apply Before": job.get("Apply Before", ""),
            "Salary": job.get("Salary", "Not mentioned"),
"Job URL": job.get("Job URL", ""),
            "Description": job.get("Description", ""),
            "Skills": job.get("Skills", ""),  # for skill list in modal
            "score": round(float(similarities[i]), 3)
        })
    return recommendations