// components/Layout/Header/UserActions.tsx
import { Bell, PlusCircle } from "lucide-react";
import { Button } from "../ui/button";
import { getInitials } from "@/utils/stringUtils";

interface UserActionsProps {
  isAuthenticated: boolean;
  isLoading: boolean;
  user?: any;
  onProfileClick: () => void;
  onLogin: () => void;
  profileButtonRef: React.RefObject<HTMLButtonElement>;
}

export const UserActions: React.FC<UserActionsProps> = ({
  isAuthenticated,
  isLoading,
  user,
  onProfileClick,
  onLogin,
  profileButtonRef,
}) => (
  <div className="flex items-center gap-2 min-w-[120px] pl-6 justify-end">
    {isAuthenticated && (
      <>
        <Button
          variant="ghost"
          className="p-2 rounded-full w-10 hover:w-40 flex items-center justify-center gap-2 transition-all duration-200 overflow-hidden group"
        >
          <PlusCircle className="h-6 w-6 text-gray-600 dark:text-gray-200 shrink-0" />
          <span className="w-0 group-hover:w-auto opacity-0 group-hover:opacity-100 transition-all duration-200 text-gray-600 dark:text-gray-200 whitespace-nowrap">
            New Sequence
          </span>
        </Button>
        <Button variant="ghost" className="p-2 rounded-full w-10 h-10 mr-3">
          <Bell className="text-gray-600 dark:text-gray-200" />
        </Button>
      </>
    )}

    {isLoading ? (
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900" />
    ) : isAuthenticated ? (
      <button
        ref={profileButtonRef}
        onClick={onProfileClick}
        className="h-9 w-9 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition-transform hover:scale-110"
      >
        {user?.picture ? (
          <img
            src={user.picture}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-600 flex items-center justify-center text-white text-sm">
            {getInitials(user?.name || "")}
          </div>
        )}
      </button>
    ) : (
      <Button
        onClick={onLogin}
        variant="outline"
        className="border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600 font-semibold rounded-full"
      >
        Sign in
      </Button>
    )}
  </div>
);
