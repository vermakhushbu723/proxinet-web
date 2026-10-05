// Technology alliances shown in the Home marquee and on /partners.
import Picture01 from '../assets/picture_01.png';
import Picture02 from '../assets/picture_02.png';
import Picture03 from '../assets/picture_03.png';
import Picture04 from '../assets/picture_04.png';
import Picture06 from '../assets/picture_06.png';
import Picture08 from '../assets/picture_08.png';
import Picture12 from '../assets/picture_12.png';
import Picture13 from '../assets/picture_13.png';
import Picture14 from '../assets/picture_14.png';
import Picture16 from '../assets/picture_16.png';
import Picture17 from '../assets/picture_17.png';
import Picture19 from '../assets/picture_19.jpeg';
import Picture21 from '../assets/picture_21.png';
import Unnamed1 from '../assets/unnamed (1).png';
import Unnamed2 from '../assets/unnamed (2).png';
import Unnamed3 from '../assets/unnamed (3).png';
import Unnamed4 from '../assets/unnamed (4).png';
import Unnamed5 from '../assets/unnamed (5).png';
import Unnamed6 from '../assets/unnamed (6).png';
import Unnamed7 from '../assets/unnamed (7).png';
import Unnamed from '../assets/unnamed.png';

export const alliances = [
  { name: 'Accops', logo: Picture01, cat: 'Virtual Workspace & VDI', desc: 'Secure digital workspace, VDI and zero-trust remote access for distributed teams.', offer: ['Virtual desktop infrastructure', 'Secure remote access gateway', 'Multi-factor authentication'] },
  { name: 'Microsoft', logo: Picture02, cat: 'Cloud & Productivity', desc: 'Microsoft 365, Azure and identity services — licensing, migration and ongoing management.', offer: ['Microsoft 365 & Exchange Online', 'Azure infrastructure & backup', 'Entra ID & Intune'] },
  { name: 'Veeam', logo: Picture03, cat: 'Backup & DR', desc: 'Image-level backup, replication and verified recovery for physical, virtual and cloud workloads.', offer: ['Backup & Replication', 'Immutable backup repositories', 'Automated restore testing'] },
  { name: 'Acronis', logo: Picture04, cat: 'Cyber Protection', desc: 'Integrated backup, disaster recovery and anti-ransomware protection in a single agent.', offer: ['Cyber Protect suite', 'Cloud backup & DR', 'Anti-ransomware'] },
  { name: 'Trend Micro', logo: Picture06, cat: 'Endpoint & Server Security', desc: 'Layered protection for endpoints, servers, email and hybrid cloud workloads.', offer: ['Endpoint protection & EDR', 'Server & workload security', 'Email security'] },
  { name: 'Red Hat', logo: Picture08, cat: 'Enterprise Linux', desc: 'Red Hat Enterprise Linux subscriptions, deployment and support for business-critical servers.', offer: ['RHEL subscriptions', 'Server build & hardening', 'Patch & lifecycle management'] },
  { name: 'Aruba Networks', logo: Picture12, cat: 'Wireless & Switching', desc: 'Enterprise Wi-Fi, campus switching and centralised network management.', offer: ['Wi-Fi 6 access points', 'Campus switching', 'Cloud-managed networking'] },
  { name: 'Lenovo', logo: Picture13, cat: 'Compute', desc: 'Desktops, laptops, workstations and ThinkSystem servers for every workload.', offer: ['ThinkPad & ThinkCentre', 'ThinkSystem servers', 'Warranty & lifecycle services'] },
  { name: 'Cisco', logo: Picture14, cat: 'Networking', desc: 'Routing, switching, security and collaboration for branch and data-center networks.', offer: ['Routing & switching', 'Meraki cloud networking', 'Network security'] },
  { name: 'ManageEngine', logo: Picture16, cat: 'IT Management', desc: 'IT service desk, endpoint management and network monitoring tools.', offer: ['ServiceDesk Plus', 'Endpoint Central', 'OpManager monitoring'] },
  { name: 'Time Champ', logo: Picture17, cat: 'Workforce Analytics', desc: 'Employee productivity tracking, attendance and workforce analytics.', offer: ['Productivity monitoring', 'Attendance & time tracking', 'Activity reports'] },
  { name: 'HPE', logo: Picture19, cat: 'Server & Storage', desc: 'ProLiant servers, storage arrays and hybrid infrastructure from Hewlett Packard Enterprise.', offer: ['ProLiant servers', 'Storage arrays', 'HPE GreenLake'] },
  { name: 'RSA SecurID', logo: Picture21, cat: 'Identity & Access', desc: 'Strong authentication and identity assurance for users, apps and remote access.', offer: ['Multi-factor authentication', 'Hardware & software tokens', 'Identity governance'] },
  { name: 'eScan', logo: Unnamed1, cat: 'Endpoint Security', desc: 'Antivirus and endpoint security with centralised management for business networks.', offer: ['Endpoint antivirus', 'Central management console', 'Device & web control'] },
  { name: 'SUSE', logo: Unnamed2, cat: 'Enterprise Linux', desc: 'SUSE Linux Enterprise Server and open-source infrastructure for SAP and critical workloads.', offer: ['SUSE Linux Enterprise', 'SAP-ready platforms', 'Support subscriptions'] },
  { name: 'Claude by Anthropic', logo: Unnamed3, cat: 'AI Assistant', desc: 'Claude AI for business — writing, analysis, coding and workflow automation for your teams.', offer: ['Claude for teams & enterprise', 'AI adoption & enablement', 'Workflow automation'] },
  { name: 'Dell Technologies', logo: Unnamed4, cat: 'Server & Storage', desc: 'PowerEdge servers, storage, laptops and desktops with enterprise support.', offer: ['PowerEdge servers', 'Storage solutions', 'Latitude & OptiPlex'] },
  { name: 'Ruckus Networks', logo: Unnamed5, cat: 'Wireless Networking', desc: 'High-density Wi-Fi and switching for campuses, hospitality and large venues.', offer: ['High-density Wi-Fi', 'ICX switching', 'Cloud network management'] },
  { name: 'Arcserve', logo: Unnamed6, cat: 'Backup & Recovery', desc: 'Unified data protection, backup appliances and business continuity.', offer: ['Unified Data Protection', 'Backup appliances', 'Cloud DR'] },
  { name: 'Sophos', logo: Unnamed7, cat: 'Network & Endpoint Security', desc: 'Firewalls, endpoint protection and managed detection and response.', offer: ['XGS firewalls', 'Intercept X endpoint', 'Managed detection & response'] },
  { name: 'Proxmox', logo: Unnamed, cat: 'Virtualization', desc: 'Open-source virtualization platform for VMs, containers and backup.', offer: ['Proxmox VE clusters', 'Proxmox Backup Server', 'VMware migration'] },
];
