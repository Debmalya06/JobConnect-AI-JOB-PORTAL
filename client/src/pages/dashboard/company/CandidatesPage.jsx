"use client"
import { useState, useEffect } from "react"
import { ChevronDown, Download, Search, User, Briefcase } from "lucide-react"
import Button from "../../../components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/Card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/Tabs"
import Checkbox from "../../../components/ui/Checkbox"
import Input from "../../../components/ui/Input"
import Progress from "../../../components/ui/Progress"
import toast from "react-hot-toast"
import { Link } from "react-router-dom"

function CandidatesPage() {
  const [selectedCandidates, setSelectedCandidates] = useState([])
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false)
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch("http://localhost:5001/api/applications/company", {
          headers: { Authorization: token }
        })
        if (res.ok) setCandidates(await res.json())
        else toast.error("Failed to load candidates")
      } catch (error) {
        toast.error("Network error")
      } finally {
        setLoading(false)
      }
    }
    fetchCandidates()
  }, [])

  const toggleCandidateSelection = (id) =>
    setSelectedCandidates((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])

  const filteredBy = (statusFilter) => {
    let list = candidates
    if (statusFilter && statusFilter !== "all") list = list.filter(c => c.status === statusFilter)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(c => {
        const name = `${c.candidate?.firstName || ""} ${c.candidate?.lastName || ""}`.toLowerCase()
        return name.includes(q) || (c.job?.title || "").toLowerCase().includes(q)
      })
    }
    return list
  }

  const isAllSelected = (list) => list.length > 0 && list.every(c => selectedCandidates.includes(c._id))
  const toggleSelectAll = (list) => {
    const ids = list.map(c => c._id)
    if (isAllSelected(list)) setSelectedCandidates(prev => prev.filter(id => !ids.includes(id)))
    else setSelectedCandidates(prev => [...new Set([...prev, ...ids])])
  }

  const handleBulkAction = async (status) => {
    if (!selectedCandidates.length) return
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("http://localhost:5001/api/applications/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({ applicationIds: selectedCandidates, status })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      toast.success(data.message)
      setCandidates(prev => prev.map(c => selectedCandidates.includes(c._id) ? { ...c, status } : c))
      setSelectedCandidates([])
      setIsActionsMenuOpen(false)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "shortlisted": return "bg-green-100 text-green-700"
      case "rejected":    return "bg-red-100 text-red-700"
      case "interview":   return "bg-yellow-100 text-yellow-700"
      default:            return "bg-blue-100 text-blue-700"
    }
  }

  const getScoreColor = (score) =>
    score >= 85 ? "text-green-600" : score >= 60 ? "text-yellow-600" : "text-red-500"

  const CandidateTable = ({ list }) => (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Candidates</CardTitle>
          <CardDescription>{list.length} found</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <div className="grid grid-cols-12 gap-2 border-b bg-gray-50 p-4 text-sm font-medium text-gray-600">
            <div className="col-span-1 flex items-center">
              <Checkbox checked={isAllSelected(list)} onChange={() => toggleSelectAll(list)} />
            </div>
            <div className="col-span-3">Candidate</div>
            <div className="col-span-3">Job Applied</div>
            <div className="col-span-2">AI Score</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">CV</div>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : list.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No candidates found.</div>
          ) : list.map((app) => (
            <div key={app._id} className={`grid grid-cols-12 gap-2 border-b p-4 text-sm last:border-0 hover:bg-gray-50 transition ${app.status === "shortlisted" ? "bg-green-50/40" : ""}`}>
              <div className="col-span-1 flex items-center">
                <Checkbox checked={selectedCandidates.includes(app._id)} onChange={() => toggleCandidateSelection(app._id)} />
              </div>
              <div className="col-span-3 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-purple-600 flex-shrink-0">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium">{app.candidate?.firstName} {app.candidate?.lastName}</div>
                  <div className="text-xs text-gray-400">{new Date(app.appliedAt || app.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="col-span-3 flex items-center gap-1 text-gray-600 text-xs">
                <Briefcase className="h-3 w-3 text-gray-400 flex-shrink-0" />
                {app.job?.title || "—"}
              </div>
              <div className="col-span-2 flex flex-col justify-center pr-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>Match</span>
                  <span className={`font-bold ${getScoreColor(app.aiScore || 0)}`}>{app.aiScore || 0}%</span>
                </div>
                <Progress value={app.aiScore || 0} className="h-1.5" />
              </div>
              <div className="col-span-2 flex items-center">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getStatusBadge(app.status)}`}>{app.status}</span>
              </div>
              <div className="col-span-1 flex items-center">
                {app.resumeUrl ? (
                  <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800" title="View Resume">
                    <Download className="h-4 w-4" />
                  </a>
                ) : <span className="text-xs text-gray-300">—</span>}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Candidates</h1>
          <p className="text-sm text-gray-500 mt-1">
            All applicants across your jobs. To run AI Shortlist, go to{" "}
            <Link to="/dashboard/company/jobs" className="text-purple-600 hover:underline font-medium">Manage Jobs</Link>{" "}
            → View Applicants on any job.
          </p>
        </div>
        <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input placeholder="Search by name or job..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
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
                  <button onClick={() => handleBulkAction("shortlisted")} className="block w-full px-4 py-2 text-left text-sm text-green-700 hover:bg-green-50">✅ Shortlist Selected</button>
                  <button onClick={() => handleBulkAction("interview")} className="block w-full px-4 py-2 text-left text-sm text-yellow-700 hover:bg-yellow-50">📅 Move to Interview</button>
                  <button onClick={() => handleBulkAction("rejected")} className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">❌ Reject Selected</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({filteredBy("all").length})</TabsTrigger>
          <TabsTrigger value="shortlisted">Shortlisted ({filteredBy("shortlisted").length})</TabsTrigger>
          <TabsTrigger value="interview">Interview ({filteredBy("interview").length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({filteredBy("rejected").length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4"><CandidateTable list={filteredBy("all")} /></TabsContent>
        <TabsContent value="shortlisted" className="mt-4"><CandidateTable list={filteredBy("shortlisted")} /></TabsContent>
        <TabsContent value="interview" className="mt-4"><CandidateTable list={filteredBy("interview")} /></TabsContent>
        <TabsContent value="rejected" className="mt-4"><CandidateTable list={filteredBy("rejected")} /></TabsContent>
      </Tabs>
    </div>
  )
}

export default CandidatesPage
