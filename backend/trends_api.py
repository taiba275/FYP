import os
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.stattools import adfuller
from pymongo import MongoClient
from dotenv import load_dotenv
from fastapi import Query

# Load environment variables
load_dotenv()
MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")

# FastAPI setup
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://fyp-e7ifx8lyj-mtti-bc46b27f.vercel.app", "http://localhost:3000"],  # tighten in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB setup
client = MongoClient(MONGO_URI)
db = client["test"]
jobs_collection = db["PreprocessedCombinedData"]

@app.get("/jobs-by-role")
def get_jobs_by_role(role: str = Query(...)):
    jobs = list(jobs_collection.find(
        {"ExtractedRole": role},
        {
            "_id": 1,
            "Title": 1,
            "Company": 1,
            "City": 1,
            "Area": 1,
            "Description": 1,
            "Salary": 1,
            "Remote": 1
        }
    ))

    # Convert ObjectId to string
    for job in jobs:
        job["_id"] = str(job["_id"])

    return {"jobs": jobs}

# Industry-role mapping
industry_map = {
    "Computer Science": [
        "Software Engineer", "Data Scientist", "AI Engineer", "DevOps Engineer", "Web Developer",
        "Mobile Developer", "IT Support Specialist", "Network Engineer", "Cybersecurity Analyst"
    ],
    "Business & Product": [
        "Product Manager", "Project Manager", "Business Analyst", "Operations Manager", "Scrum Master"
    ],
    "Sales & Marketing": [
        "Sales Executive", "Marketing Manager", "Digital Marketing Specialist",
        "SEO Specialist", "Content Writer"
    ],
    "Design": [
        "Graphic Designer", "UI/UX Designer", "Animator", "Video Editor"
    ],
    "Finance & Accounting": [
        "Accountant", "Financial Analyst", "Bookkeeper", "Auditor", "Tax Consultant"
    ],
    "Healthcare": [
        "Doctor", "Nurse", "Pharmacist", "Medical Technologist",
        "Lab Technician", "Radiologist", "Healthcare Assistant"
    ],
    "HR & Admin": [
        "HR Manager", "Recruiter", "Talent Acquisition Specialist", "Administrative Assistant"
    ],
    "Legal": [
        "Lawyer", "Legal Advisor", "Compliance Officer", "Paralegal"
    ],
    "Education": [
        "Teacher", "Lecturer", "Professor", "Academic Coordinator", "School Counselor"
    ],
    "Construction & Engineering": [
        "Civil Engineer", "Mechanical Engineer", "Electrical Engineer", "Construction Manager", "Architect"
    ],
    "Logistics": [
        "Supply Chain Manager", "Warehouse Supervisor", "Logistics Coordinator", "Inventory Analyst"
    ],
    "Hospitality": [
        "Barista", "Chef", "Waiter", "Hotel Manager", "Housekeeping Staff"
    ],
    "Customer Service": [
        "Customer Support Representative", "Call Center Agent", "Client Success Manager"
    ],
    "Other": [
        "General Manager", "Data Entry Operator", "Quality Assurance Officer", "Environmental Specialist"
    ]
}


@app.get("/trends/{industry}")
def get_trends_by_industry(industry: str):
    raw_jobs = list(jobs_collection.find({}, {"ExtractedRole": 1, "Posting Date": 1, "_id": 0}))
    df = pd.DataFrame(raw_jobs)

    if "ExtractedRole" not in df.columns or "Posting Date" not in df.columns:
        raise HTTPException(status_code=500, detail="Required columns missing in dataset")

    df["Posting Date"] = pd.to_datetime(df["Posting Date"], errors="coerce")
    # df.dropna(subset=["Posting Date"], inplace=True)

    if industry == "All Industries":
        role_counts = df["ExtractedRole"].value_counts().to_dict()
        top_roles = list(role_counts.keys())[:30]
        result = []

        for role in top_roles:
            role_df = df[df["ExtractedRole"] == role]
            ts = role_df.groupby(role_df["Posting Date"].dt.to_period("M")).size().sort_index()
            ts.index = ts.index.to_timestamp()

            growth = None
            if len(ts) >= 0:
                try:
                    train_data = ts.copy()
                    adf = adfuller(train_data)
                    model = ARIMA(train_data.values, order=(1, 1, 1))
                    model_fit = model.fit()
                    forecast = model_fit.forecast(steps=1)[0]
                    latest = train_data.iloc[-1]
                    growth = 0.0 if latest == 0 else round(((forecast - latest) / latest) * 100, 2)
                    print(f"🔮 {role} (All Industries): Forecast={forecast:.2f}, Latest={latest}, Growth={growth}%")
                except Exception as e:
                    print(f"⚠️ ARIMA failed for {role} (All Industries): {e}")
                    growth = 0.0
            else:
                print(f"⚠️ Not enough data for {role} (All Industries)")
                growth = 0.0

            result.append({
                "title": role,
                "count": role_counts[role],
                "forecast": growth
            })

        return {"roles": result}

    if industry not in industry_map:
        raise HTTPException(status_code=400, detail="Invalid industry")

    roles = industry_map[industry]
    filtered = df[df["ExtractedRole"].isin(roles)].copy()
    role_counts = filtered["ExtractedRole"].value_counts().to_dict()
    top_roles = list(role_counts.keys())[:10]

    result = []
    for role in top_roles:
        role_df = filtered[filtered["ExtractedRole"] == role]
        ts = role_df.groupby(role_df["Posting Date"].dt.to_period("M")).size().sort_index()
        ts.index = ts.index.to_timestamp()

        growth = None
        if len(ts) >= 0:
            try:
                train_data = ts.copy()
                adf = adfuller(train_data)
                model = ARIMA(train_data.values, order=(1, 1, 1))
                model_fit = model.fit()
                forecast = model_fit.forecast(steps=1)[0]
                latest = train_data.iloc[-1]
                growth = 0.0 if latest == 0 else round(((forecast - latest) / latest) * 100, 2)
                print(f"🔮 {role}: Forecast={forecast:.2f}, Latest={latest}, Growth={growth}%")
            except Exception as e:
                print(f"⚠️ ARIMA failed for {role}: {e}")
                growth = 0.0
        else:
            print(f"⚠️ Not enough data for {role} (months={len(ts)})")
            growth = 0.0

        result.append({
            "title": role,
            "count": role_counts[role],
            "forecast": growth
        })

    print(f"✅ Returning {len(result)} roles for {industry}")
    return {"roles": result}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

























# import pandas as pd
# from fastapi import FastAPI, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from statsmodels.tsa.arima.model import ARIMA
# from statsmodels.tsa.stattools import adfuller
# import os

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Load Excel
# DATA_PATH = os.path.join(os.path.dirname(__file__), "cleaned_dataset_final.xlsx")
# df = pd.read_excel(DATA_PATH)

# # Industry-role mapping
# industry_map = {
#     "Computer Science": [
#         "Software Engineer", "Data Scientist", "AI Engineer", "DevOps Engineer", "Web Developer",
#         "Mobile Developer", "IT Support Specialist", "Network Engineer", "Cybersecurity Analyst"
#     ],
#     "Business & Product": [
#         "Product Manager", "Project Manager", "Business Analyst", "Operations Manager", "Scrum Master"
#     ],
#     "Sales & Marketing": [
#         "Sales Executive", "Marketing Manager", "Digital Marketing Specialist",
#         "SEO Specialist", "Content Writer"
#     ],
#     "Design": [
#         "Graphic Designer", "UI/UX Designer", "Animator", "Video Editor"
#     ],
#     "Finance & Accounting": [
#         "Accountant", "Financial Analyst", "Bookkeeper", "Auditor", "Tax Consultant"
#     ],
#     "Healthcare": [
#         "Doctor", "Nurse", "Pharmacist", "Medical Technologist",
#         "Lab Technician", "Radiologist", "Healthcare Assistant"
#     ],
#     "HR & Admin": [
#         "HR Manager", "Recruiter", "Talent Acquisition Specialist", "Administrative Assistant"
#     ],
#     "Legal": [
#         "Lawyer", "Legal Advisor", "Compliance Officer", "Paralegal"
#     ],
#     "Education": [
#         "Teacher", "Lecturer", "Professor", "Academic Coordinator", "School Counselor"
#     ],
#     "Construction & Engineering": [
#         "Civil Engineer", "Mechanical Engineer", "Electrical Engineer", "Construction Manager", "Architect"
#     ],
#     "Logistics": [
#         "Supply Chain Manager", "Warehouse Supervisor", "Logistics Coordinator", "Inventory Analyst"
#     ],
#     "Hospitality": [
#         "Barista", "Chef", "Waiter", "Hotel Manager", "Housekeeping Staff"
#     ],
#     "Customer Service": [
#         "Customer Support Representative", "Call Center Agent", "Client Success Manager"
#     ],
#     "Other": [
#         "General Manager", "Data Entry Operator", "Quality Assurance Officer", "Environmental Specialist"
#     ]
# }

# @app.get("/trends/{industry}")
# def get_trends_by_industry(industry: str):
#     if "ExtractedRole" not in df.columns or "Posting Date" not in df.columns:
#         raise HTTPException(status_code=500, detail="Required columns missing in dataset")

#     df["Posting Date"] = pd.to_datetime(df["Posting Date"], errors="coerce")
#     df.dropna(subset=["Posting Date"], inplace=True)

#     if industry == "All Industries":
#         role_counts = df["ExtractedRole"].value_counts().to_dict()
#         top_roles = list(role_counts.keys())[:15]
#         return {"roles": [
#             {"title": role, "count": role_counts[role], "forecast": None}
#             for role in top_roles
#         ]}

#     if industry not in industry_map:
#         raise HTTPException(status_code=400, detail="Invalid industry")

#     roles = industry_map[industry]
#     filtered = df[df["ExtractedRole"].isin(roles)].copy()
#     role_counts = filtered["ExtractedRole"].value_counts().to_dict()
#     top_roles = list(role_counts.keys())[:10]

#     result = []
#     for role in top_roles:
#         role_df = filtered[filtered["ExtractedRole"] == role]
#         ts = role_df.groupby(role_df["Posting Date"].dt.to_period("M")).size().sort_index()
#         ts.index = ts.index.to_timestamp()

#         growth = None
#         if len(ts) >= 0:
#             try:
#                 train_data = ts.copy()
#                 adf = adfuller(train_data)
#                 model = ARIMA(train_data.values, order=(1, 1, 1))
#                 model_fit = model.fit()
#                 forecast = model_fit.forecast(steps=1)[0]
#                 latest = train_data.iloc[-1]
#                 growth = 0.0 if latest == 0 else round(((forecast - latest) / latest) * 100, 2)
#                 growth = round(((forecast - latest) / latest) * 100, 2)
#                 print(f"🔮 {role}: Forecast={forecast:.2f}, Latest={latest}, Growth={growth}%")
#             except Exception as e:
#                 print(f"⚠️ ARIMA failed for {role}: {e}")
#                 growth = 0.0
#         else:
#             print(f"⚠️ Not enough data for {role} (months={len(ts)})")
#             growth = 0.0


#         result.append({
#             "title": role,
#             "count": role_counts[role],
#             "forecast": growth
#         })

#     print(f"✅ Returning {len(result)} roles for {industry}")
#     return {"roles": result}
