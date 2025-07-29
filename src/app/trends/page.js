"use client";
import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const industries = [
  "All Industries",
  "Computer Science",
  "Business & Product",
  "Sales & Marketing",
  "Design",
  "Finance & Accounting",
  "Healthcare",
  "HR & Admin",
  "Legal",
  "Education",
  "Construction & Engineering",
  "Logistics",
  "Hospitality",
  "Customer Service",
  "Other",
];

export default function TrendsPage() {
  const [selectedIndustry, setSelectedIndustry] = useState("All Industries");
  const [roleData, setRoleData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const res = await fetch(`http://localhost:8000/trends/${selectedIndustry}`);
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.detail || "Unknown error");
        }

        setRoleData(json.roles || []);
        setError(null);
      } catch (err) {
        console.error("Failed to load trends:", err);
        setError(err.message || "Failed to fetch trends.");
        setRoleData([]);
      }
    };

    fetchTrends();
  }, [selectedIndustry]);

  const buildChartData = (label, field, color) => ({
    labels: roleData.map((r) => r.title),
    datasets: [
      {
        label,
        data: roleData.map((r) => r[field] !== null ? r[field] : null),
        backgroundColor: color,
        borderColor: color,
        tension: 0.3,
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  });

  const chartOptions = (title) => ({
    responsive: true,
    plugins: {
      legend: { display: true },
      title: {
        display: true,
        text: title,
        font: { size: 18 },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: (value) => `${value}`,
        },
      },
    },
  });

  // 🔁 Dynamic forecast label logic
  const forecastLabel = (() => {
    const forecasts = roleData.map((r) => r.forecast).filter((v) => v !== null);
    const allNegative = forecasts.length > 0 && forecasts.every((v) => v < 0);
    const allPositive = forecasts.length > 0 && forecasts.every((v) => v >= 0);
    if (allNegative) return "Forecasted Decline (%)";
    if (allPositive) return "Forecasted Growth (%)";
    return "Forecasted Change (%)";
  })();

  return (
    <div className="container p-4">
      <h2 className="text-center mb-4">📈 Job Trends by Industry</h2>

      {/* Industry Dropdown */}
      <div className="text-center mb-4">
        <label className="form-label me-2"><strong>Select Industry:</strong></label>
        <select
          className="form-select d-inline w-auto"
          value={selectedIndustry}
          onChange={(e) => setSelectedIndustry(e.target.value)}
        >
          {industries.map((ind) => (
            <option key={ind} value={ind}>
              {ind}
            </option>
          ))}
        </select>
      </div>

      {/* Error or No Data */}
      {error && <p className="text-danger text-center">⚠️ {error}</p>}
      {!error && roleData.length === 0 && (
        <p className="text-muted text-center">No trend data found for this industry.</p>
      )}

      {/* Line Chart: Job Role Count */}
      {roleData.length > 0 && (
        <div
          className="mb-5"
          style={{
            height: selectedIndustry === "All Industries" ? "500px" : "320px",
          }}
        >
          <Line
            data={buildChartData("Number of Job Postings", "count", "#4B9CD3")}
            options={chartOptions("📊 Current Job Role Demand")}
          />
        </div>
      )}

      {/* Line Chart: Forecasted Trend */}
      {roleData.length > 0 && selectedIndustry !== "All Industries" ? (
        <div style={{ height: "320px" }}>
          <Line
            data={buildChartData(forecastLabel, "forecast", "#72C472")}
            options={chartOptions(`📉 ${forecastLabel}`)}
          />
        </div>
      ) : selectedIndustry === "All Industries" && roleData.length > 0 && (
        <p className="text-center text-muted">Forecast not available for All Industries.</p>
      )}
    </div>
  );
}
