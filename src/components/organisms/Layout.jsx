import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/layouts/Root";
import Header from "@/components/organisms/Header";
import Sidebar from "@/components/organisms/Sidebar";

const Layout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { logout } = useAuth();

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <Sidebar 
        isOpen={false}
        onClose={() => {}}
      />

      {/* Mobile Sidebar */}
      <Sidebar 
        isOpen={isMobileSidebarOpen}
        onClose={closeMobileSidebar}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          onToggleSidebar={toggleMobileSidebar}
          onLogout={logout}
        />
        
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;