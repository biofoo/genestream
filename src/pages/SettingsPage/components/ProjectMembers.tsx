// apps/gs/frontend/src/pages/SettingsPage/components/ProjectMembers.tsx

import React, { useState, useMemo } from "react";
import DeleteProjectModal from "./DeleteProjectModal";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Project,
  ProjectRole,
  ProjectMember,
  ProjectDetails,
  ProjectMemberAction,
  MemberRole,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createProjectApi } from "@/api/projectApi";
import { useProjectStore } from "@/stores/useProjectStore";

const API_URL = import.meta.env.VITE_API_URL;

interface ProjectMembersProps {
  selectedProject: Project | null;
}

const ProjectMembers: React.FC<ProjectMembersProps> = ({ selectedProject }) => {
  const [error] = useState<string | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedAction, setSelectedAction] = useState<string>("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<MemberRole>("contributor");
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { getAccessTokenSilently, user } = useAuth0();
  const { activeProject } = useProjectStore();
  const queryClient = useQueryClient();

  const { projectApi } = useMemo(
    () => ({
      projectApi: createProjectApi(API_URL, getAccessTokenSilently),
    }),
    [getAccessTokenSilently]
  );

  const { data: projectDetails } = useQuery<ProjectDetails>({
    queryKey: ["project", selectedProject?.id, "members"],
    queryFn: async () => {
      const [members, userRole] = await Promise.all([
        projectApi.getProjectMembers(selectedProject!.id),
        projectApi.getUserRole(selectedProject!.id),
      ]);
      return { members, userRole };
    },
    enabled: !!selectedProject?.id,
  });

  const members = projectDetails?.members || [];
  const userRole = projectDetails?.userRole.role || "";

  const handleSelectMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSelectAll = () => {
    const eligibleMembers = members.filter(
      (member: ProjectMember) =>
        member.role !== "owner" && member.id !== user?.sub
    );
    const allEligibleSelected = eligibleMembers.every((member: ProjectMember) =>
      selectedMembers.includes(member.id)
    );

    setSelectedMembers(
      allEligibleSelected
        ? [] // If all eligible members are selected, deselect all
        : eligibleMembers.map((member: ProjectMember) => member.id) // Otherwise, select all eligible members
    );
  };

  const actionMutation = useMutation({
    mutationFn: async ({ action, memberIds }: ProjectMemberAction) => {
      if (action === "remove") {
        await Promise.all(
          memberIds.map((id) =>
            projectApi.removeMember(selectedProject!.id, id)
          )
        );
      } else {
        await Promise.all(
          memberIds.map((id) =>
            projectApi.changeRole(selectedProject!.id, id, action)
          )
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["project", selectedProject?.id, "members"],
      });
      setSelectedMembers([]);
      setSelectedAction("");
    },
  });

  const inviteMutation = useMutation({
    mutationFn: ({ email, role }: { email: string; role: MemberRole }) =>
      projectApi.inviteMember({
        projectId: selectedProject!.id,
        userEmail: email,
        role,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["project", selectedProject?.id, "members"],
      });
      setInviteEmail("");
    },
  });

  const leaveMutation = useMutation({
    mutationFn: () => projectApi.leaveProject(selectedProject!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setShowLeaveConfirmation(false);
      window.location.reload();
    },
  });

  const handleAction = () => {
    if (!selectedAction || selectedMembers.length === 0) return;
    actionMutation.mutate({
      action: selectedAction as MemberRole | "remove",
      memberIds: selectedMembers,
    });
  };

  const handleInvite = (event: React.FormEvent) => {
    event.preventDefault();
    inviteMutation.mutate({
      email: inviteEmail,
      role: inviteRole, // This is now correctly typed as MemberRole
    });
  };

  const handleLeaveProject = () => {
    leaveMutation.mutate();
  };

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  if (!selectedProject) {
    return <div>No project selected</div>;
  }

  return (
    <div className="bg-background shadow overflow-hidden sm:rounded-lg">
      <div className="px-6 py-5 sm:px-6">
        <h2 className="text-2xl font-semibold text-foreground">Project</h2>
      </div>
      <div className="px-4 py-2 sm:px-6">
        <div className="max-w-2xl text-sm text-muted-foreground">
          <p>
            Your role in {selectedProject.name} is '{userRole}'.
          </p>
          {userRole !== "owner" && (
            <div className="text-sm">
              To leave this project, click{" "}
              <span
                onClick={() => setShowLeaveConfirmation(true)}
                className="text-red-600 hover:text-red-800 cursor-pointer font-medium"
              >
                here
              </span>
              .
            </div>
          )}
          {activeProject &&
            userRole === "owner" &&
            selectedProject &&
            selectedProject.id === activeProject.id &&
            !selectedProject.is_default && (
              <div className="mt-2 text-sm">
                To delete this project, click{" "}
                <span
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="text-red-600 hover:text-red-800 cursor-pointer font-medium"
                >
                  here
                </span>
                .
              </div>
            )}
        </div>
        <DeleteProjectModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          projectId={selectedProject?.id}
          onProjectDeleted={() => {
            // Refresh projects list or navigate away
            window.location.reload(); // This is a simple way to refresh, but you might want to use a more React-friendly approach
          }}
        />
      </div>

      {!selectedProject.is_default && (
        <div className="px-4 py-5 sm:p-6">
          <h4 className="text-lg font-medium text-foreground mb-2">
            Invite New Members
          </h4>
          <form onSubmit={handleInvite} className="flex items-center space-x-4">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Email address"
              className="flex-grow px-3 py-2 border border-input rounded-md bg-background text-foreground"
              required
            />{" "}
            &nbsp;&nbsp;&nbsp;as
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as MemberRole)}
              className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
            >
              <option value="contributor">Contributor</option>
              <option value="admin">Admin</option>
              <option value="observer">Observer</option>
            </select>
            <button
              onClick={handleAction}
              disabled={
                !selectedAction ||
                selectedMembers.length === 0 ||
                actionMutation.isPending
              }
              className="ml-2 inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {inviteMutation.isPending ? "Inviting..." : "Invite"}
            </button>
          </form>

          <h4 className="text-lg font-medium text-foreground mt-8 mb-4">
            Project Members
          </h4>

          {(userRole === "owner" || userRole === "admin") && (
            <div className="flex items-center mb-4">
              <select
                value={selectedAction}
                onChange={(e) =>
                  setSelectedAction(e.target.value as ProjectRole | "remove")
                }
                className="block w-64 h-9 px-3 border border-input rounded-md shadow-sm bg-background text-foreground focus:outline-none focus:ring-ring focus:border-ring text-sm"
              >
                <option value="">Select Action</option>
                <option value="admin">Make Admin</option>
                <option value="contributor">Make Contributor</option>
                <option value="observer">Make Observer</option>
                <option value="remove">Remove from Project</option>
              </select>
              <button
                onClick={handleAction}
                disabled={
                  !selectedAction ||
                  selectedMembers.length === 0 ||
                  actionMutation.isPending
                }
                className="ml-2 inline-flex items-center justify-center h-9 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {actionMutation.isPending ? "Applying..." : "Apply Action"}
              </button>
            </div>
          )}

          <div className="flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-border sm:rounded-lg">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted">
                      <tr>
                        {(userRole === "owner" || userRole === "admin") && (
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                          >
                            <input
                              type="checkbox"
                              checked={
                                members
                                  .filter(
                                    (member: ProjectMember) =>
                                      member.role !== "owner" &&
                                      member.id !== user?.sub
                                  )
                                  .every((member: ProjectMember) =>
                                    selectedMembers.includes(member.id)
                                  ) || false
                              }
                              onChange={handleSelectAll}
                              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-input rounded"
                            />
                          </th>
                        )}
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                        >
                          Name
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                        >
                          Email
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                        >
                          Role
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                        >
                          Member Since
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-border">
                      {members.map((member: ProjectMember) => (
                        <tr key={member.id}>
                          {(userRole === "owner" || userRole === "admin") && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              {member.role !== "owner" &&
                                member.id !== user?.sub && (
                                  <input
                                    type="checkbox"
                                    checked={selectedMembers.includes(
                                      member.id
                                    )}
                                    onChange={() =>
                                      handleSelectMember(member.id)
                                    }
                                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-input rounded"
                                  />
                                )}
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <a
                              href="#"
                              className="text-primary hover:text-primary/90"
                            >
                              {member.name}
                            </a>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {member.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {member.role}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {member.joined_at}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLeaveConfirmation && (
        <div
          className="fixed z-10 inset-0 overflow-y-auto"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-background/80 transition-opacity"
              aria-hidden="true"
            ></div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom text-background rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="text-background px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3
                      className="text-lg leading-6 font-medium text-foreground"
                      id="modal-title"
                    >
                      Leave Project
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">
                        Are you sure you want to leave this project? This action
                        cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-muted px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleLeaveProject}
                  disabled={leaveMutation.isPending}
                >
                  {leaveMutation.isPending ? "Leaving..." : "Leave Project"}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-input shadow-sm px-4 py-2 text-background text-base font-medium text-gray-700 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowLeaveConfirmation(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectMembers;
