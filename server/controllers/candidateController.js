import Candidate from "../models/Candidate.js";

export const updateProfile = async (req, res) => {
  try {
    const { about, headline, location, skills, experience, education, resumeUrl } = req.body;
    
    if (req.user.userType !== "candidate") {
      return res.status(403).json({ message: "Only candidates can update profile" });
    }

    const updatedCandidate = await Candidate.findByIdAndUpdate(
      req.user.id,
      { $set: { about, headline, location, skills, experience, education, resumeUrl } },
      { new: true }
    );

    res.json({ message: "Profile updated successfully", user: updatedCandidate });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
