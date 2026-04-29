import nodemailer from "nodemailer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import JobAlert from "../models/JobAlert.js";
import Candidate from "../models/Candidate.js";
import Job from "../models/Job.js";
import "../models/Company.js";

function getCandidateProfileText(candidate, alert) {
  const experience = (candidate.experience || [])
    .map((item) => `${item.title || ""} ${item.company || ""} ${item.description || ""}`)
    .join("\n");
  const education = (candidate.education || [])
    .map((item) => `${item.degree || ""} ${item.school || ""} ${item.description || ""}`)
    .join("\n");

  return [
    alert.resumeText,
    candidate.headline,
    candidate.about,
    (candidate.skills || []).join(", "),
    experience,
    education,
  ]
    .filter(Boolean)
    .join("\n");
}

function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return null;

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

function getShortDescription(description = "") {
  const trimmed = description.replace(/\s+/g, " ").trim();
  if (trimmed.length <= 280) return trimmed;
  return `${trimmed.slice(0, 277)}...`;
}

async function scoreJobWithGemini(candidateText, job) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
  const prompt = `You are an ATS matching assistant.

Compare this candidate profile/resume against this new job post.
Return ONLY valid JSON in this shape:
{"score":72,"reason":"Short reason under 25 words"}

Scoring rules:
- 90-100: most required skills and role experience match.
- 75-89: strong match with minor gaps.
- 60-74: moderate match.
- 40-59: weak partial match.
- 0-39: poor match.

Candidate profile/resume:
${candidateText}

Job title: ${job.title}
Company: ${job.company?.companyName || "Company"}
Location: ${job.location || "Not specified"}
Employment type: ${job.employmentType || "Not specified"}
Required skills: ${(job.skills || []).join(", ") || "Not specified"}
Short JD:
${job.description}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`Invalid Gemini response: ${text}`);

  const parsed = JSON.parse(jsonMatch[0]);
  const score = Number(parsed.score);
  if (Number.isNaN(score)) throw new Error(`Invalid Gemini score: ${text}`);

  return {
    score: Math.min(100, Math.max(0, Math.round(score))),
    reason: parsed.reason || "Your profile matched this job post.",
  };
}

async function sendJobAlertEmail({ to, candidate, job, score, reason }) {
  const transporter = createTransporter();
  if (!transporter) {
    console.warn("SMTP is not configured. Skipping job alert email.");
    return false;
  }

  const company = job.company?.companyName || "Company";
  const shortDescription = getShortDescription(job.description);
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to,
    subject: `New job match: ${job.title} (${score}%)`,
    text: `Hi ${candidate.firstName || "there"},

JobConnect AI found a new job match for you.

Role: ${job.title}
Company: ${company}
Location: ${job.location || "Remote"}
Match Score: ${score}%

Why it matched: ${reason}

Short JD:
${shortDescription}

Log in to JobConnect to view and apply.
`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#172033">
        <h2>New job match: ${job.title}</h2>
        <p>Hi ${candidate.firstName || "there"}, JobConnect AI found a new role that matches your resume.</p>
        <p><strong>Company:</strong> ${company}<br/>
        <strong>Location:</strong> ${job.location || "Remote"}<br/>
        <strong>Match Score:</strong> ${score}%</p>
        <p><strong>Why it matched:</strong> ${reason}</p>
        <p><strong>Short JD:</strong><br/>${shortDescription}</p>
        <p>Log in to JobConnect to view and apply.</p>
      </div>
    `,
  });

  return true;
}

export async function processJobAlertNotifications(job) {
  try {
    const populatedJob = job.populate ? await job.populate("company", "companyName") : job;
    const alerts = await JobAlert.find({
      emailEnabled: true,
      notifiedJobs: { $ne: populatedJob._id },
    }).populate("candidate");

    for (const alert of alerts) {
      const candidate = alert.candidate;
      if (!candidate) continue;

      const candidateText = getCandidateProfileText(candidate, alert);
      if (!candidateText.trim()) continue;

      try {
        const { score, reason } = await scoreJobWithGemini(candidateText, populatedJob);
        alert.lastRunAt = new Date();
        console.log(
          `Job alert score for ${candidate.email} -> "${populatedJob.title}": ${score}% ` +
            `(threshold ${alert.minimumScore}%)`
        );

        if (score >= alert.minimumScore) {
          const sent = await sendJobAlertEmail({
            to: alert.email,
            candidate,
            job: populatedJob,
            score,
            reason,
          });

          if (sent) {
            alert.notifiedJobs.addToSet(populatedJob._id);
            console.log(`Job alert email sent to ${alert.email} for "${populatedJob.title}"`);
          }
        } else {
          console.log(`Job alert skipped for ${alert.email}: score below threshold.`);
        }

        await alert.save();
      } catch (error) {
        console.error(`Job alert failed for candidate ${candidate._id}:`, error.message);
      }
    }
  } catch (error) {
    console.error("Job alert notification worker failed:", error.message);
  }
}

export async function processCandidateJobAlertsNow(candidateId) {
  const alert = await JobAlert.findOne({ candidate: candidateId }).populate("candidate");
  if (!alert) {
    return {
      sent: 0,
      scored: 0,
      belowThreshold: 0,
      alreadyNotified: 0,
      message: "No job alert settings found. Enable Email Notification first.",
      results: [],
    };
  }

  const candidate = alert.candidate;
  if (!candidate) throw new Error("Candidate not found");

  if (!alert.emailEnabled) {
    return {
      sent: 0,
      scored: 0,
      belowThreshold: 0,
      alreadyNotified: 0,
      message: "Email Notification is turned off.",
      results: [],
    };
  }

  const candidateText = getCandidateProfileText(candidate, alert);
  if (!candidateText.trim()) {
    return {
      sent: 0,
      scored: 0,
      belowThreshold: 0,
      alreadyNotified: 0,
      message: "No resume/profile text available for matching.",
      results: [],
    };
  }

  const jobs = await Job.find({ status: { $ne: "closed" } })
    .populate("company", "companyName")
    .sort({ createdAt: -1 })
    .limit(20);
  const notifiedJobIds = new Set((alert.notifiedJobs || []).map((id) => id.toString()));
  const results = [];
  let sent = 0;
  let scored = 0;
  let belowThreshold = 0;
  let alreadyNotified = 0;

  for (const job of jobs) {
    if (notifiedJobIds.has(job._id.toString())) {
      alreadyNotified++;
      results.push({ jobId: job._id, title: job.title, status: "already_notified" });
      continue;
    }

    try {
      const { score, reason } = await scoreJobWithGemini(candidateText, job);
      scored++;

      if (score < alert.minimumScore) {
        belowThreshold++;
        results.push({ jobId: job._id, title: job.title, score, reason, status: "below_threshold" });
        continue;
      }

      const delivered = await sendJobAlertEmail({
        to: alert.email,
        candidate,
        job,
        score,
        reason,
      });

      if (delivered) {
        sent++;
        alert.notifiedJobs.addToSet(job._id);
        results.push({ jobId: job._id, title: job.title, score, reason, status: "sent" });
      } else {
        results.push({ jobId: job._id, title: job.title, score, reason, status: "smtp_not_configured" });
      }
    } catch (error) {
      results.push({ jobId: job._id, title: job.title, status: "failed", error: error.message });
    }
  }

  alert.lastRunAt = new Date();
  await alert.save();

  return {
    sent,
    scored,
    belowThreshold,
    alreadyNotified,
    message:
      sent > 0
        ? `${sent} job alert email${sent === 1 ? "" : "s"} sent.`
        : `No emails sent. ${belowThreshold} job${belowThreshold === 1 ? "" : "s"} below threshold, ${alreadyNotified} already notified.`,
    results,
  };
}

export async function upsertCandidateJobAlert(candidateId, data) {
  const candidate = await Candidate.findById(candidateId);
  if (!candidate) throw new Error("Candidate not found");

  return JobAlert.findOneAndUpdate(
    { candidate: candidateId },
    {
      $set: {
        email: data.email || candidate.email,
        resumeText: data.resumeText || "",
        minimumScore: Number(data.minimumScore) || 60,
        emailEnabled: Boolean(data.emailEnabled),
      },
      $setOnInsert: {
        candidate: candidateId,
      },
    },
    { new: true, upsert: true }
  );
}
