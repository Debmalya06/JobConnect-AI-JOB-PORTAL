"use client"

import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Briefcase, Building2, Lock, Mail, Phone, User } from "lucide-react"
import toast from "react-hot-toast"

import Button from "../../components/ui/Button"
import Input from "../../components/ui/Input"
import Label from "../../components/ui/Label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/Card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/Tabs"

function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const defaultTab = searchParams.get("type") || "candidate"
  
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState(defaultTab)

  // Candidate State
  const [cFirstName, setCFirstName] = useState("")
  const [cLastName, setCLastName] = useState("")
  const [cEmail, setCEmail] = useState("")
  const [cPhone, setCPhone] = useState("")
  const [cPassword, setCPassword] = useState("")
  const [cConfirmPass, setCConfirmPass] = useState("")

  // Company State
  const [coName, setCoName] = useState("")
  const [coEmail, setCoEmail] = useState("")
  const [coPhone, setCoPhone] = useState("")
  const [coWebsite, setCoWebsite] = useState("")
  const [coPassword, setCoPassword] = useState("")
  const [coConfirmPass, setCoConfirmPass] = useState("")

  const handleCandidateRegister = async () => {
    if (!cFirstName || !cLastName || !cEmail || !cPhone || !cPassword || !cConfirmPass) {
      return toast.error("Please fill all fields");
    }
    if (cPassword !== cConfirmPass) {
      return toast.error("Passwords do not match");
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5001/api/auth/register/candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: cFirstName,
          lastName: cLastName,
          email: cEmail,
          phone: cPhone,
          password: cPassword
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || "Registration failed");

      toast.success("Registration successful! Please login.");
      navigate("/auth/login");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleCompanyRegister = async () => {
    if (!coName || !coEmail || !coPhone || !coPassword || !coConfirmPass) {
      return toast.error("Please fill all required fields");
    }
    if (coPassword !== coConfirmPass) {
      return toast.error("Passwords do not match");
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5001/api/auth/register/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: coName,
          businessEmail: coEmail,
          businessPhone: coPhone,
          companyWebsite: coWebsite,
          password: coPassword
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || "Registration failed");

      toast.success("Company registration successful! Please login.");
      navigate("/auth/login");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-purple-600">
            <Briefcase className="h-6 w-6" />
            <span>JobConnect</span>
          </Link>
        </div>

        {activeTab === "candidate" ? (
            <Card>
              <CardHeader>
                <CardTitle>Create Candidate Account</CardTitle>
                <CardDescription>Enter your details to create your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input id="first-name" placeholder="John" className="pl-10" value={cFirstName} onChange={e => setCFirstName(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input id="last-name" placeholder="Doe" value={cLastName} onChange={e => setCLastName(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="candidate-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="candidate-email" type="email" placeholder="you@example.com" className="pl-10" value={cEmail} onChange={e => setCEmail(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="candidate-phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="candidate-phone" type="tel" placeholder="+1 (555) 000-0000" className="pl-10" value={cPhone} onChange={e => setCPhone(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="candidate-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="candidate-password" type="password" className="pl-10" value={cPassword} onChange={e => setCPassword(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="candidate-confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="candidate-confirm-password" type="password" className="pl-10" value={cConfirmPass} onChange={e => setCConfirmPass(e.target.value)} />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={handleCandidateRegister}
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
                <div className="flex flex-col space-y-2 text-center text-sm">
                  <div>
                    Already have an account?{" "}
                    <Link to="/auth/login" className="text-purple-600 hover:underline">
                      Login
                    </Link>
                  </div>
                  <div className="pt-2 border-t mt-2">
                    Are you a company?{" "}
                    <button onClick={() => setActiveTab("company")} className="text-purple-600 hover:underline font-medium">
                      Company Registration
                    </button>
                  </div>
                </div>
              </CardFooter>
            </Card>
        ) : (
            <Card>
              <CardHeader>
                <CardTitle>Create Company Account</CardTitle>
                <CardDescription>Enter your company details to create your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="company-name" placeholder="Acme Inc." className="pl-10" value={coName} onChange={e => setCoName(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-email">Business Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="company-email" type="email" placeholder="company@example.com" className="pl-10" value={coEmail} onChange={e => setCoEmail(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-phone">Business Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="company-phone" type="tel" placeholder="+1 (555) 000-0000" className="pl-10" value={coPhone} onChange={e => setCoPhone(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-website">Company Website</Label>
                  <Input id="company-website" type="url" placeholder="https://example.com" value={coWebsite} onChange={e => setCoWebsite(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="company-password" type="password" className="pl-10" value={coPassword} onChange={e => setCoPassword(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="company-confirm-password" type="password" className="pl-10" value={coConfirmPass} onChange={e => setCoConfirmPass(e.target.value)} />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={handleCompanyRegister}
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
                <div className="flex flex-col space-y-2 text-center text-sm">
                  <div>
                    Already have an account?{" "}
                    <Link to="/auth/login" className="text-purple-600 hover:underline">
                      Login
                    </Link>
                  </div>
                  <div className="pt-2 border-t mt-2">
                    Are you a candidate?{" "}
                    <button onClick={() => setActiveTab("candidate")} className="text-purple-600 hover:underline font-medium">
                      Candidate Registration
                    </button>
                  </div>
                </div>
              </CardFooter>
            </Card>
        )}
      </div>
    </div>
  )
}

export default RegisterPage
