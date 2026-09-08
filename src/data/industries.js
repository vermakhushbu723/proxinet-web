export const industries = [
  {
    slug: 'manufacturing', name: 'Manufacturing', icon: 'tool',
    blurb: 'From the plant floor to the corporate office — a network that covers both OT and IT.',
    challenges: ['Shop-floor and office networks are not segregated', 'SCADA and MES systems run on unsupported operating systems', 'Plant downtime translates directly into production loss'],
    compliance: ['ISO 27001', 'IEC 62443 (OT security)', 'DPDP Act 2023'],
    fits: ['network', 'cyber-security', 'backup-dr'],
  },
  {
    slug: 'bfsi', name: 'BFSI', icon: 'bank',
    blurb: 'Banking, NBFC and insurance — regulated, audited and always on.',
    challenges: ['RBI cyber security framework compliance', 'Audit trail and log retention obligations', 'Branch connectivity uptime'],
    compliance: ['RBI Cyber Security Framework', 'ISO 27001', 'PCI-DSS', 'DPDP Act 2023'],
    fits: ['cyber-security', 'backup-dr', 'data-center'],
  },
  {
    slug: 'pharma-healthcare', name: 'Pharma & Healthcare', icon: 'medicine',
    blurb: 'GxP-validated environments and patient data protection.',
    challenges: ['Patching restrictions inside validated systems', 'Strict data integrity requirements', 'Long-term record retention'],
    compliance: ['21 CFR Part 11', 'GxP / GAMP 5', 'ISO 27001', 'DPDP Act 2023'],
    fits: ['backup-dr', 'cyber-security', 'data-center'],
  },
  {
    slug: 'education', name: 'Education', icon: 'read',
    blurb: 'Campus Wi-Fi, computer labs and digital classrooms.',
    challenges: ['High-density Wi-Fi across classrooms and hostels', 'Content filtering for students', 'Limited IT budget and staff'],
    compliance: ['Content filtering norms', 'DPDP Act 2023 (minors data)', 'Accessibility standards'],
    fits: ['network', 'cyber-security', 'cloud'],
  },
  {
    slug: 'legal', name: 'Legal', icon: 'audit',
    blurb: 'Confidentiality-first IT — the digital equivalent of client privilege.',
    challenges: ['Document confidentiality and access control', 'Secure collaboration with external parties', 'Long retention with fast retrieval'],
    compliance: ['Client confidentiality obligations', 'DPDP Act 2023', 'ISO 27001'],
    fits: ['cyber-security', 'backup-dr', 'cloud'],
  },
  {
    slug: 'retail-ecommerce', name: 'Retail & E-commerce', icon: 'shop',
    blurb: 'Multi-store connectivity, POS uptime and payment security.',
    challenges: ['Store network reliability', 'POS and payment data security', 'Scaling for seasonal traffic'],
    compliance: ['PCI-DSS', 'DPDP Act 2023'],
    fits: ['network', 'cloud', 'cyber-security'],
  },
  {
    slug: 'construction-real-estate', name: 'Construction & Real Estate', icon: 'build',
    blurb: 'Site offices, temporary connectivity and project data.',
    challenges: ['Connectivity at remote sites', 'Device management for a mobile workforce', 'Collaboration on large CAD and BIM files'],
    compliance: ['Project data retention', 'DPDP Act 2023'],
    fits: ['network', 'cloud', 'collaboration'],
  },
  {
    slug: 'hospitality-tourism', name: 'Hospitality & Tourism', icon: 'coffee',
    blurb: 'Guest Wi-Fi, PMS integration and round-the-clock uptime.',
    challenges: ['Guest Wi-Fi quality drives review scores', 'PMS and POS integration', 'Seasonal staffing and high turnover'],
    compliance: ['Guest data privacy', 'DPDP Act 2023', 'PCI-DSS'],
    fits: ['network', 'physical-security', 'cyber-security'],
  },
  {
    slug: 'it-ites', name: 'IT & ITES', icon: 'code',
    blurb: 'Scalable seats, client compliance audits and business continuity.',
    challenges: ['Client-mandated security audits', 'Rapid seat scaling', 'BCP and work-from-anywhere readiness'],
    compliance: ['ISO 27001', 'SOC 2 readiness', 'Client-specific controls'],
    fits: ['cloud', 'cyber-security', 'collaboration'],
  },
];

export const findIndustry = (slug) => industries.find((i) => i.slug === slug);
