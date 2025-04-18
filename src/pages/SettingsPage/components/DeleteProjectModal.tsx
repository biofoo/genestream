// src/components/SettingsPage/DeleteProjectModal.tsx
import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { createProjectApi } from "@/api/projectApi";
import { useProjectStore } from "@/stores/useProjectStore";

interface DeleteProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string | undefined;
  onProjectDeleted: () => void;
}

const DeleteProjectModal: React.FC<DeleteProjectModalProps> = ({
  isOpen,
  onClose,
  projectId,
  onProjectDeleted,
}) => {
  const { getAccessTokenSilently } = useAuth0();
  const { setActiveProject } = useProjectStore();
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Create ProjectApi instance
  const projectApi = React.useMemo(
    () =>
      createProjectApi(import.meta.env.VITE_API_URL, getAccessTokenSilently),
    [getAccessTokenSilently]
  );

  // Delete project mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await projectApi.deleteProject(id);
      const newActiveProject = await projectApi.getActiveProject();
      return newActiveProject;
    },
    onSuccess: (newActiveProject) => {
      if (newActiveProject) {
        setActiveProject(newActiveProject);
      }
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      onProjectDeleted();
      onClose();
    },
    onError: (err) => {
      console.error("Error deleting project:", err);
      setError(
        "An error occurred while deleting the project. Please try again."
      );
    },
  });

  const handleDelete = () => {
    if (!projectId) return;
    setError(null);
    deleteMutation.mutate(projectId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg w-96">
        <h2 className="text-2xl font-bold mb-4">Delete Project</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <p>
            Are you sure you want to delete this project? This action cannot be
            undone.
          </p>
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={deleteMutation.isPending}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete Project"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProjectModal;
