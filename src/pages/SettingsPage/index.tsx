// Settings.tsx
import React from "react";
import ProjectMembers from "./components/ProjectMembers";
import Theme from "./components/Theme";
import { Layout } from "@/components/Layout";
import { useProjectStore } from "@/stores/useProjectStore";

const Settings: React.FC = () => {
  const { activeProject } = useProjectStore();

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col gap-6">
          <ProjectMembers selectedProject={activeProject} />
          <Theme />
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
