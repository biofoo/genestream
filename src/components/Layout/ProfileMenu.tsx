import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { LogOut, User } from "lucide-react";
import { ProjectSelector } from "./ProjectSelector";

interface ProfileMenuProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  anchorRect: DOMRect | null;
  onLogout: () => void;
  onNavigate: (path: string) => void;
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({
  isOpen,
  setIsOpen,
  anchorRect,
  onLogout,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [, setIsProjectDropdownOpen] = useState(false);

  const menuStyle = anchorRect
    ? {
        position: "fixed" as const,
        top: `${anchorRect.bottom + 8}px`,
        right: `${window.innerWidth - anchorRect.right}px`,
        zIndex: 1000,
      }
    : {};

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsProjectDropdownOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  return isOpen
    ? createPortal(
        <div
          ref={menuRef}
          className="w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
          style={menuStyle}
        >
          <div className="flex flex-col">
            <ProjectSelector closeMenu={() => setIsOpen(false)} />

            <button
              onClick={() => {
                window.open("/account", "_blank");
                setIsOpen(false);
              }}
              className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="ml-3 text-sm text-gray-700 dark:text-gray-200">
                Manage account
              </span>
            </button>
            <div className="h-px bg-gray-200 dark:bg-gray-700" />
            <button
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
              className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <LogOut className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="ml-3 text-sm text-gray-700 dark:text-gray-200">
                Sign out
              </span>
            </button>
          </div>
        </div>,
        document.body
      )
    : null;
};

export default ProfileMenu;
