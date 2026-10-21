export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  count?: number;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-all', name: 'All Works', slug: 'all', description: 'Comprehensive catalog of spatial interventions.', count: 15 },
  { id: 'cat-res', name: 'Residential', slug: 'residential', description: 'Homes and apartment projects.', count: 5 },
  { id: 'cat-com', name: 'Commercial', slug: 'commercial', description: 'Offices, showrooms and commercial projects.', count: 3 },
  { id: 'cat-hos', name: 'Hospitality', slug: 'hospitality', description: 'Resorts, hotels and hospitality projects.', count: 4 },
  { id: 'cat-tou', name: 'Tourism', slug: 'tourism', description: 'Parks and tourism destinations.', count: 3 },
];
