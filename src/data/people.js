// Placeholder profiles — replace with real names, photos and LinkedIn links.
export const leadership = [
  { name: 'Managing Director', role: 'Founder & MD', exp: '20+ yrs', focus: 'Strategy, key accounts and OEM alliances', initials: 'MD' },
  { name: 'Technical Director', role: 'Head of Solutions', exp: '16+ yrs', focus: 'Architecture, data center and virtualization', initials: 'TD' },
  { name: 'Head of Security', role: 'Security Practice Lead', exp: '12+ yrs', focus: 'Endpoint and network security, VAPT and compliance', initials: 'HS' },
  { name: 'Head of Cloud', role: 'Cloud Practice Lead', exp: '11+ yrs', focus: 'Azure, AWS, M365 and migration programmes', initials: 'HC' },
  { name: 'Service Delivery Manager', role: 'SDM — Managed Services', exp: '10+ yrs', focus: 'SLA governance, NOC and escalations', initials: 'SD' },
  { name: 'Head of Projects', role: 'PMO Lead', exp: '9+ yrs', focus: 'Project delivery, timelines and documentation', initials: 'HP' },
];

export const milestones = [
  { year: '2010', title: 'Company founded', desc: 'Started in Noida with hardware supply and onsite support for SME clients.' },
  { year: '2013', title: 'Managed services launched', desc: 'Our first structured AMC framework and helpdesk process.' },
  { year: '2016', title: 'Data center practice', desc: 'Virtualization and SAN/NAS projects, including our first 100+ VM deployment.' },
  { year: '2018', title: 'Security practice', desc: 'Endpoint, firewall and email security established as a dedicated practice.' },
  { year: '2020', title: 'Cloud & remote work', desc: 'Remote access and Microsoft 365 rollouts for 40+ clients during lockdown.' },
  { year: '2022', title: 'Delhi registered office', desc: 'The New Ashok Nagar office opened, expanding NCR coverage.' },
  { year: '2024', title: '24x7 NOC', desc: 'Round-the-clock monitoring and SLA-backed support tiers.' },
  { year: '2026', title: 'Client portal & automation', desc: 'Self-service portal, SLA dashboards and proactive alerting.' },
];

export const jobs = [
  { slug: 'system-engineer-l2', title: 'System Engineer (L2)', dept: 'Service Delivery', loc: 'Noida', type: 'Full-time', exp: '3–5 years',
    skills: ['Windows Server', 'VMware / Hyper-V', 'Active Directory', 'Backup tools'],
    desc: 'L2 support across client environments, handling escalations and preventive maintenance visits.' },
  { slug: 'network-engineer', title: 'Network Engineer', dept: 'Network Practice', loc: 'Noida', type: 'Full-time', exp: '2–4 years',
    skills: ['Switching & routing', 'Firewall (Fortinet/Sophos)', 'Wi-Fi controllers', 'Troubleshooting'],
    desc: 'LAN and WAN deployment, firewall configuration and enterprise Wi-Fi rollouts.' },
  { slug: 'cloud-engineer-azure', title: 'Cloud Engineer — Azure', dept: 'Cloud Practice', loc: 'Noida / Hybrid', type: 'Full-time', exp: '3–6 years',
    skills: ['Azure IaaS/PaaS', 'M365 administration', 'Entra ID', 'PowerShell'],
    desc: 'Azure landing zones, migrations and Microsoft 365 tenant management.' },
  { slug: 'security-analyst', title: 'Security Analyst', dept: 'Security Practice', loc: 'Noida', type: 'Full-time', exp: '2–4 years',
    skills: ['EDR/XDR consoles', 'SIEM basics', 'VAPT tools', 'Incident response'],
    desc: 'Security monitoring, alert triage and client security posture reporting.' },
  { slug: 'inside-sales-executive', title: 'Inside Sales Executive', dept: 'Sales', loc: 'Noida', type: 'Full-time', exp: '1–3 years',
    skills: ['B2B lead qualification', 'CRM hygiene', 'Proposal coordination'],
    desc: 'Qualifying inbound leads, scheduling meetings and maintaining the pipeline.' },
  { slug: 'field-support-engineer', title: 'Field Support Engineer (L1)', dept: 'Service Delivery', loc: 'Delhi NCR', type: 'Full-time', exp: '0–2 years',
    skills: ['Desktop/laptop support', 'Printer & peripherals', 'Basic networking', 'Ticketing tools'],
    desc: 'Onsite L1 support and installation assistance at client sites.' },
];

export const findJob = (slug) => jobs.find((j) => j.slug === slug);
