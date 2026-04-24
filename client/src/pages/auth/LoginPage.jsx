"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Briefcase, Building2, Lock, Mail, User } from "lucide-react"
import toast from "react-hot-toast"

import Button from "../../components/ui/Button"
import Input from "../../components/ui/Input"
import Label from "../../components/ui/Label"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "../../components/ui/Card"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "../../components/ui/Tabs"
import { useAuth } from "../../context/AuthContext"

function LoginPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [activeTab, setActiveTab] = useState("candidate")
  const { login } = useAuth()

  const handleLogin = async (userType) => {
    if (!email || !password) {
      return toast.error("Please fill all fields");
    }
    
    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, userType })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }
      
      login(data.token, data.user, userType);
      toast.success("Login successful!");
      
      if (userType === "candidate") {
        navigate("/dashboard/candidate");
      } else {
        navigate("/dashboard/company");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  // Reset fields when tab changes
  const handleTabChange = (val) => {
    setActiveTab(val);
    setEmail("");
    setPassword("");
  };

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
                <CardTitle>Candidate Login</CardTitle>
                <CardDescription>Enter your credentials to access your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="candidate-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      id="candidate-email" 
                      type="email" 
                      placeholder="you@example.com" 
                      className="pl-10" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="candidate-password">Password</Label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      id="candidate-password" 
                      type="password" 
                      className="pl-10" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => handleLogin("candidate")}
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
                <div className="flex flex-col space-y-2 text-center text-sm">
                  <div>
                    Don't have an account?{" "}
                    <Link to="/auth/register?type=candidate" className="text-purple-600 hover:underline">
                      Register
                    </Link>
                  </div>
                  <div className="pt-2 border-t mt-2">
                    Are you a company?{" "}
                    <button onClick={() => handleTabChange("company")} className="text-purple-600 hover:underline font-medium">
                      Company Login
                    </button>
                  </div>
                </div>
              </CardFooter>
            </Card>
        ) : (
            <Card>
              <CardHeader>
                <CardTitle>Company Login</CardTitle>
                <CardDescription>Enter your credentials to access your company account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      id="company-email" 
                      type="email" 
                      placeholder="company@example.com" 
                      className="pl-10" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="company-password">Password</Label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      id="company-password" 
                      type="password" 
                      className="pl-10" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => handleLogin("company")}
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
                <div className="flex flex-col space-y-2 text-center text-sm">
                  <div>
                    Don't have an account?{" "}
                    <Link to="/auth/register?type=company" className="text-purple-600 hover:underline">
                      Register
                    </Link>
                  </div>
                  <div className="pt-2 border-t mt-2">
                    Are you a candidate?{" "}
                    <button onClick={() => handleTabChange("candidate")} className="text-purple-600 hover:underline font-medium">
                      Candidate Login
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

export default LoginPage
