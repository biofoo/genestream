// src/api/projectApi.ts
import axios from 'axios';
import { MemberRole, Project, ProjectRole, ProjectRoleData } from '@/types';

// Types
interface SetActiveProjectRequest {
    projectId: string;
}

interface GetActiveProjectResponse {
    activeProject: Project;
}

interface ProjectMember {
    id: string;
    name: string;
    email: string;
    role: string;
    joined_at: string;
}

export interface ProjectInvite {
    projectId: string;
    userEmail: string;
    role: MemberRole;  // can't invite as owner
}

export interface ProjectMemberAction {
    action: MemberRole | 'remove';  // can't change to owner
    memberIds: string[];
}

// API Client class
export class ProjectApi {
    constructor(private baseUrl: string, private getToken: () => Promise<string>) { }

    private async getHeaders(): Promise<{ Authorization: string }> {
        const token = await this.getToken();
        return { Authorization: `Bearer ${token}` };
    }

    // Projects List
    async getProjects(): Promise<Project[]> {
        const headers = await this.getHeaders();
        const response = await axios.get<Project[]>(`${this.baseUrl}/projects`, { headers });
        return response.data;
    }

    // Active Project
    async getActiveProject(): Promise<Project | null> {
        const headers = await this.getHeaders();
        const response = await axios.get<GetActiveProjectResponse>(
            `${this.baseUrl}/projects/getActiveProject`,
            { headers }
        );
        return response.data.activeProject;
    }

    async setActiveProject(projectId: string): Promise<void> {
        const headers = await this.getHeaders();
        const data: SetActiveProjectRequest = { projectId };
        await axios.post(
            `${this.baseUrl}/projects/setActiveProject`,
            data,
            { headers }
        );
    }

    // Project CRUD
    async createProject(name: string): Promise<Project> {
        const headers = await this.getHeaders();
        const response = await axios.post<Project>(
            `${this.baseUrl}/projects`,
            { name },
            { headers }
        );
        return response.data;
    }

    async updateProject(projectId: string, name: string): Promise<Project> {
        const headers = await this.getHeaders();
        const response = await axios.put<Project>(
            `${this.baseUrl}/projects/${projectId}`,
            { name },
            { headers }
        );
        return response.data;
    }

    async deleteProject(projectId: string): Promise<void> {
        const headers = await this.getHeaders();
        await axios.delete(`${this.baseUrl}/projects/${projectId}`, { headers });
    }

    // Project Members
    async getProjectMembers(projectId: string): Promise<ProjectMember[]> {
        const headers = await this.getHeaders();
        const response = await axios.get<ProjectMember[]>(
            `${this.baseUrl}/projects/${projectId}/members`,
            { headers }
        );
        return response.data;
    }

    async inviteMember(invite: ProjectInvite): Promise<void> {
        const headers = await this.getHeaders();
        await axios.post(
            `${this.baseUrl}/projects/invite`,
            invite,
            { headers }
        );
    }

    async removeMember(projectId: string, memberId: string): Promise<void> {
        const headers = await this.getHeaders();
        await axios.post(
            `${this.baseUrl}/projects/${projectId}/members/${memberId}/remove`,
            {},
            { headers }
        );
    }

    async getUserRole(projectId: string): Promise<ProjectRoleData> {
        const headers = await this.getHeaders();
        const response = await axios.get(
            `${this.baseUrl}/projects/user-role/${projectId}`,
            { headers }
        );
        return response.data;
    }

    async changeRole(projectId: string, memberId: string, newRole: ProjectRole): Promise<void> {
        const headers = await this.getHeaders();
        await axios.post(
            `${this.baseUrl}/projects/${projectId}/members/${memberId}/changeRole`,
            { newRole },
            { headers }
        );
    }

    async leaveProject(projectId: string): Promise<void> {
        const headers = await this.getHeaders();
        await axios.post(
            `${this.baseUrl}/projects/leave/${projectId}`,
            {},
            { headers }
        );
    }
}

// Factory function to create API client
export const createProjectApi = (baseUrl: string, getToken: () => Promise<string>) => {
    return new ProjectApi(baseUrl, getToken);
};