import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.stattools import adfuller
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Excel
DATA_PATH = os.path.join(os.path.dirname(__file__), "cleaned_dataset_with_roles.xlsx")
df = pd.read_excel(DATA_PATH)

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
    if "ExtractedRole" not in df.columns or "Posting Date" not in df.columns:
        raise HTTPException(status_code=500, detail="Required columns missing in dataset")

    df["Posting Date"] = pd.to_datetime(df["Posting Date"], errors="coerce")
    df.dropna(subset=["Posting Date"], inplace=True)

    if industry == "All Industries":
        role_counts = df["ExtractedRole"].value_counts().to_dict()
        top_roles = list(role_counts.keys())[:15]
        return {"roles": [
            {"title": role, "count": role_counts[role], "forecast": None}
            for role in top_roles
        ]}

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
                growth = round(((forecast - latest) / latest) * 100, 2)
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
