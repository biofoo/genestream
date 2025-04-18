import React from "react";
import { useTheme } from "@/contexts/ThemeContext";

const ThemeSettings: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="bg-background shadow overflow-hidden sm:rounded-lg">
      <div className="px-6 py-5 sm:px-6">
        <h2 className="text-2xl font-semibold text-foreground">Theme</h2>
      </div>
      <div className="px-4 py-5 sm:px-6">
        <select
          value={theme}
          onChange={(e) =>
            setTheme(e.target.value as "light" | "dark" | "system")
          }
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-input focus:outline-none focus:ring-ring focus:border-ring sm:text-sm rounded-md bg-muted text-foreground"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System</option>
        </select>
        <p className="p-3 mt-2 text-sm text-muted-foreground italic">
          Note: Currently only applies to Design Studio.
        </p>
      </div>
    </div>
  );
};

export default ThemeSettings;
