import Job from "../models/Job.js";
import { processJobAlertNotifications } from "../services/jobAlertService.js";

export const postJob = async (req, res) => {
  try {
    const { title, description, vacancies, location, salary, category, employmentType, skills, salaryPeriod } = req.body;
    const companyId = req.user.id;
    
    if (req.user.userType !== "company") {
      return res.status(403).json({ message: "Only companies can post jobs" });
    }
    
    const newJob = new Job({
      company: companyId,
      title,
      description,
      vacancies,
      location,
      salary,
      category,
      employmentType,
      skills,
      salaryPeriod
    });
    
    await newJob.save();
    setImmediate(() => processJobAlertNotifications(newJob));
    res.status(201).json({ message: "Job posted successfully", job: newJob });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate("company", "companyName companyWebsite").sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCompanyJobs = async (req, res) => {
  try {
    const companyId = req.user.id;
    const jobs = await Job.find({ company: companyId }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id).populate("company", "companyName companyWebsite description");
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.id;
    if (req.user.userType !== "company") return res.status(403).json({ message: "Forbidden" });
    
    const job = await Job.findOneAndUpdate(
      { _id: id, company: companyId },
      { $set: req.body },
      { new: true }
    );
    if (!job) return res.status(404).json({ message: "Job not found or unauthorized" });
    res.json({ message: "Job updated successfully", job });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
