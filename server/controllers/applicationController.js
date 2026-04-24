import Application from "../models/Application.js";
import Job from "../models/Job.js";
import Candidate from "../models/Candidate.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY: Convert any Google Drive share URL to a direct download URL
// Handles formats:
//   https://drive.google.com/file/d/FILE_ID/view?usp=sharing
//   https://drive.google.com/open?id=FILE_ID
//   https://drive.google.com/uc?id=FILE_ID          (already direct)
//   https://drive.google.com/uc?export=download&id=FILE_ID
// ─────────────────────────────────────────────────────────────────────────────
function toGoogleDriveDirectUrl(url) {
  if (!url) return url;

  // Already a direct download URL — return as-is
  if (url.includes("drive.google.com/uc") && url.includes("export=download")) {
    return url;
  }

  let fileId = null;

  // Format: /file/d/FILE_ID/
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) fileId = fileMatch[1];

  // Format: ?id=FILE_ID or &id=FILE_ID
  if (!fileId) {
    const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch) fileId = idMatch[1];
  }

  if (fileId) {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }

  // Not a Drive URL — return unchanged (could be Cloudinary, S3, etc.)
  return url;
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY: Fetch PDF bytes from a URL, handling Drive redirects
// Returns { base64, mimeType } or throws
// ─────────────────────────────────────────────────────────────────────────────
async function fetchPdfAsBase64(rawUrl) {
  const directUrl = toGoogleDriveDirectUrl(rawUrl);
  console.log(`📄 Fetching resume from: ${directUrl}`);

  const response = await axios.get(directUrl, {
    responseType: "arraybuffer",
    maxRedirects: 10,
    timeout: 30000,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });

  // Verify we actually got a PDF (not an HTML error page)
  const contentType = response.headers["content-type"] || "";
  const buffer = Buffer.from(response.data);

  if (contentType.includes("text/html") || buffer.slice(0, 5).toString() !== "%PDF-") {
    throw new Error(
      `URL returned HTML instead of PDF (content-type: ${contentType}). ` +
        "Make sure the Google Drive file is shared as 'Anyone with the link can view'."
    );
  }

  return {
    base64: buffer.toString("base64"),
    mimeType: "application/pdf",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY: Score a resume against a job using Gemini
// Returns an integer 0–100
// ─────────────────────────────────────────────────────────────────────────────
async function scoreResumeWithGemini(resumeBase64, mimeType, job) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const prompt = `You are an expert ATS (Applicant Tracking System) recruiter.

Job Title: ${job.title}
Job Description:
${job.description}
Required Skills: ${(job.skills || []).join(", ")}
Employment Type: ${job.employmentType || "Not specified"}
Location: ${job.location || "Not specified"}

Analyze the attached resume PDF against the Job Description above.
Consider:
1. Skills match (how many required skills does the candidate have?)
2. Experience relevance (is their past experience related to this role?)
3. Education fit (does their education match the job requirements?)
4. Overall suitability for the position

Give a match score from 0 to 100 where:
- 90-100: Excellent match, highly qualified
- 75-89: Good match, meets most requirements  
- 60-74: Moderate match, meets some requirements
- 40-59: Partial match, missing key requirements
- 0-39: Poor match, significantly underqualified

Respond with ONLY a single integer number from 0 to 100. Nothing else. No words, no explanation, no punctuation.`;

  const result = await model.generateContent([
    prompt,
    { inlineData: { data: resumeBase64, mimeType } },
  ]);

  const scoreStr = result.response.text().trim();
  console.log(`🤖 Gemini raw response: "${scoreStr}"`);

  // Extract just the number (handles cases like "Score: 78" or "78." etc.)
  const parsed = parseInt(scoreStr.replace(/[^0-9]/g, ""), 10);
  if (isNaN(parsed) || parsed < 0 || parsed > 100) {
    throw new Error(`Invalid score from Gemini: "${scoreStr}"`);
  }

  return Math.min(Math.max(parsed, 0), 100);
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/applications/apply
// Candidate applies to a job with their resume URL
// ─────────────────────────────────────────────────────────────────────────────
export const applyJob = async (req, res) => {
  try {
    const { jobId, resumeUrl } = req.body;
    const candidateId = req.user.id;

    if (req.user.userType !== "candidate") {
      return res.status(403).json({ message: "Only candidates can apply" });
    }

    if (!jobId || !resumeUrl) {
      return res.status(400).json({ message: "jobId and resumeUrl are required" });
    }

    // Check if already applied
    const existing = await Application.findOne({ candidate: candidateId, job: jobId });
    if (existing) {
      return res.status(400).json({ message: "Already applied to this job" });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Save application first with score 0 (score will be updated by AI Shortlist later)
    const newApp = new Application({
      candidate: candidateId,
      job: jobId,
      resumeUrl,
      aiScore: 0,
    });
    await newApp.save();

    // Try to score immediately in background (non-blocking)
    setImmediate(async () => {
      try {
        const { base64, mimeType } = await fetchPdfAsBase64(resumeUrl);
        const score = await scoreResumeWithGemini(base64, mimeType, job);
        await Application.findByIdAndUpdate(newApp._id, { aiScore: score });
        console.log(`✅ Initial score for app ${newApp._id}: ${score}`);
      } catch (err) {
        console.error(`⚠️ Initial scoring failed for app ${newApp._id}:`, err.message);
      }
    });

    res.status(201).json({ message: "Applied successfully", application: newApp });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/applications/job/:jobId
// Get all applications for a specific job (sorted by score)
// ─────────────────────────────────────────────────────────────────────────────
export const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    const applications = await Application.find({ job: jobId })
      .populate("candidate", "firstName lastName email phone")
      .sort({ aiScore: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/applications/shortlist
// Manual shortlist by count (not AI)
// ─────────────────────────────────────────────────────────────────────────────
export const shortlistCandidates = async (req, res) => {
  try {
    const { jobId, count } = req.body;
    if (req.user.userType !== "company") {
      return res.status(403).json({ message: "Only companies can shortlist" });
    }

    const applications = await Application.find({ job: jobId }).sort({ aiScore: -1 });
    const topApps = applications.slice(0, count);
    const topAppIds = topApps.map((a) => a._id);

    await Application.updateMany({ _id: { $in: topAppIds } }, { $set: { status: "shortlisted" } });

    const rejectedAppIds = applications.slice(count).map((a) => a._id);
    if (rejectedAppIds.length > 0) {
      await Application.updateMany(
        { _id: { $in: rejectedAppIds } },
        { $set: { status: "rejected" } }
      );
    }

    res.json({ message: `Successfully shortlisted top ${count} candidates` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/applications/candidate
// Candidate views their own applications
// ─────────────────────────────────────────────────────────────────────────────
export const getCandidateApplications = async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user.id })
      .populate({
        path: "job",
        select: "title status location salary company",
        populate: { path: "company", select: "companyName" },
      })
      .sort({ appliedAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/applications/company?jobId=xxx
// Company views all applicants (optionally filtered by jobId)
// ─────────────────────────────────────────────────────────────────────────────
export const getCompanyApplications = async (req, res) => {
  try {
    const companyId = req.user.id;
    const { jobId } = req.query;

    let query = {};
    if (jobId) {
      query.job = jobId;
    } else {
      const jobs = await Job.find({ company: companyId }).select("_id");
      const jobIds = jobs.map((j) => j._id);
      query.job = { $in: jobIds };
    }

    const applications = await Application.find(query)
      // Fix: aiScore is on Application, NOT on Candidate — do not request it from populate
      .populate("candidate", "firstName lastName email phone")
      .populate("job", "title vacancies")
      .sort({ aiScore: -1, createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/applications/ai-shortlist
// AI scores ALL resumes for a job via Gemini, then shortlists top candidates
// ─────────────────────────────────────────────────────────────────────────────
export const aiShortlistCandidates = async (req, res) => {
  try {
    if (req.user.userType !== "company") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const companyId = req.user.id;
    const { jobId } = req.body;

    if (!jobId) return res.status(400).json({ message: "jobId is required" });

    // Verify the job belongs to this company
    const job = await Job.findOne({ _id: jobId, company: companyId });
    if (!job) return res.status(404).json({ message: "Job not found or unauthorized" });

    const vacancies = job.vacancies || 1;

    // 1. Get ALL applications for this job
    const allApps = await Application.find({ job: jobId });
    if (allApps.length === 0) {
      return res.json({ message: "No applications found for this job" });
    }

    console.log(`\n🚀 AI Shortlist started for job: "${job.title}" (${allApps.length} applicants, ${vacancies} vacancies)`);

    // 2. Score every application using Gemini
    let scored = 0;
    let failed = 0;
    const scoreResults = [];

    for (const app of allApps) {
      if (!app.resumeUrl) {
        console.log(`⚠️  App ${app._id} has no resumeUrl — skipping`);
        failed++;
        continue;
      }

      try {
        console.log(`\n📋 Scoring app ${app._id}...`);

        // Convert Drive URL → direct download URL, then fetch PDF
        const { base64, mimeType } = await fetchPdfAsBase64(app.resumeUrl);

        // Score with Gemini
        const score = await scoreResumeWithGemini(base64, mimeType, job);

        // Save score to DB
        app.aiScore = score;
        await app.save();
        scored++;

        console.log(`✅ App ${app._id} scored: ${score}/100`);
        scoreResults.push({ appId: app._id, score });
      } catch (e) {
        failed++;
        console.error(`❌ Failed to score app ${app._id}:`, e.message);
        // Keep app.aiScore as whatever it was (don't reset to 0 on error)
        scoreResults.push({ appId: app._id, score: app.aiScore || 0, error: e.message });
      }
    }

    // 3. Re-fetch with updated scores, sorted highest first
    const scoredApps = await Application.find({ job: jobId }).sort({ aiScore: -1 });

    console.log(`\n📊 Score results (sorted):`);
    scoredApps.forEach((a) => console.log(`   Score ${a.aiScore} → App ${a._id}`));

    // 4. Shortlist logic: >= 85% score, limited by vacancy count
    const qualified = scoredApps.filter(a => a.aiScore >= 85);
    const toShortlist = qualified.slice(0, vacancies);
    const toShortlistIds = toShortlist.map((a) => a._id);

    // Everyone not shortlisted → rejected
    const toRejectIds = scoredApps
      .filter((a) => !toShortlistIds.includes(a._id))
      .map((a) => a._id);

    if (toShortlistIds.length > 0) {
      await Application.updateMany(
        { _id: { $in: toShortlistIds } },
        { $set: { status: "shortlisted" } }
      );
    }

    if (toRejectIds.length > 0) {
      await Application.updateMany(
        { _id: { $in: toRejectIds } },
        { $set: { status: "rejected" } }
      );
    }

    const summary = {
      message: `AI scored ${scored} resume(s). Top ${toShortlistIds.length} shortlisted (based on ${vacancies} vacanc${vacancies === 1 ? "y" : "ies"}). ${toRejectIds.length} rejected. ${failed > 0 ? `${failed} could not be scored (check console).` : ""}`,
      shortlisted: toShortlistIds.length,
      rejected: toRejectIds.length,
      totalScored: scored,
      failed,
      scores: scoreResults,
    };

    console.log(`\n🏁 AI Shortlist complete:`, summary.message);
    res.json(summary);
  } catch (error) {
    console.error("AI Shortlist Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/applications/status
// Manually update status for a list of applications
// ─────────────────────────────────────────────────────────────────────────────
export const updateApplicationStatus = async (req, res) => {
  try {
    if (req.user.userType !== "company") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const { applicationIds, status } = req.body;
    if (!applicationIds || !status) {
      return res.status(400).json({ message: "applicationIds and status are required" });
    }

    const validStatuses = ["applied", "shortlisted", "rejected", "interview"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Use: ${validStatuses.join(", ")}` });
    }

    await Application.updateMany(
      { _id: { $in: applicationIds } },
      { $set: { status } }
    );
    res.json({ message: `Updated ${applicationIds.length} candidate(s) to "${status}"` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
