"use client"
import { useState, useEffect } from "react"
import { useAuth } from "../../../context/AuthContext"
import Button from "../../../components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/Card"
import Input from "../../../components/ui/Input"
import Label from "../../../components/ui/Label"
import toast from "react-hot-toast"
import { Building2, Globe, Briefcase, MapPin, Users, FileText, Save, Loader2 } from "lucide-react"

function CompanyProfilePage() {
  const { user, refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    companyWebsite: "",
    industry: "",
    location: "",
    description: "",
    size: "",
    logoUrl: "",
  });

  // Populate form from current user data
  useEffect(() => {
    if (user) {
      setFormData({
        companyWebsite: user.companyWebsite || "",
        industry: user.industry || "",
        location: user.location || "",
        description: user.description || "",
        size: user.size || "",
        logoUrl: user.logoUrl || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5001/api/company/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error);
      toast.success("Profile saved successfully!");
      // Refresh in-memory user so dashboard reflects new values immediately
      await refreshUser();
    } catch (error) {
      toast.error(error.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const companyInitial = user?.companyName?.charAt(0)?.toUpperCase() || "C";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Company Profile</h1>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
        >
          {saving ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
          ) : (
            <><Save className="h-4 w-4" /> Save Changes</>
          )}
        </Button>
      </div>

      {/* Company Identity Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-purple-600" />
            Company Identity
          </CardTitle>
          <CardDescription>Basic registration info (read-only)</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Company Name</Label>
            <Input value={user?.companyName || ""} disabled className="bg-gray-50 text-gray-500 mt-1" />
            <p className="text-xs text-gray-400 mt-1">Cannot be changed after registration.</p>
          </div>
          <div>
            <Label>Business Email</Label>
            <Input value={user?.businessEmail || ""} disabled className="bg-gray-50 text-gray-500 mt-1" />
            <p className="text-xs text-gray-400 mt-1">Contact support to change your email.</p>
          </div>
          <div>
            <Label>Business Phone</Label>
            <Input value={user?.businessPhone || ""} disabled className="bg-gray-50 text-gray-500 mt-1" />
          </div>
        </CardContent>
      </Card>

      {/* Editable Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-purple-600" />
            Profile Details
          </CardTitle>
          <CardDescription>This information is shown to job seekers</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="flex items-center gap-1 mb-1">
              <Globe className="h-4 w-4 text-gray-400" /> Website
            </Label>
            <Input
              name="companyWebsite"
              value={formData.companyWebsite}
              onChange={handleChange}
              placeholder="https://yourcompany.com"
            />
          </div>
          <div>
            <Label className="flex items-center gap-1 mb-1">
              <Briefcase className="h-4 w-4 text-gray-400" /> Industry
            </Label>
            <Input
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              placeholder="e.g. Technology, Finance, Healthcare"
            />
          </div>
          <div>
            <Label className="flex items-center gap-1 mb-1">
              <MapPin className="h-4 w-4 text-gray-400" /> Location
            </Label>
            <Input
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Mumbai, India"
            />
          </div>
          <div>
            <Label className="flex items-center gap-1 mb-1">
              <Users className="h-4 w-4 text-gray-400" /> Company Size
            </Label>
            <Input
              name="size"
              value={formData.size}
              onChange={handleChange}
              placeholder="e.g. 1-10, 11-50, 51-200, 200+"
            />
          </div>
          <div className="sm:col-span-2">
            <Label className="flex items-center gap-1 mb-1">
              <Globe className="h-4 w-4 text-gray-400" /> Logo URL
            </Label>
            <Input
              name="logoUrl"
              value={formData.logoUrl}
              onChange={handleChange}
              placeholder="https://link-to-your-logo.png"
            />
          </div>
          <div className="sm:col-span-2">
            <Label className="flex items-center gap-1 mb-1">
              <FileText className="h-4 w-4 text-gray-400" /> Company Description
            </Label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell candidates about your company, culture, and mission..."
              rows={4}
              className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Profile Preview */}
      {(formData.description || formData.industry || formData.location) && (
        <Card className="border-purple-100 bg-purple-50/30">
          <CardHeader>
            <CardTitle className="text-sm text-purple-700">Preview (as seen by candidates)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-600 text-white text-xl font-bold flex-shrink-0">
                {formData.logoUrl ? (
                  <img src={formData.logoUrl} alt="logo" className="h-14 w-14 rounded-xl object-cover" />
                ) : (
                  companyInitial
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{user?.companyName}</h3>
                <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-1">
                  {formData.industry && <span>🏢 {formData.industry}</span>}
                  {formData.location && <span>📍 {formData.location}</span>}
                  {formData.size && <span>👥 {formData.size} employees</span>}
                  {formData.companyWebsite && (
                    <a href={formData.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                      🌐 Website
                    </a>
                  )}
                </div>
                {formData.description && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-3">{formData.description}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default CompanyProfilePage;
