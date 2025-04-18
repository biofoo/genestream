import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreateAnnotationFormData } from "@/types";
import { ProjectAccess } from "@/types";

interface CreateAnnotationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: CreateAnnotationFormData) => Promise<void>;
  availableProjects: ProjectAccess[];
  initialType?: "name" | "description";
}

export const CreateAnnotationDialog: React.FC<CreateAnnotationDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  availableProjects,
  initialType = "description",
}) => {
  // Form state
  const [type, setType] = useState<"name" | "description">(initialType);
  const [content, setContent] = useState("");
  const [selectedProject, setSelectedProject] = useState<string>(
    availableProjects.length === 1 ? availableProjects[0].project_id : ""
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form state when dialog opens/closes
  const handleClose = () => {
    setContent("");
    setError(null);
    setIsSubmitting(false);
    setSelectedProject(
      availableProjects.length === 1 ? availableProjects[0].project_id : ""
    );
    setType(initialType);
    onClose();
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    if (!content.trim()) {
      setError("Content is required");
      return false;
    }
    if (!selectedProject) {
      setError("Please select a project");
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async () => {
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const input: CreateAnnotationFormData = {
        type,
        content: content.trim(),
        project_id: selectedProject,
      };

      await onSubmit(input);
      handleClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create annotation"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get project display name
  const getProjectDisplay = (project: ProjectAccess): string => {
    return project.project_name || project.project_id;
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => !isSubmitting && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Annotation</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Annotation Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="type">Annotation Type</Label>
            <Select
              value={type}
              onValueChange={(value: "name" | "description") => setType(value)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="description">Description</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Project Selection - Only show if multiple projects */}
          {availableProjects.length > 1 && (
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select
                value={selectedProject}
                onValueChange={setSelectedProject}
                disabled={isSubmitting}
              >
                <SelectTrigger id="project">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {availableProjects.map((project) => (
                      <SelectItem
                        key={project.project_id}
                        value={project.project_id}
                      >
                        {getProjectDisplay(project)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Content Input */}
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Enter ${type} content...`}
              className="min-h-[100px]"
              disabled={isSubmitting}
            />
          </div>

          {/* Error Display */}
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
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
