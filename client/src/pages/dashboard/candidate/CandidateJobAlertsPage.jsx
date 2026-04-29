import API_URL from "../../../utils/api"
import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import {
  Bell,
  BrainCircuit,
  CheckCircle2,
  FileText,
  Mail,
  Play,
  Search,
  Send,
  Sparkles,
} from "lucide-react"
import Button from "../../../components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/Card"
import Checkbox from "../../../components/ui/Checkbox"
import Input from "../../../components/ui/Input"
import Label from "../../../components/ui/Label"
import Textarea from "../../../components/ui/Textarea"
import Progress from "../../../components/ui/Progress"
import { useAuth } from "../../../context/AuthContext"

const STOP_WORDS = new Set([
  "and",
  "are",
  "for",
  "from",
  "have",
  "with",
  "the",
  "this",
  "that",
  "you",
  "your",
  "our",
  "will",
  "job",
  "role",
  "work",
  "team",
  "using",
  "into",
  "about",
  "candidate",
  "company",
  "experience",
  "knowledge",
  "required",
  "responsibilities",
  "requirements",
  "skills",
  "strong",
  "years",
])

const workflowSteps = [
  { title: "Resume", description: "Read candidate skills", icon: FileText },
  { title: "New Jobs", description: "Scan latest job posts", icon: Search },
  { title: "AI Match", description: "Compare resume with JD", icon: BrainCircuit },
  { title: "Email Alert", description: "Notify matching roles", icon: Send },
]

function normalizeKeyword(word) {
  return word
    .replace(/\.js$/g, "")
    .replace(/[^a-z0-9+#-]/g, "")
    .replace(/(ing|ers|er|ed|s)$/g, "")
}

function extractKeywords(text) {
  return [
    ...new Set(
      (text || "")
        .toLowerCase()
        .replace(/[^a-z0-9+#.\s-]/g, " ")
        .split(/\s+/)
        .map((word) => normalizeKeyword(word.trim()))
        .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
    ),
  ]
}

function hasKeywordMatch(candidateKeywords, jobKeyword) {
  return candidateKeywords.some((keyword) => {
    if (keyword === jobKeyword) return true
    if (keyword.length < 5 || jobKeyword.length < 5) return false
    return keyword.includes(jobKeyword) || jobKeyword.includes(keyword)
  })
}

function getMatchedKeywords(sourceKeywords, resumeKeywords) {
  return sourceKeywords.filter((keyword) => hasKeywordMatch(resumeKeywords, keyword))
}

function scoreJobAgainstResume(job, resumeKeywords) {
  const requiredSkills = Array.isArray(job.skills) ? job.skills : []
  const jobSkills = extractKeywords(requiredSkills.join(" "))
  const titleKeywords = extractKeywords(`${job.title || ""} ${job.category || ""}`)
  const descriptionKeywords = extractKeywords(
    `${job.description || ""} ${job.employmentType || ""} ${job.location || ""} ${job.company?.companyName || ""}`
  )
  const skillMatches = getMatchedKeywords(jobSkills, resumeKeywords)
  const titleMatches = getMatchedKeywords(titleKeywords, resumeKeywords)
  const descriptionMatches = getMatchedKeywords(descriptionKeywords, resumeKeywords)
  const skillCoverage = jobSkills.length ? skillMatches.length / jobSkills.length : 0
  const titleCoverage = titleKeywords.length ? titleMatches.length / titleKeywords.length : 0
  const descriptionCoverage = descriptionKeywords.length
    ? descriptionMatches.length / Math.min(descriptionKeywords.length, 25)
    : 0
  const hasRequiredSkills = jobSkills.length > 0

  let rawScore = hasRequiredSkills
    ? skillCoverage * 70 + titleCoverage * 15 + Math.min(descriptionCoverage, 1) * 15
    : titleCoverage * 45 + Math.min(descriptionCoverage, 1) * 35

  if (hasRequiredSkills && skillMatches.length === 0) rawScore = Math.min(rawScore, 35)
  if (hasRequiredSkills && skillCoverage > 0 && skillCoverage < 0.34) rawScore = Math.min(rawScore, 55)
  if (hasRequiredSkills && skillCoverage >= 0.34 && skillCoverage < 0.67) rawScore = Math.min(rawScore, 75)
  if (!hasRequiredSkills && titleMatches.length === 0) rawScore = Math.min(rawScore, 50)

  return {
    ...job,
    score: Math.min(100, Math.round(rawScore)),
    matchedSkills: [...new Set([...skillMatches, ...titleMatches, ...descriptionMatches])],
    matchDetails: {
      required: jobSkills.length,
      requiredMatched: skillMatches.length,
      titleMatched: titleMatches.length,
      descriptionMatched: descriptionMatches.length,
    },
  }
}

async function readApiResponse(response) {
  const contentType = response.headers.get("content-type") || ""

  if (contentType.includes("application/json")) {
    return response.json()
  }

  const text = await response.text()
  return {
    message: response.status === 404
      ? "Job alert API was not found. Restart the backend server so the new /api/job-alerts route is loaded."
      : text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(),
  }
}

function CandidateJobAlertsPage() {
  const { user } = useAuth()
  const [email, setEmail] = useState(user?.email || "")
  const [resumeText, setResumeText] = useState("")
  const [minimumScore, setMinimumScore] = useState(25)
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)
  const [matches, setMatches] = useState([])
  const [closestMatches, setClosestMatches] = useState([])
  const [scannedJobsCount, setScannedJobsCount] = useState(0)
  const [lastRun, setLastRun] = useState("")

  const resumeKeywords = useMemo(() => {
    const profileSkills = Array.isArray(user?.skills) ? user.skills.join(" ") : ""
    return extractKeywords(`${resumeText} ${profileSkills}`)
  }, [resumeText, user?.skills])

  useEffect(() => {
    const fetchAlertSettings = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`${API_URL}/api/job-alerts/settings`, {
          headers: { Authorization: token },
        })

        if (!response.ok) {
          const data = await readApiResponse(response)
          console.warn(data.message || "Failed to load job alert settings")
          return
        }

        const settings = await readApiResponse(response)
        if (!settings) return

        setEmail(settings.email || user?.email || "")
        setResumeText(settings.resumeText || "")
        setMinimumScore(settings.minimumScore || 60)
        setEmailNotificationsEnabled(Boolean(settings.emailEnabled))
      } catch (error) {
        console.error("Failed to load job alert settings", error)
      }
    }

    fetchAlertSettings()
  }, [user?.email])

  const saveJobAlertSettings = async (enabled = emailNotificationsEnabled) => {
    if (enabled && !email.trim()) {
      toast.error("Please add an email address before enabling notifications.")
      return false
    }

    if (enabled && resumeKeywords.length < 3) {
      toast.error("Paste resume text or add profile skills before enabling notifications.")
      return false
    }

    setSavingSettings(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/job-alerts/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          email,
          resumeText,
          minimumScore,
          emailEnabled: enabled,
        }),
      })
      const data = await readApiResponse(response)

      if (!response.ok) throw new Error(data.message || data.error || "Failed to save alert settings")

      return true
    } catch (error) {
      toast.error(error.message)
      return false
    } finally {
      setSavingSettings(false)
    }
  }

  const handleEmailNotificationToggle = async (event) => {
    const enabled = event.target.checked
    const previousValue = emailNotificationsEnabled
    setEmailNotificationsEnabled(enabled)

    const saved = await saveJobAlertSettings(enabled)
    if (saved) {
      toast.success(enabled ? "Automatic email notifications enabled." : "Automatic email notifications disabled.")
    } else {
      setEmailNotificationsEnabled(previousValue)
    }
  }

  const runEmailAlertWorkflow = async () => {
    const token = localStorage.getItem("token")
    const response = await fetch(`${API_URL}/api/job-alerts/run-now`, {
      method: "POST",
      headers: { Authorization: token },
    })
    const data = await readApiResponse(response)

    if (!response.ok) throw new Error(data.message || data.error || "Failed to run email alert workflow")

    if (data.sent > 0) {
      toast.success(data.message)
    } else {
      toast(data.message || "No email alerts were sent.")
    }
  }

  const handleRunMatcher = async () => {
    if (!email.trim()) {
      toast.error("Please add an email address for alerts.")
      return
    }

    if (resumeKeywords.length < 3) {
      toast.error("Paste your resume or add skills in your profile before running the matcher.")
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/jobs`, {
        headers: { Authorization: token },
      })

      if (!response.ok) throw new Error("Unable to load current jobs")

      const jobs = await response.json()
      setScannedJobsCount(jobs.length)

      const allScoredJobs = jobs
        .map((job) => scoreJobAgainstResume(job, resumeKeywords))
        .sort((a, b) => b.score - a.score)
      const scoredJobs = allScoredJobs.filter((job) => job.score >= minimumScore)

      setMatches(scoredJobs)
      setClosestMatches(allScoredJobs.slice(0, 3))
      setLastRun(new Date().toLocaleString())
      localStorage.setItem(
        "candidateJobAlertAgent",
        JSON.stringify({ email, minimumScore, resumeText, lastRun: new Date().toISOString() })
      )

      if (emailNotificationsEnabled) {
        const saved = await saveJobAlertSettings(true)
        if (saved) {
          toast.success("Automatic email alert workflow saved.")
          await runEmailAlertWorkflow()
        }
      }

      if (scoredJobs.length > 0) {
        toast.success(`${scoredJobs.length} matching job alert${scoredJobs.length === 1 ? "" : "s"} ready for email.`)
      } else {
        toast(`No jobs reached ${minimumScore}%. Showing closest matches from ${jobs.length} scanned jobs.`)
      }
    } catch (error) {
      console.error("Job alert matcher failed", error)
      toast.error("Could not run the job matcher right now.")
    } finally {
      setLoading(false)
    }
  }

  const emailBody = encodeURIComponent(
    matches
      .slice(0, 5)
      .map((job, index) => {
        const company = job.company?.companyName || "Company"
        const location = job.location || "Remote"
        return `${index + 1}. ${job.title} at ${company} (${location}) - ${job.score}% match`
      })
      .join("\n")
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-purple-600">
            <Sparkles className="h-4 w-4" />
            AI Job Notification Agent
          </div>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Job Alerts AI</h1>
          <p className="mt-1 text-sm text-gray-500">
            Match your resume with new job descriptions and prepare email alerts when the score is strong.
          </p>
        </div>
        <Button onClick={handleRunMatcher} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
          <Play className="h-4 w-4" />
          {loading ? "Running Matcher..." : "Run Job Matcher"}
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-purple-600" />
                Alert Setup
              </CardTitle>
              <CardDescription>Tell the agent where to send matched job notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="alert-email">Email Address</Label>
                <Input
                  id="alert-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="your.email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="match-score">Minimum Match Score: {minimumScore}%</Label>
                <input
                  id="match-score"
                  type="range"
                  min="20"
                  max="90"
                  step="5"
                  value={minimumScore}
                  onChange={(event) => setMinimumScore(Number(event.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>
              <div className="flex items-start gap-3 rounded-md border p-3">
                <Checkbox
                  id="email-notifications"
                  checked={emailNotificationsEnabled}
                  onChange={handleEmailNotificationToggle}
                  disabled={savingSettings}
                />
                <div>
                  <Label htmlFor="email-notifications">Email Notification</Label>
                  <p className="mt-1 text-sm text-gray-500">
                    When enabled, every new job post is matched in the background and matching roles are emailed to you.
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="resume-text">Paste Resume</Label>
                <Textarea
                  id="resume-text"
                  value={resumeText}
                  onChange={(event) => setResumeText(event.target.value)}
                  placeholder="Paste resume text, skills, projects, education, and experience here..."
                  className="min-h-[180px]"
                />
              </div>
              <div className="rounded-md bg-purple-50 p-3 text-sm text-purple-800">
                {resumeKeywords.length} resume keywords ready for matching.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agent Status</CardTitle>
              <CardDescription>Current notification workflow state.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Email notification</span>
                <span className="font-medium text-gray-900">
                  {emailNotificationsEnabled ? "Enabled" : email ? "Configured" : "Missing"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Matched jobs</span>
                <span className="font-medium text-gray-900">{matches.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Jobs scanned</span>
                <span className="font-medium text-gray-900">{scannedJobsCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Last run</span>
                <span className="font-medium text-gray-900">{lastRun || "Not yet"}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Visualization</CardTitle>
              <CardDescription>Resume to job post match to email alert.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                {workflowSteps.map((step, index) => (
                  <div key={step.title} className="relative rounded-lg border p-4">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-purple-100 text-purple-600">
                      <step.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{step.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{step.description}</p>
                    <div className="mt-4 text-xs font-medium uppercase text-gray-400">
                      {index === 0 && resumeKeywords.length > 0
                        ? "Ready"
                        : index === 1 && scannedJobsCount > 0
                          ? `${scannedJobsCount} Scanned`
                          : index === 2 && closestMatches.length > 0
                            ? "Complete"
                            : index === 3 && matches.length > 0
                              ? "Ready"
                              : "Pending"}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Matched Job Alerts
              </CardTitle>
              <CardDescription>Jobs above your selected match score will be used for email alerts.</CardDescription>
            </CardHeader>
            <CardContent>
              {matches.length === 0 ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-dashed p-8 text-center">
                    <Mail className="mx-auto h-10 w-10 text-gray-300" />
                    <p className="mt-3 font-medium text-gray-900">
                      {closestMatches.length > 0 ? "No jobs crossed the alert score" : "No alert matches yet"}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {closestMatches.length > 0
                        ? "Lower the minimum score or improve your resume keywords to create alerts."
                        : "Run the matcher after adding resume text to find relevant jobs."}
                    </p>
                  </div>
                  {closestMatches.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-gray-900">Closest Matches</h3>
                      {closestMatches.map((job) => (
                        <div key={job._id} className="rounded-lg border p-4">
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900">{job.title}</h3>
                              <p className="text-sm text-gray-500">
                                {job.company?.companyName || "Company"} - {job.location || "Remote"}
                              </p>
                            </div>
                            <div className="min-w-[120px]">
                              <div className="mb-1 text-right text-sm font-semibold text-purple-700">{job.score}% match</div>
                              <Progress value={job.score} />
                            </div>
                          </div>
                          {job.matchedSkills.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {job.matchedSkills.slice(0, 8).map((skill) => (
                                <span key={skill} className="rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                          <p className="mt-3 text-xs text-gray-500">
                            Required skills matched: {job.matchDetails?.requiredMatched || 0} of {job.matchDetails?.required || 0}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {matches.map((job) => (
                    <div key={job._id} className="rounded-lg border p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{job.title}</h3>
                          <p className="text-sm text-gray-500">
                            {job.company?.companyName || "Company"} - {job.location || "Remote"}
                          </p>
                        </div>
                        <div className="min-w-[120px]">
                          <div className="mb-1 text-right text-sm font-semibold text-purple-700">{job.score}% match</div>
                          <Progress value={job.score} />
                        </div>
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm text-gray-600">{job.description}</p>
                      <p className="mt-3 text-xs text-gray-500">
                        Required skills matched: {job.matchDetails?.requiredMatched || 0} of {job.matchDetails?.required || 0}
                      </p>
                      {job.matchedSkills.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {job.matchedSkills.slice(0, 8).map((skill) => (
                            <span key={skill} className="rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {matches.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Email Notification Preview</CardTitle>
                <CardDescription>Open a manual draft. Automatic emails are controlled by the toggle above.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-gray-600">
                  Ready to notify <span className="font-medium text-gray-900">{email}</span> about {matches.length} matched job
                  {matches.length === 1 ? "" : "s"}.
                </div>
                <a href={`mailto:${email}?subject=New matching jobs from JobConnect AI&body=${emailBody}`}>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Mail className="h-4 w-4" />
                    Open Email Draft
                  </Button>
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default CandidateJobAlertsPage
