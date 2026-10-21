import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import { ArrowDown, ArrowRight, ArrowUpRight } from 'lucide-react';
import { FALLBACK_PROJECTS } from './data/projects.ts';
import { GOOGLE_TESTIMONIALS } from './data/testimonials.ts';
import { AnimatedStat } from './components/AnimatedStat.jsx';
import { ClientLogoSection } from './components/ClientLogoSection.jsx';
import ScrollStack, { ScrollStackItem } from './components/ScrollStack.jsx';
import { CinematicList } from './components/CinematicList.jsx';
import { AboutPage, ContactPage, ProcedurePage, ProjectDetailPage, ProjectsPage } from './pages.jsx';
import './styles.css';
import './pages.css';
import './components/FeaturedProjects.css';
import './components/BrandLogo.css';
import './components/ClientLogos.css';

const projects = FALLBACK_PROJECTS;

function ReviewColumn({ reviews, duration, className = '' }) {
  return <div className={`reviews-column ${className}`}><div className="reviews-track" style={{ '--review-duration': `${duration}s` }}>
    {[0, 1].map(copy => <div className="reviews-track-group" key={copy} aria-hidden={copy === 1 || undefined}>{reviews.map(review => <article className="review-card" key={`${copy}-${review.id}`}>
      <div className="review-card-top"><div className="review-stars" aria-label={`${review.rating || 5} out of 5 stars`}>{'★'.repeat(review.rating || 5)}</div><span className="review-source"><b>G</b> Review</span></div>
      <blockquote>“{review.quote}”</blockquote>
      <div className="review-author"><span className="review-avatar">{review.name.charAt(0)}</span><span className="review-author-copy"><strong>{review.name}</strong><small>{review.role || review.location || 'Verified Google Review'}</small></span></div>
    </article>)}</div>)}
  </div></div>;
}

function Splash({ done }) {
  return <div className="splash" role="status" aria-label="Loading Techno Plus">
    <div className="splash-top"><span>Malappuram · Kerala</span><span>Est. 1990</span></div>
    <div className="splash-center"><img className="splash-logo" src="/techno-logo.svg" alt="Techno+ Associates"/></div>
    <div className="splash-bottom"><span>Spaces for a better tomorrow</span><div className="load-track"><i/></div><span>Loading</span></div>
    <button className="skip" onClick={done}>Skip intro <ArrowRight size={15}/></button>
  </div>;
}

function Header() {
  const { pathname } = useLocation();
  const lightHeader = pathname === '/' || (pathname.startsWith('/projects/') && pathname !== '/projects');
  return <header className={`header ${lightHeader ? 'header-light' : ''}`}>
    <Link to="/" className="wordmark" aria-label="Techno+ Associates home"><img className="brand-logo" src="/techno-logo.svg" alt="Techno+ Associates"/></Link>
    <nav className="primary-nav" aria-label="Main navigation">
      <Link to="/">Home</Link><Link to="/projects">Projects</Link><Link to="/about">About</Link><Link to="/procedure">Our Process</Link><Link to="/contact">Contact</Link>
    </nav>
  </header>;
}

function Hero() {
  const [slide, setSlide] = useState(0);
  const slides = [
    { title: "Mr. Satheeshan's Residence", image: '/photos/official-projects/satheeshan-1.jpg' },
    { title: 'Heritage Resort, Kottakkal', image: '/photos/official-projects/resort-1.jpg' },
    { title: 'Govardhana Samos Resort', image: '/photos/official-projects/govardhana-2.jpg' },
  ];
  useEffect(() => { const id = window.setInterval(() => setSlide(i => (i + 1) % slides.length), 6500); return () => window.clearInterval(id); }, []);
  return <section className="hero" id="home" aria-label="Featured Techno Plus projects">{slides.map((item, i) => <div key={item.title} className={`hero-image ${slide === i ? 'visible' : ''}`} style={{ backgroundImage: `url("${item.image}")` }}/ >)}<div className="hero-shade"/><div className="hero-caption"><span>Project&nbsp; / &nbsp;{slides[slide].title}</span><span>0{slide + 1} — 03</span></div><a className="scroll-indicator" href="#intro"><span>Scroll to explore</span><i><ArrowDown size={16}/></i></a><div className="hero-dots">{slides.map((s, i) => <button key={s.title} onClick={() => setSlide(i)} aria-label={`Show ${s.title}`} className={slide === i ? 'active' : ''}/>)}</div></section>;
}

function HomePage() {
  const featured = projects.filter(p => p.featured).slice(0, 6);
  const reviewColumnSize = Math.ceil(GOOGLE_TESTIMONIALS.length / 3);
  const reviewColumns = [GOOGLE_TESTIMONIALS.slice(0, reviewColumnSize), GOOGLE_TESTIMONIALS.slice(reviewColumnSize, reviewColumnSize * 2), GOOGLE_TESTIMONIALS.slice(reviewColumnSize * 2)];
  return <main><Hero/>
    <section className="intro section-pad" id="intro"><div className="eyebrow"><span className="eyebrow-dot"/> Independent architecture practice <span className="eyebrow-line"/></div><div className="intro-content"><h1>We design <em>thoughtful spaces</em> for people and place.</h1><div className="intro-aside"><p>Techno Plus Associates is an architecture practice established in 1990. We create functional, beautiful spaces shaped by the people who use them and the places they belong to.</p><Link className="text-link" to="/about">Discover our practice <ArrowRight/></Link></div></div><div className="intro-image"><img src="/photos/aboutimg.png" alt="Techno Plus architecture project" loading="lazy"/><span>Spaces that connect people, place and purpose.</span></div></section>
    <section className="projects section-pad" id="projects"><div className="section-heading"><div><span className="eyebrow"><span className="eyebrow-dot"/> Selected work / Kerala</span><h2>Featured<br/><em>Projects</em></h2></div><div className="section-heading-side"><p>Homes, hospitality, commercial spaces and tourism destinations shaped by people and place.</p><Link className="round-link" to="/projects" aria-label="View all projects"><ArrowUpRight/></Link></div></div><ScrollStack className="featured-project-stack" useWindowScroll stackPosition="13%" itemDistance={88} itemStackDistance={26} itemScale={0.04} baseScale={0.78} dimAmount={0.24} holdDistance={220}>{featured.map((p, i) => <ScrollStackItem key={p.id} itemClassName="featured-stack-item"><Link className={`featured-project-link card-${i + 1}`} to={`/projects/${p.slug}`}><img src={p.coverImage} alt={p.title} loading={i < 2 ? 'eager' : 'lazy'}/><span className="featured-project-shade"/><span className="featured-project-number">{String(i + 1).padStart(2, '0')}</span><span className="featured-project-category">{p.category}</span><span className="featured-project-meta"><span><strong>{p.title}</strong><small>{p.location}</small></span><i><ArrowUpRight/></i></span></Link></ScrollStackItem>)}</ScrollStack></section>
    <section className="stats section-pad" id="about"><div className="stats-intro"><span className="eyebrow"><span className="eyebrow-dot"/> Our practice</span><h2>Creating with<br/><em>purpose since 1990.</em></h2><p>We combine careful listening, practical expertise and a deep respect for each site to make places that last.</p><Link className="text-link" to="/about">About Techno Plus <ArrowRight/></Link></div><div className="stats-list"><AnimatedStat value={35} label="Years of practice"/><AnimatedStat value={60} label="Built projects"/><AnimatedStat value={15} label="Kerala tourism projects"/><AnimatedStat value={12} label="Cities in India and abroad"/></div></section>
    <section className="expertise section-pad" id="expertise"><div className="expertise-top"><span className="eyebrow"><span className="eyebrow-dot"/> What we do</span><h2>Spaces with<br/><em>meaning.</em></h2><p>From a family home to a public destination, we bring architecture, interiors and landscape together around real needs.</p></div><CinematicList items={[
      { id: '01', title: 'Architecture', location: 'Residential · Pattambi, Kerala', description: 'Homes, hospitality, commercial and institutional spaces.', src: '/photos/official-projects/satheeshan-1.jpg', alt: "Mr. Satheeshan's Residence in Pattambi", to: '/projects/satheeshan-residence' },
      { id: '02', title: 'Interiors', location: 'Techno Plus · Malappuram', description: 'Warm, considered interiors tailored to everyday life.', src: '/photos/official-projects/office1.jpg', alt: 'Interior at the Techno Plus office', to: '/projects/technoplus-office-malappuram' },
      { id: '03', title: 'Tourism & Landscape', location: 'Kundukadavu · Kerala', description: 'Destinations and public places rooted in Kerala.', src: '/photos/official-projects/project12.jpg', alt: 'Kundukadavu tourism destination in Kerala', to: '/projects/kundukadavu-tourism-destination' },
    ]}/></section>
    <section className="reviews section-pad"><div className="reviews-heading"><div><span className="eyebrow"><span className="eyebrow-dot"/> Notes from our clients</span><h2>Words from<br/><em>the people we serve.</em></h2><p>Thoughtful feedback from the people who trusted us with their spaces.</p></div><div className="reviews-rating"><div className="reviews-google-mark">G</div><div><strong>4.8 <span>/ 5.0</span></strong><small><b>★★★★★</b> · {GOOGLE_TESTIMONIALS.length} Google reviews</small></div></div></div><div className="reviews-columns" aria-label="Client testimonials"><ReviewColumn reviews={reviewColumns[0]} duration={24}/><ReviewColumn reviews={reviewColumns[1]} duration={28} className="reviews-column-mid"/><ReviewColumn reviews={reviewColumns[2]} duration={26} className="reviews-column-last"/></div></section>
    <ClientLogoSection/>
    <section className="contact section-pad"><span className="eyebrow"><span className="eyebrow-dot"/> Start a conversation</span><Link to="/contact" className="contact-title">Let's build<br/><em>with purpose.</em><ArrowUpRight/></Link><div className="contact-bottom"><span>Have a project in mind?</span><Link to="/contact">Get in touch <ArrowRight/></Link></div></section>
  </main>;
}

function SiteFooter() {
  return <footer className="footer section-pad"><div className="footer-brand"><Link to="/" className="wordmark" aria-label="Techno+ Associates home"><img className="brand-logo" src="/techno-logo.svg" alt="Techno+ Associates"/></Link><p>Munduparamba<br/>Malappuram, Kerala 676509</p></div><div className="footer-links"><div><span>Explore</span><Link to="/projects">Projects</Link><Link to="/about">About us</Link><Link to="/procedure">Our process</Link><Link to="/contact">Contact</Link></div><div><span>Say hello</span><a href="tel:+919847012345">+91 98470 12345</a><a href="mailto:hello@techplus.com">hello@techplus.com</a></div></div><div className="footer-bottom"><span>© Techno Plus Associates</span><span>Architecture · Interiors · Landscape</span><a href="#top" onClick={() => window.scrollTo({top:0,behavior:'smooth'})}>Back to top ↑</a></div></footer>;
}

function ScrollToTop() { const { pathname, hash } = useLocation(); useEffect(() => { if (hash) { requestAnimationFrame(() => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' })); } else { window.scrollTo(0, 0); } }, [pathname, hash]); return null; }
function MotionEnhancer() {
  const { pathname } = useLocation();
  useEffect(() => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const selectors = 'main > section, .page-hero-copy, .page-hero-image, .project-card, .wall-card, .stat, .tourism-list span, .phase-card, .story-copy, .story-image, .gallery-grid figure, .contact-detail, .expertise-list a, .reviews-rating';
    const elements = Array.from(document.querySelectorAll(selectors));
    if (reduceMotion || !('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('motion-reveal', 'is-visible'));
      return undefined;
    }

    document.documentElement.classList.add('motion-ready');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ isIntersecting, target }) => {
        if (!isIntersecting) return;
        target.classList.add('is-visible');
        observer.unobserve(target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    elements.forEach((element, index) => {
      element.classList.add('motion-reveal');
      element.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 70}ms`);
      observer.observe(element);
    });
    return () => observer.disconnect();
  }, [pathname]);
  return null;
}
function App() {
  const [loading, setLoading] = useState(true);
  useEffect(() => { const id = window.setTimeout(() => setLoading(false), 2100); return () => window.clearTimeout(id); }, []);
  return <BrowserRouter><ScrollToTop/><MotionEnhancer/>{loading && <Splash done={() => setLoading(false)}/>}<Header/><Routes><Route path="/" element={<HomePage/>}/><Route path="/about" element={<AboutPage/>}/><Route path="/projects" element={<ProjectsPage/>}/><Route path="/projects/:slug" element={<ProjectDetailPage/>}/><Route path="/procedure" element={<ProcedurePage/>}/><Route path="/contact" element={<ContactPage/>}/><Route path="*" element={<ProjectsPage/>}/></Routes><SiteFooter/></BrowserRouter>;
}

createRoot(document.getElementById('root')).render(<App/>);
