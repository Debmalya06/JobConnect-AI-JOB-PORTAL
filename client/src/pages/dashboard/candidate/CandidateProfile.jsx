import API_URL from '../../../utils/api';;
"use client"
import { useState, useEffect } from "react"
import { Briefcase, Building2, Calendar, Edit, GraduationCap, MapPin, Save, User, FileText } from "lucide-react"
import Button from "../../../components/ui/Button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/Card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/Tabs"
import Input from "../../../components/ui/Input"
import Label from "../../../components/ui/Label"
import Textarea from "../../../components/ui/Textarea"
import Separator from "../../../components/ui/Separator"
import { useAuth } from "../../../context/AuthContext"
import toast from "react-hot-toast"

function CandidateProfile() {
  const { user, login } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  
  const [formData, setFormData] = useState({
    headline: "",
    location: "",
    about: "",
    resumeUrl: "",
    skills: ""
  })

  useEffect(() => {
    if (user) {
      setFormData({
        headline: user.headline || "",
        location: user.location || "",
        about: user.about || "",
        resumeUrl: user.resumeUrl || "",
        skills: user.skills ? user.skills.join(", ") : ""
      })
    }
  }, [user])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token")
      const updatedSkills = formData.skills.split(",").map(s => s.trim()).filter(Boolean)
      
      const res = await fetch(`${API_URL}/api/candidate/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token
        },
        body: JSON.stringify({ ...formData, skills: updatedSkills })
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to update profile")
      
      toast.success("Profile updated successfully!")
      setIsEditing(false)
      // Update local context
      login(token, data.user, "candidate")
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleDownloadResume = () => {
    if (user?.resumeUrl) {
      window.open(user.resumeUrl, "_blank")
    } else {
      toast.error("No resume uploaded. Please add a resume link in the About tab.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <Button
          onClick={() => {
            if (isEditing) handleSave();
            else setIsEditing(true);
          }}
          className={isEditing ? "bg-green-600 hover:bg-green-700" : "bg-purple-600 hover:bg-purple-700"}
        >
          {isEditing ? (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          ) : (
            <>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                <User className="h-12 w-12" />
              </div>
            </div>
            <CardTitle className="text-center">{user?.firstName} {user?.lastName}</CardTitle>
            <CardDescription className="text-center">
              {isEditing ? (
                 <Input name="headline" value={formData.headline} onChange={handleChange} placeholder="e.g. Frontend Developer" className="mt-2 text-center" />
              ) : (
                 user?.headline || "Add a professional headline"
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {isEditing ? (
                  <Input name="location" value={formData.location} onChange={handleChange} placeholder="City, Country" className="h-8" />
                ) : (
                  <span>{user?.location || "Location not set"}</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span>{user?.experience?.length || 0} years experience</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={handleDownloadResume}>
              View / Download Resume
            </Button>
          </CardFooter>
        </Card>

        <div className="md:col-span-2">
          <Tabs defaultValue="about">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="about">About & Resume</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>About Me</CardTitle>
                  <CardDescription>Tell employers about yourself and provide your resume</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Resume PDF URL</Label>
                    {isEditing ? (
                      <Input 
                        name="resumeUrl" 
                        value={formData.resumeUrl} 
                        onChange={handleChange} 
                        placeholder="https://your-storage.com/resume.pdf" 
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <FileText className="h-4 w-4" />
                        {user?.resumeUrl ? (
                          <a href={user.resumeUrl} target="_blank" rel="noreferrer" className="hover:underline">
                            {user.resumeUrl}
                          </a>
                        ) : "No resume link provided yet"}
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      Provide a direct public URL to your PDF resume. This allows our AI to automatically screen your profile for jobs!
                    </p>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Bio / Summary</Label>
                    {isEditing ? (
                      <Textarea
                        name="about"
                        value={formData.about}
                        onChange={handleChange}
                        className="min-h-[200px]"
                        placeholder="I'm a passionate developer..."
                      />
                    ) : (
                      <div className="space-y-4 whitespace-pre-wrap text-sm">
                        {user?.about || "You haven't written a summary yet."}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="skills" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Technical Skills</CardTitle>
                  <CardDescription>Highlight your technical and professional skills</CardDescription>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="technical-skills">Skills List</Label>
                        <Textarea
                          name="skills"
                          value={formData.skills}
                          onChange={handleChange}
                          placeholder="React, JavaScript, Node.js, SQL"
                        />
                        <p className="text-xs text-gray-500">Separate skills with commas</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <div className="flex flex-wrap gap-2">
                          {user?.skills && user.skills.length > 0 ? user.skills.map((skill) => (
                            <div key={skill} className="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-600">
                              {skill}
                            </div>
                          )) : (
                            <p className="text-sm text-gray-500">No skills added yet.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default CandidateProfile



