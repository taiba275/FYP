import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
  Title: String,
  Company: String,
  "Job Location": String,
  Description: String,
  Salary: String,
  Skills: String, // comma-separated string
  Industry: String,
  "Functional Area": String,
  "Total Positions": String,
  "Job Shift": String,
  "Job Type": String,
  Gender: String,
  "Minimum Education": String,
  "Degree Title": String,
  "Career Level": String,
  "Apply Before": String,
  "Posting Date": String, // originally was Date but your data uses string format like "12-jun-25"
  Experience: String,
  "Experience Range": String,
  "Job URL": String,
  City: String,
  Currency: String,
  "Salary Lower": Number,
  "Salary Upper": Number,
  "Formatted Posting Date": String, // format: "12/06/2025"
}, {
  collection: 'PreprocessedCombinedData'
});

export default mongoose.models.Job || mongoose.model('Job', JobSchema);
