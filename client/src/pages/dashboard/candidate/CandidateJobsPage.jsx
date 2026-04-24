import API_URL from '../../../utils/api';;
"use client"
import { useState, useEffect } from "react"
import { Briefcase, Building2, MapPin } from "lucide-react"
import Button from "../../../components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card"
import toast from "react-hot-toast"
import { useAuth } from "../../../context/AuthContext"
function CandidateJobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("$API_URL/api/jobs", {
          headers: { Authorization: token }
        });
        if (res.ok) {
          const data = await res.json();
          setJobs(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleApply = async (jobId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("$API_URL/api/applications/apply", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: token 
        },
        body: JSON.stringify({ jobId, resumeUrl: user?.resumeUrl || "" })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to apply");
      toast.success("Applied successfully! AI is screening your profile.");
    } catch (error) {
      toast.error(error.message);
    }
  }

  if (loading) return <div className="p-8 text-center">Loading jobs...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Find Jobs</h1>
      <div className="grid gap-4">
        {jobs.length === 0 ? (
          <p>No jobs available.</p>
        ) : (
          jobs.map(job => (
            <Card key={job._id}>
              <CardHeader>
                <CardTitle>{job.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building2 className="h-4 w-4" /> {job.company?.companyName || "Unknown Company"}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" /> {job.location || "Remote"}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Briefcase className="h-4 w-4" /> {job.vacancies || 1} Vacancies
                </div>
                <p className="mt-2 text-sm">{job.description}</p>
                <Button onClick={() => handleApply(job._id)} className="mt-4 bg-purple-600 hover:bg-purple-700">Apply Now</Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
export default CandidateJobsPage;


