"use client";
import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function TrendsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/Images/trend_output.json")
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error("Failed to load trend data:", err));
  }, []);

  if (!data) return <p className="text-center mt-4">Loading trends...</p>;

  // Job Role Chart Data
  const jobRoleChart = {
    labels: data.roles.map((r) => r.title),
    datasets: [
      {
        label: "Growth Forecast (%)",
        data: data.roles.map((r) => parseInt(r.growth)),
        backgroundColor: "#4B9CD3",
      },
    ],
  };

  // Skill Chart Data
  const skillChart = {
    labels: data.skills.map((s) => s.skill),
    datasets: [
      {
        label: "Demand Increase (%)",
        data: data.skills.map((s) => parseInt(s.growth)),
        backgroundColor: "#72C472",
      },
    ],
  };

  const barOptionsHorizontal = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "📊 Job Role Forecast", font: { size: 16 } },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { stepSize: 5 },
      },
    },
  };

  const barOptionsVertical = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "💡 Skill Demand Insights", font: { size: 16 } },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 5 },
      },
    },
  };

  return (
    <div className="container p-4">
      {/* Job Role Forecast Chart */}
      <div className="mb-5" style={{ maxWidth: "100%", height: "300px" }}>
        <Bar data={jobRoleChart} options={barOptionsHorizontal} />
      </div>

      {/* Skill Demand Insights Chart */}
      <div style={{ maxWidth: "100%", height: "300px" }}>
        <Bar data={skillChart} options={barOptionsVertical} />
      </div>
    </div>
  );
}
