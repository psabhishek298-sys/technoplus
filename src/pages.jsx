import React, { useLayoutEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight, MapPin } from 'lucide-react';
import { FALLBACK_PROJECTS } from './data/projects.ts';
import { DEFAULT_CATEGORIES } from './data/categories.ts';
import './projects.css';
import './components/ProcedureAnimation.css';

function PageHero({ kicker, title, accent, description, image, className = '' }) {
  return <section className={`page-hero ${className}`}><div className="page-hero-copy"><span className="eyebrow"><span className="eyebrow-dot"/>{kicker}</span><h1>{title}<br/><em>{accent}</em></h1>{description && <p>{description}</p>}</div>{image && <div className="page-hero-image"><img src={image} alt=""/></div>}</section>;
}

export function ProjectsPage() {
  const [category, setCategory] = useState('all');
  const visible = useMemo(() => category === 'all' ? FALLBACK_PROJECTS : FALLBACK_PROJECTS.filter(p => p.category.toLowerCase() === category.toLowerCase()), [category]);
  return <main className="subpage work-index">
    <section className="projects-filter-scene" aria-label="Featured projects and filters"><div className="projects-filter-image"/><div className="projects-filter-row">{DEFAULT_CATEGORIES.map(c => <button key={c.slug} className={category === c.slug ? 'filter-chip selected' : 'filter-chip'} onClick={() => setCategory(c.slug)}>{c.name}</button>)}</div></section>
    <section className="project-wall section-pad" aria-label={`${visible.length} projects`}>
      <div className="project-wall-grid">{visible.map((p, i) => <Link className="wall-card" to={`/projects/${p.slug}`} key={p.id}>
        <img className="wall-card-photo" src={p.coverImage || p.heroImage} alt={p.title} loading={i < 6 ? 'eager' : 'lazy'}/><span className="wall-card-shade"/>
        <span className="wall-card-number">{String(i + 1).padStart(2,'0')}</span><span className="wall-card-category">{p.category}</span>
        <span className="wall-card-caption"><span><strong>{p.title}</strong><small><MapPin size={12}/>{p.location}</small></span><i><ArrowRight size={17}/></i></span>
      </Link>)}</div>
    </section>
  </main>;
}

export function ProjectDetailPage() {
  const { slug } = useParams();
  const project = FALLBACK_PROJECTS.find(p => p.slug === slug);
  if (!project) return <main className="subpage"><PageHero kicker="Project" title="Project" accent="not found."/><section className="section-pad subpage-section"><Link className="text-link" to="/projects"><ArrowLeft/> Back to all projects</Link></section></main>;
  const gallery = project.gallery?.length ? project.gallery : [project.heroImage, project.coverImage].filter(Boolean);
  return <main className="subpage project-detail"><section className="detail-hero" style={{backgroundImage:`linear-gradient(0deg,rgba(23,22,20,.55),transparent 66%),url("${project.heroImage || project.coverImage}")`}}><Link className="back-link" to="/projects"><ArrowLeft/> All projects</Link><div className="detail-title"><span className="eyebrow"><span className="eyebrow-dot"/>{project.category} · {project.year || 'Techno Plus project'}</span><h1>{project.title}</h1><span className="detail-location"><MapPin size={15}/>{project.location}</span></div></section>
    <section className="detail-intro section-pad"><div><span className="eyebrow"><span className="eyebrow-dot"/> Project overview</span><h2>{project.tagline}</h2></div><div><p>{project.description}</p>{project.concept && <p>{project.concept}</p>}<div className="detail-facts">{project.area && <span><small>Area</small>{project.area}</span>}{project.status && <span><small>Status</small>{project.status}</span>}{project.year && <span><small>Year</small>{project.year}</span>}</div></div></section>
    {project.materials?.length > 0 && <section className="detail-materials section-pad"><span className="eyebrow"><span className="eyebrow-dot"/> Materials & approach</span><div>{project.materials.map(m => <span key={m}>{m}</span>)}</div></section>}
    <section className="detail-gallery section-pad"><span className="eyebrow"><span className="eyebrow-dot"/> Project gallery</span><div className="gallery-grid">{gallery.map((src,i) => <figure key={`${src}-${i}`}><img src={src} alt={`${project.title} view ${i+1}`} loading="lazy"/></figure>)}</div></section>
    <section className="next-step section-pad"><span className="eyebrow"><span className="eyebrow-dot"/> Have a project in mind?</span><Link to="/contact" className="contact-title">Let's talk<ArrowUpRight/></Link><Link className="text-link" to="/projects">Back to all projects <ArrowRight/></Link></section></main>;
}

export function AboutPage() {
  return <main className="subpage"><PageHero kicker="About Techno Plus" title="We design" accent="with purpose." description="Techno Plus Associates is an architecture practice established in 1990, creating thoughtful spaces that bring people, place and nature together." image="/photos/aboutimg.png"/>
    <section className="story-section section-pad" id="story"><div className="story-copy"><span className="eyebrow"><span className="eyebrow-dot"/> Our story</span><h2>A team shaping<br/>meaningful spaces.</h2><p className="story-lead">We are a team of highly skilled architects and designers who are passionate about creating beautiful, functional and sustainable buildings and spaces.</p><p>Techno Plus Associates was established by Mr. Vijayakumar in 1990. Over the years, the practice has completed residential homes, commercial buildings, institutional buildings and hospitality projects. We value attention to detail, creativity and close collaboration with our clients.</p><p>Aravind, our principal architect, has worked on government and private projects. After completing his B.Arch in 2016 from USD-Mysore (School of Planning and Architecture), he joined Techno Plus in 2017 and brought a dynamic outlook to the practice. His philosophy of blurring the boundaries between architecture, interiors and landscape initiated a new design direction.</p><p>We believe architecture can positively impact people’s lives. We are committed to sustainable, energy-efficient and environmentally responsible buildings and spaces, reducing environmental impact while enhancing quality of life.</p></div><div className="story-image"><img src="/photos/imgi_5_baner5.jpg" alt="Techno Plus architecture" loading="lazy"/></div></section>
    <section className="stats section-pad about-stats"><div className="stats-intro"><span className="eyebrow"><span className="eyebrow-dot"/> Our impact in numbers</span><h2>Experience<br/><em>built over time.</em></h2><p>From homes and workplaces to destinations across Kerala.</p></div><div className="stats-list"><div className="stat"><strong>35<span>+</span></strong><span>Years of practice</span></div><div className="stat"><strong>60<span>+</span></strong><span>Built projects</span></div><div className="stat"><strong>12<span>+</span></strong><span>Cities in India and abroad</span></div><div className="stat"><strong>15<span>+</span></strong><span>Tourism destinations in Kerala</span></div></div></section>
    <section className="tourism-section section-pad"><div><span className="eyebrow"><span className="eyebrow-dot"/> Kerala Tourism</span><h2>Places that welcome<br/><em>people in.</em></h2><p>Techno Plus has been among Kerala Tourism’s empanelled architects for the past 10 years, completing more than 15 tourism destination projects across Kerala.</p></div><div className="tourism-list"><span>Cherumbu Eco Village · Karuvarakundu</span><span>Nilayoram Park · Kuttipuram</span><span>Mangalam Dam Garden · Palakkad</span><span>Pothundy Dam Garden</span><span>Beeyam Bridge · Ponnani</span><span>Marine Museum · Ponnani</span></div></section>
  </main>;
}

const phases = [
  { n:'01', title:'Discover', subtitle:'Understanding the client, site and requirements.', desc:'We begin with detailed site study: sun paths, prevailing winds, soil, neighbouring context and local bylaws. Conversations help us understand your lifestyle, spatial aspirations and priorities.', points:['Topographic & climatic site analysis','Client lifestyle & spatial brief','Zoning, FAR & regulatory feasibility','Initial budget & timeline framework'], image:'/photos/imgi_6_baner6.jpg' },
  { n:'02', title:'Concept', subtitle:'Developing the architectural direction.', desc:'Through massing models, light studies and volumetric sketches, the core architectural idea takes shape. We establish the relationship between built form, open space, courtyards and circulation.', points:['Architectural concept narrative','Massing & circulation studies','Preliminary 3D spatial renderings','Mood & material boards'], image:'/photos/imgi_7_baner3.jpg' },
  { n:'03', title:'Design', subtitle:'Refining form, materials, space and experience.', desc:'The approved concept develops into detailed architectural plans, sections and elevations. We consider finishes, joinery, acoustics and daylight throughout.', points:['Comprehensive architectural drawings','3D visualisations','Material & finish selection','Structural & MEP coordination'], image:'/photos/imgi_8_baner4.jpg' },
  { n:'04', title:'Develop', subtitle:'Detailed drawings, documentation and coordination.', desc:'We prepare working drawings, joinery details, structural calculations and building services schematics, and assist with contractor coordination and statutory approvals.', points:['Construction drawings','Bill of quantities','Contractor & vendor documentation','Statutory approval submissions'], image:'/photos/imgi_9_baner7.jpg' },
  { n:'05', title:'Deliver', subtitle:'Bringing the design into reality.', desc:'Our architects and site coordinators make regular inspections to support craftsmanship and keep construction aligned with the design through to handover.', points:['On-site quality reviews','Mockup inspections','Landscape & lighting coordination','Final snagging & handover'], image:'/photos/imgi_10_baner8.jpg' },
];

export function ProcedurePage() {
  useLayoutEffect(() => {
    const cards = Array.from(document.querySelectorAll('.phase-list .phase-card'));
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!cards.length || reduceMotion || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

    cards.forEach((card) => {
      card.classList.add('phase-card-animated');
      observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);
  return <main className="subpage"><PageHero kicker="Our procedure" title="From idea" accent="to space." description="Our structured five-phase procedure bridges creative thinking with practical coordination through construction." image="/photos/pcherp1.png"/><section className="process-intro section-pad"><span className="eyebrow"><span className="eyebrow-dot"/> 5-phase architectural journey</span><p>We guide each project from the first conversations and site studies to the final details on site.</p></section><section className="phase-list section-pad">{phases.map((phase,i) => <article className={`phase-card ${i%2 ? 'reverse' : ''}`} key={phase.n}><div className="phase-photo"><img src={phase.image} alt={`${phase.title} phase`} loading="lazy"/></div><div className="phase-copy"><span className="eyebrow"><span className="eyebrow-dot"/> Phase {phase.n}</span><h2>{phase.title}</h2><h3>{phase.subtitle}</h3><p>{phase.desc}</p><ul>{phase.points.map(point => <li key={point}>{point}</li>)}</ul></div></article>)}</section><section className="next-step section-pad"><span className="eyebrow"><span className="eyebrow-dot"/> Ready to begin?</span><Link to="/contact" className="contact-title">Tell us<br/><em>what you imagine.</em><ArrowUpRight/></Link></section></main>;
}

export function ContactPage() {
  return <main className="subpage"><PageHero kicker="Contact Techno Plus" title="Let's build" accent="something meaningful." description="Tell us about the place you want to create. We would be glad to hear from you." image="/photos/pchero.jpg"/><section className="contact-page section-pad"><div className="contact-details"><span className="eyebrow"><span className="eyebrow-dot"/> Visit or reach us</span><h2>Start a<br/><em>conversation.</em></h2><div className="contact-detail"><small>Location</small><p>Munduparamba,<br/>Malappuram, Kerala 676509</p></div><div className="contact-detail"><small>Email</small><a href="mailto:hello@techplus.com">hello@techplus.com <ArrowUpRight/></a></div><div className="contact-detail"><small>Phone</small><a href="tel:+919847012345">+91 98470 12345 <ArrowUpRight/></a></div></div><div className="contact-visual"><img src="/photos/portimg.png" alt="Techno Plus architecture portfolio" loading="lazy"/><a href="mailto:hello@techplus.com" className="contact-title">Have a<br/><em>project in mind?</em><ArrowUpRight/></a></div></section><section className="contact-note section-pad"><span className="eyebrow"><span className="eyebrow-dot"/> Tell us about your project</span><p>For new project enquiries, include a little about the site, your goals and the kind of space you have in mind.</p><a className="text-link" href="mailto:hello@techplus.com?subject=Project%20enquiry">Email the studio <ArrowRight/></a></section></main>;
}
