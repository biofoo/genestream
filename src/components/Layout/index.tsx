// apps/gs/src/components/Layout/index.tsx
import React, { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Toaster } from "@/components/ui/toaster";
import { useAuth0 } from "@auth0/auth0-react";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isAuthenticated } = useAuth0();

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="min-h-[100vh] bg-gray-50 dark:bg-gray-900">
      <Header isExpanded={isExpanded} onToggle={toggleSidebar} />
      {isAuthenticated && (
        <Sidebar isExpanded={isExpanded} onToggle={toggleSidebar} />
      )}
      <main
        className={`
          transition-all
          duration-300
          ${isExpanded ? "ml-56" : "ml-20"}
          pt-20
`}
      >
        {children}
      </main>
      <Toaster />
    </div>
  );
};

export { Layout, Header, Sidebar };
