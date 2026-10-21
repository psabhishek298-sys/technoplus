import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './AccordionGallery.css';

export default function AccordionGallery({
  items,
  defaultIndex = 0,
  accentColor = '#f9f8f6',
  overlayColor = '#272520',
  textColor = '#f9f8f6',
  height = 460,
  gap = 10,
  radius = 4,
  expandRatio = 0.42,
  duration = 0.72,
  ease = 'power3.out',
  parallax = 0.35,
  tilt = 5,
  stagger = 0.06,
  trigger = 'hover',
  grayscale = true,
  showLabels = true,
  className = '',
}) {
  const rootRef = useRef(null);
  const panelRefs = useRef([]);
  const mediaRefs = useRef([]);
  const barRefs = useRef([]);
  const textRefs = useRef([]);
  const tlRef = useRef(null);
  const firstRunRef = useRef(true);
  const mediaSizeRef = useRef(320);
  const count = items.length;
  const [active, setActive] = useState(Math.min(Math.max(defaultIndex, 0), Math.max(count - 1, 0)));
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const applyLayout = useCallback((animate) => {
    const panels = panelRefs.current;
    if (!panels.length) return;
    const ratio = Math.min(Math.max(expandRatio, 0.2), 0.9);
    const grow = count > 1 ? (ratio * (count - 1)) / (1 - ratio) : 1;
    const mediaSize = mediaSizeRef.current;
    tlRef.current?.kill();
    const dur = animate && !prefersReduced ? duration : 0;
    const timeline = gsap.timeline();

    panels.forEach((panel, index) => {
      if (!panel) return;
      const isActive = index === active;
      const media = mediaRefs.current[index];
      const bar = barRefs.current[index];
      const text = textRefs.current[index];
      const rotation = isActive ? 0 : index < active ? tilt : -tilt;
      timeline.to(panel, {
        flexGrow: isActive ? grow : 1,
        rotateY: rotation,
        '--ag-dim': isActive ? 0 : 0.35,
        duration: dur,
        ease,
      }, 0);

      if (media) {
        const drift = Math.max(-1.5, Math.min(1.5, active - index));
        timeline.to(media, {
          xPercent: -50,
          yPercent: -50,
          x: isActive ? 0 : drift * parallax * mediaSize * 0.06,
          '--ag-gray': grayscale && !isActive ? 1 : 0,
          duration: dur,
          ease,
        }, 0);
      }

      if (bar && text) {
        timeline.to([bar, text], {
          opacity: isActive ? 1 : 0,
          x: isActive ? 0 : -14,
          duration: isActive ? dur : dur * 0.6,
          ease,
          stagger: isActive && !prefersReduced ? stagger : 0,
        }, 0);
      }
    });
    tlRef.current = timeline;
  }, [active, count, duration, ease, expandRatio, grayscale, parallax, prefersReduced, stagger, tilt]);

  useEffect(() => {
    const element = rootRef.current;
    if (!element || !count) return undefined;
    const measure = () => {
      const usable = Math.max(element.getBoundingClientRect().width - gap * (count - 1), 120);
      const size = Math.max(140, usable * Math.min(Math.max(expandRatio, 0.2), 0.9) * 1.22);
      mediaSizeRef.current = size;
      element.style.setProperty('--ag-media-size', `${size}px`);
      applyLayout(!firstRunRef.current);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [applyLayout, count, expandRatio, gap]);

  useEffect(() => {
    applyLayout(!firstRunRef.current);
    firstRunRef.current = false;
  }, [applyLayout]);

  useEffect(() => () => tlRef.current?.kill(), []);

  const handleClick = (index, event) => {
    if (index !== active) {
      event.preventDefault();
      setActive(index);
    }
  };

  if (!count) return null;

  return (
    <div
      ref={rootRef}
      className={`accordion-gallery${className ? ` ${className}` : ''}`}
      style={{
        '--ag-accent': accentColor,
        '--ag-overlay': overlayColor,
        '--ag-text': textColor,
        '--ag-gap': `${gap}px`,
        '--ag-radius': `${radius}px`,
        height: `${height}px`,
      }}
      role="list"
      aria-label="Featured architecture projects"
    >
      {items.map((item, index) => {
        const Panel = item.link ? 'a' : 'div';
        const isActive = active === index;
        return (
          <Panel
            key={item.id || item.link || item.image || index}
            ref={(element) => { panelRefs.current[index] = element; }}
            className={`ag-panel${isActive ? ' ag-panel--active' : ''}`}
            style={{ borderRadius: `${radius}px` }}
            href={item.link || undefined}
            onMouseEnter={() => trigger === 'hover' && setActive(index)}
            onFocus={() => setActive(index)}
            onClick={(event) => handleClick(index, event)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                event.preventDefault();
                setActive((index + 1) % count);
              } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                event.preventDefault();
                setActive((index - 1 + count) % count);
              }
            }}
            role="listitem"
            tabIndex={0}
            aria-current={isActive ? 'true' : undefined}
            aria-label={`${item.label} · ${item.category || 'Project'}`}
          >
            <span className="ag-panel__frame">
              <span className="ag-panel__media" ref={(element) => { mediaRefs.current[index] = element; }}>
                <img src={item.image} alt={item.alt || item.label || 'Architecture project'} draggable="false" />
              </span>
              <span className="ag-panel__overlay" aria-hidden="true" />
            </span>
            {showLabels && <span className="ag-panel__label" aria-hidden="true">
              <span className="ag-panel__bar" ref={(element) => { barRefs.current[index] = element; }} />
              <span className="ag-panel__text" ref={(element) => { textRefs.current[index] = element; }}>
                <strong>{item.label}</strong><small>{item.category}{item.location ? ` · ${item.location}` : ''}</small>
              </span>
            </span>}
          </Panel>
        );
      })}
    </div>
  );
}
