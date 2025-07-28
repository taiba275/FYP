import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.stattools import adfuller
from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables from .env file (optional)
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Use specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection string (replace or use .env)
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb+srv://UMT:Saranghae_275@cluster0.um52i.mongodb.net/test?retryWrites=true&w=majority")
client = MongoClient(MONGODB_URI)
db = client["test"]  # Replace with your DB name if different
collection = db["PreprocessedCombinedData"]  # Replace with your collection name

@app.get("/predict-trends")
def predict_trends():
    # Fetch job postings from MongoDB
    cursor = collection.find({}, {"Posting Date": 1})
    dates = [doc.get("Posting Date") for doc in cursor if doc.get("Posting Date")]

    if not dates:
        return {"error": "No valid 'Posting Date' found in MongoDB."}

    df = pd.DataFrame({"Date": pd.to_datetime(dates, errors='coerce')})
    df.dropna(subset=["Date"], inplace=True)

    df['Year'] = df['Date'].dt.year
    df['Month'] = df['Date'].dt.month

    monthly_counts = df.groupby(['Year', 'Month']).size().reset_index(name='Job Count')

    if len(monthly_counts) < 8:
        return {"error": "Not enough data for ARIMA. Need at least 8 months."}

    train_data = monthly_counts['Job Count'][:8]
    train_data_diff = train_data.diff().dropna()

    adf = adfuller(train_data_diff)
    if adf[1] >= 0.05:
        train_data_diff = train_data_diff.diff().dropna()

    model = ARIMA(train_data_diff.values, order=(1, 1, 1))
    model_fit = model.fit()
    forecast = model_fit.forecast(steps=3)

    # Static return data (you can improve this later)
    job_roles = ['Software Engineer', 'Data Scientist', 'Product Manager', 'AI Specialist']
    job_growth = [15, 25, 10, 35]
    skills = ['Python', 'Machine Learning', 'Cloud Computing', 'Data Analysis']
    skills_growth = [30, 40, 25, 20]

    return {
        "roles": [{"title": t, "growth": g} for t, g in zip(job_roles, job_growth)],
        "skills": [{"skill": s, "growth": g} for s, g in zip(skills, skills_growth)],
        "forecast_raw": forecast.tolist()
    }



# from fastapi import FastAPI, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from typing import Dict

# app = FastAPI()

# # Allow requests from your frontend origin
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:3000"],  # Adjust for production
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Mock domain-wise skill trends data
# MOCK_TREND_DATA: Dict[str, Dict[str, int]] = {
#     "computers": {
#         "Machine Learning": 95,
#         "Artificial Intelligence": 92,
#         "Cloud Computing": 85,
#         "Data Analytics": 80,
#         "Python": 78,
#         "Cybersecurity": 75,
#         "DevOps": 72,
#         "Blockchain": 65,
#         "Web Development": 62,
#         "UI/UX Design": 55
#     },
#     "medical": {
#         "Telemedicine": 90,
#         "Healthcare Data Analysis": 82,
#         "Clinical Research": 79,
#         "Genetics": 77,
#         "Medical Imaging": 75,
#         "AI in Healthcare": 72,
#         "Robotic Surgery": 68,
#         "Pharmacology": 66,
#         "Public Health": 60,
#         "Nursing Informatics": 55
#     },
#     "finance": {
#         "Fintech": 94,
#         "Blockchain": 90,
#         "Quantitative Analysis": 85,
#         "Risk Management": 82,
#         "Financial Modeling": 80,
#         "Investment Strategy": 78,
#         "Data Analysis": 75,
#         "Excel + Power BI": 72,
#         "RegTech": 70,
#         "Accounting Tech": 65
#     }
# }

# @app.get("/api/trends/{domain}")
# async def get_trends(domain: str):
#     domain_lower = domain.lower()
#     if domain_lower in MOCK_TREND_DATA:
#         return {
#             "domain": domain_lower,
#             "skills": MOCK_TREND_DATA[domain_lower]
#         }
#     else:
#         raise HTTPException(status_code=404, detail="Domain not found")


