// Central image library. Every photo is an Unsplash image (free to use under the Unsplash licence),
// served through their CDN with on-the-fly resizing. Swap an id here and it changes everywhere.
export const img = (id, w = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;

export const photos = {
  // infrastructure
  datacenter: '1558494949-ef010cbdcc31',
  dcEngineer: '1573164713988-8665fc963095',
  patchPanel: '1544197150-b99a580bb7a8',
  rackFiber: '1520869562399-e772f042f422',
  ethernetSwitch: '1591808216268-ce0b82787efe',
  glowCircuit: '1550751827-4bd374c3f58b',
  circuitBoard: '1518770660439-4636190af475',
  pcb: '1517077304055-6e89abbf09b0',
  hardDisk: '1597852074816-d933c7d2b988',
  archive: '1544383835-bda2bc66a55d',
  wiring: '1558346490-a72e53ae2d4f',
  router: '1606904825846-647eb07f5be2',
  hardwareRepair: '1581092918056-0c4c3acd3789',
  electrician: '1621905251189-08b45d6a269e',
  // cloud & abstract
  earthNight: '1451187580459-43490279c0fa',
  cubes: '1639322537228-f710d846310a',
  darkCubes: '1523961131990-5ea7c61b2107',
  networkLines: '1545987796-200677ee1011',
  spheres: '1655720828018-edd2daec9349',
  matrix: '1526374965328-7f61d4dc18c5',
  // security
  padlockKeyboard: '1614064641938-3bbee52942c7',
  neonPadlock: '1614064548237-096f735f344f',
  padlockCard: '1633265486064-086b219458ec',
  phoneLock: '1603899122634-f086ca5f5ddd',
  smartLock: '1558002038-1055907df827',
  hacker: '1510915228340-29c85a43dcfe',
  virus: '1584036561566-baf8f5f1b144',
  cctv: '1557597774-9d273605dfa9',
  // work & people
  laptopPhone: '1563986768609-322da13575f3',
  typing: '1486312338219-ce68d2c6f44d',
  codeScreen: '1488590528505-98d2b5aba04b',
  analytics: '1460925895917-afdab827c52f',
  dashboardLaptop: '1504868584819-f8e8b4b6d7e3',
  lineChart: '1591696205602-2f950c417cb9',
  financeChart: '1618044733300-9472054094ee',
  coins: '1579621970563-ebec7560ff3e',
  monitorDesk: '1614624532983-4ce03382d63d',
  nocDesk: '1580894894513-541e068a3e2b',
  laptopsTopDown: '1519389950473-47ba0277781c',
  tablet: '1573164713714-d95e436ab8d6',
  phoneLaptop: '1423666639041-f56000c27a9a',
  bwLaptop: '1553877522-43269d4ea984',
  laptopDesk: '1499750310107-5fef28a66643',
  womanLaptop: '1515378791036-0648a3ef77b2',
  writing: '1434030216411-0b793f4b4173',
  signing: '1454165804606-c3d57bc86b40',
  contract: '1450101499163-c8848c66ca85',
  blueprint: '1600132806370-bf17e65e942f',
  documentation: '1600267204091-5c1ab8b10c02',
  contactUs: '1596524430615-b46475ddff6e',
  openOffice: '1504384308090-c894fdcc538d',
  officeTeam: '1522071820081-009f0129c71c',
  pairWork: '1531482615713-2afd69097998',
  highFive: '1600880292203-757bb62b4baf',
  teamMonitors: '1551434678-e076c223a692',
  teamMeeting: '1542744173-8e7e53415bb0',
  workshop: '1556761175-5973dc0f32e7',
  helpdesk: '1521737604893-d14cc237f11d',
  whiteboard: '1557804506-669a67965ba0',
  pointingLaptop: '1516321318423-f06f85e504b3',
  event: '1587825140708-dfaf72ae4b04',
  teamLaptop: '1531545514256-b1400bc00f31',
  loftOffice: '1559136555-9303baea8ebd',
  cafeMeeting: '1568992687947-868a62a9f521',
  boardroom: '1573164574572-cb89e39749b4',
  stickyNotes: '1552664730-d307ca884978',
  officeFloor: '1577412647305-991150c7d163',
  officeSpace: '1531973576160-7125cd663d86',
  executive: '1560250097-0b93528c311a',
  // industries
  labMachines: '1581091226825-a6a2a5aee158',
  welding: '1504328345606-18bbc8c9d7d1',
  atm: '1601597111158-2fceff292cdc',
  doctor: '1576091160399-112ba8d25d1d',
  pills: '1587854692152-cbe660dbde88',
  education: '1503676260728-1c00da094a0b',
  retailStore: '1441986300917-64674bd600d8',
  retailPos: '1556742049-0cfed4f6a45d',
  construction: '1541888946425-d81bb19240f5',
  skyscrapers: '1486406146926-c627a92ad1ab',
  resort: '1566073771259-6a8506099945',
  justice: '1589829545856-d10d557cf95f',
};

const P = photos;

const familyMap = {
  cloud: P.earthNight,
  'cyber-security': P.glowCircuit,
  'data-center': P.datacenter,
  'backup-dr': P.hardDisk,
  network: P.patchPanel,
  collaboration: P.boardroom,
  'physical-security': P.cctv,
};

const solutionMap = {
  'microsoft-azure': P.cubes,
  aws: P.teamMonitors,
  'microsoft-365': P.laptopsTopDown,
  'google-cloud': P.spheres,
  'hybrid-cloud': P.darkCubes,
  'cloud-migration': P.networkLines,
  'cloud-cost-optimization': P.coins,
  'virtual-desktop-avd': P.monitorDesk,
  'endpoint-security': P.laptopPhone,
  'email-security': P.phoneLaptop,
  'data-loss-prevention': P.padlockCard,
  'mobile-device-management': P.phoneLock,
  'ssl-vpn': P.padlockKeyboard,
  'web-proxy-filtering': P.typing,
  'firewall-utm': P.ethernetSwitch,
  'xdr-siem-soc': P.hacker,
  'zero-trust': P.neonPadlock,
  'identity-access-management': P.tablet,
  'server-virtualization': P.glowCircuit,
  servers: P.datacenter,
  'san-storage': P.hardDisk,
  'nas-storage': P.archive,
  'hyperconverged-hci': P.rackFiber,
  colocation: P.dcEngineer,
  'veeam-backup': P.pcb,
  'cloud-backup': P.dashboardLaptop,
  'disaster-recovery-draas': P.wiring,
  'ransomware-recovery': P.virus,
  'structured-cabling': P.electrician,
  'switching-routing': P.patchPanel,
  'enterprise-wifi': P.router,
  'sd-wan': P.earthNight,
  'network-monitoring': P.nocDesk,
  'microsoft-teams': P.boardroom,
  'ip-telephony': P.helpdesk,
  'video-conferencing': P.pointingLaptop,
  'ip-cctv': P.cctv,
  'access-control': P.smartLock,
  'attendance-systems': P.openOffice,
};

const serviceMap = {
  'managed-it-services': P.teamMonitors,
  'annual-maintenance-contract': P.hardwareRepair,
  'it-consulting': P.stickyNotes,
  'project-management': P.blueprint,
  '247-noc-helpdesk': P.helpdesk,
  'security-audit-vapt': P.hacker,
  'it-staffing-resident-engineer': P.pairWork,
  'infrastructure-assessment': P.analytics,
  'procurement-licensing': P.signing,
  'relocation-migration': P.officeFloor,
};

const industryMap = {
  manufacturing: P.labMachines,
  bfsi: P.atm,
  'pharma-healthcare': P.doctor,
  education: P.education,
  legal: P.justice,
  'retail-ecommerce': P.retailStore,
  'construction-real-estate': P.construction,
  'hospitality-tourism': P.resort,
  'it-ites': P.officeTeam,
};

const caseMap = {
  'auto-components-dc-refresh': P.welding,
  'nbfc-security-hardening': P.financeChart,
  'pharma-cloud-migration': P.pills,
  'campus-wifi-rollout': P.teamLaptop,
  'retail-multi-store-sdwan': P.retailPos,
  'law-firm-dlp': P.contract,
};

const postMap = {
  'server-amc-7-questions': P.rackFiber,
  'ransomware-recovery-timeline': P.matrix,
  'azure-vs-onprem-tco': P.lineChart,
  'dpdp-act-it-checklist': P.writing,
  'wifi-survey-why-it-matters': P.router,
  'backup-321-rule': P.hardDisk,
};

const toolMap = {
  '/tools/cloud-cost-calculator': P.coins,
  '/tools/security-health-score': P.padlockKeyboard,
  '/tools/amc-plan-selector': P.hardwareRepair,
  '/tools/server-sizing': P.datacenter,
  '/tools/wifi-estimator': P.router,
  '/tools/tco-calculator': P.financeChart,
};

// Hero photo for pages that are not driven by a data slug
const pageMap = {
  '/solutions': P.circuitBoard,
  '/services': P.dcEngineer,
  '/services/plans': P.dashboardLaptop,
  '/industries': P.skyscrapers,
  '/clients': P.cafeMeeting,
  '/case-studies': P.teamMeeting,
  '/partners': P.highFive,
  '/testimonials': P.whiteboard,
  '/about': P.openOffice,
  '/about/leadership': P.executive,
  '/about/story': P.loftOffice,
  '/about/process': P.documentation,
  '/about/certifications': P.signing,
  '/resources': P.laptopDesk,
  '/blog': P.womanLaptop,
  '/resources/whitepapers': P.writing,
  '/resources/glossary': P.bwLaptop,
  '/resources/faq': P.phoneLaptop,
  '/news-events': P.event,
  '/tools': P.analytics,
  '/contact': P.contactUs,
  '/book-assessment': P.workshop,
  '/procurement': P.contract,
  '/careers': P.laptopsTopDown,
  '/status': P.nocDesk,
  '/sitemap': P.officeSpace,
};

// Pain-point / home icons → solution family
export const iconFamily = {
  cloud: 'cloud', shield: 'cyber-security', server: 'data-center', backup: 'backup-dr',
  wifi: 'network', team: 'collaboration', camera: 'physical-security',
};

const pick = (map, key, fallback) => map[key] || fallback;
export const familyImg = (slug, w) => img(pick(familyMap, slug, P.datacenter), w);
export const solutionImg = (slug, w) => img(pick(solutionMap, slug, P.circuitBoard), w);
export const serviceImg = (slug, w) => img(pick(serviceMap, slug, P.teamMonitors), w);
export const industryImg = (slug, w) => img(pick(industryMap, slug, P.skyscrapers), w);
export const caseImg = (slug, w) => img(pick(caseMap, slug, P.teamMeeting), w);
export const postImg = (slug, w) => img(pick(postMap, slug, P.laptopDesk), w);
export const toolImg = (path, w) => img(pick(toolMap, path, P.analytics), w);

/** Picks the hero background for any route. Returns null where no photo hero is wanted. */
export function heroImageFor(pathname) {
  const W = 1920;
  const seg = pathname.split('/').filter(Boolean);
  const [a, b, c] = seg;
  if (!a) return null;
  if (a === 'solutions' && c) return solutionImg(c, W);
  if (a === 'solutions' && b) return familyImg(b, W);
  if (a === 'services' && b && b !== 'plans') return serviceImg(b, W);
  if (a === 'industries' && b) return industryImg(b, W);
  if (a === 'case-studies' && b) return caseImg(b, W);
  if (a === 'blog' && b) return postImg(b, W);
  if (a === 'tools' && b) return toolImg(`/tools/${b}`, W);
  if (a === 'legal') return img(P.contract, W);
  const key = `/${seg.join('/')}`;
  return pageMap[key] ? img(pageMap[key], W) : null;
}
