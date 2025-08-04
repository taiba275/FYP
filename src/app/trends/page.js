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
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState("All Industries");
  const [roleData, setRoleData] = useState([]);
  const [error, setError] = useState(null);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setHasTimedOut(false);
    setLoading(true);

    const timeout = setTimeout(() => {
      setHasTimedOut(true);
      setLoading(false);
    }, 40000); // 40 seconds

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
      } finally {
        clearTimeout(timeout);
        setLoading(false);
      }
    };

    fetchTrends();

    return () => clearTimeout(timeout);
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
    maintainAspectRatio: false,

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

  const forecastLabel = (() => {
    const forecasts = roleData.map((r) => r.forecast).filter((v) => v !== null);
    const allNegative = forecasts.length > 0 && forecasts.every((v) => v < 0);
    const allPositive = forecasts.length > 0 && forecasts.every((v) => v >= 0);
    if (allNegative) return "Forecasted Decline (%)";
    if (allPositive) return "Forecasted Growth (%)";
    return "Forecasted Change (%)";
  })();

  return (
    <div>
      {/* Industry Dropdown */}
      <div className="flex text-black flex-wrap p-2 mx-8 bg-[#ededed] rounded-lg gap-4 z-10 items-center">
        <div>
          <h1 className="text-center font-bold text-lg ml-5">Job Trends by Industry</h1>
        </div>
        <div
          className="relative bg-white w-[500px] rounded-lg px-2 py-2"
          onMouseEnter={() => {
            clearTimeout(window.hideTimeout);
            setShowDropdown(true);
          }}
          onMouseLeave={() => {
            window.hideTimeout = setTimeout(() => setShowDropdown(false), 300);
          }}
        >
          <div className="flex justify-between items-center cursor-pointer">
            <span>{selectedIndustry}</span>
            <svg
              className={`w-5 h-5 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {showDropdown && (
            <div className="absolute z-50 left-0 bg-white border rounded shadow w-[500px] mt-3 max-h-60 overflow-y-auto custom-scrollbar">
              {industries.map((industry, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setSelectedIndustry(industry);
                    setShowDropdown(false);
                  }}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                >
                  {industry}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Loading Animation */}
      {loading && (
        <div className="w-full h-[50vh] flex flex-col justify-center items-center bg-white">
            <div className="custom-loader wrapper scale-[1.4] mb-6">
              <div className="circle"></div>
              <div className="circle"></div>
              <div className="circle"></div>
            </div>
            <p className="text-gray-700 text-xl font-semibold mb-1">
              Loading Job Trends for You…
            </p>
            <p className="text-gray-500 text-base">
              Please wait while we fetch the current & forecasted trends
            </p>
          </div>
      )}

      {/* Error or No Data */}
      {!loading && error && <p className="text-danger text-center">⚠️ {error}</p>}
      {!loading && !error && hasTimedOut && roleData.length === 0 && (
        <p className="text-muted text-center">No trend data found for this industry.</p>
      )}

      {/* Charts */}
      {!loading && roleData.length > 0 && (
        <div className="flex justify-center m-10">
          {/* Job Postings Chart */}
          <div className="flex-1 text-center" style={{ height: "600px" }}>
            <Line
              data={buildChartData("Number of Job Postings", "count", "#4B9CD3")}
              options={{
                ...chartOptions("Number of Job Postings"),
                onClick: (event, elements) => {
                  if (elements.length > 0) {
                    const index = elements[0].index;
                    const roleTitle = roleData[index].title;
                    const encoded = encodeURIComponent(roleTitle);
                    window.location.href = `/jobs/${encoded}`;
                  }
                },
              }}
            />
          </div>

          {/* Forecast Chart */}
          {roleData.some((r) => r.forecast !== null) ? (
<div className="flex-1 text-center" style={{ height: "600px" }}>

              <Line
                data={buildChartData(forecastLabel, "forecast", "#72C472")}
                options={chartOptions(forecastLabel)}
              />
            </div>
          ) : hasTimedOut ? (
            <div className="flex-1 text-center flex items-center justify-center text-muted">
              <p>Forecast data not available.</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}


