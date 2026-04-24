"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { Briefcase, Check, ChevronDown, Clock, DollarSign, MapPin, X } from "lucide-react"
import  Button  from "../../../components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/Card"
import  Checkbox  from "../../../components/ui/Checkbox"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../../components/ui/command"
import  Input  from "../../../components/ui/Input"
import  Label  from "../../../components/ui/Label"
import  {Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/Popover"
import  {RadioGroup, RadioGroupItem } from "../../../components/ui/RadioGroup"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/Select"
import  Textarea  from "../../../components/ui/Textarea"

function PostJobPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  // State to handle the dropdowns and popovers properly
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedEmploymentType, setSelectedEmploymentType] = useState("")
  const [selectedSalaryPeriod, setSelectedSalaryPeriod] = useState("yearly")
  const [selectedSkills, setSelectedSkills] = useState([])
  const [isSkillsPopoverOpen, setIsSkillsPopoverOpen] = useState(false)
  const [aiMatching, setAiMatching] = useState(false)

  const handleAddSkill = (skill) => {
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill])
    }
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

      const response = await fetch("http://localhost:5001/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token
        },
        body: JSON.stringify({
          title,
          description,
          location,
          vacancies,
          salary: `${minSalary} - ${maxSalary}`,
          category: selectedCategory,
          employmentType: selectedEmploymentType,
          salaryPeriod: selectedSalaryPeriod,
          skills: selectedSkills
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || "Failed to post job")

      toast.success("Job posted successfully!")
      navigate("/dashboard/company")
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const jobCategories = [
    "Software Development",
    "Web Development",
    "Mobile Development",
    "UI/UX Design",
    "Product Management",
    "Data Science",
    "Machine Learning",
    "DevOps",
    "Quality Assurance",
    "Project Management",
  ]

  const skills = [
    "JavaScript", "React", "Angular", "Vue.js", "Node.js", "Python", 
    "Java", "C#", "PHP", "Ruby", "Swift", "Kotlin", "SQL", 
    "MongoDB", "AWS", "Docker", "Kubernetes", "Git", "Figma", "Adobe XD"
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Post a New Job</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
              <CardDescription>Provide information about the position you're hiring for</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="job-title">Job Title</Label>
                <Input id="job-title" placeholder="e.g. Senior Frontend Developer" required />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Job Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Employment Type</Label>
                  <Select value={selectedEmploymentType} onValueChange={setSelectedEmploymentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="job-description">Job Description</Label>
                <Textarea
                  id="job-description"
                  placeholder="Describe the responsibilities, requirements, and benefits of the position"
                  className="min-h-[200px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Required Skills</Label>
                
                {/* Manual dropdown instead of Popover for command, since Popover context might conflict with command clicks */}
                <div className="relative">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full justify-between"
                    onClick={() => setIsSkillsPopoverOpen(!isSkillsPopoverOpen)}
                  >
                    Select skills
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                  
                  {isSkillsPopoverOpen && (
                    <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg p-2 max-h-60 overflow-auto">
                      <div className="space-y-1">
                        {skills.filter(s => !selectedSkills.includes(s)).map(skill => (
                          <div 
                            key={skill}
                            onClick={() => handleAddSkill(skill)}
                            className="p-2 hover:bg-gray-100 cursor-pointer rounded-md text-sm"
                          >
                            {skill}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedSkills.map((skill) => (
                    <div
                      key={skill}
                      className="flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-600"
                    >
                      {skill}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-1 text-purple-400 hover:text-purple-600 focus:outline-none"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {selectedSkills.length === 0 && (
                    <span className="text-sm text-gray-400">No skills selected</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Location & Salary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Work Location</Label>
                  <RadioGroup defaultValue="onsite">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="onsite" id="onsite" />
                      <Label htmlFor="onsite">On-site</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="remote" id="remote" />
                      <Label htmlFor="remote">Remote</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hybrid" id="hybrid" />
                      <Label htmlFor="hybrid">Hybrid</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="location" placeholder="e.g. San Francisco, CA" className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Salary Range</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input id="min-salary" type="number" placeholder="Min" className="pl-10" />
                    </div>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input id="max-salary" type="number" placeholder="Max" className="pl-10" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Vacancies</Label>
                  <Input id="vacancies" type="number" placeholder="Number of openings" defaultValue={1} min={1} />
                </div>

                <div className="space-y-2">
                  <Label>Salary Period</Label>
                  <Select value={selectedSalaryPeriod} onValueChange={setSelectedSalaryPeriod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Per Hour</SelectItem>
                      <SelectItem value="monthly">Per Month</SelectItem>
                      <SelectItem value="yearly">Per Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Application Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="deadline">Application Deadline</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="deadline" type="date" className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Application Method</Label>
                  <RadioGroup defaultValue="internal">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="internal" id="internal" />
                      <Label htmlFor="internal">Apply through JobConnect</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="email" id="email" />
                      <Label htmlFor="email">Apply via Email</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="external" id="external" />
                      <Label htmlFor="external">External Website</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="ai-matching" 
                    checked={aiMatching}
                    onChange={(e) => setAiMatching(e.target.checked)}
                  />
                  <Label htmlFor="ai-matching">Enable AI-powered candidate matching</Label>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <Button variant="outline" type="button">
            Save as Draft
          </Button>
          <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={isSubmitting}>
            {isSubmitting ? (
              <>Posting Job...</>
            ) : (
              <>
                <Briefcase className="mr-2 h-4 w-4" />
                Post Job
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default PostJobPage
