export const company = {
  name: 'ProXinet Technologies Pvt. Ltd.',
  short: 'ProXinet',
  tagline: 'Design. Deploy. Manage.',
  promise:
    'End-to-end IT infrastructure for Delhi NCR businesses — designed, deployed and managed 24/7.',
  email: 'info@proxinet.in',
  phones: ['9555581330', '9971120195'],
  whatsapp: '919555581330',
  offices: [
    { label: 'Corporate Office', line: 'D-13, Ground Floor, Sector-3, Gautam Buddha Nagar, Noida, UP - 201301', city: 'Noida' },
    { label: 'Registered Office', line: 'B-1249, Ground Floor, New Ashok Nagar, Near Metro Station, New Delhi - 110096', city: 'New Delhi' },
  ],
  social: { linkedin: '#', facebook: '#', twitter: '#', instagram: '#' },
};

export const stats = [
  { value: 15, suffix: '+', label: 'Years in business', hint: 'IT infrastructure delivery' },
  { value: 200, suffix: '+', label: 'Clients served', hint: 'across 9 industries' },
  { value: 5000, suffix: '+', label: 'Endpoints managed', hint: 'under active AMC' },
  { value: 99.9, suffix: '%', label: 'SLA uptime', hint: 'managed infrastructure', decimals: 1 },
  { value: 24, suffix: '×7', label: 'NOC & helpdesk', hint: 'always-on support' },
];

export const painPoints = [
  { icon: 'server', title: 'Ageing servers', desc: 'Hardware past end-of-life, warranty expired, performance declining.', to: '/solutions/data-center/servers' },
  { icon: 'shield', title: 'Ransomware exposure', desc: 'Endpoint and email protection is thin or outdated.', to: '/solutions/cyber-security/endpoint-security' },
  { icon: 'cloud', title: 'Move to the cloud', desc: 'You need a realistic Azure or AWS migration roadmap.', to: '/solutions/cloud/cloud-migration' },
  { icon: 'backup', title: 'Backups you cannot trust', desc: 'Restores have never been tested. RPO and RTO undefined.', to: '/solutions/backup-dr/veeam-backup' },
  { icon: 'wifi', title: 'Unreliable Wi-Fi', desc: 'Dead zones, dropped sessions and an unmanaged guest network.', to: '/solutions/network/enterprise-wifi' },
  { icon: 'team', title: 'A small IT team', desc: 'Limited in-house bandwidth — you need managed services.', to: '/services/managed-it-services' },
];

export const processSteps = [
  { n: '01', title: 'Assess', desc: 'A full infrastructure audit — inventory, gaps, risks and a written findings report.', out: 'Assessment report' },
  { n: '02', title: 'Design', desc: 'Reference architecture, bill of materials, sizing and a commercial proposal with options.', out: 'Solution design + BOQ' },
  { n: '03', title: 'Deploy', desc: 'Phased implementation, planned migration windows, UAT and documented handover.', out: 'Go-live + as-built docs' },
  { n: '04', title: 'Manage', desc: '24/7 monitoring, SLA-backed support, patching and a quarterly review.', out: 'Monthly SLA report' },
];

export const values = [
  { title: 'Operational excellence', desc: 'ITIL-aligned processes, standardised delivery and measurable SLAs.' },
  { title: 'Customer focus', desc: 'A named engineer on every account and a published escalation matrix.' },
  { title: 'Information security', desc: 'Data confidentiality, regulatory compliance and perimeter-to-endpoint protection.' },
  { title: 'People development', desc: 'Certified engineers, continuous OEM training and ethical practices.' },
  { title: 'Sustainability', desc: 'Energy-efficient design and carbon footprint reduction on every data center project.' },
];
