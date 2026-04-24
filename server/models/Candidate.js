import mongoose from "mongoose";

const CandidateSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  // Profile fields for "complete profile 100%"
  headline: { type: String, default: "" },
  location: { type: String, default: "" },
  about: { type: String, default: "" },
  resumeUrl: { type: String, default: "" },
  skills: [{ type: String }],
  experience: [{
    title: String,
    company: String,
    startDate: String,
    endDate: String,
    description: String
  }],
  education: [{
    degree: String,
    school: String,
    startYear: String,
    endYear: String,
    description: String
  }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Candidate", CandidateSchema);
