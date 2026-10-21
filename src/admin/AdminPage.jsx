import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getDoc } from 'firebase/firestore';
import { ArrowDown, ArrowLeft, ArrowUp, BriefcaseBusiness, Building2, FolderKanban, GripVertical, LogOut, MessageSquareQuote, Plus, Search, ShieldCheck, Trash2, Users, X } from 'lucide-react';
import { auth, db, firebaseReady } from '../firebase/client.js';
import { docRef, importCurrentSiteContent, markInquiryStatus, removeContent, saveContent, saveContentOrder, subscribeAdminContent } from '../firebase/content.js';
import { useSiteContent } from '../firebase/SiteContentContext.jsx';
import CloudinaryImageField from './CloudinaryImageField.jsx';
import './admin.css';

const TABS = [
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'categories', label: 'Categories', icon: BriefcaseBusiness },
  { id: 'clients', label: 'Clients', icon: Building2 },
  { id: 'testimonials', label: 'Testimonials', icon: MessageSquareQuote },
  { id: 'inquiries', label: 'Inquiries', icon: Users },
];
const NAV_TABS = [{ id: 'overview', label: 'Overview', icon: Building2 }, ...TABS];

const EDITORS = {
  projects: [
    { key: 'title', label: 'Project title', required: true },
    { key: 'location', label: 'Location', required: true },
    { key: 'year', label: 'Year' },
    { key: 'tagline', label: 'Tagline', type: 'textarea' },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'category', label: 'Category', type: 'select', required: true },
    { key: 'featured', label: 'Show in homepage Featured Projects', type: 'checkbox' },
  ],
  categories: [
    { key: 'name', label: 'Category name', required: true },
  ],
  clients: [],
  testimonials: [
    { key: 'name', label: 'Name', required: true }, { key: 'location', label: 'Location' },
    { key: 'quote', label: 'Testimonial', type: 'textarea', required: true }, { key: 'rating', label: 'Rating (1–5)', type: 'number', required: true },
  ],
};

const EMPTY_DATA = { projects: [], categories: [], clients: [], testimonials: [], inquiries: [] };
const formatDate = (value) => value?.toDate ? value.toDate().toLocaleString() : 'Just now';
const plural = (count, label) => `${count} ${label}${count === 1 ? '' : 's'}`;
const toSlug = (value) => value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export default function AdminPage() {
  const [authState, setAuthState] = useState(firebaseReady ? 'checking' : 'unconfigured');
  const [adminUser, setAdminUser] = useState(null);
  const [authMessage, setAuthMessage] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [records, setRecords] = useState(EMPTY_DATA);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [draggedProjectId, setDraggedProjectId] = useState('');
  const syncedUser = useRef('');
  const { categories: siteCategories } = useSiteContent();

  useEffect(() => {
    if (!firebaseReady) return undefined;
    return onAuthStateChanged(auth, async (user) => {
      setAuthMessage('');
      if (!user) {
        setAdminUser(null);
        setAuthState('signed-out');
        return;
      }
      setAuthState('checking');
      try {
        const role = await getDoc(docRef('adminUsers', user.uid));
        if (role.exists() && role.data().enabled === true) {
          setAdminUser(user);
          setAuthState('admin');
        } else {
          setAdminUser(null);
          await signOut(auth);
          setAuthState('signed-out');
          setAuthMessage('This account does not have admin access. Ask the project owner to enable it.');
        }
      } catch (error) {
        setAdminUser(null);
        setAuthState('signed-out');
        setAuthMessage(error.message || 'Could not verify admin access. Check your Firebase setup.');
      }
    });
  }, []);

  useEffect(() => {
    if (authState !== 'admin') return undefined;
    const unsubscribe = TABS.map(({ id }) => subscribeAdminContent(id, (items) => {
      setRecords((current) => {
        const next = { ...current, [id]: items };
        return next;
      });
    }, (error) => setNotice(error.message || 'Could not load records.')));
    return () => unsubscribe.forEach((stop) => stop());
  }, [authState]);

  useEffect(() => {
    if (authState !== 'admin' || !adminUser?.uid || syncedUser.current === adminUser.uid) return;
    syncedUser.current = adminUser.uid;
    let active = true;
    importCurrentSiteContent().then((imported) => {
      if (!active) return;
      setNotice(imported
        ? `Added ${imported} existing website records to Admin: missing projects, categories, client logos and testimonials. Nothing was removed or overwritten.`
        : 'All existing website projects, categories, client logos and testimonials are already in Admin. Nothing was removed.');
    }).catch((error) => {
      if (!active) return;
      syncedUser.current = '';
      setNotice(`${error.message || 'Could not sync existing website content.'} Use “Sync missing content” to retry.`);
    });
    return () => { active = false; };
  }, [authState, adminUser]);

  const currentItems = records[activeTab] || [];
  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return currentItems;
    return currentItems.filter((item) => Object.values(item).some((value) => String(value ?? '').toLowerCase().includes(term)));
  }, [currentItems, search]);

  const handleSignIn = async (event) => {
    event.preventDefault();
    setBusy(true);
    setAuthMessage('');
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch {
      setAuthMessage('Sign-in failed. Check the email and password, and make sure Email/Password sign-in is enabled in Firebase.');
    } finally {
      setBusy(false);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const values = {};
    for (const field of EDITORS[activeTab]) {
      const value = form.get(field.key);
      values[field.key] = field.type === 'checkbox' ? value === 'on' : field.type === 'number' ? Number(value || 0) : String(value ?? '').trim();
    }
    if (activeTab === 'projects') {
      const gallery = String(editing.galleryText || '').split('\n').map((url) => url.trim()).filter(Boolean);
      values.galleryText = gallery.join('\n');
      if (!gallery.length) {
        setFormError('Add at least one project image. The first image becomes the thumbnail.');
        return;
      }
      if (gallery.length > 30) {
        setFormError('A project can have up to 30 images.');
        return;
      }
      const title = String(values.title || '').trim();
      const slugBase = toSlug(title) || `project-${Date.now()}`;
      let slug = slugBase;
      let suffix = 2;
      while (records.projects.some((item) => item.slug === slug && item.id !== editing.id)) slug = `${slugBase}-${suffix++}`;
      values.slug = slug;
      values.coverImage = gallery[0];
      values.heroImage = gallery[0];
      values.area = editing.area || '';
      values.status = editing.status || '';
      values.concept = editing.concept || '';
      values.materialsText = editing.materialsText || '';
      values.statsText = editing.statsText || '';
      values.published = true;
      values.order = editing.order || (Math.max(0, ...records.projects.map((item) => Number(item.order) || 0)) + 1);
    }
    if (activeTab === 'categories') {
      const name = String(values.name || '').trim();
      const slugBase = toSlug(name) || `category-${Date.now()}`;
      let slug = slugBase;
      let suffix = 2;
      while (records.categories.some((item) => item.slug === slug && item.id !== editing.id)) slug = `${slugBase}-${suffix++}`;
      values.slug = slug;
      values.description = editing.description || '';
      values.order = editing.order || (Math.max(0, ...records.categories.map((item) => Number(item.order) || 0)) + 1);
      values.published = true;
    }
    if (activeTab === 'clients') {
      if (!editing.logoPath) {
        setFormError('Upload a client logo before saving.');
        return;
      }
      values.logoPath = editing.logoPath;
      values.name = editing.name || `Client ${String(records.clients.length + 1).padStart(2, '0')}`;
      values.website = editing.website || '';
      values.order = editing.order || (Math.max(0, ...records.clients.map((item) => Number(item.order) || 0)) + 1);
      values.published = true;
    }
    if (activeTab === 'testimonials') {
      values.role = editing.role || '';
      values.order = editing.order || (Math.max(0, ...records.testimonials.map((item) => Number(item.order) || 0)) + 1);
      values.published = true;
    }
    setBusy(true);
    setFormError('');
    try {
      await saveContent(activeTab, editing?.id, values);
      setEditing(null);
      setNotice(`${activeTab.slice(0, -1)} saved.`);
    } catch (error) {
      setFormError(error.message || 'Could not save. Check the Firebase project and security rules.');
    } finally {
      setBusy(false);
    }
  };

  const openProjectEditor = (item) => {
    const gallery = String(item.galleryText || '').split('\n').map((url) => url.trim()).filter(Boolean);
    if (item.coverImage && !gallery.includes(item.coverImage)) gallery.unshift(item.coverImage);
    setEditing({ ...item, galleryText: gallery.join('\n') });
  };

  const moveProject = async (sourceId, targetId) => {
    const previous = records.projects;
    const ordered = [...previous];
    const from = ordered.findIndex((item) => item.id === sourceId);
    const to = ordered.findIndex((item) => item.id === targetId);
    if (from < 0 || to < 0 || from === to) return;
    const [moved] = ordered.splice(from, 1);
    ordered.splice(to, 0, moved);
    setRecords((current) => ({ ...current, projects: ordered.map((item, index) => ({ ...item, order: index + 1 })) }));
    setDraggedProjectId('');
    try {
      await saveContentOrder('projects', ordered);
      setNotice('Project order saved. The website now uses this order.');
    } catch (error) {
      setRecords((current) => ({ ...current, projects: previous }));
      setNotice(error.message || 'Could not save project order.');
    }
  };

  const handleDelete = async (item) => {
    const title = item.title || item.name || 'this record';
    if (!window.confirm(`Remove “${title}” from the website? This cannot be undone.`)) return;
    try {
      await removeContent(activeTab, item.id);
      setNotice('Record removed.');
    } catch (error) {
      setNotice(error.message || 'Could not remove this record.');
    }
  };

  const handleImport = async () => {
    setBusy(true);
    setNotice('');
    try {
      const imported = await importCurrentSiteContent();
      setNotice(imported
        ? `Synced ${imported} missing projects, categories, client logos and testimonials from the current website into Firebase. Existing admin content was kept.`
        : 'The current website content is already in Firebase. Existing admin content was kept.');
    } catch (error) {
      setNotice(error.message || 'Could not import the current site content.');
    } finally {
      setBusy(false);
    }
  };

  if (authState === 'unconfigured') return <main className="admin-page"><section className="admin-setup"><div className="admin-mark"><img src="/techno-logo.svg" alt="Techno Plus"/></div><span className="admin-eyebrow"><ShieldCheck size={15}/> Secure studio access</span><h1>Admin is ready<br/><em>for Firebase.</em></h1><p>Connect your Firebase web app config to enable secure sign-in and content editing. This admin page does not create a local or demo password.</p><Link to="/" className="admin-back-link"><ArrowLeft size={15}/> Return to website</Link><small>Setup instructions are in the project root: FIREBASE_SETUP.md</small></section></main>;

  if (authState === 'checking') return <main className="admin-page"><div className="admin-loading"><span className="admin-spinner"/> Verifying secure access…</div></main>;

  if (authState !== 'admin') return <main className="admin-page"><section className="admin-login">
    <Link to="/" className="admin-back-link"><ArrowLeft size={15}/> Back to website</Link>
    <div className="admin-login-card"><div className="admin-mark"><img src="/techno-logo.svg" alt="Techno Plus"/></div><span className="admin-eyebrow"><ShieldCheck size={15}/> Private admin access</span><h1>Welcome<br/><em>back.</em></h1><p>Sign in with the admin account created in Firebase Authentication.</p>
      <form onSubmit={handleSignIn}><label>Email address<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required/></label><label>Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required/></label>{authMessage && <div className="admin-error" role="alert">{authMessage}</div>}<button className="admin-primary" disabled={busy}>{busy ? 'Checking…' : 'Sign in securely'}</button></form>
      <small>Admin permissions are checked against Firestore security rules.</small>
    </div>
  </section></main>;

  const editingFields = EDITORS[activeTab] || [];
  const newRecord = () => {
    const base = activeTab === 'projects' ? { title: '', slug: '', category: siteCategories[0]?.name || '', location: '', year: new Date().getFullYear(), tagline: '', description: '', galleryText: '', coverImage: '', heroImage: '', featured: false, published: true } :
      activeTab === 'categories' ? { name: '', slug: '', published: true } :
      activeTab === 'clients' ? { name: '', website: '', logoPath: '', published: true } :
        { name: '', location: '', quote: '', rating: 5, published: true };
    const maxOrder = Math.max(0, ...currentItems.map((item) => item.order || 0));
    return { ...base, order: maxOrder + 1 };
  };
  const labelFor = (item) => item.title || item.name || item.id;

  return <main className="admin-workspace">
    <aside className="admin-sidebar"><Link to="/" className="admin-sidebar-brand"><img src="/techno-logo.svg" alt="Techno Plus"/><span>STUDIO ADMIN</span></Link><div className="admin-nav-label">CONTENT</div><nav>{NAV_TABS.map(({ id, label, icon: Icon }) => <button key={id} className={activeTab === id ? 'active' : ''} onClick={() => { setActiveTab(id); setSearch(''); setNotice(''); }}><Icon size={17}/><span>{label}</span>{id !== 'overview' && <small>{records[id].length}</small>}</button>)}</nav><div className="admin-sidebar-bottom"><Link to="/" target="_blank"><ArrowLeft size={15}/> View website</Link><span><ShieldCheck size={14}/> Admin protected</span></div></aside>
    <section className="admin-main"><header className="admin-topbar"><div><span>TECHNO PLUS ASSOCIATES</span><strong>Content management</strong></div><div className="admin-user"><span>{adminUser?.email}</span><button onClick={() => signOut(auth)} aria-label="Sign out"><LogOut size={16}/> Sign out</button></div></header>
      <div className="admin-content"><div className="admin-page-title"><div><span className="admin-eyebrow">{activeTab === 'overview' ? 'STUDIO OVERVIEW' : 'CONTENT MANAGEMENT'}</span><h1>{activeTab === 'overview' ? <>Good day<span>.</span></> : <>{TABS.find((tab) => tab.id === activeTab)?.label}<span>.</span></>}</h1><p>{activeTab === 'overview' ? 'Your website content at a glance.' : `Manage ${activeTab} published across your website.`}</p></div>{activeTab !== 'overview' && activeTab !== 'inquiries' && <button className="admin-primary admin-add" onClick={() => { setFormError(''); setEditing(newRecord()); }}><Plus size={17}/> Add {activeTab === 'projects' ? 'project' : activeTab === 'categories' ? 'category' : activeTab === 'clients' ? 'client logo' : 'testimonial'}</button>}</div>
        {activeTab === 'overview' && <div className="admin-overview">{TABS.map(({ id, label, icon: Icon }) => <button key={id} className="" onClick={() => { setActiveTab(id); setSearch(''); }}><span><Icon size={17}/>{label}</span><strong>{records[id].length}</strong></button>)}</div>}
        {activeTab === 'overview' && authState === 'admin' && <div className="admin-import"><div><strong>Sync website content</strong><p>Add any missing projects, categories, client logos and testimonials from the current site to Firebase. Existing records are kept; future edits from here publish to the website.</p></div><button onClick={handleImport} disabled={busy}>{busy ? 'Syncing…' : 'Sync missing content'}</button></div>}
        {notice && <div className="admin-notice" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss"><X size={15}/></button></div>}
        {activeTab !== 'overview' && <><div className="admin-list-heading"><div><h2>{TABS.find((tab) => tab.id === activeTab)?.label}</h2><p>{activeTab === 'inquiries' ? 'Private contact messages. Only approved admins can read them.' : 'Only published records appear on the public website.'}</p></div><label className="admin-search"><Search size={16}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${activeTab}…`}/></label></div>
        {activeTab === 'projects' && <p className="admin-reorder-hint"><GripVertical size={16}/> Drag a project row to change its website position, or use the arrow buttons.</p>}
        {activeTab === 'inquiries' ? <div className="admin-inquiries">{filteredItems.length ? filteredItems.map((item) => <article key={item.id} className={`admin-inquiry ${item.status === 'new' ? 'is-new' : ''}`}><div className="admin-inquiry-head"><div><span className={`inquiry-status ${item.status || 'new'}`}>{item.status || 'new'}</span><strong>{item.name}</strong></div><time>{formatDate(item.createdAt)}</time></div><div className="admin-inquiry-contact"><a href={`mailto:${item.email}`}>{item.email}</a>{item.phone && <a href={`tel:${item.phone}`}>{item.phone}</a>}</div>{(item.projectType || item.location || item.budget) && <div className="admin-inquiry-meta">{[item.projectType, item.location, item.budget].filter(Boolean).join(' · ')}</div>}<p>{item.message}</p><div className="admin-inquiry-actions"><button onClick={() => markInquiryStatus(item.id, item.status === 'new' ? 'read' : 'new')}>{item.status === 'new' ? 'Mark as read' : 'Mark as new'}</button><button className="admin-delete" onClick={() => handleDelete(item)}><Trash2 size={14}/> Remove</button></div></article>) : <EmptyState title="No inquiries yet" description="Messages submitted through the website contact form will appear here."/>}</div> : <div className="admin-records">{filteredItems.length ? filteredItems.map((item) => { const projectIndex = records.projects.findIndex((project) => project.id === item.id); const canDrag = activeTab === 'projects' && !search.trim(); return <article className={`admin-record ${canDrag ? 'is-draggable' : ''} ${draggedProjectId === item.id ? 'is-dragging' : ''}`} key={item.id} draggable={canDrag} onDragStart={() => setDraggedProjectId(item.id)} onDragEnd={() => setDraggedProjectId('')} onDragOver={(event) => { if (canDrag) event.preventDefault(); }} onDrop={(event) => { event.preventDefault(); if (canDrag) moveProject(draggedProjectId, item.id); }}><div className="admin-record-order">{String(item.order || 0).padStart(2, '0')}</div><div className="admin-record-copy"><strong>{labelFor(item)}</strong><span>{item.category || item.slug || item.role || item.description || 'Content record'}{item.featured ? ' · Featured on home' : ''}</span></div><span className={`admin-publish ${item.published ? 'published' : 'draft'}`}>{item.published ? 'Published' : 'Draft'}</span><div className="admin-record-actions">{activeTab === 'projects' && <><button className="admin-order-button" onClick={() => projectIndex > 0 && moveProject(item.id, records.projects[projectIndex - 1].id)} disabled={projectIndex <= 0} aria-label={`Move ${labelFor(item)} up`}><ArrowUp size={16}/></button><button className="admin-order-button" onClick={() => projectIndex < records.projects.length - 1 && moveProject(item.id, records.projects[projectIndex + 1].id)} disabled={projectIndex >= records.projects.length - 1} aria-label={`Move ${labelFor(item)} down`}><ArrowDown size={16}/></button></>}<button onClick={() => activeTab === 'projects' ? openProjectEditor(item) : setEditing(item)}>Edit</button><button className="admin-delete" onClick={() => handleDelete(item)} aria-label={`Remove ${labelFor(item)}`}><Trash2 size={15}/></button></div></article>}) : <EmptyState title={`No ${activeTab} found`} description="Add a record or clear your search to see available content."/>}</div>}</>}
      </div>
    </section>

    {editing && <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(null); }}><section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-editor-title"><header><div><span className="admin-eyebrow">{editing.id ? 'UPDATE CONTENT' : 'NEW CONTENT'}</span><h2 id="admin-editor-title">{editing.id ? 'Edit' : 'Add'} {activeTab === 'categories' ? 'category' : activeTab === 'clients' ? 'client' : activeTab.slice(0, -1)}</h2></div><button className="admin-close" onClick={() => setEditing(null)} aria-label="Close editor"><X size={20}/></button></header><form onSubmit={handleSave}><div className="admin-fields">{editingFields.map((field) => <label key={field.key} className={`${field.type === 'textarea' ? 'span-2' : ''} ${field.type === 'checkbox' ? 'checkbox-field' : ''}`}>{field.type === 'checkbox' ? <><input type="checkbox" name={field.key} defaultChecked={Boolean(editing[field.key])}/><span>{field.label}{field.hint && <small>{field.hint}</small>}</span></> : <>{field.label}{field.type === 'textarea' ? <textarea name={field.key} value={editing[field.key] ?? ''} onChange={(event) => setEditing((current) => ({ ...current, [field.key]: event.target.value }))} required={field.required} rows={field.key === 'description' || field.key === 'quote' ? 4 : 3}/> : field.type === 'select' ? <select name={field.key} value={editing[field.key] || ''} onChange={(event) => setEditing((current) => ({ ...current, category: event.target.value }))} required={field.required}><option value="" disabled>Choose a category</option>{siteCategories.filter((item) => item.published !== false).map((item) => <option key={item.id || item.slug} value={item.name}>{item.name}</option>)}</select> : <input name={field.key} type={field.type || 'text'} {...(field.type === 'number' ? { value: editing[field.key] ?? '', onChange: (event) => setEditing((current) => ({ ...current, [field.key]: event.target.value })) } : { defaultValue: editing[field.key] ?? '' })} required={field.required} min={field.key === 'rating' ? 1 : undefined} max={field.key === 'rating' ? 5 : undefined}/ >}{field.hint && <small>{field.hint}</small>}</>}</label>)}</div>
      {activeTab === 'projects' && <div className="cloudinary-uploaders"><CloudinaryImageField label="Project images" multiple value={editing.galleryText || ''} onChange={(value) => { const images = value.split('\n').filter(Boolean); setEditing((current) => ({ ...current, galleryText: value, ...(images.length ? { coverImage: images[0], heroImage: images[0] } : {}) })); }}/></div>}
      {activeTab === 'clients' && <div className="cloudinary-uploaders"><CloudinaryImageField label="Client logo" value={editing.logoPath || ''} onChange={(value) => setEditing((current) => ({ ...current, logoPath: value }))}/></div>}
      {formError && <div className="admin-error" role="alert">{formError}</div>}<div className="admin-modal-actions"><button type="button" onClick={() => setEditing(null)}>Cancel</button><button className="admin-primary" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button></div></form></section></div>}
  </main>;
}

function EmptyState({ title, description }) {
  return <div className="admin-empty"><span><FolderKanban size={19}/></span><strong>{title}</strong><p>{description}</p></div>;
}
