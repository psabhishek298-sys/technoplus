import React, { Suspense, lazy, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { ArrowDown, ArrowRight, ArrowUpRight } from 'lucide-react';
import { ClientLogoSection } from './components/ClientLogoSection.jsx';
import { SiteContentProvider, useSiteContent } from './firebase/SiteContentContext.jsx';
import { SEOHead } from './components/SEOHead.jsx';
import { CinematicList } from './components/CinematicList.jsx';
import './styles.css';
import './pages.css';
import './components/BrandLogo.css';
import './components/ClientLogos.css';
import './theme.css';
import './site-refinements.css';
import './responsive.css';

const AdminPage = lazy(() => import('./admin/AdminPage.jsx'));
const AboutPage = lazy(() => import('./pages.jsx').then((module) => ({ default: module.AboutPage })));
const ContactPage = lazy(() => import('./pages.jsx').then((module) => ({ default: module.ContactPage })));
const ProcedurePage = lazy(() => import('./pages.jsx').then((module) => ({ default: module.ProcedurePage })));
const ProjectDetailPage = lazy(() => import('./pages.jsx').then((module) => ({ default: module.ProjectDetailPage })));
const ProjectsPage = lazy(() => import('./pages.jsx').then((module) => ({ default: module.ProjectsPage })));

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

function Header({ loading }) {
  const { pathname } = useLocation();
  if (pathname === '/admin') return null;
  const lightHeader = pathname === '/' || (pathname.startsWith('/projects/') && pathname !== '/projects');
  const navItems = [
    { label: 'Home', to: '/' },
    { label: 'Projects', to: '/projects' },
    { label: 'About', to: '/about' },
    { label: 'Our Process', to: '/procedure' },
    { label: 'Contact', to: '/contact' },
  ];
  return <header className={`header ${lightHeader ? 'header-light' : ''} ${pathname === '/' ? 'home-header' : ''}`}>
    <Link to="/" className="wordmark" aria-label="Techno+ Associates home"><img key={loading ? 'loading-logo' : 'hero-logo'} className="brand-logo" src={loading ? '/techno-logo.svg?animation=loading' : '/techno-logo.svg?animation=hero'} alt="Techno+ Associates"/></Link>
    <nav className="primary-nav" aria-label="Main navigation">
      <ul className="primary-nav-list">{navItems.map(({ label, to }) => {
        const active = pathname === to || (to === '/projects' && pathname.startsWith('/projects/'));
        return <li key={to}><NavLink to={to} end={to === '/'} className={`primary-nav-link${active ? ' is-active' : ''}`}>{label}</NavLink></li>;
      })}</ul>
    </nav>
  </header>;
}

function Hero() {
  return <section className="hero" id="home" aria-label="Techno Plus architecture film">
    <video className="hero-video" autoPlay muted loop playsInline preload="metadata" poster="https://res.cloudinary.com/vpi7w3h5/image/upload/f_auto,q_auto/v1792580252/b9bhk7d33d5cht1ood3s.jpg" aria-hidden="true">
      <source src="https://res.cloudinary.com/vpi7w3h5/video/upload/v1792589662/technoplus/hero/z3l9qsetsn8epfjl2rpy.webm" type="video/webm"/>
    </video>
    <div className="hero-shade"/>
    <a className="scroll-indicator" href="#intro"><span>Scroll to explore</span><i><ArrowDown size={16}/></i></a>
  </section>;
}

function ArchitecturalSketch() {
  const stageRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsDrawing(true);
        observer.disconnect();
      }
    }, { threshold: 0.35 });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  return <div ref={stageRef} className={`sketch-stage ${isDrawing ? 'is-drawing' : ''}`}>
    <div className="sketch-artwork">
      <img className="sketch-art" src="/images/architectural-sketch.png" alt="Hand-drawn architectural sketch of a modern Techno Plus home" loading="lazy"/>
      <span className="sketch-pencil" aria-hidden="true"/>
    </div>
    <span className="sketch-caption">A home taking shape · Techno Plus Associates</span>
  </div>;
}

function HomePage() {
  const { projects, testimonials, homeExpertise, homeExpertiseSection } = useSiteContent();
  const featured = projects.filter(p => p.featured && (p.coverImage || p.heroImage)).slice(0, 4);
  const reviewColumnSize = Math.ceil(testimonials.length / 3);
  const reviewColumns = [testimonials.slice(0, reviewColumnSize), testimonials.slice(reviewColumnSize, reviewColumnSize * 2), testimonials.slice(reviewColumnSize * 2)];
  return <main><Hero/>
    <section className="intro section-pad" id="intro"><div className="eyebrow"><span className="eyebrow-dot"/> Independent architecture practice <span className="eyebrow-line"/></div><div className="intro-showcase"><div className="intro-content"><h1>We design <em>thoughtful spaces</em> for people and place.</h1><div className="intro-aside"><p>Techno Plus Associates is an architecture practice established in 1990. We create functional, beautiful spaces shaped by the people who use them and the places they belong to.</p><Link className="text-link" to="/about">Discover our practice <ArrowRight/></Link></div></div><div className="intro-image intro-project-image"><img src="https://res.cloudinary.com/vpi7w3h5/image/upload/f_auto,q_auto/v1792580234/vrktg5loe7uvc0uefnnt.png" alt="Techno Plus architecture project" loading="lazy"/><span>Spaces that connect people, place and purpose.</span></div></div></section>
    <section className="projects section-pad home-featured-static" id="projects"><div className="section-heading home-featured-heading"><h2>Featured Projects</h2></div><div className="home-featured-grid">{featured.map(project => <Link className="home-featured-card" to={`/projects/${project.slug}`} key={project.id}><img src={project.coverImage || project.heroImage} alt={`${project.title} architecture project`} loading="lazy"/><h3>{project.title}</h3></Link>)}</div></section>
    <section className="expertise section-pad" id="expertise"><div className="expertise-top"><span className="eyebrow"><span className="eyebrow-dot"/> {homeExpertiseSection.name}</span><h2>{homeExpertiseSection.heading}</h2><p>{homeExpertiseSection.description}</p></div><CinematicList items={homeExpertise.map((item, index) => ({ ...item, id: String(item.order || index + 1).padStart(2, '0'), src: item.src || item.image, to: '/projects' }))}/></section>
    <section className="reviews section-pad" aria-labelledby="reviews-title">
      <div className="reviews-heading">
        <div className="reviews-rating" aria-label={`Rated 4.8 out of 5 from ${testimonials.length} Google reviews`}>
          <span className="reviews-google-mark" aria-hidden="true">G</span>
          <span className="reviews-rating-score">4.8 <i>/ 5.0</i></span>
          <span className="reviews-rating-stars" aria-hidden="true">★★★★★</span>
          <span className="reviews-rating-count">· {testimonials.length} Google Reviews</span>
        </div>
        <div className="reviews-heading-copy">
          <h2 id="reviews-title">What our clients say</h2>
          <p>Real feedback and experiences from the people who trust Techno + Associates with their spaces.</p>
        </div>
      </div>
      <div className="reviews-columns" aria-label="Client testimonials">
        <ReviewColumn reviews={reviewColumns[0]} duration={24}/>
        <ReviewColumn reviews={reviewColumns[1]} duration={28} className="reviews-column-mid"/>
        <ReviewColumn reviews={reviewColumns[2]} duration={26} className="reviews-column-last"/>
      </div>
    </section>
    <ClientLogoSection/>
    <section className="contact section-pad"><span className="eyebrow"><span className="eyebrow-dot"/> Start a conversation</span><div className="contact-main"><Link to="/contact" className="contact-title">Let's build<br/><em>with purpose.</em><ArrowUpRight/></Link><div className="contact-sketch"><ArchitecturalSketch/></div></div><div className="contact-bottom"><span>Have a project in mind?</span><Link to="/contact">Get in touch <ArrowRight/></Link></div></section>
  </main>;
}

function SiteFooter() {
  const { pathname } = useLocation();
  if (pathname === '/admin') return null;
  return <footer className="footer section-pad"><div className="footer-brand"><Link to="/" className="wordmark" aria-label="Techno+ Associates home"><img className="brand-logo" src="/techno-logo.svg" alt="Techno+ Associates"/></Link><p>Munduparamba<br/>Malappuram</p></div><div className="footer-links"><div><span>Explore</span><Link to="/projects">Projects</Link><Link to="/about">About us</Link><Link to="/procedure">Our process</Link><Link to="/contact">Contact</Link></div><div><span>Say hello</span><a href="tel:+919037000619">+91 9037 00 0619</a><a href="mailto:info@technoplus.in">info@technoplus.in</a></div></div><div className="footer-bottom"><span>© Techno Plus Associates</span><span>Architecture · Planning · Interiors</span><a href="#top" onClick={() => window.scrollTo({top:0,behavior:'smooth'})}>Back to top ↑</a></div></footer>;
}

function NotFoundPage() {
  return <main className="subpage"><section className="page-hero not-found-hero"><div className="page-hero-copy"><span className="eyebrow"><span className="eyebrow-dot"/>404 · Page not found</span><h1>This page<br/><em>isn't here.</em></h1><p>The address may have changed. Browse our projects or return to the home page.</p><Link className="text-link" to="/">Return home <ArrowRight/></Link></div></section></main>;
}

function ScrollToTop() { const { pathname, hash } = useLocation(); useLayoutEffect(() => { if (hash) { requestAnimationFrame(() => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' })); } else { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); } }, [pathname, hash]); return null; }
function MotionEnhancer() {
  const { pathname } = useLocation();
  useEffect(() => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const selectors = 'main > section:not(.home-featured-static), .page-hero-copy, .page-hero-image, .project-card, .wall-card, .stat, .tourism-list span, .story-copy, .story-image, .gallery-grid figure, .contact-detail, .expertise-list a, .reviews-rating';
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
  return <BrowserRouter><SiteContentProvider><ScrollToTop/><SEOHead/><MotionEnhancer/>{loading && <Splash done={() => setLoading(false)}/>}<Header loading={loading}/><Suspense fallback={<div role="status" aria-label="Loading page" style={{ minHeight: '60vh' }}/> }><Routes><Route path="/" element={<HomePage/>}/><Route path="/about" element={<AboutPage/>}/><Route path="/projects" element={<ProjectsPage/>}/><Route path="/projects/:slug" element={<ProjectDetailPage/>}/><Route path="/procedure" element={<ProcedurePage/>}/><Route path="/contact" element={<ContactPage/>}/><Route path="/admin" element={<AdminPage/>}/><Route path="*" element={<NotFoundPage/>}/></Routes></Suspense><SiteFooter/></SiteContentProvider></BrowserRouter>;
}

if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
createRoot(document.getElementById('root')).render(<App/>);
