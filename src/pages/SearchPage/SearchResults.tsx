// src/pages/SearchPage/SearchResults.tsx
import { useSearchService } from "../../services";
import { useQuery } from "@tanstack/react-query";
import { SequenceGrid } from "./components/SequenceGrid";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SearchOptions } from "@/types";
import { useProjectStore } from "@/stores/useProjectStore";

interface SearchResultsProps {
  query: string;
  filter: Partial<SearchOptions>;
  isAuthenticated: boolean;
}

const SearchResultsContent: React.FC<SearchResultsProps> = ({
  query,
  filter,
  isAuthenticated,
}) => {
  const { activeProject, isLoading } = useProjectStore();
  const { searchSequences } = useSearchService();

  const {
    data: sequences,
    isLoading: sequencesLoading,
    error,
  } = useQuery({
    queryKey: ["sequences", query, filter, activeProject?.id, isAuthenticated],
    queryFn: async () => {
      // Extract sort from filter
      const { sort: filterSort, ...restFilter } = filter;

      const searchParams = {
        query,
        sort: filterSort,
        filters: {
          projectId:
            isAuthenticated && activeProject ? activeProject.id : undefined,
          publicOnly: !isAuthenticated,
          ...restFilter,
        },
      };

      console.log("Final request parameters:", {
        searchParams,
        activeProject,
        isAuthenticated,
        rawFilter: filter,
      });

      return searchSequences(searchParams);
    },
    enabled: isAuthenticated ? activeProject !== null : true,
  });

  console.log("SearchResults state:", {
    activeProject,
    isLoading,
    isAuthenticated,
    sequencesLoading,
    error,
    sequences,
    queryEnabled: isAuthenticated ? activeProject !== null : true,
  });

  if (sequencesLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Error loading sequences: {(error as Error).message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!sequences?.results.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          {query
            ? `No sequences found for "${query}"`
            : "No sequences found matching the selected filters."}
        </p>
      </div>
    );
  }

  return <SequenceGrid sequences={sequences.results} />;
};

export const SearchResults: React.FC<SearchResultsProps> = (props) => (
  <SearchResultsContent {...props} />
);
