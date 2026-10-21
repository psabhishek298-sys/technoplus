import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { FALLBACK_PROJECTS } from '../data/projects.ts';
import { DEFAULT_CATEGORIES } from '../data/categories.ts';
import { GOOGLE_TESTIMONIALS } from '../data/testimonials.ts';
import { DEFAULT_CLIENTS, subscribePublicContent } from './content.js';

const SiteContentContext = createContext(null);

export function SiteContentProvider({ children }) {
  const [projects, setProjects] = useState(FALLBACK_PROJECTS);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES.filter((item) => item.slug !== 'all'));
  const [clients, setClients] = useState(DEFAULT_CLIENTS);
  const [testimonials, setTestimonials] = useState(GOOGLE_TESTIMONIALS);

  useEffect(() => {
    const safeSubscribe = (name, setter) => subscribePublicContent(name, (items) => {
      setter(items);
    }, (error) => console.warn(`Could not load public ${name}:`, error));
    const unsubscribers = [
      safeSubscribe('projects', setProjects),
      safeSubscribe('categories', setCategories),
      safeSubscribe('clients', setClients),
      safeSubscribe('testimonials', setTestimonials),
    ];
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, []);

  const value = useMemo(() => ({ projects, categories, clients, testimonials }), [projects, categories, clients, testimonials]);
  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent() {
  const value = useContext(SiteContentContext);
  if (!value) throw new Error('useSiteContent must be used inside SiteContentProvider');
  return value;
}
