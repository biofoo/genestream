import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Search, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useSearchService } from "../../services";
import debounce from "lodash/debounce";
import { cn } from "@/lib/utils";
import type { SearchSuggestion } from "@/types";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar = ({
  onSearch,
  placeholder = "Search sequences...",
  className = "",
}: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [inputRect, setInputRect] = useState<DOMRect | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [resetKey, setResetKey] = useState(0);

  const { getSuggestions } = useSearchService();
  const navigate = useNavigate();
  const commandRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const results = await getSuggestions({
        query,
      });
      setSuggestions(results);
    } catch (error) {
      console.error("Suggestion error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch suggestions"
      );
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedFetchSuggestions = useRef(
    debounce((query: string) => fetchSuggestions(query), 300)
  ).current;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    debouncedFetchSuggestions(query);
  };

  const performSearch = () => {
    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery) {
      setSelectedIndex(-1);
      setResetKey((prev) => prev + 1);
      setSuggestions([]);
      setIsFocused(false);

      const encodedQuery = encodeURIComponent(trimmedQuery).replace(
        /%20/g,
        "+"
      );
      navigate(`/search?query=${encodedQuery}`);

      if (onSearch) {
        onSearch(trimmedQuery);
      }

      setTimeout(() => {
        setSearchQuery(trimmedQuery);
      }, 10);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        const selectedSuggestion = suggestions[selectedIndex];
        handleSelect(selectedSuggestion);
      } else {
        performSearch();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > -1 ? prev - 1 : -1));
    } else if (e.key === "Escape") {
      setSelectedIndex(-1);
    }
  };

  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions]);

  const handleSelect = (suggestion: SearchSuggestion) => {
    navigate(`/view?id=${suggestion.id}`);
    setIsFocused(false);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSuggestions([]);
    setError(null);
  };

  const handleFocus = () => {
    if (commandRef.current) {
      setInputRect(commandRef.current.getBoundingClientRect());
    }
    setIsFocused(true);
  };

  useEffect(() => {
    const updatePosition = () => {
      if (commandRef.current && isFocused) {
        setInputRect(commandRef.current.getBoundingClientRect());
      }
    };

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isFocused]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        commandRef.current &&
        !commandRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showDropdown =
    isFocused &&
    (suggestions.length > 0 || isLoading || error || searchQuery.length >= 2);

  return (
    <div className={className}>
      <form ref={formRef} onSubmit={handleSubmit} className="w-full">
        <Command
          key={resetKey} // Force remount
          ref={commandRef}
          className={cn(
            "relative bg-transparent",
            "w-full [&_[cmdk-input-wrapper]_svg]:hidden",
            "[&_[cmdk-input-wrapper]]:w-full",
            "[&_[cmdk-input]]:w-full",
            "[&_[cmdk-item]]:w-full",
            "[&_[cmdk-input-wrapper]]:border-0"
          )}
          shouldFilter={false}
        >
          <div className="relative flex items-center w-full">
            <CommandInput
              value={searchQuery}
              onValueChange={handleSearch}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              placeholder={placeholder}
              className={cn(
                "w-full pl-10 h-10",
                "bg-gray-50 dark:bg-gray-800/50",
                "border border-gray-200 dark:border-gray-700/50",
                "rounded-full transition-colors duration-200",
                "focus:outline-none focus:ring-0 focus:ring-blue-500/50"
              )}
            />
            <div className="absolute left-6 flex items-center pointer-events-none">
              {isLoading ? (
                <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
              ) : (
                <Search className="h-5 w-5 text-gray-400" />
              )}
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-5 p-1 text-gray-400 hover:text-gray-600 
                  rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {showDropdown &&
            createPortal(
              <div
                className="fixed shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                style={{
                  top: inputRect ? `${inputRect.bottom + 4}px` : 0,
                  left: inputRect ? `${inputRect.left}px` : 0,
                  width: inputRect ? `${inputRect.width}px` : "auto",
                  zIndex: 1000,
                }}
              >
                <CommandList
                  className={cn(
                    "bg-white dark:bg-gray-800/95 backdrop-blur supports-[backdrop-filter]:bg-white/80",
                    "max-h-[300px] overflow-y-auto"
                  )}
                >
                  {error ? (
                    <CommandEmpty className="py-6 text-sm text-red-500 text-center">
                      {error}
                    </CommandEmpty>
                  ) : searchQuery.length < 2 ? (
                    <CommandEmpty className="py-6 text-sm text-gray-500 text-center">
                      Type at least 2 characters to search
                    </CommandEmpty>
                  ) : isLoading ? (
                    <CommandEmpty className="py-6 text-sm text-gray-500 text-center">
                      Searching...
                    </CommandEmpty>
                  ) : suggestions.length === 0 ? (
                    <CommandEmpty className="py-6 text-sm text-gray-500 text-center">
                      No results found for "{searchQuery}"
                    </CommandEmpty>
                  ) : (
                    <>
                      <CommandGroup className="p-2">
                        {suggestions.map((suggestion, index) => (
                          <CommandItem
                            key={suggestion.id}
                            onSelect={() => handleSelect(suggestion)}
                            className={cn(
                              "flex items-center gap-2 px-4 py-2",
                              "hover:bg-gray-100 dark:hover:bg-gray-700/50",
                              "rounded-md cursor-pointer",
                              // Override the default aria-selected styles with !important
                              "[&[aria-selected]]:!bg-transparent",
                              "[&[aria-selected]]:!text-inherit",
                              // Add distinct styling for keyboard-selected item
                              selectedIndex === index
                                ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800"
                                : ""
                            )}
                          >
                            <div className="flex-1 min-w-0">
                              <div
                                className={cn(
                                  "font-medium truncate",
                                  selectedIndex === index
                                    ? "text-blue-600 dark:text-blue-400"
                                    : ""
                                )}
                              >
                                {suggestion.text}
                              </div>
                              <div
                                className={cn(
                                  "text-xs font-mono truncate uppercase-none normal-case",
                                  selectedIndex === index
                                    ? "text-blue-500 dark:text-blue-300"
                                    : "text-gray-500 dark:text-gray-400"
                                )}
                              >
                                {suggestion.id.toLowerCase()}
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </>
                  )}
                </CommandList>
              </div>,
              document.body
            )}
        </Command>
      </form>
    </div>
  );
};
