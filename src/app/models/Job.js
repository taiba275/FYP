import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
  Company: String,
  Title: String,
  Description: String,
  Area: String,
  City: String,
  Salary: String,
  Remote: Boolean,
  Industry: String,
  "Job Type": String,
  Experience: String,
  "Posting Date": Date,
  "Job Location": String,
  "Functional Area": String,
  "Total Positions": String,
  "Job Shift": String,
  Gender: String,
  "Minimum Education": String,
  "Degree Title": String,
  "Career Level": String,
  "Apply Before": String
}, { 
  collection: 'Combined_Dataset'
});

export default mongoose.models.Job || mongoose.model('Job', JobSchema); 