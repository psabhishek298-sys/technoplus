import {
  addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, orderBy, query,
  serverTimestamp, updateDoc, where, writeBatch,
} from 'firebase/firestore';
import { db, firebaseReady } from './client.js';
import { FALLBACK_PROJECTS } from '../data/projects.ts';
import { DEFAULT_CATEGORIES } from '../data/categories.ts';
import { GOOGLE_TESTIMONIALS } from '../data/testimonials.ts';

export const CONTENT_COLLECTIONS = ['projects', 'categories', 'clients', 'testimonials', 'inquiries'];

export const DEFAULT_CLIENTS = [
  { id: 'client-01', name: 'Sree Gokulam Group', logoPath: 'https://res.cloudinary.com/vpi7w3h5/image/upload/f_auto,q_auto/v1792580232/p3i0915rqppe19miec0h.webp', website: '', order: 1, published: true },
  { id: 'client-02', name: 'Bhima Jewellers', logoPath: 'https://res.cloudinary.com/vpi7w3h5/image/upload/f_auto,q_auto/v1792580232/bnqklwb5gvrx2cxswwhn.webp', website: '', order: 2, published: true },
  { id: 'client-03', name: 'Wonderla', logoPath: 'https://res.cloudinary.com/vpi7w3h5/image/upload/f_auto,q_auto/v1792580233/ceczjaktmkisyyyvuhdq.png', website: '', order: 3, published: true },
  { id: 'client-04', name: 'Lulu Group', logoPath: 'https://res.cloudinary.com/vpi7w3h5/image/upload/f_auto,q_auto/v1792580234/a3uos1bccielqnpw2iap.webp', website: '', order: 4, published: true },
  { id: 'client-05', name: 'Kalyan Silks', logoPath: 'https://res.cloudinary.com/vpi7w3h5/image/upload/f_auto,q_auto/v1792580235/snavhtwexfmkkb3abldh.webp', website: '', order: 5, published: true },
  { id: 'client-06', name: 'Kairali', logoPath: 'https://res.cloudinary.com/vpi7w3h5/image/upload/f_auto,q_auto/v1792580235/u3oxdzjt6iotbnzducpd.webp', website: '', order: 6, published: true },
];

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

export async function saveContent(collectionName, id, value) {
  if (!db) throw new Error('Firebase is not configured yet.');
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
