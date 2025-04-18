// src/types/index.ts - Consolidated types for the frontend application

// Project types
export type MemberRole = "admin" | "contributor" | "observer";
export type ProjectRole = "owner" | "admin" | "contributor" | "observer";

export interface Project {
  id: string;
  name: string;
  is_default: boolean;
  role: string;
}

export interface ProjectAccess {
  project_id: string;
  project_name?: string;
  granted_by: string;
  granted_at: string | Date;
}

export interface ProjectRoleData {
  role: string;
  joined_at: string;
}

export interface ProjectMember {
  id: string;
  name: string;
  email: string;
  role: string;
  joined_at: string;
}

export interface ProjectDetails {
  members: ProjectMember[];
  userRole: ProjectRoleData;
}

export interface ProjectMemberAction {
  action: MemberRole | "remove";
  memberIds: string[];
}

// API Error types
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  message: string;
  code: string;
  validation?: ValidationError[];
}

// Search types
export type CharSetType = "DNA" | "RNA" | "PROTEIN" | "UNKNOWN";

export interface SearchOptions {
  query: string;
  page?: number;
  limit?: number;
  filters?: {
    projectId?: string;
    organism?: string;
    minLength?: number;
    maxLength?: number;
    dateFrom?: Date;
    dateTo?: Date;
    charSet?: CharSetType;
    publicOnly?: boolean;
  };
  sort?: {
    field: "relevance" | "date" | "length";
    order: "asc" | "desc";
  };
  includeAggregations?: boolean;
}

export interface SearchResult {
  gs_id: string;
  score: number;
  sequence_length: number | null;
  char_set: CharSetType;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  published_by?: string;
  published_at?: string;
  metadata: {
    organism?: string;
    display_name?: string;
    display_description?: string;
    public_ids: Record<string, string>;
    public_names: Record<string, string>;
    public_aliases: string[];
    access_level: "private" | "public";
  };
  annotations: {
    name: string;
    description: string;
    created_by: string;
    sequence: string;
  };
}

export interface AggregationBucket {
  value: string;
  count: number;
}

export interface RangeBucket {
  range: string;
  count: number;
}

export interface DateBucket {
  date: string;
  count: number;
}

export interface SearchAggregations {
  organisms: {
    buckets: {
      key: string;
      doc_count: number;
    }[];
  };
  char_sets: {
    buckets: {
      key: CharSetType;
      doc_count: number;
    }[];
  };
  sequence_length_ranges: {
    buckets: {
      key: string;
      from?: number;
      to?: number;
      doc_count: number;
    }[];
  };
  creation_date: {
    buckets: {
      key: number;
      key_as_string: string;
      doc_count: number;
    }[];
  };
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  aggregations: SearchAggregations;
  searchParams: URLSearchParams;
}

export interface SequenceResponse {
  gs_id: string;
  sequence?: string;
  metadata: SequenceMetadataResponse & SequenceResponseMetadata;
  annotations?: {
    name: AnnotationResponse[];
    description: AnnotationResponse[];
  };
  _metadata?: {
    jsonLd?: Record<string, any>;
    cache: {
      ttl: number;
    };
  };
}

export interface SequenceResponseMetadata {
  access_level: 'public' | 'private';
  project_access: ProjectAccessRecord[];
  organization_id?: string[];
  created_at: string;
  updated_at: string;
}

export interface AnnotationResponse {
  _id: string;
  gs_id: string;
  type: 'name' | 'description';
  content: string;
  created_by: string;
  project_id: string;
  access_level: 'private' | 'public';
  created_at: string;
  updated_at: string;
  published: boolean;
  published_by: string | null;
  published_at: string | null;
}

export interface SearchSuggestion {
  id: string;
  text: string;
  description?: string;
  highlight?: any;
  score?: number;
}

// Sequence types
export interface ProjectAccessRecord {
  project_id: string;
  granted_at: string | Date;
  granted_by: string;
}

export interface SequenceMetadataResponse {
  gs_id: string;
  char_set: CharSetType;
  length: number;
  checksum: string;
  organism?: string;
  display_name?: string;
  display_description?: string;
  public_aliases?: string[];
  public_ids?: Record<string, string>;
  public_names?: Record<string, string>;
  access_level: "private" | "public";
  project_access: ProjectAccessRecord[];
  organization_id?: string[];
  created_at: string;
  updated_at: string;
}

export interface APIAnnotation {
  _id: string;
  gs_id: string;
  type: "name" | "description";
  content: string;
  created_by: string;
  project_id: string;
  access_level: "private" | "public";
  created_at: string;
  updated_at: string;
  published: boolean;
  published_by: string | null;
  published_at: string | null;
}

export interface SequenceDataWithAnnotation {
  gs_id: string;
  sequence?: string;
  metadata?: SequenceMetadataResponse;
  annotations?: {
    name: APIAnnotation[];
    description: APIAnnotation[];
  };
  _metadata?: {
    jsonLd?: Record<string, any>;
    cache: {
      ttl: number;
    };
  };
}

// Annotation types used in the frontend
export interface CreateAnnotationFormData {
  type: "name" | "description";
  content: string;
  project_id: string;
}

export interface BaseAnnotation {
  gs_id: string;
  type: "name" | "description";
  content: string;
  created_by: string;
  project_id: string;
  access_level: "private" | "public";
}

export interface CreateAnnotationInput
  extends Omit<BaseAnnotation, "access_level"> {
  gs_id: string;
  created_by: string;
  access_level?: "private" | "public";
}

// UI Component Props
export interface CreateAnnotationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateAnnotationFormData) => Promise<void>;
  availableProjects: ProjectAccess[];
  initialType?: "name" | "description";
}

export interface ProjectOption {
  value: string;
  label: string;
  grantedAt: string;
  grantedBy: string;
}

export interface AnnotationPermissions {
  canEdit: boolean;
  canPublish: boolean;
  canDelete: boolean;
  availableProjects: ProjectAccess[];
}

export interface AnnotationItemProps {
  annotation: APIAnnotation;
  userProjects: ProjectAccess[];
  onEdit: (annotationId: string, content: string) => Promise<void>;
  onPublish: (annotationId: string) => Promise<void>;
  onVote?: (annotationId: string, isUpvote: boolean) => Promise<void>;
  className?: string;
}

// User types
export interface User {
  id: string;
  auth0_id: string;
  name: string;
  email: string;
  picture: string;
  created_at: string;
  updated_at: string;
  active_project_id: string | null;
  type: "core" | "manufacturer" | "customer";
}

// Utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export type AsyncData<T> = {
  data: Optional<T>;
  isLoading: boolean;
  error: Optional<Error>;
};

export type WithMetadata<T> = T & {
  metadata: {
    created_at: string;
    updated_at: string;
  };
};
