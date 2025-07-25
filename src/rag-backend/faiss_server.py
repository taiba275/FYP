from flask import Flask, request, jsonify
import pickle
from sentence_transformers import SentenceTransformer
import numpy as np

app = Flask(__name__)

# Load FAISS index and job metadata
with open("job_faiss_index.pkl", "rb") as f:
    data = pickle.load(f)

index = data["index"]
jobs = data["jobs"]
model = SentenceTransformer("all-MiniLM-L6-v2")

@app.route("/retrieve-jobs", methods=["POST"])
def retrieve_jobs():
    content = request.json.get("message", "")
    if not content:
        return jsonify({"error": "Empty message"}), 400

    # Embed the query
    query_embedding = model.encode([content])
    D, I = index.search(np.array(query_embedding), k=3)  # top 3 results

    results = []
    for i in I[0]:
        job = jobs[i]
        results.append({
            "title": job.get("Title", "Unknown"),
            "description": job.get("Description", "No description"),
            "url": job.get("Job URL", "#")
        })

    return jsonify({"results": results})

if __name__ == "__main__":
    app.run(port=5005)
