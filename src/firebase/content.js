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
  { id: 'client-01', name: 'Sree Gokulam Group', logoPath: '/photos/client-logos/client-01.webp', website: '', order: 1, published: true },
  { id: 'client-02', name: 'Bhima Jewellers', logoPath: '/photos/client-logos/client-02.webp', website: '', order: 2, published: true },
  { id: 'client-03', name: 'Wonderla', logoPath: '/photos/client-logos/client-03.png', website: '', order: 3, published: true },
  { id: 'client-04', name: 'Lulu Group', logoPath: '/photos/client-logos/client-04.webp', website: '', order: 4, published: true },
  { id: 'client-05', name: 'Kalyan Silks', logoPath: '/photos/client-logos/client-05.webp', website: '', order: 5, published: true },
  { id: 'client-06', name: 'Kairali', logoPath: '/photos/client-logos/client-06.webp', website: '', order: 6, published: true },
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
  const q = query(collection(db, collectionName), where('published', '==', true), orderBy('order'));
  return onSnapshot(q, (snapshot) => {
    onData(snapshot.docs.map((item) => ({ id: item.id, ...normalizeContent(collectionName, item.data()) })));
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
  const existing = await Promise.all(names.map((name) => getDocs(collection(db, name))));
  if (existing.some((snapshot) => !snapshot.empty)) {
    throw new Error('At least one content collection already has records. Import stopped to prevent overwriting or duplicate seed data.');
  }

  const batch = writeBatch(db);
  const createdAt = serverTimestamp();
  const projects = FALLBACK_PROJECTS.map((project) => {
    const { id, materials, gallery, stats, ...rest } = project;
    return [id, { ...rest, materialsText: materials.join('\n'), galleryText: gallery.join('\n'), statsText: stats.map((item) => `${item.label} | ${item.value}`).join('\n'), published: true, createdAt, updatedAt: createdAt }];
  });
  const categories = DEFAULT_CATEGORIES.filter((item) => item.slug !== 'all').map(({ id, count, ...item }, index) => [id, { ...item, order: index + 1, published: true, createdAt, updatedAt: createdAt }]);
  const clients = DEFAULT_CLIENTS.map(({ id, ...item }) => [id, { ...item, createdAt, updatedAt: createdAt }]);
  const testimonials = GOOGLE_TESTIMONIALS.map(({ id, name, role = '', location = '', quote, rating = 5 }, index) => [id, { name, role, location, quote, rating, order: index + 1, published: true, createdAt, updatedAt: createdAt }]);

  [...projects, ...categories, ...clients, ...testimonials].forEach(([id, value], index) => {
    const collectionName = index < projects.length ? 'projects' : index < projects.length + categories.length ? 'categories' : index < projects.length + categories.length + clients.length ? 'clients' : 'testimonials';
    batch.set(doc(db, collectionName, id), value);
  });
  await batch.commit();
}

export function docRef(collectionName, id) {
  return doc(db, collectionName, id);
}
