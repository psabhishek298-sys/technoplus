import React, { useRef, useState } from 'react';
import { GripVertical, ImagePlus, LoaderCircle, Trash2, UploadCloud } from 'lucide-react';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

async function uploadImage(file) {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary is not configured. Add the cloud name and upload preset to .env.local, then restart Vite.');
  }
  if (!ACCEPTED_TYPES.has(file.type)) throw new Error('Choose a JPG, PNG, WebP or AVIF image.');
  if (file.size > MAX_FILE_SIZE) throw new Error('Images must be 10 MB or smaller.');

  const body = new FormData();
  body.append('file', file);
  body.append('upload_preset', UPLOAD_PRESET);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(CLOUD_NAME)}/image/upload`, { method: 'POST', body });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error?.message || 'Cloudinary could not upload this image.');
  if (!result.secure_url) throw new Error('Cloudinary did not return a secure image URL.');
  return result.secure_url;
}

export default function CloudinaryImageField({ label, value, multiple = false, onChange }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [draggedImage, setDraggedImage] = useState(-1);
  const [dragTarget, setDragTarget] = useState(-1);
  const images = multiple ? String(value || '').split('\n').map((item) => item.trim()).filter(Boolean) : (value ? [value] : []);
  const configured = Boolean(CLOUD_NAME && UPLOAD_PRESET);

  const uploadFiles = async (files) => {
    if (!files.length) return;
    const filesToUpload = multiple ? files : files.slice(0, 1);
    setBusy(true);
    setMessage('');
    try {
      const uploaded = [];
      for (let index = 0; index < filesToUpload.length; index += 1) {
        setMessage(`Uploading ${index + 1} of ${filesToUpload.length}…`);
        uploaded.push(await uploadImage(filesToUpload[index]));
      }
      onChange(multiple ? [...images, ...uploaded].join('\n') : uploaded[0]);
      setMessage(`${uploaded.length} image${uploaded.length === 1 ? '' : 's'} uploaded to Cloudinary.`);
    } catch (error) {
      setMessage(error.message || 'Image upload failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    await uploadFiles(files);
  };

  const removeAt = (index) => {
    onChange(multiple ? images.filter((_, imageIndex) => imageIndex !== index).join('\n') : '');
    setMessage('Image removed from this content record.');
  };

  const moveImage = (from, to) => {
    if (to < 0 || to >= images.length || from === to) return;
    const reordered = [...images];
    const [image] = reordered.splice(from, 1);
    reordered.splice(to, 0, image);
    onChange(reordered.join('\n'));
    setMessage(multiple && to === 0 ? 'Main project thumbnail updated.' : 'Image order updated.');
  };

  return <section className={`cloudinary-field ${dragOver ? 'is-drop-active' : ''}`} aria-label={label} onDragOver={(event) => { if (configured) { event.preventDefault(); setDragOver(true); } }} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDragOver(false); }} onDrop={(event) => { if (!configured) return; const files = Array.from(event.dataTransfer.files || []); if (!files.length) return; event.preventDefault(); setDragOver(false); event.stopPropagation(); uploadFiles(files); }}>
    <div className="cloudinary-field-head"><div><strong>{label}</strong><small>{configured ? 'Images upload to Cloudinary; their secure URLs are saved in Firestore.' : 'Add Cloudinary configuration to enable uploads.'}</small></div>
      <button type="button" className="cloudinary-upload-button" onClick={() => inputRef.current?.click()} disabled={busy || !configured}><UploadCloud size={15}/>{busy ? 'Uploading…' : multiple ? 'Browse images' : 'Upload image'}</button>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple={multiple} onChange={handleFiles} hidden />
    </div>
    <small className="cloudinary-sort-hint"><GripVertical size={14}/>{multiple ? 'Drop files here or browse. Drag images to reorder; the first is the thumbnail.' : 'Drop an image here or browse files.'}</small>
    {images.length > 0 ? <><div className="cloudinary-image-list">{images.map((src, index) => <div className={`cloudinary-image-item ${multiple ? 'is-reorderable' : ''} ${draggedImage === index ? 'is-image-dragging' : ''} ${dragTarget === index && draggedImage !== index ? 'is-image-drop-target' : ''}`} key={`${src}-${index}`} draggable={multiple} onDragStart={(event) => { setDraggedImage(index); event.dataTransfer.setData('text/plain', String(index)); event.dataTransfer.effectAllowed = 'move'; }} onDragEnd={() => { setDraggedImage(-1); setDragTarget(-1); }} onDragEnter={() => { if (multiple && draggedImage !== index) setDragTarget(index); }} onDragOver={(event) => { if (multiple) event.preventDefault(); }} onDrop={(event) => { if (!multiple || !Array.from(event.dataTransfer.types).includes('text/plain')) return; event.preventDefault(); event.stopPropagation(); moveImage(Number(event.dataTransfer.getData('text/plain')), index); setDraggedImage(-1); setDragTarget(-1); }}>
      {multiple && <GripVertical className="cloudinary-image-grip" size={17} aria-hidden="true"/>}<img src={src} alt={`${label} ${index + 1}`} loading="lazy"/><span className={index === 0 && multiple ? 'cloudinary-thumb-label' : ''} title={src}>{multiple ? index === 0 ? 'Main thumbnail' : `Image ${String(index + 1).padStart(2, '0')}` : 'Current image'}</span>
      <button type="button" onClick={() => removeAt(index)} aria-label={`Remove ${label} ${index + 1}`}><Trash2 size={14}/></button>
    </div>)}</div></> : <div className="cloudinary-empty"><ImagePlus size={16}/>No image selected</div>}
    {message && <small className="cloudinary-status" role="status">{busy && <LoaderCircle className="cloudinary-spinner" size={13}/>} {message}</small>}
  </section>;
}
