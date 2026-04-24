import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  businessEmail: { type: String, required: true, unique: true },
  businessPhone: { type: String, required: true },
  companyWebsite: { type: String, default: "" },
  password: { type: String, required: true },
  // Profile fields
  industry: { type: String, default: "" },
  location: { type: String, default: "" },
  description: { type: String, default: "" },
  size: { type: String, default: "" },
  logoUrl: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Company", CompanySchema);
