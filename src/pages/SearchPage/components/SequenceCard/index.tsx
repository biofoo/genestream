import React, { useState } from "react";
import {
  Lock,
  Copy,
  FlaskConical,
  MoreVertical,
  Download,
  Check,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CharSetType } from "@/types";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

interface SequenceCardProps {
  gs_id: string;
  sequence: string;
  score: number;
  char_set: CharSetType;
  access_level: "private" | "public";
  sequence_length: number;
  created_by: string;
  created_at: string | null;
  updated_at: string | null;
  published_by: string | null;
  published_at: string | null;
  metadata: {
    organism?: string;
    public_ids: Record<string, string>;
    public_names: Record<string, string>;
    public_aliases: string[];
  };
  annotations: {
    name: string;
    description: string;
  };
  display_name: string;
  display_description: string;
  onNavigate?: (gs_id: string) => void;
}

interface SequenceDetail {
  gs_id: string;
  metadata: {
    gs_id: string;
    char_set: CharSetType;
    length: number;
    checksum: string;
    access_level: "public" | "private";
    project_access: any[];
    public_aliases: string[];
    public_ids: Record<string, string>;
    public_names: Record<string, string>;
    created_at: string;
    updated_at: string;
  };
  sequence: string;
}

const getSequenceColor = (char_set: CharSetType) => {
  switch (char_set) {
    case "DNA":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "RNA":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "PROTEIN":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  }
};

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  } catch {
    return "Invalid date";
  }
};

export const SequenceCard: React.FC<SequenceCardProps> = ({
  gs_id,
  score,
  sequence_length,
  created_by,
  created_at,
  updated_at,
  access_level,
  char_set,
  published_by,
  published_at,
  metadata,
  display_name,
  display_description,
  onNavigate,
}) => {
  const { getAccessTokenSilently } = useAuth0();
  const [isClicked, setIsClicked] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const navigate = useNavigate();
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest('[role="menuitem"]')) {
      return;
    }

    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 400);

    if (onNavigate) {
      onNavigate(gs_id);
    } else {
      navigate(`/view?id=${gs_id}`);
    }
  };

  const handleCopy = async () => {
    try {
      setIsCopying(true);

      let headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (access_level === "private") {
        const token = await getAccessTokenSilently();
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`/sequences/${gs_id}`, {
        headers,
      });

      if (!response.ok) throw new Error("Failed to fetch sequence");

      const data: SequenceDetail = await response.json();
      await navigator.clipboard.writeText(data.sequence);

      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error("Failed to copy sequence:", error);
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <Card
      className={`
        group overflow-hidden
        shadow-none rounded-none bg-transparent
        text-gray-900 dark:text-gray-100 
        border-gray-50 dark:border-gray-900 
        transition-colors duration-200 cursor-pointer
        ${
          isClicked
            ? "bg-gray-100 dark:bg-gray-700"
            : "hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
        }
      `}
      onClick={handleCardClick}
    >
      <div className="flex gap-2">
        {/* Left Column */}
        <div
          className="relative w-1/3 min-h-[200px] flex-shrink-0
                      bg-gray-200 dark:bg-gray-800
                      rounded-xl group-hover:rounded-none transition-all duration-1000 ease-in-out
                      overflow-hidden"
        >
          <div className="absolute bottom-3 right-3 flex flex-col gap-1 items-end">
            {/* Sequence Type */}
            <Badge
              variant="secondary"
              className={`text-xs ${getSequenceColor(char_set)}`}
            >
              {char_set}
            </Badge>

            <Badge variant="secondary" className="font-mono">
              {sequence_length.toLocaleString()} bp
            </Badge>
            {score > 0 && (
              <Badge variant="default" className="bg-blue-600">
                Score: {score.toFixed(2)}
              </Badge>
            )}
          </div>
        </div>

        {/* Right Column - Sequence Info */}
        <div className="flex-1 flex flex-col justify-between">
          <CardHeader className="space-y-2 px-4 pt-4 pb-0">
            <div className="flex items-start justify-between">
              <div className="">
                {/* Status & Display Name*/}
                <p
                  className="font-semibold text-lg line-clamp-1"
                  title={display_name}
                >
                  <Tooltip>
                    <TooltipTrigger>
                      {access_level === "private" ? (
                        <Lock className="w-4 h-4 mr-2 text-red-500 dark:text-red-400" />
                      ) : null}
                    </TooltipTrigger>
                    <TooltipContent>{"Private sequence"}</TooltipContent>
                  </Tooltip>

                  {display_name}
                </p>
              </div>

              {/* Menu */}
              <div className="flex items-center gap-3">
                {copySuccess && (
                  <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    Copied!
                  </span>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => navigate(`/view?id=${gs_id}`)}
                      className="flex items-center gap-2"
                    >
                      View Details
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onSelect={handleCopy}
                      className="flex items-center gap-2"
                      disabled={isCopying}
                    >
                      <Copy className="w-4 h-4" />
                      {isCopying ? "Copying..." : "Copy Sequence"}
                    </DropdownMenuItem>

                    <DropdownMenuItem className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Download
                    </DropdownMenuItem>

                    {access_level === "private" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="flex items-center gap-2 text-red-600 dark:text-red-400">
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Organism */}
            <div>
              {metadata.organism && (
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <FlaskConical className="w-4 h-4" />
                  {metadata.organism}
                </p>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4 px-4 pt-0 pb-4">
            {/* Display Description */}
            {display_description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 min-h-16">
                {display_description}
              </p>
            )}

            {/* Public IDs */}
            {Object.entries(metadata.public_ids).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(metadata.public_ids).map(([key, value]) => (
                  <Badge
                    key={key}
                    variant="outline"
                    className="text-xs dark:bg-gray-800 dark:text-gray-300"
                  >
                    {key.toUpperCase()}: {value}
                  </Badge>
                ))}
              </div>
            )}

            {/* Aliases */}
            {metadata.public_aliases.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {metadata.public_aliases.map((alias) => (
                  <Badge
                    key={alias}
                    variant="secondary"
                    className="text-xs bg-gray-100 dark:bg-gray-800"
                  >
                    {alias}
                  </Badge>
                ))}
              </div>
            )}

            {/* Footer Info */}
            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
              {access_level === "public" ? (
                // Public sequence - show published info
                <>
                  {published_by && <span>Published by {published_by}</span>}
                  {published_at && <span>{formatDate(published_at)}</span>}
                </>
              ) : (
                // Private sequence - show creation/update info
                <>
                  <span>Created by {created_by}</span>
                  <div className="flex gap-2">
                    {created_at && <span>{formatDate(created_at)}</span>}
                    {updated_at && updated_at !== created_at && (
                      <span>• Updated {formatDate(updated_at)}</span>
                    )}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
};

export default SequenceCard;
