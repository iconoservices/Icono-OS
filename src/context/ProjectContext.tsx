"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Project, projectsData, projectCampaigns, CampaignMatrix, calendarEvents } from "@/data/mock";
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
import { generateSlug } from "@/lib/utils";

interface ProjectContextType {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  hiddenCampaignIds: string[];
  toggleCampaignVisibility: (id: string) => void;
  globalContents: any[];
  setGlobalContents: React.Dispatch<React.SetStateAction<any[]>>;
  // Campaigns grouped by project ID
  allProjectCampaigns: Record<string, CampaignMatrix[]>;
  setAllProjectCampaigns: React.Dispatch<React.SetStateAction<Record<string, CampaignMatrix[]>>>;
  addCampaign: (campaign: any) => Promise<string>;
  updateCampaign: (campaignId: string, updates: any) => Promise<void>;
  deleteCampaign: (campaignId: string) => Promise<void>;
  addContent: (content: any) => Promise<void>;
  updateContent: (id: string, updates: any) => Promise<void>;
  deleteContent: (id: string) => Promise<void>;
  // Strategy Library
  strategyLibrary: any[];
  addStrategyTemplate: (template: any) => Promise<void>;
  updateStrategyTemplate: (id: string, updates: any) => Promise<void>;
  deleteStrategyTemplate: (id: string) => Promise<void>;
  // Matrix Columns (Categories)
  matrixColumns: any[];
  addMatrixColumn: (column: any) => Promise<void>;
  updateMatrixColumn: (id: string, updates: any) => Promise<void>;
  deleteMatrixColumn: (id: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [hiddenCampaignIds, setHiddenCampaignIds] = useState<string[]>([]);
  const [globalContents, setGlobalContents] = useState<any[]>([]);
  const [allProjectCampaigns, setAllProjectCampaigns] = useState<Record<string, CampaignMatrix[]>>({});
  const [strategyLibrary, setStrategyLibrary] = useState<any[]>([]);
  const [matrixColumns, setMatrixColumns] = useState<any[]>([]);

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
        // Migration: Ensure all projects have slugs
        const projectsToUpdate = projectsList.filter(p => !p.slug);
        if (projectsToUpdate.length > 0) {
          const batch = writeBatch(db);
          projectsToUpdate.forEach(p => {
            const slug = generateSlug(p.name, projectsList.filter(pr => pr.slug));
            batch.update(doc(db, "projects", p.id), { slug });
          });
          batch.commit();
        }

        setProjects(projectsList);
        // Do not auto-set if already set or if explicitly null
        if (!currentProject && currentProject !== null) {
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

    // Listen to Strategy Library
    const unsubLibrary = onSnapshot(collection(db, "strategyLibrary"), (snapshot) => {
      const libraryList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStrategyLibrary(libraryList);
    });

    // Listen to Matrix Columns
    const unsubColumns = onSnapshot(collection(db, "matrixColumns"), (snapshot) => {
      const columnsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (columnsList.length === 0) {
        const initialMatrixColumns = [
          { id: 'prod', title: 'Producción', subtitle: 'Acción en Campo', color: 'text-emerald-500', bg: 'bg-emerald-500', isAction: true },
          { id: 'tiktok', title: 'TikTok', subtitle: 'Humor / Cercano', color: 'text-[#FE2C55]', bg: 'bg-[#FE2C55]' },
          { id: 'ig', title: 'Instagram', subtitle: 'Estético / Info', color: 'text-[#E4405F]', bg: 'bg-[#E4405F]' },
          { id: 'fb', title: 'Facebook', subtitle: 'Promo / Comunidad', color: 'text-[#1877F2]', bg: 'bg-[#1877F2]' },
          { id: 'stories', title: 'Meta Stories', subtitle: 'Historias / 24h', color: 'text-[#E1306C]', bg: 'bg-[#E1306C]' }
        ];
        const batch = writeBatch(db);
        initialMatrixColumns.forEach(col => {
          batch.set(doc(db, "matrixColumns", col.id), col);
        });
        batch.commit();
      } else {
        setMatrixColumns(columnsList);
      }
    });

    // Listen to Contents (Calendar Events)
    const unsubContents = onSnapshot(collection(db, "contents"), (snapshot) => {
      const contentsList = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      
      if (contentsList.length === 0) {
        const batch = writeBatch(db);
        calendarEvents.forEach((c, idx) => {
          const docId = `mock_event_${idx}`;
          batch.set(doc(db, "contents", docId), { ...c, id: docId });
        });
        batch.commit();
      } else {
        setGlobalContents(contentsList);
      }
    });

    return () => {
      unsubProjects();
      unsubCampaigns();
      unsubContents();
      unsubLibrary();
      unsubColumns();
    };
  }, [currentProject]);

  const toggleCampaignVisibility = (id: string) => {
    setHiddenCampaignIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // CRUD for Campaigns
  const addCampaign = async (campaign: any) => {
    const id = campaign.id?.toString() || `camp_${Date.now()}`;
    const sanitized = JSON.parse(JSON.stringify(campaign));
    await setDoc(doc(db, "campaigns", id), sanitized);
    return id;
  };

  const updateCampaign = async (campaignId: string, updates: any) => {
    await updateDoc(doc(db, "campaigns", campaignId), updates);
  };

  const deleteCampaign = async (campaignId: string) => {
    await deleteDoc(doc(db, "campaigns", campaignId));
  };

  // CRUD for Contents
  const addContent = async (content: any) => {
    const id = content.id?.toString() || Date.now().toString();
    const sanitized = JSON.parse(JSON.stringify(content)); // strip undefined
    await setDoc(doc(db, "contents", id), sanitized);
  };

  const updateContent = async (id: string, updates: any) => {
    const sanitized = JSON.parse(JSON.stringify(updates)); // strip undefined
    await setDoc(doc(db, "contents", id), sanitized, { merge: true });
  };

  const deleteContent = async (id: string) => {
    await deleteDoc(doc(db, "contents", id));
  };

  // CRUD for Strategy Library
  const addStrategyTemplate = async (template: any) => {
    const id = template.id || `template_${Date.now()}`;
    await setDoc(doc(db, "strategyLibrary", id), { ...template, id });
  };

  const updateStrategyTemplate = async (id: string, updates: any) => {
    await updateDoc(doc(db, "strategyLibrary", id), updates);
  };

  const deleteStrategyTemplate = async (id: string) => {
    await deleteDoc(doc(db, "strategyLibrary", id));
  };

  // CRUD for Matrix Columns
  const addMatrixColumn = async (column: any) => {
    const id = column.id || `col_${Date.now()}`;
    await setDoc(doc(db, "matrixColumns", id), { ...column, id });
  };

  const updateMatrixColumn = async (id: string, updates: any) => {
    await updateDoc(doc(db, "matrixColumns", id), updates);
  };

  const deleteMatrixColumn = async (id: string) => {
    await deleteDoc(doc(db, "matrixColumns", id));
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
      addCampaign,
      updateCampaign,
      deleteCampaign,
      addContent,
      updateContent,
      deleteContent,
      strategyLibrary,
      addStrategyTemplate,
      updateStrategyTemplate,
      deleteStrategyTemplate,
      matrixColumns,
      addMatrixColumn,
      updateMatrixColumn,
      deleteMatrixColumn
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
