// src/pages/SequenceDetailPage/index.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth0 } from "@auth0/auth0-react";
import { useSequenceDetail } from "./hooks/useSequenceDetail";
import { AlertCircle, Copy, Check } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { useClipboard } from "@/hooks/useClipboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnnotationItem } from "@/components/AnnotationItem";
import { CreateAnnotationDialog } from "@/components/CreateAnnotationDialog";
import { ProjectAccessDisplay } from "@/components/ProjectAccessDisplay";
import { Skeleton } from "@/components/ui/skeleton";
import { getDisplayName } from "./utils";
import { SequenceMetadataResponse } from "@/types";
import { APIAnnotation } from "@/types";
import { ProjectAccess } from "@/types";
import { CreateAnnotationFormData } from "@/types";

const SequenceDetailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const gs_id = searchParams.get("id") || "";
  const navigate = useNavigate();
  const { user } = useAuth0();
  const { copied, handleCopy } = useClipboard();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { isLoading: isAuthLoading } = useAuth0();

  // Ref for the annotations section
  const { ref: annotationsRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const {
    metadata,
    sequence,
    annotations,
    isLoadingMetadata,
    isLoadingSequence,
    isLoadingAnnotations,
    loadAnnotations,
    error,
    handleCreateAnnotation,
    handleEditAnnotation,
    handlePublishAnnotation,
  } = useSequenceDetail(gs_id);

  // Scroll to top on navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [gs_id]);

  // Load annotations when scrolled into view
  useEffect(() => {
    if (inView && !annotations && !isLoadingAnnotations) {
      loadAnnotations();
    }
  }, [inView, annotations, isLoadingAnnotations, loadAnnotations]);

  const handleCreateAnnotationSubmit = async (
    formData: CreateAnnotationFormData
  ) => {
    if (!user?.sub) return;

    await handleCreateAnnotation({
      gs_id,
      type: formData.type,
      content: formData.content,
      created_by: user.sub,
      project_id: formData.project_id,
    });
    setIsCreateDialogOpen(false);
  };

  // Show loading state while either auth or data is loading
  if (isLoadingMetadata || isAuthLoading) {
    return <SequenceDetailSkeleton />;
  }

  // Only show error state if we're done loading auth
  if (!isAuthLoading && (error || !metadata)) {
    return (
      <ErrorState
        error={error ? new Error(error.message) : undefined}
        onBack={() => navigate("/")}
      />
    );
  }

  // TypeScript safety - we know metadata exists at this point
  if (!metadata) {
    throw new Error("Unexpected state: metadata is undefined");
  }

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Main content */}
          <div className="flex-1">
            <MainContent
              sequence={sequence}
              metadata={metadata}
              isLoadingSequence={isLoadingSequence}
              copied={copied}
              onCopy={handleCopy}
            />

            {/* Annotations section */}
            <div ref={annotationsRef}>
              <AnnotationsSection
                annotations={annotations}
                isLoading={isLoadingAnnotations}
                onCreateAnnotation={() => setIsCreateDialogOpen(true)}
                onEditAnnotation={handleEditAnnotation}
                onPublishAnnotation={handlePublishAnnotation}
                userProjects={metadata.project_access}
              />
            </div>
          </div>

          {/* Similar sequences sidebar */}
          <div className="w-80 flex-shrink-0">
            <SimilarSequences />
          </div>
        </div>
      </div>

      {/* Create Annotation Dialog */}
      <CreateAnnotationDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateAnnotationSubmit}
        availableProjects={metadata.project_access}
      />
    </Layout>
  );
};

export default SequenceDetailPage;

const MainContent: React.FC<{
  sequence?: string;
  metadata: SequenceMetadataResponse;
  isLoadingSequence: boolean;
  copied: boolean;
  onCopy: (text: string) => void;
}> = ({ sequence, metadata, isLoadingSequence, copied, onCopy }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold mb-2">
            {getDisplayName(metadata)}
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm font-light text-gray-500">
              GSID: {metadata.gs_id}
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="p-0 text-gray-500 hover:text-gray-700"
              onClick={() => onCopy(metadata.gs_id)}
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        <ProjectAccessDisplay
          accessLevel={metadata.access_level}
          projectAccess={metadata.project_access}
        />
      </div>

      {/* Metadata Card */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {metadata.organism && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">{metadata.organism}</span>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {metadata.length?.toLocaleString() || "0"} bp
            </Badge>
            <Badge variant="secondary">{metadata.char_set || "UNKNOWN"}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Sequence Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Sequence</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => sequence && onCopy(sequence)}
              disabled={!sequence || isLoadingSequence}
            >
              {copied ? (
                <Check className="w-4 h-4 mr-2 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              Copy
            </Button>
          </div>
          {isLoadingSequence ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <pre
              className="bg-gray-50 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap break-words"
              style={{ wordBreak: "break-word" }}
            >
              {sequence || ""}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const AnnotationsSection: React.FC<{
  annotations?: {
    name: APIAnnotation[];
    description: APIAnnotation[];
  };
  isLoading: boolean;
  onCreateAnnotation: () => void;
  onEditAnnotation: (id: string, content: string) => Promise<void>;
  onPublishAnnotation: (id: string) => Promise<void>;
  userProjects: ProjectAccess[];
}> = ({
  annotations,
  isLoading,
  onCreateAnnotation,
  onEditAnnotation,
  onPublishAnnotation,
  userProjects,
}) => {
  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Annotations</h2>
        <Button onClick={onCreateAnnotation} variant="outline">
          Add Annotation
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : annotations ? (
        <div className="space-y-6">
          {/* Name Annotations */}
          {annotations.name && annotations.name.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-500">Names</h3>
              {annotations.name.map((annotation) => (
                <AnnotationItem
                  key={annotation._id}
                  annotation={annotation}
                  userProjects={userProjects}
                  onEdit={onEditAnnotation}
                  onPublish={onPublishAnnotation}
                />
              ))}
            </div>
          )}

          {/* Description Annotations */}
          {annotations.description && annotations.description.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-500">
                Descriptions
              </h3>
              {annotations.description.map((annotation) => (
                <AnnotationItem
                  key={annotation._id}
                  annotation={annotation}
                  userProjects={userProjects}
                  onEdit={onEditAnnotation}
                  onPublish={onPublishAnnotation}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No annotations yet. Be the first to add one!
        </div>
      )}
    </div>
  );
};

const SimilarSequences: React.FC = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Similar Sequences</h3>
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="hover:bg-gray-50 transition-colors">
          <CardContent className="p-4">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const SequenceDetailSkeleton: React.FC = () => {
  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          <div className="flex-1 space-y-6">
            <div>
              <Skeleton className="h-8 w-1/2 mb-2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
            <Card>
              <CardContent className="p-4 space-y-4">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="w-80 flex-shrink-0">
            <Skeleton className="h-6 w-1/2 mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const ErrorState: React.FC<{
  error?: Error;
  onBack: () => void;
}> = ({ error, onBack }) => {
  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto px-4 py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Failed to load sequence
            </h3>
            <p className="text-gray-500 mb-4">
              {error?.message ||
                "An error occurred while loading the sequence."}
            </p>
            <Button onClick={onBack}>Return to Library</Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
