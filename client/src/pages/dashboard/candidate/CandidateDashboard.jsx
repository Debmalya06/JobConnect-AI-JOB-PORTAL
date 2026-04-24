import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Briefcase, Building2, Clock, Search } from "lucide-react"
import Button from "../../../components/ui/Button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/Card"
import Checkbox from "../../../components/ui/Checkbox";
import Input from "../../../components/ui/Input";
import Label from "../../../components/ui/Label";
import Progress from "../../../components/ui/Progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/ui/Tabs";
import Textarea from "../../../components/ui/Textarea";
import { Select } from "../../../components/ui/Select";
import {Popover} from "../../../components/ui/Popover";
import RadioGroup from "../../../components/ui/RadioGroup";
import Separator from "../../../components/ui/Separator";
import { useAuth } from "../../../context/AuthContext"

function CandidateDashboard() {
  const { user } = useAuth();
  const [recentJobs, setRecentJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")
        
        const appRes = await fetch("http://localhost:5001/api/applications/candidate", {
          headers: { Authorization: token }
        })
        if (appRes.ok) {
          const appData = await appRes.json()
          setApplications(appData)
        }
        
        const jobsRes = await fetch("http://localhost:5001/api/jobs", {
          headers: { Authorization: token }
        })
        if (jobsRes.ok) {
          const jobsData = await jobsRes.json()
          setRecentJobs(jobsData.slice(0, 3))
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  // Calculate profile completion
  const calculateProfileCompletion = () => {
    if (!user) return 0;
    let score = 20; // Base score for registering
    if (user.headline) score += 10;
    if (user.location) score += 10;
    if (user.about) score += 20;
    if (user.resumeUrl) score += 20;
    if (user.skills && user.skills.length > 0) score += 10;
    if (user.experience && user.experience.length > 0) score += 10;
    return score;
  };
  const profileScore = calculateProfileCompletion();

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold">Welcome, {user?.firstName || "Candidate"}!</h1>
        <div className="flex gap-2">
          <Link to="/dashboard/candidate/jobs">
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Search className="mr-2 h-4 w-4" />
              Find Jobs
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Profile Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profileScore}%</div>
            <Progress value={profileScore} className="mt-2" />
            <p className="mt-2 text-xs text-muted-foreground">
              Complete your profile to increase visibility to employers
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <Link to="/dashboard/candidate/profile">
                Complete Profile
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applications.length}</div>
            <p className="mt-2 text-xs text-muted-foreground">You have {applications.length} active job applications</p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <Link to="/dashboard/candidate/applications">
                View Applications
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saved Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="mt-2 text-xs text-muted-foreground">You have 0 saved jobs for later</p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <Link to="/dashboard/candidate/jobs">
                Find More Jobs
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Job Applications</CardTitle>
            <CardDescription>Track the status of your recent job applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {applications.length === 0 ? (
                <p className="text-sm text-gray-500">No recent applications.</p>
              ) : applications.slice(0, 3).map((application) => (
                <div key={application._id} className="flex flex-col gap-2 rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{application.job?.title}</h3>
                      <p className="text-sm text-muted-foreground">{application.job?.company?.companyName}</p>
                    </div>
                    <div className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-600 capitalize">
                      {application.status}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Applied on: {new Date(application.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/dashboard/candidate/applications">View All Applications</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommended Jobs</CardTitle>
            <CardDescription>Jobs that match your skills and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentJobs.length === 0 ? (
                <p className="text-sm text-gray-500">No jobs available right now.</p>
              ) : recentJobs.map((job) => (
                <div key={job._id} className="flex flex-col gap-2 rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{job.title}</h3>
                      <p className="text-sm text-muted-foreground">{job.company?.companyName}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Building2 className="mr-1 h-4 w-4" />
                      {job.location || "Remote"}
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="mr-1 h-4 w-4" />
                      {job.salary || "Not specified"}
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700" asChild>
                      <Link to={`/dashboard/candidate/jobs`}>Apply</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/dashboard/candidate/jobs">Browse All Jobs</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default CandidateDashboard
