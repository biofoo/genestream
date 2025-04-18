// src/pages/SearchPage/index.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Layout } from "@/components/Layout";
import { SearchResults } from "./SearchResults";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { SearchOptions } from "@/types";

type FilterType =
  | "all"
  | "viral-vectors"
  | "plasmids"
  | "promoters"
  | "homo-sapiens"
  | "recently-added"
  | "most-used";

const TagButton: React.FC<{
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}> = ({ children, active }) => (
  <Button
    variant="ghost"
    className={`
      rounded-lg px-2 max-h-8 text-sm font-semibold
      ${
        active
          ? "bg-gray-800 text-white dark:bg-gray-300 dark:text-gray-900"
          : "text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
      }
      whitespace-nowrap
    `}
  >
    {children}
  </Button>
);

export const SearchPage: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth0();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showChevron, setShowChevron] = useState({ left: false, right: false });
  const [searchParams] = useSearchParams();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const updateChevrons = useCallback(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const isScrollable = container.scrollWidth > container.clientWidth;
      const hasScrolledLeft = container.scrollLeft > 0;
      const hasScrolledRight =
        container.scrollLeft <
        container.scrollWidth - container.clientWidth - 1;

      setShowChevron({
        left: hasScrolledLeft,
        right: isScrollable && hasScrolledRight,
      });
    }
  }, []);

  const handleScroll = useCallback((direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 200;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      updateChevrons();
      container.addEventListener("scroll", updateChevrons);
      window.addEventListener("resize", updateChevrons);

      return () => {
        container.removeEventListener("scroll", updateChevrons);
        window.removeEventListener("resize", updateChevrons);
      };
    }
  }, [updateChevrons]);

  const filterToParams: Record<FilterType, Partial<SearchOptions>> = {
    all: {
      sort: { field: "date", order: "desc" },
    },
    "recently-added": {
      sort: { field: "date", order: "desc" },
    },
    "most-used": {
      sort: { field: "relevance", order: "desc" },
    },
    // For now, just use sort options for other filters
    "viral-vectors": { sort: { field: "relevance", order: "desc" } },
    plasmids: { sort: { field: "relevance", order: "desc" } },
    promoters: { sort: { field: "relevance", order: "desc" } },
    "homo-sapiens": { sort: { field: "relevance", order: "desc" } },
  } as const;

  const handleFilterClick = (filter: FilterType) => {
    setActiveFilter(filter);
  };

  return (
    <Layout>
      {/* Tag buttons container */}
      <div className="sticky top-20 z-10 border-gray-200 mb-6">
        <div className="w-full max-w-7xl px-4 pb-4 mx-auto gradient-background">
          <div className="flex items-center py-3">
            {/* Main container with flex layout */}
            <div className="flex-1 flex items-center min-w-0 gap-4 px-2">
              {/* Scrollable tags container */}
              <div className="relative flex-1 min-w-0">
                {showChevron.left && (
                  <button
                    onClick={() => handleScroll("left")}
                    className="absolute -left-2 top-1/2 -translate-y-1/2 bg-gray-200 dark:bg-gray-800 px-1 h-8 rounded-lg z-10"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </button>
                )}

                <div
                  ref={scrollContainerRef}
                  className="overflow-x-auto hide-scrollbar px-0 flex gap-2"
                >
                  <TagButton
                    active={activeFilter === "all"}
                    onClick={() => handleFilterClick("all")}
                  >
                    All
                  </TagButton>
                  <TagButton
                    active={activeFilter === "viral-vectors"}
                    onClick={() => handleFilterClick("viral-vectors")}
                  >
                    Viral Vectors
                  </TagButton>
                  <TagButton
                    active={activeFilter === "plasmids"}
                    onClick={() => handleFilterClick("plasmids")}
                  >
                    Plasmids
                  </TagButton>
                  <TagButton
                    active={activeFilter === "promoters"}
                    onClick={() => handleFilterClick("promoters")}
                  >
                    Promoters
                  </TagButton>
                  <TagButton
                    active={activeFilter === "homo-sapiens"}
                    onClick={() => handleFilterClick("homo-sapiens")}
                  >
                    Homo sapiens
                  </TagButton>
                  <TagButton
                    active={activeFilter === "recently-added"}
                    onClick={() => handleFilterClick("recently-added")}
                  >
                    Recently Added
                  </TagButton>
                  <TagButton
                    active={activeFilter === "most-used"}
                    onClick={() => handleFilterClick("most-used")}
                  >
                    Most Used
                  </TagButton>
                </div>

                {showChevron.right && (
                  <button
                    onClick={() => handleScroll("right")}
                    className="absolute -right-2 top-1/2 -translate-y-1/2 bg-gray-200 dark:bg-gray-800 px-1 h-8 rounded-lg z-10"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </button>
                )}
              </div>

              {/* Filters button */}
              <Button
                variant="outline"
                className="flex items-center gap-2 whitespace-nowrap text-black dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 flex-shrink-0"
              >
                Filters
                <SlidersHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Display search results */}
      {authLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="w-full max-w-7xl px-4 mx-auto">
            <SearchResults
              query={searchParams.get("query") || ""}
              filter={filterToParams[activeFilter] || {}}
              isAuthenticated={isAuthenticated}
            />
          </div>
        </div>
      )}
    </Layout>
  );
};

export default SearchPage;
