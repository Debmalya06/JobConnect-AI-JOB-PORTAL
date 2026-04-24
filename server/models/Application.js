import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema({
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate", required: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  resumeUrl: { type: String, required: true },
  aiScore: { type: Number },
  status: { type: String, enum: ["applied", "shortlisted", "rejected", "interview"], default: "applied" },
  appliedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Application", ApplicationSchema);
