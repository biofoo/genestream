import React from "react";
import { Globe, Lock, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { ProjectAccess } from "@/types";

interface ProjectAccessDisplayProps {
  accessLevel: "private" | "public";
  projectAccess: ProjectAccess[];
  className?: string;
}

interface ProjectAccessTooltipContentProps {
  projectAccess: ProjectAccess[];
}

const ProjectAccessTooltipContent: React.FC<
  ProjectAccessTooltipContentProps
> = ({ projectAccess }) => {
  if (projectAccess.length === 0) {
    return (
      <div className="text-sm">No project access information available</div>
    );
  }

  return (
    <div className="space-y-2 max-w-xs">
      <div className="text-sm font-medium">Accessible through:</div>
      <div className="space-y-1.5">
        {projectAccess.map((access) => (
          <div
            key={access.project_id}
            className="text-sm flex flex-col gap-0.5"
          >
            <div className="font-medium">
              {access.project_name || access.project_id}
            </div>
            <div className="text-xs text-gray-500">
              Added {new Date(access.granted_at).toLocaleDateString()} by{" "}
              {access.granted_by}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ProjectAccessDisplay: React.FC<ProjectAccessDisplayProps> = ({
  accessLevel,
  projectAccess,
  className = "",
}) => {
  const isPublic = accessLevel === "public";

  return (
    <TooltipProvider>
      <div className={`flex items-center gap-2 ${className}`}>
        {/* Access Level Icon */}
        {isPublic ? (
          <Globe className="w-5 h-5 text-green-500" />
        ) : (
          <Lock className="w-5 h-5 text-gray-500" />
        )}

        {/* Project Access Badges */}
        <div className="flex items-center gap-1.5">
          {projectAccess.length > 0 && (
            <>
              {/* Show first project directly */}
              <Badge variant="outline" className="text-xs py-0 px-2">
                {projectAccess[0].project_name || projectAccess[0].project_id}
              </Badge>

              {/* If there are more projects, show count */}
              {projectAccess.length > 1 && (
                <Tooltip>
                  <TooltipTrigger>
                    <Badge
                      variant="secondary"
                      className="text-xs py-0 px-2 cursor-help"
                    >
                      +{projectAccess.length - 1} more
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <ProjectAccessTooltipContent
                      projectAccess={projectAccess.slice(1)}
                    />
                  </TooltipContent>
                </Tooltip>
              )}
            </>
          )}

          {/* Info tooltip for access explanation */}
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-4 h-4 text-gray-400" />
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-2 max-w-xs">
                <div className="text-sm">
                  {isPublic
                    ? "This sequence is public and visible to all users"
                    : "This sequence is private and only accessible through specific projects"}
                </div>
                <ProjectAccessTooltipContent projectAccess={projectAccess} />
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};

// Optional: Create a compact version for search results
export const CompactProjectAccessDisplay: React.FC<
  ProjectAccessDisplayProps
> = ({ accessLevel, projectAccess, className = "" }) => {
  const isPublic = accessLevel === "public";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className={`flex items-center gap-1.5 ${className}`}>
          {isPublic ? (
            <Globe className="w-4 h-4 text-green-500" />
          ) : (
            <Lock className="w-4 h-4 text-gray-500" />
          )}
          {!isPublic && projectAccess.length > 0 && (
            <Badge variant="outline" className="text-xs py-0 px-1.5">
              {projectAccess.length}
            </Badge>
          )}
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-2 max-w-xs">
            <div className="text-sm">
              {isPublic
                ? "Public sequence"
                : `Private sequence accessible through ${
                    projectAccess.length
                  } project${projectAccess.length !== 1 ? "s" : ""}`}
            </div>
            <ProjectAccessTooltipContent projectAccess={projectAccess} />
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
