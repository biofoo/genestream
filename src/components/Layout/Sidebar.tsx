import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Layers,
  MessageSquare,
  MessageSquareWarning,
  Settings,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItemProps = {
  to?: string;
  icon: LucideIcon;
  label: string;
  isExpanded: boolean;
  onClick?: () => void;
};

const NavItem: React.FC<NavItemProps> = ({
  to,
  icon: Icon,
  label,
  isExpanded,
  onClick,
}) => {
  const location = useLocation();
  const isActive = to ? location.pathname === to : false;

  const content = (
    <>
      <Icon className="h-5 w-5 -ml-0.5 text-black dark:text-gray-200 shrink-0" />
      {isExpanded && <span className="ml-6">{label}</span>}
    </>
  );

  const buttonClass = cn(
    "w-full justify-start text-black dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700",
    isActive && "bg-gray-100 dark:bg-gray-700"
  );

  if (to) {
    return (
      <Button variant="ghost" className={buttonClass}>
        <Link to={to} className="flex items-center w-full">
          {content}
        </Link>
      </Button>
    );
  }

  return (
    <Button variant="ghost" className={buttonClass} onClick={onClick}>
      <div className="flex items-center w-full">{content}</div>
    </Button>
  );
};

type SidebarProps = {
  isExpanded: boolean;
  onToggle: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ isExpanded }) => {
  const topNavItems: NavItemProps[] = [
    { to: "/", icon: Home, label: "Home", isExpanded },
    { to: undefined, icon: Layers, label: "Collections", isExpanded },
    { to: "/chat", icon: MessageSquare, label: "Chat", isExpanded },
  ];

  const bottomNavItems: NavItemProps[] = [
    { to: "/settings", icon: Settings, label: "Settings", isExpanded },
    {
      to: undefined,
      icon: MessageSquareWarning,
      label: "Send feedback",
      isExpanded,
      onClick: () => console.log("Feedback clicked"),
    },
  ];

  return (
    <div
      className={cn(
        "fixed left-0 top-16 bottom-0 bg-white dark:bg-gray-900 shadow-lg transition-all duration-300 overflow-hidden",
        isExpanded ? "w-56" : "w-16"
      )}
    >
      <nav className="flex flex-col h-full px-2 pt-8">
        <div className="flex flex-col h-full">
          {/* Top Navigation Items */}
          <div className="flex flex-col gap-2">
            {topNavItems.map((item) => (
              <NavItem key={item.label} {...item} />
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-grow" />

          {/* Bottom Navigation Items */}
          <div className="flex flex-col gap-2 my-2">
            {bottomNavItems.map((item) => (
              <NavItem key={item.label} {...item} />
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
