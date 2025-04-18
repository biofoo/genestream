// src/pages/Callback.tsx
import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

const Callback: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Callback mounted:", { isAuthenticated, isLoading });

    if (!isLoading) {
      if (isAuthenticated) {
        navigate("/");
      } else {
        navigate("/");
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-lg">Loading...</div>
    </div>
  );
};

export default Callback;
