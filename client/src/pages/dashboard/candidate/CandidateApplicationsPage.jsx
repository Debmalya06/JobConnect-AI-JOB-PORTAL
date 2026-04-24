import API_URL from '../../../utils/api';;
"use client"
import { useState, useEffect } from "react"
import { Building2, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card"

function CandidateApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`${API_URL}/api/applications/candidate`, {
          headers: { Authorization: token }
        })
        if (res.ok) {
          const data = await res.json()
          setApplications(data)
        }
      } catch (error) {
        console.error("Failed to fetch applications:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchApplications()
  }, [])

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your applications...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Applications</h1>
      <div className="grid gap-4">
        {applications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              <p>You haven't applied to any jobs yet.</p>
            </CardContent>
          </Card>
        ) : (
          applications.map(app => (
            <Card key={app._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
                <CardTitle className="text-lg font-semibold text-gray-800">{app.job?.title || "Unknown Job"}</CardTitle>
                <div className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                  app.status === 'applied' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                  app.status === 'shortlisted' ? 'bg-green-100 text-green-700 border border-green-200' :
                  'bg-red-100 text-red-700 border border-red-200'
                }`}>
                  {app.status}
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building2 className="h-4 w-4 text-purple-500" /> 
                  <span className="font-medium">{app.job?.company?.companyName || "Company Unavailable"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4 text-gray-400" /> 
                  Applied on {new Date(app.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default CandidateApplicationsPage



