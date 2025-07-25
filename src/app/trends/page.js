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
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/predict-trends")
      .then((res) => res.json())
      .then((json) => {
        console.log("Received trend data:", json);

        // Check for server-side error message
        if (json.error) {
          setError(json.error);
        } else {
          setData(json);
        }
      })
      .catch((err) => {
        console.error("Failed to load trend data:", err);
        setError("Failed to connect to trend prediction server.");
      });
  }, []);

  // Show loading
  if (!data && !error) {
    return <p className="text-center mt-4">Loading trends...</p>;
  }

  // Show error message
  if (error) {
    return <p className="text-danger text-center mt-4">⚠️ {error}</p>;
  }

  // Validate data structure
  if (!Array.isArray(data.roles) || !Array.isArray(data.skills)) {
    return <p className="text-danger text-center mt-4">⚠️ Invalid trend data format received.</p>;
  }

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




// 'use client';

// import React, { useEffect, useState } from 'react';
// import { useParams } from 'next/navigation';
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
// } from 'recharts';

// export default function DomainTrendsPage() {
//   const { domain } = useParams();
//   const [skillData, setSkillData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(false);

//   useEffect(() => {
//     if (!domain) return;

//     setLoading(true);
//     setError(false);

//     fetch(`http://localhost:8000/api/trends/${domain}`)
//       .then(res => {
//         if (!res.ok) throw new Error('Domain not found');
//         return res.json();
//       })
//       .then(data => {
//         const skillsArray = Object.entries(data.skills).map(([skill, count]) => ({
//           skill,
//           count,
//         }));
//         setSkillData(skillsArray);
//         setLoading(false);
//       })
//       .catch(err => {
//         console.error('Error fetching skill trends:', err);
//         setError(true);
//         setSkillData([]);
//         setLoading(false);
//       });
//   }, [domain]);

//   if (loading) return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</p>;
//   if (error) return <p style={{ textAlign: 'center', color: 'red' }}>Error loading data for domain: {domain}</p>;

//   return (
//     <div style={{ padding: '2rem' }}>
//       <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>
//         Top Skills in {domain.charAt(0).toUpperCase() + domain.slice(1)}
//       </h2>

//       <ResponsiveContainer width="100%" height={400}>
//         <BarChart
//           data={skillData}
//           margin={{ top: 20, right: 30, left: 0, bottom: 50 }}
//         >
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="skill" angle={-30} textAnchor="end" interval={0} />
//           <YAxis />
//           <Tooltip />
//           <Bar dataKey="count" fill="#0070f3" />
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }


