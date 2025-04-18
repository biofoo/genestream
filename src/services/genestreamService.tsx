// apps/genestream/src/services/genestreamService.tsx
import { SequenceDataWithAnnotation } from "@/types";
import { SearchOptions, SearchResponse, SearchSuggestion } from "@/types";
import { useAuth0 } from "@auth0/auth0-react";

const API_URL = import.meta.env.VITE_API_URL;

// Type definitions
interface AuthService {
  getToken: () => Promise<string | null>;
  isAuthenticated: boolean;
}

interface ApiErrorResponse {
  error: string;
  message?: string;
}

class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Base service with auth handling
const createBaseService = () => {
  const useAuthToken = (): AuthService => {
    const { getAccessTokenSilently, isAuthenticated } = useAuth0();

    console.log("Auth status:", isAuthenticated);

    const getToken = async () => {
      if (!isAuthenticated) {
        console.warn("User not authenticated, token will be null.");
        return null;
      }
      try {
        const token = await getAccessTokenSilently();
        console.log("Access token retrieved:", token ? "Success" : "Failed");
        return token;
      } catch (error) {
        console.error("Error getting access token:", error);
        return null;
      }
    };

    return { getToken, isAuthenticated };
  };

  const handleApiError = async (response: Response): Promise<never> => {
    try {
      const errorData: ApiErrorResponse = await response.json();
      throw new ApiError(
        errorData.message || errorData.error || response.statusText,
        response.status
      );
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError("An unexpected error occurred", response.status);
    }
  };

  return { useAuthToken, handleApiError };
};

// Helper for making authenticated requests
async function makeAuthorizedRequest<T>(
  endpoint: string,
  token: string | null,
  options: RequestInit = {}
): Promise<T> {
  const fullUrl = `${API_URL}${endpoint}`;

  console.log(`Making API request to: ${fullUrl}`);
  console.log("Auth Token Provided:", token ? "Yes" : "No");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  if (!response.ok) {
    console.error(`API Error: ${response.status} - ${response.statusText}`);
    const { handleApiError } = createBaseService();
    await handleApiError(response);
  }

  return response.json();
}

// Public search service
export const useSearchService = () => {
  const { getToken, isAuthenticated } = createBaseService().useAuthToken();

  return {
    getSuggestions: async (params: {
      query: string;
      type?: string;
    }): Promise<SearchSuggestion[]> => {
      console.log("getSuggestions called with params:", params);

      const token = await getToken();
      console.log("Got auth token:", !!token);

      const queryParams = new URLSearchParams({
        query: params.query,
        ...(params.type && { type: params.type }),
      });

      console.log(
        "Making request to:",
        `${API_URL}/sequences/suggest?${queryParams}`
      );

      return makeAuthorizedRequest<SearchSuggestion[]>(
        `/sequences/suggest?${queryParams}`,
        token
      );
    },

    searchSequences: async (
      options: SearchOptions
    ): Promise<SearchResponse> => {
      const token = await getToken();

      const queryParams = new URLSearchParams({
        query: options.query || "",
        page: (options.page || 1).toString(),
        limit: (options.limit || 20).toString(),
        ...(options.sort && {
          sortBy: options.sort.field,
          sortOrder: options.sort.order,
        }),
        ...(options.filters?.projectId && {
          projectId: options.filters.projectId,
        }),
        publicOnly: !token || options.filters?.publicOnly ? "true" : "false",
      });

      return makeAuthorizedRequest<SearchResponse>(
        `/sequences/search?${queryParams}`,
        token
      );
    },
    isAuthenticated,
  };
};

// Main service with full API access
export const useGeneStreamService = () => {
  const { getToken } = createBaseService().useAuthToken();

  return {
    fetchSequence: async (gs_id: string, params?: { include?: string }) => {
      const token = await getToken();
      const queryParams = params?.include ? `?include=${params.include}` : "";
      return makeAuthorizedRequest<SequenceDataWithAnnotation>(
        `/sequences/${gs_id}${queryParams}`,
        token
      );
    },

    createAnnotation: async (
      gs_id: string,
      type: "name" | "description",
      content: string
    ): Promise<void> => {
      const token = await getToken();
      return makeAuthorizedRequest<void>("/annotations", token, {
        method: "POST",
        body: JSON.stringify({ gs_id, type, content }),
      });
    },

    editAnnotation: async (
      annotationId: string,
      content: string
    ): Promise<void> => {
      const token = await getToken();
      return makeAuthorizedRequest<void>(
        `/annotations/${annotationId}`,
        token,
        {
          method: "PATCH",
          body: JSON.stringify({ content }),
        }
      );
    },

    publishAnnotation: async (annotationId: string): Promise<void> => {
      const token = await getToken();
      return makeAuthorizedRequest<void>(
        `/annotations/${annotationId}/publish`,
        token,
        { method: "PATCH" }
      );
    },

    updateAccess: async (
      gs_id: string,
      access: "public" | "private"
    ): Promise<void> => {
      const token = await getToken();
      return makeAuthorizedRequest<void>(`/sequences/${gs_id}/access`, token, {
        method: "PATCH",
        body: JSON.stringify({ access_level: access }),
      });
    },

    grantProjectAccess: async (
      gs_id: string,
      projectId: string
    ): Promise<void> => {
      const token = await getToken();
      return makeAuthorizedRequest<void>(
        `/sequences/${gs_id}/project-access`,
        token,
        {
          method: "POST",
          body: JSON.stringify({ project_id: projectId }),
        }
      );
    },

    revokeProjectAccess: async (
      gs_id: string,
      projectId: string
    ): Promise<void> => {
      const token = await getToken();
      return makeAuthorizedRequest<void>(
        `/sequences/${gs_id}/project-access/${projectId}`,
        token,
        { method: "DELETE" }
      );
    },
  };
};

export type GeneStreamService = ReturnType<typeof useGeneStreamService>;
