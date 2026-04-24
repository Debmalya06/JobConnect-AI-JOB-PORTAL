import Company from "../models/Company.js";

export const updateCompanyProfile = async (req, res) => {
  try {
    if (req.user.userType !== "company") {
      return res.status(403).json({ message: "Only companies can update their profile" });
    }

    const { companyWebsite, industry, location, description, size, logoUrl } = req.body;

    const updated = await Company.findByIdAndUpdate(
      req.user.id,
      { $set: { companyWebsite, industry, location, description, size, logoUrl } },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updated) return res.status(404).json({ message: "Company not found" });

    res.json({ message: "Profile updated successfully", user: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
