import { Link } from 'react-router-dom';
import { MoveRight } from 'lucide-react';
import './CinematicList.css';

export function CinematicList({ items }) {
  return <div className="cinematic-list">
    {items.map(item => <Link className="cinematic-list-item" key={item.id} to={item.to} aria-label={`${item.title} — ${item.description}`}>
      <div className="cinematic-list-image"><img src={item.src} alt={item.alt} loading="lazy"/><span/></div>
      <div className="cinematic-list-content">
        <div className="cinematic-list-main"><span className="cinematic-list-id">{item.id}</span><span className="cinematic-list-copy"><strong>{item.title}</strong><small>{item.description}</small></span></div>
        <span className="cinematic-list-location">{item.location}</span>
        <i className="cinematic-list-arrow"><MoveRight/></i>
      </div>
    </Link>)}
    <div className="cinematic-list-end"/>
  </div>;
}
