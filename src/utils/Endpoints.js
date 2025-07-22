export const getRecommendedJobs = async (userId) => {
const response = await fetch(`http://localhost:8000/recommend?user_id=${userId}`);
  if (!response.ok) throw new Error('Failed to fetch recommendations');
  return response.json();
};