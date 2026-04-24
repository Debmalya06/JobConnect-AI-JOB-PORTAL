import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { AuthProvider } from "./context/AuthContext"
import LandingPage from "./pages/LandingPage"
import LoginPage from "./pages/auth/LoginPage"
import RegisterPage from "./pages/auth/RegisterPage"
import CandidateDashboard from "./pages/dashboard/candidate/CandidateDashboard"
import CandidateProfile from "./pages/dashboard/candidate/CandidateProfile"
import CompanyDashboard from "./pages/dashboard/company/CompanyDashboard"
import PostJobPage from "./pages/dashboard/company/PostJobPage"
import CandidatesPage from "./pages/dashboard/company/CandidatesPage"
import CandidateJobsPage from "./pages/dashboard/candidate/CandidateJobsPage"
import CandidateApplicationsPage from "./pages/dashboard/candidate/CandidateApplicationsPage"
import CompanyJobsPage from "./pages/dashboard/company/CompanyJobsPage"
import EditJobPage from "./pages/dashboard/company/EditJobPage"
import JobApplicantsPage from "./pages/dashboard/company/JobApplicantsPage"
import CompanyProfilePage from "./pages/dashboard/company/CompanyProfilePage"
import CandidateDashboardLayout from "./layouts/CandidateDashboardLayout"
import CompanyDashboardLayout from "./layouts/CompanyDashboardLayout"

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />

          {/* Candidate Dashboard Routes */}
          <Route
            path="/dashboard/candidate"
            element={
              <CandidateDashboardLayout>
                <CandidateDashboard />
              </CandidateDashboardLayout>
            }
          />
          <Route
            path="/dashboard/candidate/profile"
            element={
              <CandidateDashboardLayout>
                <CandidateProfile />
              </CandidateDashboardLayout>
            }
          />
          <Route
            path="/dashboard/candidate/jobs"
            element={
              <CandidateDashboardLayout>
                <CandidateJobsPage />
              </CandidateDashboardLayout>
            }
          />
          <Route
            path="/dashboard/candidate/applications"
            element={
              <CandidateDashboardLayout>
                <CandidateApplicationsPage />
              </CandidateDashboardLayout>
            }
          />

          {/* Company Dashboard Routes */}
          <Route
            path="/dashboard/company"
            element={
              <CompanyDashboardLayout>
                <CompanyDashboard />
              </CompanyDashboardLayout>
            }
          />
          <Route
            path="/dashboard/company/post-job"
            element={
              <CompanyDashboardLayout>
                <PostJobPage />
              </CompanyDashboardLayout>
            }
          />
          <Route
            path="/dashboard/company/jobs"
            element={
              <CompanyDashboardLayout>
                <CompanyJobsPage />
              </CompanyDashboardLayout>
            }
          />
          <Route
            path="/dashboard/company/edit-job/:id"
            element={
              <CompanyDashboardLayout>
                <EditJobPage />
              </CompanyDashboardLayout>
            }
          />
          <Route
            path="/dashboard/company/job/:jobId/applicants"
            element={
              <CompanyDashboardLayout>
                <JobApplicantsPage />
              </CompanyDashboardLayout>
            }
          />
          <Route
            path="/dashboard/company/candidates"
            element={
              <CompanyDashboardLayout>
                <CandidatesPage />
              </CompanyDashboardLayout>
            }
          />
          <Route
            path="/dashboard/company/profile"
            element={
              <CompanyDashboardLayout>
                <CompanyProfilePage />
              </CompanyDashboardLayout>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App