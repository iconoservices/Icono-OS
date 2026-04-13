"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Project, projectsData, projectCampaigns, CampaignMatrix } from "@/data/mock";
import { db } from "@/lib/firebase";
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  deleteDoc,
  writeBatch
} from "firebase/firestore";

interface ProjectContextType {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  currentProject: Project | null;
  setCurrentProject: (project: Project) => void;
  hiddenCampaignIds: string[];
  toggleCampaignVisibility: (id: string) => void;
  globalContents: any[];
  setGlobalContents: React.Dispatch<React.SetStateAction<any[]>>;
  // Campaigns grouped by project ID
  allProjectCampaigns: Record<string, CampaignMatrix[]>;
  setAllProjectCampaigns: React.Dispatch<React.SetStateAction<Record<string, CampaignMatrix[]>>>;
  updateCampaign: (campaignId: string, updates: any) => Promise<void>;
  addContent: (content: any) => Promise<void>;
  updateContent: (id: string, updates: any) => Promise<void>;
  deleteContent: (id: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [hiddenCampaignIds, setHiddenCampaignIds] = useState<string[]>([]);
  const [globalContents, setGlobalContents] = useState<any[]>([]);
  const [allProjectCampaigns, setAllProjectCampaigns] = useState<Record<string, CampaignMatrix[]>>({});

  // 1. Initial Sync & Seeding
  useEffect(() => {
    // Listen to Projects
    const unsubProjects = onSnapshot(collection(db, "projects"), (snapshot) => {
      const projectsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      
      if (projectsList.length === 0) {
        // Seed initial projects
        const batch = writeBatch(db);
        projectsData.forEach(p => {
          batch.set(doc(db, "projects", p.id), p);
        });
        batch.commit();
      } else {
        setProjects(projectsList);
        if (!currentProject) {
          const sunset = projectsList.find(p => p.id === "2") || projectsList[0];
          setCurrentProject(sunset);
        }
      }
    });

    // Listen to Campaigns
    const unsubCampaigns = onSnapshot(collection(db, "campaigns"), (snapshot) => {
      const campaignsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CampaignMatrix));
      
      if (campaignsList.length === 0) {
        // Seed initial campaigns
        const batch = writeBatch(db);
        Object.entries(projectCampaigns).forEach(([projId, camps]) => {
          camps.forEach(c => {
            batch.set(doc(db, "campaigns", c.id), { ...c, projectId: projId });
          });
        });
        batch.commit();
      } else {
        const grouped: Record<string, CampaignMatrix[]> = {};
        campaignsList.forEach(c => {
          const projId = (c as any).projectId || "2";
          if (!grouped[projId]) grouped[projId] = [];
          grouped[projId].push(c);
        });
        setAllProjectCampaigns(grouped);
      }
    });

    // Listen to Contents (Calendar Events)
    const unsubContents = onSnapshot(collection(db, "contents"), (snapshot) => {
      const contentsList = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setGlobalContents(contentsList);
    });

    return () => {
      unsubProjects();
      unsubCampaigns();
      unsubContents();
    };
  }, [currentProject]);

  const toggleCampaignVisibility = (id: string) => {
    setHiddenCampaignIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // CRUD for Campaigns
  const updateCampaign = async (campaignId: string, updates: any) => {
    await updateDoc(doc(db, "campaigns", campaignId), updates);
  };

  // CRUD for Contents
  const addContent = async (content: any) => {
    const id = content.id?.toString() || Date.now().toString();
    await setDoc(doc(db, "contents", id), content);
  };

  const updateContent = async (id: string, updates: any) => {
    await updateDoc(doc(db, "contents", id), updates);
  };

  const deleteContent = async (id: string) => {
    await deleteDoc(doc(db, "contents", id));
  };

  return (
    <ProjectContext.Provider value={{ 
      projects, 
      setProjects,
      currentProject, 
      setCurrentProject,
      hiddenCampaignIds,
      toggleCampaignVisibility,
      globalContents,
      setGlobalContents,
      allProjectCampaigns,
      setAllProjectCampaigns,
      updateCampaign,
      addContent,
      updateContent,
      deleteContent
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
