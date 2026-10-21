export interface ProjectStat {
  label: string;
  value: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  location: string;
  category: string;
  year: string;
  area: string;
  status: string;
  tagline: string;
  description: string;
  concept: string;
  materials: string[];
  coverImage: string;
  heroImage: string;
  gallery: string[];
  stats: ProjectStat[];
  featured: boolean;
  order: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  count: number;
}

export interface ContactPayload {
  name: string;
  email: string;
  phone: string;
  projectType?: string;
  message: string;
  budget?: string;
  location?: string;
}

export { OFFICIAL_PROJECTS as FALLBACK_PROJECTS } from './technoplusProjects';
