// src/App.tsx
import { useAuth0 } from "@auth0/auth0-react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Callback from "./components/Callback";
import { Layout } from "./components/Layout";
import { useEffect } from "react";
import SearchPage from "./pages/SearchPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { projectApi } from "./api/projects";
import { useProjectStore } from "./stores/useProjectStore";
import { TooltipProvider } from "./components/ui/tooltip";
import SettingsPage from "./pages/SettingsPage";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ToastProvider } from "@radix-ui/react-toast";
import SequenceDetailPage from "./pages/SequenceDetailPage";
import ChatPage from "./pages/ChatPage";
import WaitlistPage from "./pages/WaitlistPage/WaitlistPage";
import WaitlistSuccessPage from "./pages/WaitlistPage/WaitlistSuccessPage";
import ManageAccount from "./pages/ManageAccount";

const queryClient = new QueryClient();

const ProtectedRoute = () => {
  const {
    isAuthenticated,
    isLoading: authLoading,
    loginWithRedirect,
    getAccessTokenSilently,
  } = useAuth0();
  const { setProjects, setActiveProject, activeProject, setIsLoading } =
    useProjectStore();

  useEffect(() => {
    const initializeData = async () => {
      if (isAuthenticated) {
        try {
          const token = await getAccessTokenSilently();
          localStorage.setItem("auth_token", token);

          setIsLoading(true);
          const [projectList, active] = await Promise.all([
            projectApi.getProjects(),
            projectApi.getActiveProject(),
          ]);
          setProjects(projectList);
          setActiveProject(active);
        } catch (error) {
          console.error("Error initializing data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    initializeData();
  }, [isAuthenticated, getAccessTokenSilently]);

  if (authLoading || (isAuthenticated && !activeProject)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    loginWithRedirect();
    return null;
  }

  return <Outlet />;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <TooltipProvider>
            <Routes>
              <Route path="/callback" element={<Callback />} />
              <Route path="/waitlist" element={<WaitlistPage />} />
              <Route
                path="/waitlist/success"
                element={<WaitlistSuccessPage />}
              />

              <Route element={<ProtectedRoute />}>
                <Route
                  element={
                    <Layout>
                      <Outlet />
                    </Layout>
                  }
                ></Route>
                <Route path="/" element={<SearchPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/view" element={<SequenceDetailPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/account" element={<ManageAccount />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </TooltipProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
