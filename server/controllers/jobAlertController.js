import JobAlert from "../models/JobAlert.js";
import { processCandidateJobAlertsNow, upsertCandidateJobAlert } from "../services/jobAlertService.js";

export const getJobAlertSettings = async (req, res) => {
  try {
    if (req.user.userType !== "candidate") {
      return res.status(403).json({ message: "Only candidates can manage job alerts" });
    }

    const settings = await JobAlert.findOne({ candidate: req.user.id });
    res.json(settings || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const saveJobAlertSettings = async (req, res) => {
  try {
    if (req.user.userType !== "candidate") {
      return res.status(403).json({ message: "Only candidates can manage job alerts" });
    }

    const settings = await upsertCandidateJobAlert(req.user.id, req.body);
    res.json({ message: "Job alert settings saved", settings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const runJobAlertsNow = async (req, res) => {
  try {
    if (req.user.userType !== "candidate") {
      return res.status(403).json({ message: "Only candidates can run job alerts" });
    }

    const result = await processCandidateJobAlertsNow(req.user.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
