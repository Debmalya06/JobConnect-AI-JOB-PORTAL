"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import toast from "react-hot-toast"
import { Briefcase, Check, ChevronDown, Clock, DollarSign, MapPin, X } from "lucide-react"
import  Button  from "../../../components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/Card"
import  Checkbox  from "../../../components/ui/Checkbox"
import  Input  from "../../../components/ui/Input"
import  Label  from "../../../components/ui/Label"
import  {RadioGroup, RadioGroupItem } from "../../../components/ui/RadioGroup"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/Select"
import  Textarea  from "../../../components/ui/Textarea"

function EditJobPage() {
  const { id } = useParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const [job, setJob] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedEmploymentType, setSelectedEmploymentType] = useState("")
  const [selectedSalaryPeriod, setSelectedSalaryPeriod] = useState("yearly")
  const [selectedSkills, setSelectedSkills] = useState([])
  const [isSkillsPopoverOpen, setIsSkillsPopoverOpen] = useState(false)

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`http://localhost:5001/api/jobs/${id}`, {
          headers: { Authorization: token }
        })
        if (res.ok) {
          const data = await res.json()
          setJob(data)
          setSelectedCategory(data.category || "")
          setSelectedEmploymentType(data.employmentType || "")
          setSelectedSalaryPeriod(data.salaryPeriod || "yearly")
          setSelectedSkills(data.skills || [])
        }
      } catch (error) {
        toast.error("Failed to load job details")
      } finally {
        setLoading(false)
      }
    }
    fetchJob()
  }, [id])

  const handleAddSkill = (skill) => {
    if (!selectedSkills.includes(skill)) setSelectedSkills([...selectedSkills, skill])
    setIsSkillsPopoverOpen(false)
  }

  const handleRemoveSkill = (skillToRemove) => {
    setSelectedSkills(selectedSkills.filter(skill => skill !== skillToRemove))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("token")
      const title = document.getElementById("job-title")?.value
      const description = document.getElementById("job-description")?.value
      const location = document.getElementById("location")?.value
      const minSalary = document.getElementById("min-salary")?.value || ""
      const maxSalary = document.getElementById("max-salary")?.value || ""
      const vacancies = document.getElementById("vacancies")?.value || 1

      const response = await fetch(`http://localhost:5001/api/jobs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token
        },
        body: JSON.stringify({
          title,
          description,
          location,
          vacancies,
          salary: minSalary || maxSalary ? `${minSalary} - ${maxSalary}` : job.salary,
          category: selectedCategory,
          employmentType: selectedEmploymentType,
          salaryPeriod: selectedSalaryPeriod,
          skills: selectedSkills
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || "Failed to update job")

      toast.success("Job updated successfully!")
      navigate("/dashboard/company/jobs")
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const jobCategories = [
    "Software Development", "Web Development", "Mobile Development", "UI/UX Design",
    "Product Management", "Data Science", "Machine Learning", "DevOps", "Quality Assurance", "Project Management",
  ]

  const skills = [
    "JavaScript", "React", "Angular", "Vue.js", "Node.js", "Python", 
    "Java", "C#", "PHP", "Ruby", "Swift", "Kotlin", "SQL", 
    "MongoDB", "AWS", "Docker", "Kubernetes", "Git", "Figma", "Adobe XD"
  ]

  if (loading) return <div className="p-8 text-center">Loading job details...</div>
  if (!job) return <div className="p-8 text-center text-red-500">Job not found</div>

  let minSal = "", maxSal = "";
  if (job.salary && job.salary.includes(" - ")) {
    [minSal, maxSal] = job.salary.split(" - ");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Job</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="job-title">Job Title</Label>
                <Input id="job-title" defaultValue={job.title} required />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Job Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {jobCategories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Employment Type</Label>
                  <Select value={selectedEmploymentType} onValueChange={setSelectedEmploymentType}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="job-description">Job Description</Label>
                <Textarea id="job-description" defaultValue={job.description} className="min-h-[200px]" required />
              </div>

              <div className="space-y-2">
                <Label>Required Skills</Label>
                <div className="relative">
                  <Button type="button" variant="outline" className="w-full justify-between" onClick={() => setIsSkillsPopoverOpen(!isSkillsPopoverOpen)}>
                    Select skills <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                  {isSkillsPopoverOpen && (
                    <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg p-2 max-h-60 overflow-auto">
                      <div className="space-y-1">
                        {skills.filter(s => !selectedSkills.includes(s)).map(skill => (
                          <div key={skill} onClick={() => handleAddSkill(skill)} className="p-2 hover:bg-gray-100 cursor-pointer rounded-md text-sm">
                            {skill}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedSkills.map((skill) => (
                    <div key={skill} className="flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-600">
                      {skill}
                      <button type="button" onClick={() => handleRemoveSkill(skill)} className="ml-1 text-purple-400 hover:text-purple-600 focus:outline-none">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Location & Salary</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="location" defaultValue={job.location} className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Salary Range</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input id="min-salary" type="number" defaultValue={minSal} className="pl-10" />
                    </div>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input id="max-salary" type="number" defaultValue={maxSal} className="pl-10" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Vacancies</Label>
                  <Input id="vacancies" type="number" defaultValue={job.vacancies} min={1} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate("/dashboard/company/jobs")}>Cancel</Button>
          <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default EditJobPage
