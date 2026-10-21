import React from 'react';
import { LogoLoop } from './LogoLoop.tsx';
import './ClientLogos.css';

const CLIENT_LOGOS = [
  { src: '/photos/client-logos/client-01.webp', alt: 'Sree Gokulam Group', title: 'Sree Gokulam Group', height: 56 },
  { src: '/photos/client-logos/client-02.webp', alt: 'Bhima Jewellers', title: 'Bhima Jewellers', height: 56 },
  { src: '/photos/client-logos/client-03.png', alt: 'Wonderla', title: 'Wonderla', height: 56 },
  { src: '/photos/client-logos/client-04.webp', alt: 'Lulu Group', title: 'Lulu Group', height: 56 },
  { src: '/photos/client-logos/client-05.webp', alt: 'Kalyan Silks', title: 'Kalyan Silks', height: 56 },
  { src: '/photos/client-logos/client-06.webp', alt: 'Kairali', title: 'Kairali', height: 56 },
];

export function ClientLogoSection() {
  return (
    <section className="client-logos section-pad" aria-labelledby="our-clients-title">
      <div className="client-logos-heading">
        <span className="eyebrow"><span className="eyebrow-dot"/> Trusted partnerships</span>
        <h2 id="our-clients-title">Our <em>Clients</em></h2>
        <p>Organizations we are proud to have worked with.</p>
      </div>
      <div className="client-logos-track">
        <LogoLoop logos={CLIENT_LOGOS} speed={60} direction="left" logoHeight={56} gap={112} hoverSpeed={0} fadeOut fadeOutColor="#efe4d6" ariaLabel="Our clients"/>
      </div>
    </section>
  );
}
