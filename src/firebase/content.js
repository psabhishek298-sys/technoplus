import {
  addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, orderBy, query,
  serverTimestamp, setDoc, updateDoc, where, writeBatch,
} from 'firebase/firestore';
import { db, firebaseReady } from './client.js';
import { FALLBACK_PROJECTS } from '../data/projects.ts';
import { DEFAULT_CATEGORIES } from '../data/categories.ts';
import { GOOGLE_TESTIMONIALS } from '../data/testimonials.ts';
import { DEFAULT_CLIENTS } from '../data/clients.js';
import { DEFAULT_HOME_EXPERTISE_ITEMS, DEFAULT_HOME_EXPERTISE_SECTION } from '../data/homeExpertise.js';
import { DEFAULT_ABOUT_TOURISM_ITEMS } from '../data/aboutTourism.js';
import { DEFAULT_ABOUT_HERO } from '../data/aboutHero.js';

export const CONTENT_COLLECTIONS = ['projects', 'categories', 'clients', 'testimonials', 'homeExpertise', 'aboutTourism', 'inquiries'];

export { DEFAULT_CLIENTS };

export function normalizeContent(collectionName, raw) {
  if (collectionName === 'projects') {
    return {
      ...raw,
      materials: (raw.materialsText || '').split('\n').map((item) => item.trim()).filter(Boolean),
      gallery: (raw.galleryText || '').split('\n').map((item) => item.trim()).filter(Boolean),
      stats: (raw.statsText || '').split('\n').map((line) => {
        const [label, ...value] = line.split('|');
        return { label: label?.trim() || '', value: value.join('|').trim() };
      }).filter((item) => item.label && item.value),
    };
  }
  if (collectionName === 'testimonials') {
    return { ...raw, created_at: raw.createdAt?.toDate?.().toISOString?.().slice(0, 10) || '' };
  }
  return raw;
}

export function subscribePublicContent(collectionName, onData, onError = () => {}) {
  if (!firebaseReady) return () => {};
  // Keep the public query on Firestore's single-field published index. Sorting
  // locally avoids a composite-index requirement on every environment.
  const q = query(collection(db, collectionName), where('published', '==', true));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((item) => ({ id: item.id, ...normalizeContent(collectionName, item.data()) }));
    items.sort((left, right) => (Number(left.order) || 0) - (Number(right.order) || 0));
    onData(items);
  }, onError);
}

export function subscribeAdminContent(collectionName, onData, onError = () => {}) {
  if (!firebaseReady) return () => {};
  const sortField = collectionName === 'inquiries' ? 'createdAt' : 'order';
  const q = query(collection(db, collectionName), orderBy(sortField, collectionName === 'inquiries' ? 'desc' : 'asc'));
  return onSnapshot(q, (snapshot) => {
    onData(snapshot.docs.map((item) => ({ id: item.id, ...normalizeContent(collectionName, item.data()) })));
  }, onError);
}

export function subscribeSectionSettings(sectionId, onData, onError = () => {}) {
  if (!firebaseReady) return () => {};
  return onSnapshot(doc(db, 'siteSections', sectionId), (snapshot) => {
    if (!snapshot.exists()) {
      onData(null);
      return;
    }
    const data = snapshot.data();
    onData(sectionId === 'homeExpertise' ? {
      id: snapshot.id,
      name: data.name || data.kicker || DEFAULT_HOME_EXPERTISE_SECTION.name,
      heading: data.accent ? `${data.heading || ''} ${data.accent}`.trim() : (data.heading || DEFAULT_HOME_EXPERTISE_SECTION.heading),
      description: data.description || '',
    } : { id: snapshot.id, ...data });
  }, onError);
}

export async function saveSectionSettings(sectionId, value) {
  if (!db) throw new Error('Firebase is not configured yet.');
  const ref = doc(db, 'siteSections', sectionId);
  const snapshot = await getDoc(ref);
  const payload = {
    name: String(value.name || ''),
    heading: String(value.heading || ''),
    description: String(value.description || ''),
    published: true,
    updatedAt: serverTimestamp(),
    ...(sectionId === 'aboutHero' ? { backgroundImage: String(value.backgroundImage || '') } : {}),
  };
  if (snapshot.exists()) return setDoc(ref, { ...payload, createdAt: snapshot.data().createdAt || serverTimestamp() });
  return setDoc(ref, { ...payload, createdAt: serverTimestamp() });
}

export async function ensureAboutHeroDefaults() {
  if (!db) throw new Error('Firebase is not configured yet.');
  const ref = doc(db, 'siteSections', 'aboutHero');
  const snapshot = await getDoc(ref);
  if (snapshot.exists()) return false;
  const timestamp = serverTimestamp();
  await setDoc(ref, {
    ...DEFAULT_ABOUT_HERO,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  return true;
}

export async function ensureHomeExpertiseDefaults() {
  if (!db) throw new Error('Firebase is not configured yet.');
  const settingsRef = doc(db, 'siteSections', 'homeExpertise');
  const [settingsSnapshot, itemsSnapshot] = await Promise.all([
    getDoc(settingsRef),
    getDocs(collection(db, 'homeExpertise')),
  ]);
  // The settings document is the one-time migration marker. Keep it even when
  // an admin intentionally removes every service card, so defaults do not
  // unexpectedly reappear on the next sign-in.
  if (settingsSnapshot.exists()) return 0;

  const batch = writeBatch(db);
  const timestamp = serverTimestamp();
  let created = 0;
  batch.set(settingsRef, {
    ...DEFAULT_HOME_EXPERTISE_SECTION,
    published: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  created += 1;
  if (itemsSnapshot.empty) {
    DEFAULT_HOME_EXPERTISE_ITEMS.forEach(({ id, ...item }) => {
      batch.set(doc(db, 'homeExpertise', id), {
        ...item,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      created += 1;
    });
  }
  if (created) await batch.commit();
  return created;
}

export async function ensureAboutTourismDefaults() {
  if (!db) throw new Error('Firebase is not configured yet.');
  const markerRef = doc(db, 'siteSections', 'aboutTourismSeed');
  const [markerSnapshot, itemsSnapshot] = await Promise.all([
    getDoc(markerRef),
    getDocs(collection(db, 'aboutTourism')),
  ]);
  // Keep the one-time marker when an admin removes every destination.
  if (markerSnapshot.exists()) return 0;

  const batch = writeBatch(db);
  const timestamp = serverTimestamp();
  batch.set(markerRef, { defaultsSeeded: true, createdAt: timestamp, updatedAt: timestamp });
  let created = 0;
  if (itemsSnapshot.empty) {
    DEFAULT_ABOUT_TOURISM_ITEMS.forEach(({ id, ...item }) => {
      batch.set(doc(db, 'aboutTourism', id), {
        ...item,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      created += 1;
    });
  }
  await batch.commit();
  return created;
}

export async function saveContent(collectionName, id, value) {
  if (!db) throw new Error('Firebase is not configured yet.');
  if (collectionName === 'homeExpertise' || collectionName === 'aboutTourism') {
    const ref = id ? doc(db, collectionName, id) : doc(collection(db, collectionName));
    const snapshot = id ? await getDoc(ref) : null;
    const payload = {
      ...(collectionName === 'homeExpertise' ? { title: String(value.title || '') } : { name: String(value.name || '') }),
      location: String(value.location || ''),
      description: String(value.description || ''),
      src: String(value.src || ''),
      order: Number(value.order) || 1,
      published: true,
      updatedAt: serverTimestamp(),
      createdAt: snapshot?.exists() ? snapshot.data().createdAt : serverTimestamp(),
    };
    return setDoc(ref, payload);
  }
  const payload = { ...value, updatedAt: serverTimestamp() };
  if (id) return updateDoc(doc(db, collectionName, id), payload);
  return addDoc(collection(db, collectionName), { ...payload, createdAt: serverTimestamp() });
}

export async function saveContentOrder(collectionName, items) {
  if (!db) throw new Error('Firebase is not configured yet.');
  const batch = writeBatch(db);
  items.forEach((item, index) => {
    batch.update(doc(db, collectionName, item.id), { order: index + 1, updatedAt: serverTimestamp() });
  });
  await batch.commit();
}

export async function removeContent(collectionName, id) {
  if (!db) throw new Error('Firebase is not configured yet.');
  return deleteDoc(doc(db, collectionName, id));
}

export async function submitInquiry(payload) {
  if (!db) throw new Error('Firebase is not configured yet.');
  return addDoc(collection(db, 'inquiries'), {
    ...payload,
    status: 'new',
    createdAt: serverTimestamp(),
  });
}

export async function markInquiryStatus(id, status) {
  return updateDoc(doc(db, 'inquiries', id), { status, updatedAt: serverTimestamp() });
}

export async function importCurrentSiteContent() {
  if (!db) throw new Error('Firebase is not configured yet.');
  const names = ['projects', 'categories', 'clients', 'testimonials'];
  const snapshots = await Promise.all(names.map((name) => getDocs(collection(db, name))));
  const existing = Object.fromEntries(names.map((name, index) => [name, snapshots[index].docs.map((item) => ({ id: item.id, ...item.data() }))]));
  const batch = writeBatch(db);
  const createdAt = serverTimestamp();
  const projects = FALLBACK_PROJECTS.map((project) => {
    const { id, materials, gallery, stats, ...rest } = project;
    return [id, { ...rest, materialsText: materials.join('\n'), galleryText: gallery.join('\n'), statsText: stats.map((item) => `${item.label} | ${item.value}`).join('\n'), published: true, createdAt, updatedAt: createdAt }];
  });
  const categories = DEFAULT_CATEGORIES.filter((item) => item.slug !== 'all').map(({ id, count, ...item }, index) => [id, { ...item, order: index + 1, published: true, createdAt, updatedAt: createdAt }]);
  const clients = DEFAULT_CLIENTS.map(({ id, ...item }) => [id, { ...item, createdAt, updatedAt: createdAt }]);
  const testimonials = GOOGLE_TESTIMONIALS.map(({ id, name, role = '', location = '', quote, rating = 5 }, index) => [id, { name, role, location, quote, rating, order: index + 1, published: true, createdAt, updatedAt: createdAt }]);
  const existingKeys = {
    projects: new Set(existing.projects.flatMap((item) => [item.slug].filter(Boolean))),
    categories: new Set(existing.categories.flatMap((item) => [item.slug].filter(Boolean))),
    clients: new Set(existing.clients.flatMap((item) => [item.logoPath, item.name].filter(Boolean))),
    testimonials: new Set(existing.testimonials.flatMap((item) => [item.quote].filter(Boolean))),
  };
  const entries = { projects, categories, clients, testimonials };
  let imported = 0;
  for (const collectionName of names) {
    const idSet = new Set(existing[collectionName].map((item) => item.id));
    for (const [id, value] of entries[collectionName]) {
      const dedupeKey = collectionName === 'projects' || collectionName === 'categories'
        ? value.slug
        : collectionName === 'clients' ? (value.logoPath || value.name) : value.quote;
      if (idSet.has(id) || existingKeys[collectionName].has(dedupeKey)) continue;
      batch.set(doc(db, collectionName, id), value);
      imported += 1;
    }
  }
  if (imported === 0) return 0;
  await batch.commit();
  return imported;
}

export function docRef(collectionName, id) {
  return doc(db, collectionName, id);
}
