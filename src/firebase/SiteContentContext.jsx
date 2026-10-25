import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { FALLBACK_PROJECTS } from '../data/projects.ts';
import { DEFAULT_CATEGORIES } from '../data/categories.ts';
import { GOOGLE_TESTIMONIALS } from '../data/testimonials.ts';
import { DEFAULT_HOME_EXPERTISE_ITEMS, DEFAULT_HOME_EXPERTISE_SECTION } from '../data/homeExpertise.js';
import { DEFAULT_ABOUT_TOURISM_ITEMS } from '../data/aboutTourism.js';
import { DEFAULT_CLIENTS } from '../data/clients.js';
import { firebaseReady } from './config.js';

const SiteContentContext = createContext(null);

export function SiteContentProvider({ children }) {
  const [projects, setProjects] = useState(FALLBACK_PROJECTS);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES.filter((item) => item.slug !== 'all'));
  const [clients, setClients] = useState(DEFAULT_CLIENTS);
  const [testimonials, setTestimonials] = useState(GOOGLE_TESTIMONIALS);
  const [homeExpertise, setHomeExpertise] = useState(DEFAULT_HOME_EXPERTISE_ITEMS);
  const [homeExpertiseSection, setHomeExpertiseSection] = useState(DEFAULT_HOME_EXPERTISE_SECTION);
  const [aboutTourism, setAboutTourism] = useState(DEFAULT_ABOUT_TOURISM_ITEMS);

  useEffect(() => {
    if (!firebaseReady) return undefined;
    let active = true;
    const unsubscribers = [];
    import('./content.js').then(({ subscribePublicContent, subscribeSectionSettings }) => {
      if (!active) return;
      const safeSubscribe = (name, setter) => subscribePublicContent(name, setter, (error) => console.warn(`Could not load public ${name}:`, error));
      unsubscribers.push(
        safeSubscribe('projects', setProjects),
        safeSubscribe('categories', setCategories),
        safeSubscribe('clients', setClients),
        safeSubscribe('testimonials', setTestimonials),
        safeSubscribe('homeExpertise', setHomeExpertise),
        safeSubscribe('aboutTourism', setAboutTourism),
        subscribeSectionSettings('homeExpertise', (settings) => {
          setHomeExpertiseSection(settings || DEFAULT_HOME_EXPERTISE_SECTION);
        }, (error) => console.warn('Could not load home section settings:', error)),
      );
    }).catch((error) => console.warn('Could not initialize public content:', error));
    return () => {
      active = false;
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  const value = useMemo(() => ({ projects, categories, clients, testimonials, homeExpertise, homeExpertiseSection, aboutTourism }), [projects, categories, clients, testimonials, homeExpertise, homeExpertiseSection, aboutTourism]);
  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent() {
  const value = useContext(SiteContentContext);
  if (!value) throw new Error('useSiteContent must be used inside SiteContentProvider');
  return value;
}
