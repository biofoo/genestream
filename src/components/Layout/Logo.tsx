import { Menu } from "lucide-react";
import { Button } from "../ui/button";

// components/Layout/Header/Logo.tsx
interface LogoProps {
  isAuthenticated: boolean;
  onToggle: () => void;
  onLogoClick: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  isAuthenticated,
  onToggle,
  onLogoClick,
}) => (
  <div className="flex items-center space-x-1 pr-8 text-black dark:text-gray-200 min-w-[240px]">
    {isAuthenticated && (
      <Button
        variant="ghost"
        onClick={onToggle}
        className="mr-3 text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-900 p-2 rounded-full w-10 h-10"
      >
        <Menu className="h-5 w-5" />
      </Button>
    )}
    <img
      src="/assets/images/logo.webp"
      alt="GeneStream Logo"
      className="w-[32px] h-[24px]"
      onClick={onLogoClick}
      style={{ cursor: "pointer" }}
    />
    <div
      className="text-black dark:text-white font-bold px-0 text-xl"
      style={{ fontFamily: "Play, sans-serif", cursor: "pointer" }}
      onClick={onLogoClick}
    >
      GeneStream
    </div>
  </div>
);
