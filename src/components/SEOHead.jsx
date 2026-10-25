import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSiteContent } from '../firebase/SiteContentContext.jsx';

const SITE_ORIGIN = 'https://technoplus-one.vercel.app';
const DEFAULT_IMAGE = `${SITE_ORIGIN}/photos/official-projects/satheeshan-1.jpg`;

const STATIC_PAGES = {
  '/': {
    title: 'Architecture, Planning & Interiors in Kerala | Techno Plus Associates',
    description: 'Explore architecture, planning and interior projects by Techno Plus Associates, an architecture practice established in 1990 in Malappuram, Kerala.',
    image: DEFAULT_IMAGE,
  },
  '/projects': {
    title: 'Architecture Projects in Kerala | Techno Plus Associates',
    description: 'Explore residential, commercial, hospitality and tourism projects by Techno Plus Associates across Kerala.',
    image: DEFAULT_IMAGE,
  },
  '/about': {
    title: 'About Our Architecture Practice | Techno Plus Associates',
    description: 'Learn about Techno Plus Associates, an architecture practice established in 1990 in Malappuram, Kerala, and explore our work and approach.',
    image: DEFAULT_IMAGE,
  },
  '/procedure': {
    title: 'Our Architecture Design Process | Techno Plus Associates',
    description: 'See how Techno Plus Associates takes architecture projects from site study and concept design through detailed development and delivery.',
    image: DEFAULT_IMAGE,
  },
  '/contact': {
    title: 'Contact an Architect in Malappuram, Kerala | Techno Plus Associates',
    description: 'Contact Techno Plus Associates in Munduparamba, Malappuram to discuss an architecture, planning or interiors project. Call, email or WhatsApp our studio.',
    image: DEFAULT_IMAGE,
  },
};

function ensureMeta(selector, attribute, key, value) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = value;
}

function ensureCanonical(href) {
  let element = document.head.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.rel = 'canonical';
    document.head.appendChild(element);
  }
  element.href = href;
}

function conciseDescription(value) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= 160) return text;
  const shortened = text.slice(0, 157).replace(/\s+\S*$/, '');
  return `${shortened}…`;
}

export function SEOHead() {
  const { pathname } = useLocation();
  const { projects } = useSiteContent();

  useEffect(() => {
    const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
    const projectSlug = normalizedPath.startsWith('/projects/') ? normalizedPath.slice('/projects/'.length) : '';
    const project = projectSlug ? projects.find((item) => item.slug === projectSlug) : null;
    const staticPage = STATIC_PAGES[normalizedPath];
    const isAdmin = normalizedPath === '/admin';
    const isKnownProjectRoute = Boolean(projectSlug);
    const isNotFound = !isAdmin && !staticPage && (!isKnownProjectRoute || !project);
    const title = isAdmin
      ? 'Admin | Techno Plus Associates'
      : project
        ? `${project.title}${project.location && !/location not listed/i.test(project.location) ? ` in ${project.location}` : ''} | Techno Plus Associates`
        : isNotFound ? 'Page not found | Techno Plus Associates' : staticPage.title;
    const rawDescription = isAdmin
      ? 'Private content management.'
      : project
        ? (project.description || project.tagline || `Explore the ${project.category || 'architecture'} project by Techno Plus Associates.`).slice(0, 300)
        : isNotFound ? 'The page you requested could not be found. Browse the Techno Plus Associates website.' : staticPage.description;
    const description = conciseDescription(rawDescription);
    const image = project?.coverImage || project?.heroImage || staticPage?.image || DEFAULT_IMAGE;
    const canonical = `${SITE_ORIGIN}${normalizedPath}`;

    document.title = title;
    ensureMeta('meta[name="description"]', 'name', 'description', description);
    ensureMeta('meta[name="robots"]', 'name', 'robots', isAdmin || isNotFound ? 'noindex, nofollow' : 'index, follow');
    ensureMeta('meta[property="og:type"]', 'property', 'og:type', project ? 'article' : 'website');
    ensureMeta('meta[property="og:site_name"]', 'property', 'og:site_name', 'Techno Plus Associates');
    ensureMeta('meta[property="og:title"]', 'property', 'og:title', title);
    ensureMeta('meta[property="og:description"]', 'property', 'og:description', description);
    ensureMeta('meta[property="og:url"]', 'property', 'og:url', canonical);
    ensureMeta('meta[property="og:image"]', 'property', 'og:image', image);
    ensureMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    ensureMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    ensureMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    ensureMeta('meta[name="twitter:image"]', 'name', 'twitter:image', image);

    if (isAdmin || isNotFound) {
      document.head.querySelector('link[rel="canonical"]')?.remove();
    } else {
      ensureCanonical(canonical);
    }

    document.head.querySelector('script[data-route-seo]')?.remove();
    if (!isAdmin && !isNotFound) {
      const breadcrumbNames = normalizedPath === '/'
        ? []
        : project
          ? [{ name: 'Projects', path: '/projects' }, { name: project.title, path: normalizedPath }]
          : [{ name: staticPage.title.split(' | ')[0], path: normalizedPath }];
      const breadcrumb = breadcrumbNames.length ? {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
          ...breadcrumbNames.map((item, index) => ({ '@type': 'ListItem', position: index + 2, name: item.name, item: `${SITE_ORIGIN}${item.path}` })),
        ],
      } : null;
      const projectSchema = project ? {
        '@type': 'CreativeWork',
        '@id': `${canonical}#project`,
        url: canonical,
        name: project.title,
        description,
        image,
        creator: { '@id': `${SITE_ORIGIN}/#organization` },
        ...(project.category ? { genre: project.category } : {}),
        ...(project.location && !/location not listed/i.test(project.location) ? { spatialCoverage: { '@type': 'Place', name: project.location } } : {}),
      } : null;
      const pageSchema = {
        '@type': 'WebPage',
        '@id': `${canonical}#webpage`,
        url: canonical,
        name: title,
        description,
        inLanguage: 'en-IN',
        isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
        about: { '@id': `${SITE_ORIGIN}/#organization` },
        primaryImageOfPage: { '@type': 'ImageObject', url: image },
      };
      const routeSchema = [pageSchema, breadcrumb, projectSchema].filter(Boolean);
      if (routeSchema.length) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.dataset.routeSeo = 'true';
        script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': routeSchema });
        document.head.appendChild(script);
      }
    }
  }, [pathname, projects]);

  return null;
}
