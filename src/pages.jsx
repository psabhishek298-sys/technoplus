import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Building2, ChevronLeft, ChevronRight, Clock3, House, Hotel, Landmark, Mail, MapPin, MessageCircle, MessageSquare, Phone, Trees, UserRound, Video, X, ZoomIn, ZoomOut } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatedStat } from './components/AnimatedStat.jsx';
import { ClientLogoSection } from './components/ClientLogoSection.jsx';
import { CinematicList } from './components/CinematicList.jsx';
import { useSiteContent } from './firebase/SiteContentContext.jsx';
import { firebaseReady } from './firebase/client.js';
import { submitInquiry } from './firebase/content.js';
import './projects.css';

gsap.registerPlugin(ScrollTrigger);

function PageHero({ kicker, title, accent, description, image, backgroundImage, imageAlt, className = '' }) {
  const backgroundStyle = backgroundImage ? { backgroundImage: `linear-gradient(90deg, rgba(20, 20, 19, .76), rgba(20, 20, 19, .32)), url("${backgroundImage}")` } : undefined;
  return <section className={`page-hero ${className}`} style={backgroundStyle}><div className="page-hero-copy"><span className="eyebrow"><span className="eyebrow-dot"/>{kicker}</span><h1>{title}<br/><em>{accent}</em></h1>{description && <p>{description}</p>}</div>{image && <div className="page-hero-image"><img src={image} alt={imageAlt || `${title} ${accent} architecture`} fetchPriority="high"/></div>}</section>;
}

function ProjectsLandingHero({ projects }) {
  const activeProject = projects[0];

  if (!activeProject) return <section className="projects-landing-hero projects-landing-empty" aria-label="Selected projects"><div><span className="eyebrow"><span className="eyebrow-dot"/> Selected work · Kerala</span><h1>Spaces shaped<br/><em>around life.</em></h1><p>Explore architecture shaped by its place and the people who use it.</p><Link className="text-link" to="#project-wall">Explore projects <ArrowRight/></Link></div></section>;

  return <section className="projects-landing-hero section-pad" aria-label="Selected architecture projects">
    <div className="projects-landing-copy">
      <span className="eyebrow"><span className="eyebrow-dot"/> Selected work · Kerala</span>
      <h1>Spaces shaped<br/><em>around life.</em></h1>
      <p>Homes, workplaces and destinations designed with care for their place and the people who use them.</p>
      <div className="projects-landing-actions"><a className="projects-hero-link" href="#project-wall">Explore the collection <ArrowDown size={15}/></a><span>{String(projects.length).padStart(2, '0')} projects · crafted with purpose</span></div>
    </div>
    <div className="projects-landing-visual" aria-live="polite">
      <div className="projects-landing-image-frame">
        <img className="projects-landing-image" src={activeProject.coverImage || activeProject.heroImage} alt={activeProject.title} fetchPriority="high"/>
        <span className="projects-landing-shade"/>
        <div className="projects-landing-caption"><span className="projects-landing-counter">01 <i/> {String(projects.length).padStart(2, '0')}</span><div><small>{activeProject.category || 'Architecture'}{activeProject.location ? ` · ${activeProject.location}` : ''}</small><strong>{activeProject.title}</strong></div><Link to={`/projects/${activeProject.slug}`} aria-label={`View ${activeProject.title}`}><ArrowUpRight size={19}/></Link></div>
      </div>
    </div>
  </section>;
}

export function ProjectsPage() {
  const { projects, categories } = useSiteContent();
  const [activeCategory, setActiveCategory] = useState('all');
  const publishedCategories = useMemo(() => categories.filter((category) => category.published !== false), [categories]);
  useEffect(() => {
    if (activeCategory !== 'all' && !publishedCategories.some((category) => category.slug === activeCategory)) {
      setActiveCategory('all');
    }
  }, [activeCategory, publishedCategories]);
  const visibleProjects = activeCategory === 'all'
    ? projects
    : projects.filter((project) => project.category?.trim().toLowerCase() === publishedCategories.find((category) => category.slug === activeCategory)?.name?.trim().toLowerCase());
  const galleryProjects = useMemo(() => {
    const featured = projects.filter((project) => project.featured);
    const candidates = featured.length ? featured : projects;
    const govardhana = projects.find((project) => project.slug === 'govardhana-samos-resort');
    const prioritized = govardhana
      ? [{ ...govardhana, coverImage: '/photos/official-projects/govardhana-2.jpg' }, ...candidates.filter((project) => project.id !== govardhana.id)]
      : candidates;
    return prioritized.filter((project) => project.coverImage || project.heroImage).slice(0, 6);
  }, [projects]);
  return <main className="subpage work-index">
    <ProjectsLandingHero projects={galleryProjects}/>
    <section className="projects-filter-scene" aria-label="Filter projects by category">
      <div className="projects-filter-row" role="group" aria-label="Project categories">
        <button type="button" className={`filter-chip${activeCategory === 'all' ? ' selected' : ''}`} aria-pressed={activeCategory === 'all'} onClick={() => setActiveCategory('all')}>All works</button>
        {publishedCategories.map((category) => <button type="button" className={`filter-chip${activeCategory === category.slug ? ' selected' : ''}`} key={category.id || category.slug} aria-pressed={activeCategory === category.slug} onClick={() => setActiveCategory(category.slug)}>{category.name}</button>)}
      </div>
    </section>
    <section className="project-wall section-pad" id="project-wall" aria-label={`${visibleProjects.length} projects`}>
      {visibleProjects.length ? <div className="project-wall-grid">{visibleProjects.map((p, i) => <Link className="wall-card" to={`/projects/${p.slug}`} key={p.id}>
        <img className="wall-card-photo" src={p.coverImage || p.heroImage} alt={p.title} loading={i < 6 ? 'eager' : 'lazy'}/><span className="wall-card-shade"/>
        <span className="wall-card-number">{String(i + 1).padStart(2,'0')}</span><span className="wall-card-category">{p.category}</span>
        <span className="wall-card-caption"><span><strong>{p.title}</strong><small><MapPin size={12}/>{p.location}</small></span><i><ArrowRight size={17}/></i></span>
      </Link>)}</div> : <p className="projects-empty-state">No projects are currently listed in this category.</p>}
    </section>
  </main>;
}
export function ProjectDetailPage() {
  const { slug } = useParams();
  const { projects } = useSiteContent();
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const project = projects.find(p => p.slug === slug);
  const gallery = project ? (project.gallery?.length ? project.gallery : [project.heroImage, project.coverImage].filter(Boolean)) : [];
  useEffect(() => {
    if (lightboxIndex === null) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setLightboxIndex(null);
      if (event.key === 'ArrowRight') setLightboxIndex(index => (index + 1) % gallery.length);
      if (event.key === 'ArrowLeft') setLightboxIndex(index => (index - 1 + gallery.length) % gallery.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxIndex, gallery.length]);
  useEffect(() => setLightboxZoom(1), [lightboxIndex]);
  const changeLightboxImage = (direction) => setLightboxIndex(index => (index + direction + gallery.length) % gallery.length);
  if (!project) return <main className="subpage"><PageHero kicker="Project" title="Project" accent="not found."/><section className="section-pad subpage-section"><Link className="text-link" to="/projects"><ArrowLeft/> Back to all projects</Link></section></main>;
  return <main className="subpage project-detail"><section className="detail-hero" style={{backgroundImage:`linear-gradient(0deg,rgba(0, 0, 0, .55),transparent 66%),url("${project.heroImage || project.coverImage}")`}}><Link className="back-link" to="/projects"><ArrowLeft/> All projects</Link><div className="detail-title"><span className="eyebrow"><span className="eyebrow-dot"/>{project.category} · {project.year || 'Techno Plus project'}</span><h1>{project.title}</h1><span className="detail-location"><MapPin size={15}/>{project.location}</span></div></section>
    <section className="detail-intro section-pad"><div><span className="eyebrow"><span className="eyebrow-dot"/> Project overview</span><h2>{project.tagline}</h2></div><div><p>{project.description}</p>{project.concept && <p>{project.concept}</p>}<div className="detail-facts">{project.area && <span><small>Area</small>{project.area}</span>}{project.status && <span><small>Status</small>{project.status}</span>}{project.year && <span><small>Year</small>{project.year}</span>}</div></div></section>
    {project.materials?.length > 0 && <section className="detail-materials section-pad"><span className="eyebrow"><span className="eyebrow-dot"/> Materials & approach</span><div>{project.materials.map(m => <span key={m}>{m}</span>)}</div></section>}
    <section className="detail-gallery section-pad"><span className="eyebrow"><span className="eyebrow-dot"/> Project gallery · select an image to enlarge</span><div className="gallery-grid">{gallery.map((src,i) => <button className="gallery-image-button" type="button" key={`${src}-${i}`} onClick={() => setLightboxIndex(i)} aria-label={`View ${project.title} image ${i+1} full screen`}><img src={src} alt={`${project.title} view ${i+1}`} loading="lazy"/><span className="gallery-image-hint">View full image</span></button>)}</div></section>
    {lightboxIndex !== null && <div className="project-lightbox" role="dialog" aria-modal="true" aria-label={`${project.title} photo viewer`} onClick={() => setLightboxIndex(null)}><div className="project-lightbox-toolbar" onClick={event => event.stopPropagation()}><span>{project.title} <small>{lightboxIndex + 1} / {gallery.length}</small></span><div><button type="button" aria-label="Zoom out" onClick={() => setLightboxZoom(zoom => Math.max(1, zoom - .5))} disabled={lightboxZoom <= 1}><ZoomOut/></button><button type="button" aria-label="Zoom in" onClick={() => setLightboxZoom(zoom => Math.min(3, zoom + .5))} disabled={lightboxZoom >= 3}><ZoomIn/></button><button type="button" aria-label="Close image viewer" onClick={() => setLightboxIndex(null)}><X/></button></div></div><button className="project-lightbox-arrow project-lightbox-previous" type="button" aria-label="Previous image" onClick={event => { event.stopPropagation(); changeLightboxImage(-1); }}><ChevronLeft/></button><div className="project-lightbox-stage" onClick={event => event.stopPropagation()} onWheel={event => { if (event.deltaY) setLightboxZoom(zoom => Math.max(1, Math.min(3, zoom + (event.deltaY < 0 ? .2 : -.2)))); }}><img src={gallery[lightboxIndex]} alt={`${project.title} full-size view ${lightboxIndex + 1}`} style={{ transform: `scale(${lightboxZoom})` }} onDoubleClick={() => setLightboxZoom(zoom => zoom === 1 ? 2 : 1)}/></div><button className="project-lightbox-arrow project-lightbox-next" type="button" aria-label="Next image" onClick={event => { event.stopPropagation(); changeLightboxImage(1); }}><ChevronRight/></button><span className="project-lightbox-help">Use + / − to zoom · Esc to close · arrow keys to browse</span></div>}
    <section className="next-step section-pad"><span className="eyebrow"><span className="eyebrow-dot"/> Have a project in mind?</span><Link to="/contact" className="contact-title">Let's talk<ArrowUpRight/></Link><Link className="text-link" to="/projects">Back to all projects <ArrowRight/></Link></section></main>;
}

export function AboutPage() {
  const { aboutTourism, aboutHero } = useSiteContent();
  return <main className="subpage"><PageHero kicker="About Techno Plus" title="We design" accent="with purpose." description="Techno Plus Associates is an architecture practice established in 1990, creating thoughtful spaces that bring people, place and nature together." backgroundImage={aboutHero.backgroundImage} className="about-page-hero"/>
    <section className="story-section section-pad" id="story"><div className="story-copy"><span className="eyebrow"><span className="eyebrow-dot"/> Our story</span><h2>A team shaping<br/>meaningful spaces.</h2><p className="story-lead">We are a team of highly skilled architects and designers who are passionate about creating beautiful, functional and sustainable buildings and spaces.</p><p>Techno Plus Associates was established by Mr. Vijayakumar in 1990. Over the years, the practice has completed residential homes, commercial buildings, institutional buildings and hospitality projects. We value attention to detail, creativity and close collaboration with our clients.</p><p>Aravind, our principal architect, has worked on government and private projects. After completing his B.Arch in 2016 from USD-Mysore (School of Planning and Architecture), he joined Techno Plus in 2017 and brought a dynamic outlook to the practice. His philosophy of blurring the boundaries between architecture, interiors and landscape initiated a new design direction.</p><p>We believe architecture can positively impact people’s lives. We are committed to sustainable, energy-efficient and environmentally responsible buildings and spaces, reducing environmental impact while enhancing quality of life.</p></div><div className="story-image"><img src="https://res.cloudinary.com/vpi7w3h5/image/upload/f_auto,q_auto/v1792580240/jizatjasol7b0k3kq5aq.jpg" alt="Techno Plus architecture" loading="lazy"/></div></section>
    <section className="stats section-pad about-stats"><div className="stats-intro"><span className="eyebrow"><span className="eyebrow-dot"/> Our impact in numbers</span><h2>Experience<br/><em>built over time.</em></h2><p>From homes and workplaces to destinations across Kerala.</p></div><div className="stats-list"><AnimatedStat value={35} label="Years of practice"/><AnimatedStat value={60} label="Built projects"/><AnimatedStat value={12} label="Cities in India and abroad"/><AnimatedStat value={15} label="Tourism destinations in Kerala"/></div></section>
    <section className="tourism-section section-pad"><div><span className="eyebrow"><span className="eyebrow-dot"/> Kerala Tourism</span><h2>Places that welcome<br/><em>people in.</em></h2><p>Techno Plus has been among Kerala Tourism’s empanelled architects for the past 10 years, completing more than 15 tourism destination projects across Kerala.</p></div><CinematicList className="cinematic-list--tourism" items={aboutTourism.map((item, index) => ({ ...item, id: String(item.order || index + 1).padStart(2, '0'), title: item.name || item.title, alt: item.name || item.title, to: '/projects' }))}/></section>
    <ClientLogoSection/>
  </main>;
}

const phases = [
  { n:'01', title:'Discover', subtitle:'Understanding the client, site and requirements.', desc:'We begin with detailed site study: sun paths, prevailing winds, soil, neighbouring context and local bylaws. Conversations help us understand your lifestyle, spatial aspirations and priorities.', points:['Topographic & climatic site analysis','Client lifestyle & spatial brief','Zoning, FAR & regulatory feasibility','Initial budget & timeline framework'], image:'https://res.cloudinary.com/vpi7w3h5/image/upload/f_auto,q_auto/v1792580240/chjxzfmpkhudnndckhtx.jpg' },
  { n:'02', title:'Concept', subtitle:'Developing the architectural direction.', desc:'Through massing models, light studies and volumetric sketches, the core architectural idea takes shape. We establish the relationship between built form, open space, courtyards and circulation.', points:['Architectural concept narrative','Massing & circulation studies','Preliminary 3D spatial renderings','Mood & material boards'], image:'https://res.cloudinary.com/vpi7w3h5/image/upload/f_auto,q_auto/v1792580241/zkhf7ugma7nujldq5ikw.jpg' },
  { n:'03', title:'Design', subtitle:'Refining form, materials, space and experience.', desc:'The approved concept develops into detailed architectural plans, sections and elevations. We consider finishes, joinery, acoustics and daylight throughout.', points:['Comprehensive architectural drawings','3D visualisations','Material & finish selection'], image:'https://res.cloudinary.com/vpi7w3h5/image/upload/f_auto,q_auto/v1792580241/l50iq9h6gcg5u0k5wpor.jpg' },
  { n:'04', title:'Develop', subtitle:'Detailed drawings, documentation and coordination.', desc:'We prepare working drawings, joinery details, structural calculations and building services schematics, and assist with contractor coordination and statutory approvals.', points:['Construction drawings','Bill of quantities','Contractor & vendor documentation','Statutory approval submissions'], image:'https://res.cloudinary.com/vpi7w3h5/image/upload/f_auto,q_auto/v1792580241/g7oxt5xavrrisnybcqzc.jpg' },
  { n:'05', title:'Deliver', subtitle:'Bringing the design into reality.', desc:'Our architects and site coordinators make regular inspections to support craftsmanship and keep construction aligned with the design through to handover.', points:['On-site quality reviews','Mockup inspections','Landscape & lighting coordination','Final snagging & handover'], image:'https://res.cloudinary.com/vpi7w3h5/image/upload/f_auto,q_auto/v1792580237/khbalbstc0d58alb7fwr.jpg' },
];

export function ProcedurePage() {
  const phaseListRef = useRef(null);
  const phaseCurrentRef = useRef(null);
  const phaseProgressRef = useRef(null);
  const phaseProgressTrackRef = useRef(null);

  useLayoutEffect(() => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const phaseList = phaseListRef.current;
    if (!phaseList || reduceMotion) return undefined;

    const cards = Array.from(phaseList.querySelectorAll('.phase-card'));
    const progressFill = phaseProgressRef.current;
    const progressTrack = phaseProgressTrackRef.current;
    if (!cards.length) return undefined;

    const context = gsap.context(() => {
      cards.forEach((card, index) => {
        const photo = card.querySelector('.phase-photo');
        const copy = card.querySelectorAll('.phase-copy > .eyebrow, .phase-copy h2, .phase-copy h3, .phase-copy > p, .phase-copy li');
        const hiddenClip = card.classList.contains('reverse') ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)';

        gsap.set(photo, { clipPath: hiddenClip });
        gsap.set(copy, { autoAlpha: 0, y: 24 });

        const reveal = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: 'top 76%',
            toggleActions: 'play none play reverse',
            onEnter: () => { if (phaseCurrentRef.current) phaseCurrentRef.current.textContent = phases[index].n; },
            onEnterBack: () => { if (phaseCurrentRef.current) phaseCurrentRef.current.textContent = phases[index].n; },
          },
        });

        reveal
          .to(photo, { clipPath: 'inset(0 0% 0 0)', duration: 0.9, ease: 'power3.inOut' })
          .to(copy, { autoAlpha: 1, y: 0, duration: 0.62, stagger: 0.065, ease: 'power2.out' }, '-=0.55');
      });

      gsap.set(progressFill, { scaleX: 0, transformOrigin: 'left center' });
      ScrollTrigger.create({
        trigger: phaseList,
        start: 'top 78%',
        end: 'bottom 48%',
        onUpdate: ({ progress }) => {
          const active = Math.min(cards.length - 1, Math.floor(progress * cards.length));
          if (phaseCurrentRef.current) phaseCurrentRef.current.textContent = phases[active].n;
          progressTrack?.setAttribute('aria-valuenow', String(active + 1));
          gsap.set(progressFill, { scaleX: progress });
        },
      });
    }, phaseList);

    return () => context.revert();
  }, []);
  return <main className="subpage"><PageHero kicker="Our procedure" title="From idea" accent="to space." description="Our structured five-phase procedure bridges creative thinking with practical coordination through construction." backgroundImage="/photos/official-projects/satheeshan-4.jpg" className="process-page-hero"/><section className="process-intro section-pad"><span className="eyebrow"><span className="eyebrow-dot"/> 5-phase architectural journey</span><p>We guide each project from the first conversations and site studies to the final details on site.</p></section><section className="phase-list section-pad" ref={phaseListRef}><div className="phase-progress"><span ref={phaseCurrentRef}>01</span><div className="phase-progress-track" ref={phaseProgressTrackRef} role="progressbar" aria-label="Procedure progress" aria-valuemin="1" aria-valuemax={phases.length} aria-valuenow="1"><i ref={phaseProgressRef}/></div><span>{phases[phases.length - 1].n}</span></div>{phases.map((phase,i) => <article className={`phase-card ${i%2 ? 'reverse' : ''}`} key={phase.n}><div className="phase-photo"><img src={phase.image} alt={`${phase.title} phase`} loading="lazy"/></div><div className="phase-copy"><span className="eyebrow"><span className="eyebrow-dot"/> Phase {phase.n}</span><h2>{phase.title}</h2><h3>{phase.subtitle}</h3><p>{phase.desc}</p><ul>{phase.points.map(point => <li key={point}>{point}</li>)}</ul></div></article>)}</section><section className="next-step section-pad"><span className="eyebrow"><span className="eyebrow-dot"/> Ready to begin?</span><Link to="/contact" className="contact-title">Tell us<br/><em>what you imagine.</em><ArrowUpRight/></Link></section></main>;
}

export function ContactPage() {
  const [formStatus, setFormStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const handleInquiry = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    setSubmitting(true);
    setFormStatus('');
    try {
      await submitInquiry(values);
      form.reset();
      setFormStatus('Thank you. Your message has been sent to the studio.');
    } catch {
      setFormStatus('We could not send your message right now. Please email info@technoplus.in.');
    } finally {
      setSubmitting(false);
    }
  };
  const mapUrl = 'https://www.google.com/maps/place/Techno+%2B+Associates/@11.0505832,76.0931171,909m/data=!3m1!1e3!4m14!1m7!3m6!1s0x3ba63522ec3ef783:0x6eb96efac027126b!2sTechno+%2B+Associates!8m2!3d11.0505832!4d76.0931171!16s%2Fg%2F11k4lrhrmd!3m5!1s0x3ba63522ec3ef783:0x6eb96efac027126b!8m2!3d11.0505832!4d76.0931171!16s%2Fg%2F11k4lrhrmd?hl=en&entry=ttu&g_ep=EgoyMDI2MTAxOC4wIKXMDSoASAFQAw%3D%3D';
  return <main className="subpage contact-redesign">
    <section className="contact-landing">
      <div className="contact-landing-content section-pad">
        <div className="contact-landing-copy">
          <span className="eyebrow"><span className="eyebrow-dot"/> Send us a message <span className="eyebrow-line"/></span>
          <h1>Let's build<br/><em>meaningful.</em></h1>
          <p>We'd love to hear from you. Whether you have a question about our services, a project in mind, or anything else, our team is ready to help.</p>
          <div className="contact-quick-details">
            <div><i><MapPin size={17}/></i><span><strong>TechnoPlus Associates</strong><small>Munduparamba, Malappuram</small></span></div>
            <div><i><Mail size={17}/></i><span><strong>Email</strong><a href="mailto:info@technoplus.in">info@technoplus.in</a></span></div>
            <div><i><Phone size={17}/></i><span><strong>Call directly</strong><a href="tel:+919037000619">+91 9037 00 0619</a></span></div>
            <div><i><Video size={17}/></i><span><strong>Skype</strong><small>technoplus</small></span></div>
            <div className="contact-hours"><i><Clock3 size={17}/></i><span><strong>Work hours</strong><small>Monday – Friday: 08h00 – 17h30<br/>Saturday: 08h00 – 12h00<br/>Sunday: Off work</small></span></div>
          </div>
        </div>
        {firebaseReady ? <form className="contact-message-card" onSubmit={handleInquiry}>
          <span className="contact-form-kicker">Send us a message <i/></span>
          <label className="contact-field"><span>Name</span><span className="contact-input-wrap"><UserRound size={16}/><input name="name" autoComplete="name" maxLength={100} placeholder="John Doe" required/></span></label>
          <label className="contact-field"><span>Email</span><span className="contact-input-wrap"><Mail size={16}/><input name="email" type="email" autoComplete="email" maxLength={200} placeholder="john@example.com" required/></span></label>
          <label className="contact-field"><span>Mobile number</span><span className="contact-input-wrap"><Phone size={16}/><input name="phone" type="tel" autoComplete="tel" maxLength={40} placeholder="+91 98765 43210" required/></span></label>
          <label className="contact-field"><span>Message</span><span className="contact-input-wrap contact-message-wrap"><MessageSquare size={16}/><textarea name="message" rows={4} maxLength={3000} placeholder="Tell us about your project..." required/></span></label>
          <div className="contact-form-actions"><button className="contact-send-button" type="submit" disabled={submitting}>{submitting ? 'Sending…' : 'Send message'} <ArrowRight size={17}/></button><a className="contact-whatsapp-button" href={`https://wa.me/919037000619?text=${encodeURIComponent('Hello Techno Plus Associates, I would like to discuss a project.')}`} target="_blank" rel="noreferrer"><MessageCircle size={17}/> WhatsApp</a></div>
          {formStatus && <p className={`contact-form-status ${formStatus.startsWith('Thank') ? 'is-success' : 'is-error'}`} role="status">{formStatus}</p>}
        </form> : <div className="contact-message-card contact-form-offline"><span className="contact-form-kicker">Send us a message <i/></span><h2>We'd love to hear from you.</h2><p>Online enquiries are temporarily unavailable. You can reach the studio by email or WhatsApp.</p><div className="contact-form-actions"><a className="contact-send-button" href="mailto:info@technoplus.in">Email the studio <ArrowRight size={17}/></a><a className="contact-whatsapp-button" href="https://wa.me/919037000619" target="_blank" rel="noreferrer"><MessageCircle size={17}/> WhatsApp</a></div></div>}
      </div>
    </section>
    <section className="contact-map-card" aria-labelledby="contact-map-title">
      <div className="contact-map-heading"><div><h2 id="contact-map-title"><MapPin size={20}/> Visit our studio</h2><p>TechnoPlus Associates, Munduparamba, Malappuram</p></div><a href={mapUrl} target="_blank" rel="noreferrer">Open in Google Maps <ArrowRight size={16}/></a></div>
      <div className="contact-map-frame"><iframe title="Techno Plus Associates location in Munduparamba, Malappuram" src="https://maps.google.com/maps?q=11.0505832%2C76.0931171&t=k&z=17&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen/></div>
    </section>
  </main>;
}
