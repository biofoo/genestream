// src/components/Layout/ProjectSelector.tsx
import React from "react";
import { Check, FolderIcon } from "lucide-react";
import { Project } from "@/types";
import { useProjectStore } from "@/stores/useProjectStore";
import { projectApi } from "@/api/projects";
import { cn } from "@/lib/utils";

interface ProjectSelectorProps {
  closeMenu: () => void;
}

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  closeMenu,
}) => {
  const { projects, activeProject, setActiveProject, isLoading } =
    useProjectStore();

  const handleProjectSelect = async (project: Project) => {
    try {
      const updatedActive = await projectApi.setActiveProject(project.id);
      setActiveProject(updatedActive);
    } catch (error) {
      console.error("Error setting active project:", error);
    }
  };

  const handleViewAllProjects = () => {
    closeMenu();
    // Navigate to projects page - pass this as a prop or use react-router directly
    // navigate('/projects');
  };

  if (isLoading) {
    return (
      <div className="px-2 py-2 border-b border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Loading projects...
        </div>
      </div>
    );
  }

  const displayedProjects = projects?.slice(0, 5) || [];
  //   const hasMoreProjects = projects && projects.length > 5;

  return (
    <div className="px-2 py-2 border-b border-gray-200 dark:border-gray-700">
      <div className="space-y-1">
        {displayedProjects.map((project: Project) => (
          <button
            key={project.id}
            onClick={() => handleProjectSelect(project)}
            className={cn(
              "w-full px-2 py-2 text-sm text-left rounded-md flex items-center justify-between",
              "hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200",
              project.id === activeProject?.id && "bg-gray-50 dark:bg-gray-600"
            )}
          >
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {project.name}
            </span>
            {project.id === activeProject?.id && (
              <Check className="h-4 w-4 text-[#e97720] dark:text-[#e97720]" />
            )}
          </button>
        ))}
      </div>

      <button
        onClick={handleViewAllProjects}
        className="mt-2 w-full px-2 text-sm text-left rounded-md flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
      >
        <FolderIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        <span className="ml-1 text-sm text-gray-700 dark:text-gray-200">
          All projects
        </span>
      </button>
    </div>
  );
};
