import React, { useEffect, useRef, useState } from 'react';

export function AnimatedStat({ value, label }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    let observer;
    const animate = () => {
      if (reduceMotion) {
        setDisplayValue(value);
        return;
      }
      const start = performance.now();
      const duration = 1350;
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        setDisplayValue(Math.round(value * eased));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    if (!('IntersectionObserver' in window)) {
      animate();
      return () => cancelAnimationFrame(frame);
    }

    observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      animate();
      observer.disconnect();
    }, { threshold: 0.55 });
    observer.observe(element);
    return () => {
      observer?.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return <div className="stat" ref={ref}><strong>{displayValue}<span>+</span></strong><span>{label}</span></div>;
}
