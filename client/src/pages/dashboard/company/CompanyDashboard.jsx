import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Briefcase, FileText, Users, Eye, TrendingUp } from "lucide-react"
import Button from "../../../components/ui/Button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/Card"
import Progress from "../../../components/ui/Progress"
import { useAuth } from "../../../context/AuthContext"
import toast from "react-hot-toast"

function CompanyDashboard() {
  const { user } = useAuth()
  const [allJobs, setAllJobs] = useState([])
  const [recentCandidates, setRecentCandidates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")

        const [jobsRes, appRes] = await Promise.all([
          fetch("http://localhost:5001/api/jobs/company", { headers: { Authorization: token } }),
          fetch("http://localhost:5001/api/applications/company", { headers: { Authorization: token } })
        ])

        if (jobsRes.ok) setAllJobs(await jobsRes.json())
        if (appRes.ok) setRecentCandidates(await appRes.json())
      } catch (error) {
        console.error("Failed to fetch dashboard data", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Only open jobs for the active listings section
  const activeJobs = allJobs.filter(j => j.status === "open")

  const calculateProfileCompletion = () => {
    if (!user) return 0
    let score = 30
    if (user.industry) score += 15
    if (user.location) score += 15
    if (user.description) score += 20
    if (user.logoUrl) score += 20
    return score
  }

  const profileScore = calculateProfileCompletion()

  const handleCandidateAction = async (applicationId, status) => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("http://localhost:5001/api/applications/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({ applicationIds: [applicationId], status })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      toast.success(data.message)
      setRecentCandidates(prev =>
        prev.map(c => c._id === applicationId ? { ...c, status } : c)
      )
    } catch (error) {
      toast.error(error.message)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "shortlisted": return "bg-green-100 text-green-700"
      case "rejected":    return "bg-red-100 text-red-700"
      case "interview":   return "bg-yellow-100 text-yellow-700"
      default:            return "bg-purple-100 text-purple-700"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user?.companyName || "Company"}!</h1>
          <p className="text-sm text-gray-500 mt-1">Here's an overview of your recruitment activity.</p>
        </div>
        <Link to="/dashboard/company/post-job">
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Briefcase className="mr-2 h-4 w-4" />
            Post a Job
          </Button>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-purple-500" /> Active Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700">{activeJobs.length}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {allJobs.length - activeJobs.length} closed • {allJobs.length} total posted
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <Link to="/dashboard/company/jobs">
                Manage Jobs <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" /> Total Applicants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">{recentCandidates.length}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {recentCandidates.filter(c => c.status === "shortlisted").length} shortlisted •{" "}
              {recentCandidates.filter(c => c.status === "applied").length} pending review
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <Link to="/dashboard/company/candidates">
                View Candidates <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" /> Profile Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">{profileScore}%</div>
            <Progress value={profileScore} className="mt-2 h-2" />
            <p className="mt-2 text-xs text-muted-foreground">
              Complete your profile to attract more candidates
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <Link to="/dashboard/company/profile">
                Complete Profile <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Active Postings + Recent Candidates */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Active Job Postings — show only latest 2 open jobs */}
        <Card>
          <CardHeader>
            <CardTitle>Active Job Postings</CardTitle>
            <CardDescription>Your 2 most recent open positions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <p className="text-sm text-gray-400">Loading...</p>
              ) : activeJobs.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500 mb-3">No active job postings yet.</p>
                  <Link to="/dashboard/company/post-job">
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">Post Your First Job</Button>
                  </Link>
                </div>
              ) : (
                activeJobs.slice(0, 2).map((job) => (
                  <div key={job._id} className="flex flex-col gap-2 rounded-lg border p-4 hover:border-purple-200 transition">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{job.title}</h3>
                        <p className="text-sm text-muted-foreground">{job.location || "Remote"} • {job.vacancies} vacanc{job.vacancies === 1 ? "y" : "ies"}</p>
                      </div>
                      <div className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                        Open
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      Posted {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                    <div className="mt-1 flex gap-2">
                      {/* Fixed: links to per-job applicants, not global candidates */}
                      <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700" asChild>
                        <Link to={`/dashboard/company/job/${job._id}/applicants`}>
                          <Eye className="mr-1 h-3 w-3" /> View Applicants
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/dashboard/company/jobs">Manage All Jobs</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Recent Candidates — latest 4 with functional Reject/Shortlist */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Applicants</CardTitle>
            <CardDescription>Latest candidates across all your jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <p className="text-sm text-gray-400">Loading...</p>
              ) : recentCandidates.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No applicants yet.</p>
              ) : (
                recentCandidates.slice(0, 4).map((app) => (
                  <div key={app._id} className="flex flex-col gap-2 rounded-lg border p-4 hover:border-purple-200 transition">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">
                          {app.candidate?.firstName} {app.candidate?.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {app.job?.title || "Unknown Job"}
                        </p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${getStatusBadge(app.status)}`}>
                        {app.status}
                      </span>
                    </div>
                    {/* AI Score bar */}
                    <div>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-gray-500">AI Match Score</span>
                        <span className="font-semibold">{app.aiScore || 0}%</span>
                      </div>
                      <Progress value={app.aiScore || 0} className="h-1.5" />
                    </div>
                    {/* Action buttons — functional, hit DB */}
                    {app.status === "applied" && (
                      <div className="mt-1 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-red-600 hover:bg-red-50 border-red-200"
                          onClick={() => handleCandidateAction(app._id, "rejected")}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-purple-600 hover:bg-purple-700"
                          onClick={() => handleCandidateAction(app._id, "shortlisted")}
                        >
                          Shortlist
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/dashboard/company/candidates">View All Candidates</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default CompanyDashboard
