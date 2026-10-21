import React from 'react';
import { LogoLoop } from './LogoLoop.tsx';
import { useSiteContent } from '../firebase/SiteContentContext.jsx';
import './ClientLogos.css';

export function ClientLogoSection() {
  const { clients } = useSiteContent();
  const logos = clients.map((client) => client.logoPath
    ? { src: client.logoPath, alt: client.name, title: client.name, height: 56 }
    : { node: <span className="client-logo-wordmark">{client.name}</span>, title: client.name, ariaLabel: client.name });
  return (
    <section className="client-logos section-pad" aria-labelledby="our-clients-title">
      <div className="client-logos-heading">
        <span className="eyebrow"><span className="eyebrow-dot"/> Trusted partnerships</span>
        <h2 id="our-clients-title">Our <em>Clients</em></h2>
        <p>Organizations we are proud to have worked with.</p>
      </div>
      <div className="client-logos-track">
        <LogoLoop logos={logos} speed={60} direction="left" logoHeight={56} gap={112} hoverSpeed={0} fadeOut fadeOutColor="#efe4d6" ariaLabel="Our clients"/>
      </div>
    </section>
  );
}
