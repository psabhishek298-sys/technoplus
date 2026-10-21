import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './ExpandingCards.css';

export default function ExpandingCards({ items, defaultActiveIndex = 0, className = '' }) {
  const [activeIndex, setActiveIndex] = useState(defaultActiveIndex);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const resize = () => setIsDesktop(window.innerWidth >= 768);
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const gridStyle = useMemo(() => {
    if (!items.length) return {};
    const tracks = items.map((_, index) => index === activeIndex ? '5fr' : '1fr').join(' ');
    return isDesktop ? { gridTemplateColumns: tracks, gridTemplateRows: '1fr' } : { gridTemplateRows: tracks, gridTemplateColumns: '1fr' };
  }, [activeIndex, isDesktop, items]);

  if (!items.length) return null;

  return <ul className={`expanding-cards ${className}`.trim()} style={gridStyle} aria-label="Featured architecture projects">
    {items.map((item, index) => {
      const active = activeIndex === index;
      const content = <>
        <img className="expanding-card-image" src={item.imgSrc} alt={item.title} loading={index < 2 ? 'eager' : 'lazy'}/>
        <span className="expanding-card-shade" aria-hidden="true"/>
        <article className="expanding-card-content">
          <span className="expanding-card-vertical">{item.title}</span>
          <span className="expanding-card-icon" aria-hidden="true">{item.icon}</span>
          <strong className="expanding-card-title">{item.title}</strong>
          <span className="expanding-card-description">{item.description}</span>
        </article>
      </>;

      return <li key={item.id} className="expanding-card" data-active={active} onMouseEnter={() => setActiveIndex(index)} onFocus={() => setActiveIndex(index)} onClick={(event) => { if (!active) { event.preventDefault(); setActiveIndex(index); } }} onKeyDown={(event) => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') { event.preventDefault(); setActiveIndex((index + 1) % items.length); }
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') { event.preventDefault(); setActiveIndex((index - 1 + items.length) % items.length); }
      }}>
        <Link to={item.linkHref} className="expanding-card-link" aria-label={`${item.title}: ${item.description}`} tabIndex={0}>{content}</Link>
      </li>;
    })}
  </ul>;
}
