export interface TestimonialData {
  id: string;
  name: string;
  role?: string;
  location?: string;
  quote: string;
  avatar?: string;
  rating?: number;
  created_at?: string;
}

export const GOOGLE_TESTIMONIALS: TestimonialData[] = [
  {
    id: 'rev-01',
    name: 'Amrutha V',
    role: 'Verified Client',
    location: 'Google Review • 5 Stars',
    rating: 5,
    quote: 'Techno + Associates recently completed one of my projects, and I couldn\'t be more satisfied with the outcome. From the very beginning, their team demonstrated a deep understanding of my vision, seamlessly translating it into a design that exceeded my expectations. Their collaborative approach was refreshing—they took the time to listen to my ideas and provided valuable insights that enhanced the final result. Throughout the process, they exhibited a strong attention to detail, ensuring that every aspect of the design was carefully considered. The balance they achieved between aesthetics, functionality, and sustainability is truly remarkable.',
    created_at: '2025-01-15'
  },
  {
    id: 'rev-02',
    name: 'Aswathy S',
    role: 'Homeowner',
    location: 'Google Review • 5 Stars',
    rating: 5,
    quote: 'We wanted to build a well-ventilated home as far as possible, close to nature. It was challenging to find an architect who understood our needs and be with us on our journey with the same passion, patience, and professionalism. At our first meeting with the Techno Team, we were happy with the detailed discussion and knew we had made the right choice. The first design we got was perfect, very well balanced in terms of functionality and traditional looks that fit our budget. The central courtyard is my family\'s favorite place to hang out. Thank you, Vijayan Uncle, Aravind and Team, for all your efforts.',
    created_at: '2025-01-10'
  },
  {
    id: 'rev-03',
    name: 'ARS 83',
    role: 'Client',
    location: 'Google Review • 5 Stars',
    rating: 5,
    quote: 'I had the pleasure of working with Techno + Associates on a recent project, and I am thoroughly impressed with their professionalism, creativity, and dedication to excellence. From the initial consultation to the final design, the team displayed an impressive ability to listen to our needs and translate them into functional, beautiful spaces. Their process was collaborative, and they made sure to keep us informed at every stage, addressing any concerns with quick and thoughtful solutions. The design itself was innovative yet practical.',
    created_at: '2025-01-05'
  },
  {
    id: 'rev-04',
    name: 'Mumtaz P',
    role: 'Client',
    location: 'Google Review • 5 Stars',
    rating: 5,
    quote: 'Team Techno + was a totally different experience. The uniqueness in their design and commitment to complete works in time really stand apart. Thank you Aravind and Team for bringing joy to our interiors.',
    created_at: '2024-12-20'
  },
  {
    id: 'rev-05',
    name: 'Arjun Krishnadas',
    role: 'Client',
    location: 'Malappuram • Google Review',
    rating: 5,
    quote: 'One of the best architecture firms in Malappuram. Outstanding architectural design, dedicated team, and flawless execution on site.',
    created_at: '2024-12-15'
  },
  {
    id: 'rev-06',
    name: 'Thaj Rubi',
    role: 'Client',
    location: 'Google Review • 5 Stars',
    rating: 5,
    quote: 'Exceptional designs and seamless execution throughout the process. Highly recommend Techno + Associates for modern architectural projects.',
    created_at: '2024-11-28'
  },
  {
    id: 'rev-07',
    name: 'Rasneen Raheem',
    role: 'Client',
    location: 'Google Review • 5 Stars',
    rating: 5,
    quote: 'Highly recommend Techno + Associates for exceptional spaces, climate-responsive concepts, and meticulous craftsmanship.',
    created_at: '2024-11-10'
  },
  {
    id: 'rev-08',
    name: 'Hizzah Shereefa',
    role: 'Client',
    location: 'Google Review • 5 Stars',
    rating: 5,
    quote: 'Nice work and team is quite approachable. They understood our expectations clearly and delivered a clean, contemporary design.',
    created_at: '2024-10-18'
  },
  {
    id: 'rev-09',
    name: 'Abhinav Sunil',
    role: 'Client',
    location: 'Google Review • 5 Stars',
    rating: 5,
    quote: 'Very nice place and great architectural studio with visionary design ethos and warm client collaboration.',
    created_at: '2023-09-12'
  },
  {
    id: 'rev-10',
    name: 'Suhaila Rasween',
    role: 'Client',
    location: 'Google Review • 5 Stars',
    rating: 5,
    quote: 'Nice work and wonderful design experience. The spatial planning and natural light management are outstanding.',
    created_at: '2024-08-05'
  },
  {
    id: 'rev-11',
    name: 'Abhirami Achu',
    role: 'Client',
    location: 'Google Review • 5 Stars',
    rating: 5,
    quote: 'Great architecture team with creative solutions and unmatched commitment to spatial excellence.',
    created_at: '2023-07-22'
  },
  {
    id: 'rev-12',
    name: 'Riyaz Babu',
    role: 'Local Guide',
    location: 'Google Review • 5 Stars',
    rating: 5,
    quote: 'Excellent professional service and visionary architectural design. Highly recommended for premium homes and commercial buildings.',
    created_at: '2023-06-14'
  }
];
