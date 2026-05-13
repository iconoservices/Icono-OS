"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useProject } from "../../../context/ProjectContext";
import Dashboard from "../../page";

interface Project {
  id: string;
  slug: string;
  name: string;
}

export default function ProjectPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { projects, setCurrentProject } = useProject();

  useEffect(() => {
    if (slug && projects.length > 0) {
      const project = projects.find((p: Project) => p.slug === slug);
      if (project) {
        setCurrentProject(project);
      }
    }
  }, [slug, projects, setCurrentProject]);

  return <Dashboard />;
}
