import React, { useEffect, useRef, useState, createContext, useContext } from 'react';
import { motion, useInView, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRightOutlined } from '@ant-design/icons';

/* ------------------------------------------------------------------ *
 *  Theme context (light / dark)
 * ------------------------------------------------------------------ */
export const ThemeCtx = createContext({ dark: false, toggle: () => {} });
export const useTheme = () => useContext(ThemeCtx);

/* ------------------------------------------------------------------ *
 *  Reveal — scroll-triggered entrance from a VISIBLE resting state
 *  (renders fully opaque when reduced-motion is on)
 * ------------------------------------------------------------------ */
export function Reveal({ children, delay = 0, y = 18, className = '', as: Tag = 'div' }) {
  const reduce = useReducedMotion();
  const MotionTag = motion[Tag] || motion.div;
  if (reduce) return <Tag className={className}>{children}</Tag>;
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}

/* Stagger container for lists */
export function Stagger({ children, className = '', gap = 0.07 }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </motion.div>
  );
}
export const StaggerItem = ({ children, className = '' }) => {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

/* ------------------------------------------------------------------ *
 *  Counter — number roll-up on first view
 * ------------------------------------------------------------------ */
export function Counter({ to, suffix = '', decimals = 0, duration = 1.6 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduce = useReducedMotion();
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: duration * 1000, bounce: 0 });
  const [val, setVal] = useState(reduce ? to : 0);

  useEffect(() => {
    if (inView && !reduce) mv.set(to);
  }, [inView, to, mv, reduce]);
  useEffect(() => spring.on('change', (v) => setVal(v)), [spring]);

  return (
    <span ref={ref} className="tabular-nums">
      {Number(val).toFixed(decimals)}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 *  Section heading
 * ------------------------------------------------------------------ */
export function SectionHead({ eyebrow, title, sub, center = false, className = '' }) {
  return (
    <Reveal className={`${center ? 'mx-auto text-center' : ''} max-w-3xl ${className}`}>
      {eyebrow && (
        <div className={`px-eyebrow mb-3 ${center ? 'justify-center' : ''}`}>
          <span className="inline-block h-px w-6 bg-brand-400" />
          {eyebrow}
        </div>
      )}
      <h2 className="px-h2 text-slate-900 dark:text-white">{title}</h2>
      {sub && <p className="px-lead mt-4">{sub}</p>}
    </Reveal>
  );
}

/* ------------------------------------------------------------------ *
 *  Arrow link
 * ------------------------------------------------------------------ */
export function ArrowLink({ to, children, className = '' }) {
  return (
    <Link
      to={to}
      className={`group inline-flex items-center gap-2 font-semibold text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200 ${className}`}
    >
      {children}
      <ArrowRightOutlined className="text-xs transition-transform duration-300 group-hover:translate-x-1" />
    </Link>
  );
}

/* ------------------------------------------------------------------ *
 *  Decorative glow background
 * ------------------------------------------------------------------ */
export function Glow({ className = '', color = 'rgba(214,43,31,.35)', size = 420 }) {
  return (
    <span
      aria-hidden="true"
      className={`px-orb ${className}`}
      style={{ width: size, height: size, background: color }}
    />
  );
}

/* ------------------------------------------------------------------ *
 *  Animated network SVG (hero decoration) — subject-specific
 * ------------------------------------------------------------------ */
export function NetworkGraphic({ className = '' }) {
  const reduce = useReducedMotion();
  const nodes = [
    { x: 150, y: 40, r: 7, label: 'cloud' },
    { x: 60, y: 120, r: 5 },
    { x: 245, y: 118, r: 5 },
    { x: 150, y: 150, r: 10, label: 'core' },
    { x: 40, y: 225, r: 5 },
    { x: 150, y: 250, r: 5 },
    { x: 262, y: 228, r: 5 },
  ];
  const links = [[0, 3], [1, 3], [2, 3], [3, 4], [3, 5], [3, 6], [1, 4], [2, 6]];
  return (
    <svg viewBox="0 0 300 290" className={className} role="img" aria-label="Network topology illustration">
      <defs>
        <linearGradient id="pxLink" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d62b1f" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#e8763f" stopOpacity="0.65" />
        </linearGradient>
        <radialGradient id="pxNode">
          <stop offset="0%" stopColor="#e56458" />
          <stop offset="100%" stopColor="#b81f16" />
        </radialGradient>
      </defs>
      {links.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
          stroke="url(#pxLink)" strokeWidth="1.5" strokeDasharray="5 7"
          style={reduce ? undefined : { animation: `pxdash 3.4s linear ${i * 0.25}s infinite` }}
        />
      ))}
      {nodes.map((n, i) => (
        <g key={i}>
          {n.label && !reduce && (
            <circle cx={n.x} cy={n.y} r={n.r} fill="#d62b1f" opacity="0.25"
              style={{ transformOrigin: `${n.x}px ${n.y}px`, animation: `pxping 2.6s ease-out ${i * 0.4}s infinite` }} />
          )}
          <circle cx={n.x} cy={n.y} r={n.r} fill="url(#pxNode)" />
        </g>
      ))}
      <style>{`
        @keyframes pxdash { to { stroke-dashoffset: -48; } }
        @keyframes pxping { 0% { transform: scale(1); opacity:.35 } 70%,100% { transform: scale(2.6); opacity:0 } }
      `}</style>
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 *  Simple icon badge
 * ------------------------------------------------------------------ */
export function IconBadge({ children, size = 'md', tone = 'brand' }) {
  const sizes = { sm: 'h-9 w-9 text-base', md: 'h-12 w-12 text-xl', lg: 'h-14 w-14 text-2xl' };
  const tones = {
    brand: 'bg-brand-50 text-brand-600 ring-brand-100 dark:bg-brand-500/12 dark:text-brand-300 dark:ring-brand-500/20',
    ok: 'bg-emerald-50 text-emerald-600 ring-emerald-100 dark:bg-emerald-500/12 dark:text-emerald-300 dark:ring-emerald-500/20',
    warn: 'bg-amber-50 text-amber-600 ring-amber-100 dark:bg-amber-500/12 dark:text-amber-300 dark:ring-amber-500/20',
  };
  return (
    <span className={`inline-grid place-items-center rounded-xl ring-1 ${sizes[size]} ${tones[tone]}`}>
      {children}
    </span>
  );
}
