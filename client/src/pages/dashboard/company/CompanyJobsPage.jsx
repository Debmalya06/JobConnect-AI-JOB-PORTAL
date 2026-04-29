import API_URL from '../../../utils/api';;
"use client"
import { useState, useEffect } from "react"
import { Briefcase, MapPin, Users, Edit, Trash2, Eye } from "lucide-react"
import Button from "../../../components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card"
import toast from "react-hot-toast"
import { Link, useNavigate } from "react-router-dom"

function CompanyJobsPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`${API_URL}/api/jobs/company`, {
          headers: { Authorization: token }
        })
        if (res.ok) {
          const data = await res.json()
          setJobs(data)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [])

  const handleCloseJob = async (jobId) => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/jobs/${jobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({ status: "closed" })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      toast.success("Job closed successfully")
      setJobs(jobs.map(job => job._id === jobId ? { ...job, status: "closed" } : job))
    } catch (error) {
      toast.error(error.message)
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your jobs...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Jobs</h1>
        <Link to="/dashboard/company/post-job">
          <Button className="bg-purple-600 hover:bg-purple-700">Post New Job</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              <p>You haven't posted any jobs yet.</p>
            </CardContent>
          </Card>
        ) : (
          jobs.map(job => (
            <Card key={job._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">{job.title}</CardTitle>
                <div className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                  job.status === 'open' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {job.status || "open"}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {job.location || "Remote"}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" /> {job.vacancies || 1} Vacancies
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" /> {job.employmentType || "Full-time"}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                    onClick={() => navigate(`/dashboard/company/job/${job._id}/applicants`)}
                  >
                    <Eye className="h-4 w-4 mr-1" /> View Applicants
                  </Button>
                  <Link to={`/dashboard/company/edit-job/${job._id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleCloseJob(job._id)}
                    disabled={job.status === 'closed'}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> {job.status === 'closed' ? "Closed" : "Close Job"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default CompanyJobsPage



