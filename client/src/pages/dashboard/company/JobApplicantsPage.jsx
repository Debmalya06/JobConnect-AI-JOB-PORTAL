import API_URL from '../../../utils/api';;
"use client"
import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, Brain, ChevronDown, Download, Search, User, Loader2 } from "lucide-react"
import Button from "../../../components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/Card"
import Checkbox from "../../../components/ui/Checkbox"
import Input from "../../../components/ui/Input"
import Progress from "../../../components/ui/Progress"
import toast from "react-hot-toast"

function JobApplicantsPage() {
  const { jobId } = useParams()
  const [job, setJob] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [aiProcessing, setAiProcessing] = useState(false)
  const [selectedCandidates, setSelectedCandidates] = useState([])
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token")

      // Fetch job details
      const jobRes = await fetch(`$API_URL/api/jobs/${jobId}`, {
        headers: { Authorization: token }
      })
      if (jobRes.ok) setJob(await jobRes.json())

      // Fetch applicants for this job
      const appRes = await fetch(`$API_URL/api/applications/company?jobId=${jobId}`, {
        headers: { Authorization: token }
      })
      if (appRes.ok) {
        const data = await appRes.json()
        setCandidates(data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [jobId])

  const toggleCandidateSelection = (candidateId) => {
    setSelectedCandidates((prev) =>
      prev.includes(candidateId) ? prev.filter((id) => id !== candidateId) : [...prev, candidateId]
    )
  }

  const isAllSelected = selectedCandidates.length > 0 && selectedCandidates.length === candidates.length
  const toggleSelectAll = () => {
    if (isAllSelected) setSelectedCandidates([])
    else setSelectedCandidates(candidates.map(c => c._id))
  }

  const handleAIShortlist = async () => {
    setAiProcessing(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/applications/ai-shortlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({ jobId })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || data.error)
      toast.success(data.message)
      // Refresh candidates to show updated scores & statuses
      await fetchData()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setAiProcessing(false)
    }
  }

  const handleBulkAction = async (status) => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/applications/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({ applicationIds: selectedCandidates, status })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      toast.success(data.message)
      setCandidates(candidates.map(c => selectedCandidates.includes(c._id) ? { ...c, status } : c))
      setSelectedCandidates([])
      setIsActionsMenuOpen(false)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const filteredCandidates = candidates.filter(c => {
    if (!searchQuery) return true
    const name = `${c.candidate?.firstName || ""} ${c.candidate?.lastName || ""}`.toLowerCase()
    return name.includes(searchQuery.toLowerCase())
  })

  const getStatusColor = (status) => {
    switch (status) {
      case "shortlisted": return "bg-green-100 text-green-700"
      case "rejected": return "bg-red-100 text-red-700"
      case "interview": return "bg-yellow-100 text-yellow-700"
      default: return "bg-blue-100 text-blue-700"
    }
  }

  const getScoreColor = (score) => {
    if (score >= 85) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-500"
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading applicants...</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/dashboard/company/jobs" className="p-2 rounded-md hover:bg-gray-100 transition">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{job?.title || "Job"} — Applicants</h1>
          <p className="text-sm text-gray-500">{job?.location || "Remote"} • {job?.vacancies || 1} Vacancies • {candidates.length} Applications</p>
        </div>
        <Button
          onClick={handleAIShortlist}
          disabled={aiProcessing || candidates.length === 0}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white relative overflow-hidden"
        >
          {aiProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing Resumes...
            </>
          ) : (
            <>
              <Brain className="mr-2 h-4 w-4" />
              AI Shortlist
            </>
          )}
        </Button>
      </div>

      {/* AI Processing Banner */}
      {aiProcessing && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
              </div>
              <div>
                <p className="font-semibold text-purple-800">AI is analyzing resumes...</p>
                <p className="text-sm text-purple-600">Gemini is reading each resume and scoring candidates against the job description. This may take a minute.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search candidates..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{selectedCandidates.length} selected</span>
          {selectedCandidates.length > 0 && (
            <div className="relative">
              <Button variant="outline" size="sm" onClick={() => setIsActionsMenuOpen(!isActionsMenuOpen)}>
                Actions <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
              {isActionsMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md border bg-white py-1 shadow-lg z-10">
                  <div className="border-b px-4 py-2 font-medium text-sm">Bulk Actions</div>
                  <button onClick={() => handleBulkAction("shortlisted")} className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">
                    Shortlist Selected
                  </button>
                  <button onClick={() => handleBulkAction("rejected")} className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                    Reject Selected
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Candidates Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Applicants</CardTitle>
            <CardDescription>{filteredCandidates.length} candidates</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 border-b bg-gray-50 p-4 text-sm font-medium text-gray-600">
              <div className="col-span-1 flex items-center">
                <Checkbox checked={isAllSelected} onChange={toggleSelectAll} />
              </div>
              <div className="col-span-3">Candidate</div>
              <div className="col-span-2">Email</div>
              <div className="col-span-2">AI Score</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Resume</div>
            </div>

            {/* Table Body */}
            {filteredCandidates.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {candidates.length === 0 ? "No candidates have applied to this job yet." : "No candidates match your search."}
              </div>
            ) : filteredCandidates.map((app) => (
              <div
                key={app._id}
                className={`grid grid-cols-12 gap-2 border-b p-4 text-sm last:border-0 hover:bg-gray-50 transition ${
                  app.status === "shortlisted" ? "bg-green-50/50" : ""
                }`}
              >
                <div className="col-span-1 flex items-center">
                  <Checkbox
                    checked={selectedCandidates.includes(app._id)}
                    onChange={() => toggleCandidateSelection(app._id)}
                  />
                </div>
                <div className="col-span-3 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-purple-600 flex-shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium">{app.candidate?.firstName} {app.candidate?.lastName}</div>
                    <div className="text-xs text-gray-400">Applied {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="col-span-2 flex items-center text-gray-600 text-xs">{app.candidate?.email}</div>
                <div className="col-span-2 flex flex-col justify-center pr-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>AI Match</span>
                    <span className={`font-bold ${getScoreColor(app.aiScore || 0)}`}>{app.aiScore || 0}%</span>
                  </div>
                  <Progress value={app.aiScore || 0} className="h-2" />
                </div>
                <div className="col-span-2 flex items-center">
                  <div className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusColor(app.status)}`}>
                    {app.status}
                  </div>
                </div>
                <div className="col-span-2 flex items-center">
                  {app.resumeUrl ? (
                    <a
                      href={app.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-purple-600 hover:text-purple-800 text-xs font-medium"
                    >
                      <Download className="h-3 w-3" /> Download
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400">No resume</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default JobApplicantsPage



