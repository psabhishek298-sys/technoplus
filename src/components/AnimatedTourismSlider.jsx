import React from 'react';
import { MotionConfig, motion } from 'motion/react';
import './AnimatedTourismSlider.css';

const destinations = [
  { title: 'Cherumbu Eco Village · Karuvarakundu', image: 'https://res.cloudinary.com/vpi7w3h5/image/upload/f_auto,q_auto/v1792580250/xgxzjp4vaxiyv8klcy35.jpg' },
  { title: 'Nilayoram Park · Kuttipuram', image: 'https://res.cloudinary.com/vpi7w3h5/image/upload/f_auto,q_auto/v1792580251/cfar0ynv0bh5xjsrnxz7.jpg' },
  { title: 'Mangalam Dam Garden · Palakkad', image: 'https://res.cloudinary.com/vpi7w3h5/image/upload/f_auto,q_auto/v1792580247/tx3ydf2088yqh9es3hxe.jpg' },
  { title: 'Pothundy Dam Garden', image: 'https://res.cloudinary.com/vpi7w3h5/image/upload/f_auto,q_auto/v1792580250/xgxzjp4vaxiyv8klcy35.jpg' },
  { title: 'Beeyam Bridge · Ponnani', image: 'https://res.cloudinary.com/vpi7w3h5/image/upload/f_auto,q_auto/v1792580247/tx3ydf2088yqh9es3hxe.jpg' },
  { title: 'Marine Museum · Ponnani', image: 'https://res.cloudinary.com/vpi7w3h5/image/upload/f_auto,q_auto/v1792580251/cfar0ynv0bh5xjsrnxz7.jpg' },
];

function StaggeredTitle({ text, active }) {
  return <span className={`tourism-slider-title${active ? ' is-active' : ''}`} aria-hidden="true">
    {Array.from(text).map((character, index) => <span className="tourism-slider-character" key={`${index}-${character}`}>
      <motion.span className="tourism-slider-old-char" initial={false} animate={{ y: active ? '-110%' : '0%' }} transition={{ delay: index * 0.008, duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}>{character === ' ' ? '\u00a0' : character}</motion.span>
      <motion.span className="tourism-slider-new-char" initial={false} animate={{ y: active ? '0%' : '110%' }} transition={{ delay: index * 0.008, duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}>{character === ' ' ? '\u00a0' : character}</motion.span>
    </span>)}
  </span>;
}

export default function AnimatedTourismSlider() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const activate = (index) => setActiveIndex(index);
  return <MotionConfig reducedMotion="user">
    <div className="tourism-slider">
      <div className="tourism-slider-list" role="list" aria-label="Kerala Tourism destinations">
        {destinations.map((destination, index) => <button
          className={`tourism-slider-item${activeIndex === index ? ' is-active' : ''}`}
          type="button"
          role="listitem"
          key={destination.title}
          onMouseEnter={() => activate(index)}
          onFocus={() => activate(index)}
          onClick={() => activate(index)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown' || event.key === 'ArrowRight') { event.preventDefault(); activate((index + 1) % destinations.length); event.currentTarget.parentElement.children[(index + 1) % destinations.length]?.focus(); }
            if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') { event.preventDefault(); const previous = (index - 1 + destinations.length) % destinations.length; activate(previous); event.currentTarget.parentElement.children[previous]?.focus(); }
          }}
          aria-pressed={activeIndex === index}
        ><span className="tourism-slider-number">0{index + 1}</span><StaggeredTitle text={destination.title} active={activeIndex === index}/><span className="tourism-slider-arrow" aria-hidden="true">↗</span></button>)}
      </div>
      <div className="tourism-slider-image-wrap" aria-hidden="true">
        {destinations.map((destination, index) => <motion.img
          key={destination.title}
          src={destination.image}
          alt=""
          loading={index < 2 ? 'eager' : 'lazy'}
          decoding="async"
          initial={false}
          animate={{ clipPath: activeIndex === index ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' : 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)' }}
          transition={{ ease: [0.33, 1, 0.68, 1], duration: 0.8 }}
        />)}
        <span className="tourism-slider-image-caption">{destinations[activeIndex].title}</span>
      </div>
    </div>
  </MotionConfig>;
}
