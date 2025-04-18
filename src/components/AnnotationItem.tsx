import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Share2,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { APIAnnotation } from "@/types";
import { ProjectAccess } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface AnnotationItemProps {
  annotation: APIAnnotation;
  userProjects: ProjectAccess[];
  onEdit: (annotationId: string, newContent: string) => Promise<void>;
  onPublish: (annotationId: string) => Promise<void>;
  onVote?: (annotationId: string, isUpvote: boolean) => Promise<void>;
  className?: string;
}

interface AnnotationPermissions {
  canEdit: boolean;
  canPublish: boolean;
  canDelete: boolean;
  availableProjects: ProjectAccess[];
}

interface EditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string) => Promise<void>;
  initialContent: string;
  isSubmitting: boolean;
  error?: string;
}

const EditDialog: React.FC<EditDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialContent,
  isSubmitting,
  error,
}) => {
  const [content, setContent] = useState(initialContent);

  const handleSubmit = async () => {
    if (content.trim() === initialContent.trim()) {
      onClose();
      return;
    }
    await onSubmit(content);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => !isSubmitting && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Annotation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting}
            className="min-h-[100px]"
          />
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const AnnotationItem: React.FC<AnnotationItemProps> = ({
  annotation,
  userProjects,
  onEdit,
  onPublish,
  onVote,
  className = "",
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const [isVoting, setIsVoting] = useState(false);

  const getPermissions = (): AnnotationPermissions => {
    const hasProjectAccess = userProjects.some(
      (project) => project.project_id === annotation.project_id
    );

    return {
      canEdit: hasProjectAccess,
      canPublish: hasProjectAccess && annotation.access_level === "private",
      canDelete: hasProjectAccess,
      availableProjects: hasProjectAccess ? userProjects : [],
    };
  };

  const permissions = getPermissions();

  const handleEdit = async (newContent: string) => {
    setError(undefined);
    setIsSubmitting(true);

    try {
      await onEdit(annotation._id, newContent);
      setIsEditDialogOpen(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update annotation"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    setIsSubmitting(true);
    try {
      await onPublish(annotation._id);
    } catch (err) {
      console.error("Failed to publish annotation:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (isUpvote: boolean) => {
    if (!onVote || isVoting) return;

    setIsVoting(true);
    try {
      await onVote(annotation._id, isUpvote);
    } catch (err) {
      console.error("Failed to register vote:", err);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${className}`}>
      <div className="flex flex-col space-y-4">
        {/* Header row with type and buttons */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-light text-gray-500 capitalize">
              {annotation.type}
            </h4>
            {annotation.published && (
              <Badge variant="secondary" className="text-xs">
                Published
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            {permissions.canEdit && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(true)}
                  disabled={isSubmitting}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                {permissions.canPublish && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handlePublish}
                    disabled={isSubmitting}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                )}
              </>
            )}
            {onVote && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleVote(true)}
                  disabled={isVoting}
                >
                  <ThumbsUp className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleVote(false)}
                  disabled={isVoting}
                >
                  <ThumbsDown className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <p className="text-gray-700">{annotation.content}</p>

        {/* Footer with metadata */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>
            Added {new Date(annotation.created_at).toLocaleDateString()} by{" "}
            {annotation.created_by}
          </div>
          {annotation.published && (
            <div>
              Published{" "}
              {new Date(annotation.published_at!).toLocaleDateString()} by{" "}
              {annotation.published_by}
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <EditDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setError(undefined);
        }}
        onSubmit={handleEdit}
        initialContent={annotation.content}
        isSubmitting={isSubmitting}
        error={error}
      />
    </div>
  );
};
