import { createContext, useContext, type ReactNode } from "react";

import { api, type ProjectContent } from "@/lib/api";

import { useApiQuery } from "./useApiQuery";

type ProjectState = { data: ProjectContent | undefined; error: string; loading: boolean };

const ProjectContext = createContext<ProjectState | null>(null);

/** Fetches GET /api/project once and shares it with every section. */
export function ProjectProvider({ children }: { children: ReactNode }) {
  const state = useApiQuery(api.project);
  return <ProjectContext value={state}>{children}</ProjectContext>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProject(): ProjectState {
  const state = useContext(ProjectContext);
  if (!state) throw new Error("useProject must be used inside <ProjectProvider>.");
  return state;
}
