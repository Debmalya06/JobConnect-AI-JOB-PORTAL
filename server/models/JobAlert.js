import mongoose from "mongoose";

const JobAlertSchema = new mongoose.Schema(
  {
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate", required: true, unique: true },
    email: { type: String, required: true },
    resumeText: { type: String, default: "" },
    minimumScore: { type: Number, default: 60 },
    emailEnabled: { type: Boolean, default: false },
    notifiedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
    lastRunAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("JobAlert", JobAlertSchema);
