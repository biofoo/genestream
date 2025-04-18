import { useAuth } from "@/hooks/useAuth";
import { useAuth0 } from "@auth0/auth0-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { SearchBar } from "../SearchBar";
import { UserActions } from "./UserActions";
import ProfileMenu from "./ProfileMenu";

// components/Layout/Header/Header.tsx
const Header: React.FC<{ isExpanded: boolean; onToggle: () => void }> = ({
  onToggle,
}) => {
  const { loginWithRedirect, logout } = useAuth0();
  const { user, isLoading: authLoading } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [profileButtonRect, setProfileButtonRect] = useState<DOMRect | null>(
    null
  );
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  const handleLogoClick = () => navigate("/");

  const handleLogin = () => {
    loginWithRedirect({
      appState: { returnTo: "/" },
    });
  };

  const handleLogout = () => {
    logout({
      logoutParams: { returnTo: "https://genestream.io" },
    });
  };

  const handleProfileClick = () => {
    if (profileButtonRef.current) {
      setProfileButtonRect(profileButtonRef.current.getBoundingClientRect());
    }
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const isAuthenticated = !!user;

  return (
    <header className="fixed top-0 left-0 right-0 py-1 bg-white dark:bg-black shadow-sm z-20">
      <div className="max-w-full px-3 py-4 flex justify-between items-center">
        <Logo
          isAuthenticated={isAuthenticated}
          onToggle={onToggle}
          onLogoClick={handleLogoClick}
        />

        <SearchBar className="flex-1 max-w-3xl ml-16" />

        <UserActions
          isAuthenticated={isAuthenticated}
          isLoading={authLoading}
          user={user}
          onProfileClick={handleProfileClick}
          onLogin={handleLogin}
          profileButtonRef={profileButtonRef}
        />
      </div>

      <ProfileMenu
        isOpen={isProfileMenuOpen}
        setIsOpen={setIsProfileMenuOpen}
        anchorRect={profileButtonRect}
        onLogout={handleLogout}
        onNavigate={navigate}
      />
    </header>
  );
};

export default Header;
