import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.stattools import adfuller

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Use ["http://localhost:3000"] in dev or your domain in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/predict-trends")
def predict_trends():
    # Load the cleaned Excel dataset
    df = pd.read_excel("cleaned_dataset.xlsx")

    # Ensure 'Posting Date' exists and is datetime
    if 'Posting Date' not in df.columns:
        return {"error": "'Posting Date' column not found in dataset."}

    df['Date'] = pd.to_datetime(df['Posting Date'], errors='coerce')
    df.dropna(subset=['Date'], inplace=True)

    # Extract year and month
    df['Year'] = df['Date'].dt.year
    df['Month'] = df['Date'].dt.month

    # Group by month to count job postings
    monthly_counts = df.groupby(['Year', 'Month']).size().reset_index(name='Job Count')

    if len(monthly_counts) < 8:
        return {"error": "Not enough data for ARIMA. Need at least 8 months."}

    train_data = monthly_counts['Job Count'][:8]
    train_data_diff = train_data.diff().dropna()

    # ADF test for stationarity
    adf = adfuller(train_data_diff)
    if adf[1] >= 0.05:
        train_data_diff = train_data_diff.diff().dropna()  # second differencing

    # Fit ARIMA model
    model = ARIMA(train_data_diff.values, order=(1, 1, 1))
    model_fit = model.fit()
    forecast = model_fit.forecast(steps=3)

    # Return synthetic trend data (replace later with real analysis)
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


