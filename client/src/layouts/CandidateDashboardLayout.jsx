"use client"

import { useState } from "react"
import Sidebar from "../components/dashboard/Sidebar";
import Header from "../components/dashboard/Header"

function CandidateDashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden" onClick={toggleSidebar}>
          <div className="absolute h-full w-64 bg-white" onClick={(e) => e.stopPropagation()}>
            <Sidebar userType="candidate" />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:block h-screen">
        <Sidebar userType="candidate" />
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header userType="candidate" toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}

export default CandidateDashboardLayout

