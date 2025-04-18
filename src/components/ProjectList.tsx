// src/components/ProjectList.tsx
import React, { useEffect } from "react";
import { useProjectStore } from "../stores/useProjectStore";
import { projectApi } from "../api/projects";

export const ProjectList: React.FC = () => {
  const {
    projects,
    activeProject,
    setProjects,
    setActiveProject,
    isLoading,
    setIsLoading,
  } = useProjectStore();

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const [projectList, active] = await Promise.all([
          projectApi.getProjects(),
          projectApi.getActiveProject(),
        ]);
        setProjects(projectList);
        setActiveProject(active);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleProjectSelect = async (projectId: string) => {
    try {
      const updatedActive = await projectApi.setActiveProject(projectId);
      setActiveProject(updatedActive);
    } catch (error) {
      console.error("Error setting active project:", error);
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading projects...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Your Projects</h2>
      <div className="space-y-2">
        {projects.map((project) => (
          <div
            key={project.id}
            className={`p-3 rounded-lg cursor-pointer ${
              project.id === activeProject?.id
                ? "bg-blue-100 border-2 border-blue-500"
                : "bg-gray-50 hover:bg-gray-100"
            }`}
            onClick={() => handleProjectSelect(project.id)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{project.name}</h3>
                <p className="text-sm text-gray-500">Role: {project.role}</p>
              </div>
              {project.is_default && (
                <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                  Default
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
