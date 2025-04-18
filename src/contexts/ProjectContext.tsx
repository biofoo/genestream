// src/contexts/projectContext.tsx
import React, { createContext, useContext, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Project } from "@/types";
import { createProjectApi } from "@/api/projectApi";
import { useProjects } from "@/hooks/useProjects";

interface ProjectContextType {
  activeProject: Project | null;
  projects: Project[];
  setActiveProject: (project: Project) => void;
  isLoading: boolean;
  error: Error | null;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  // Create API client
  const projectApi = React.useMemo(
    () =>
      createProjectApi(import.meta.env.VITE_API_URL, getAccessTokenSilently),
    [getAccessTokenSilently]
  );

  // Use our new hook
  const {
    projects = [],
    activeProject,
    isLoading,
    error,
    setActiveProject,
  } = useProjects(projectApi);

  // Sync active project with localStorage
  useEffect(() => {
    if (activeProject) {
      localStorage.setItem("activeProject", JSON.stringify(activeProject));
    } else if (!isLoading && isAuthenticated) {
      localStorage.removeItem("activeProject");
    }
  }, [activeProject, isLoading, isAuthenticated]);

  const value = {
    activeProject: activeProject || null,
    projects,
    setActiveProject,
    isLoading,
    error: error as Error | null,
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
};
