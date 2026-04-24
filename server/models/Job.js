import mongoose from "mongoose";

const JobSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  vacancies: { type: Number, required: true },
  location: { type: String },
  salary: { type: String },
  category: { type: String },
  employmentType: { type: String },
  skills: [{ type: String }],
  salaryPeriod: { type: String },
  status: { type: String, enum: ["open", "closed"], default: "open" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Job", JobSchema);
