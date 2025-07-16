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
  "Posting Date": Date,
  Experience: String,
  "Experience Range": String,
  "Job URL": String,
  City: String,
}, {
  collection: 'Combined_Dataset'
});

export default mongoose.models.Job || mongoose.model('Job', JobSchema);
