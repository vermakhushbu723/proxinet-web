import React, { useState } from 'react';

// Simple Icons slugs (https://simpleicons.org) for partners that have one.
const iconSlug = {
  'Dell Technologies': 'dell',
  Fortinet: 'fortinet',
  Veeam: 'veeam',
  VMware: 'vmware',
  Cisco: 'cisco',
  Lenovo: 'lenovo',
  Sonicwall: 'sonicwall',
};

function MicrosoftMark({ size }) {
  const g = size * 0.06;
  const q = (size - g) / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <rect width={q} height={q} fill="#f25022" />
      <rect x={q + g} width={q} height={q} fill="#7fba00" />
      <rect y={q + g} width={q} height={q} fill="#00a4ef" />
      <rect x={q + g} y={q + g} width={q} height={q} fill="#ffb900" />
    </svg>
  );
}

function HpeMark({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2" y="7" width="20" height="10" rx="0.5" fill="none" stroke="#01a982" strokeWidth="2.6" />
    </svg>
  );
}

function LetterMark({ name, color, size }) {
  const letters = name === 'AWS' ? 'aws' : name.slice(0, 1);
  return (
    <span
      aria-hidden="true"
      className="grid shrink-0 place-items-center rounded-md font-display font-bold leading-none text-white"
      style={{ width: size, height: size, background: color, fontSize: letters.length > 1 ? size * 0.36 : size * 0.55 }}
    >
      {letters}
    </span>
  );
}

/** Brand mark for a technology partner — falls back to a coloured letter badge. */
export default function PartnerLogo({ partner, size = 22 }) {
  const [failed, setFailed] = useState(false);
  const { name, color } = partner;

  if (name === 'Microsoft') return <MicrosoftMark size={size} />;
  if (name === 'HPE') return <HpeMark size={size} />;

  const slug = iconSlug[name];
  if (slug && !failed) {
    return (
      <img
        src={`https://cdn.simpleicons.org/${slug}/${color.replace('#', '')}`}
        alt="" aria-hidden="true" width={size} height={size} loading="lazy"
        onError={() => setFailed(true)}
        className="shrink-0 object-contain" style={{ width: size, height: size }}
      />
    );
  }
  return <LetterMark name={name} color={color} size={size} />;
}
