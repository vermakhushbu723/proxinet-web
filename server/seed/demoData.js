// Demo records for the admin panel (loaded by `npm run seed` or Settings → Reset demo data).
// Dates are generated relative to "now" so the dashboard always looks current.

const ago = (days, hours = 0, minutes = 0) =>
  new Date(Date.now() - ((days * 24 + hours) * 60 + minutes) * 60000).toISOString();
const ahead = (days) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);

const base = (id, createdAt, status, read, source, extra = {}) =>
  ({ id, createdAt, status, read, notes: [], source, ...extra });

export function seedData() {
  const leads = [
    base('LD-1041', ago(0, 1, 12), 'New', false, '/', { intent: 'Cyber security', size: '101–300 users', timeline: 'Immediately', name: 'Rohit Malhotra', company: 'Kaveri Auto Parts', email: 'rohit.m@kaveriauto.in', phone: '9811023456', message: 'Had a phishing incident last week. Need EDR + email security quote.' }),
    base('LD-1040', ago(0, 4, 40), 'New', false, '/contact', { intent: 'Managed IT / AMC', size: '26–100 users', timeline: 'Within 1 month', name: 'Sneha Kapoor', company: 'Lotus Diagnostics', email: 'sneha@lotusdiag.com', phone: '9899012345', message: '' }),
    base('LD-1039', ago(1, 2), 'Contacted', true, '/', { intent: 'Cloud migration', size: '101–300 users', timeline: '1–3 months', name: 'Amit Verma', company: 'Greenfield Pharma', email: 'amit.verma@greenfieldpharma.in', phone: '9717788990', message: 'Evaluating Azure for ERP + file servers.' }),
    base('LD-1038', ago(2, 6), 'Qualified', true, '/contact', { intent: 'Backup & DR', size: '300+ users', timeline: 'Within 1 month', name: 'Neha Bansal', company: 'Sunrise Housing Finance', email: 'neha.b@sunrisehf.in', phone: '9810456789', message: 'RBI audit flagged our DR. Need a DR site with tested RTO.' }),
    base('LD-1037', ago(3, 3), 'Proposal', true, '/', { intent: 'Network / Wi-Fi', size: '300+ users', timeline: '1–3 months', name: 'Prof. S. K. Jain', company: 'Amity Engineering College', email: 'skjain@aec.edu.in', phone: '9876501234', message: 'Campus Wi-Fi for 3 hostels.' }),
    base('LD-1036', ago(5, 1), 'Won', true, '/contact', { intent: 'Data center refresh', size: '101–300 users', timeline: 'Immediately', name: 'Vikas Gupta', company: 'Precision Tools Pvt Ltd', email: 'vikas@precisiontools.co.in', phone: '9958123456', message: '' }),
    base('LD-1035', ago(7, 5), 'Lost', true, '/', { intent: 'Something else', size: '1–25 users', timeline: 'Just exploring', name: 'Karan Mehta', company: 'Mehta & Associates', email: 'karan@mehtaassociates.in', phone: '9811987654', message: 'Just exploring options for a small office.' }),
    base('LD-1034', ago(9, 2), 'Contacted', true, '/contact', { intent: 'Cyber security', size: '26–100 users', timeline: '1–3 months', name: 'Pooja Sharma', company: 'Arora Law Chambers', email: 'pooja@arorachambers.in', phone: '9899776655', message: 'Need DLP for client files.' }),
    base('LD-1033', ago(12, 4), 'Qualified', true, '/', { intent: 'Managed IT / AMC', size: '101–300 users', timeline: 'Within 1 month', name: 'Harpreet Singh', company: 'Royal Orchid Hotels NCR', email: 'harpreet@royalorchidncr.com', phone: '9810011223', message: '' }),
    base('LD-1032', ago(16, 3), 'Won', true, '/contact', { intent: 'Cloud migration', size: '26–100 users', timeline: 'Immediately', name: 'Ananya Iyer', company: 'Finedge Fintech', email: 'ananya@finedge.io', phone: '9717001122', message: 'AWS to Azure consolidation.' }),
    base('LD-1031', ago(21, 6), 'Lost', true, '/', { intent: 'Network / Wi-Fi', size: '26–100 users', timeline: 'Just exploring', name: 'Deepak Chauhan', company: 'Chauhan Textiles', email: 'deepak@chauhantex.in', phone: '9811334455', message: '' }),
    base('LD-1030', ago(26, 2), 'Won', true, '/contact', { intent: 'Backup & DR', size: '101–300 users', timeline: 'Within 1 month', name: 'Meera Nair', company: 'Infra Projects Ltd.', email: 'meera.nair@infraprojects.in', phone: '9899445566', message: '' }),
  ];
  leads[3].notes = [{ text: 'Call done — sending DR proposal by Friday.', by: 'Admin', at: ago(1, 20) }];

  const assessments = [
    base('AS-2210', ago(0, 2, 5), 'Requested', false, '/book-assessment', { name: 'Rajesh Khanna', company: 'Metro Retail Chain', email: 'rajesh@metroretail.in', phone: '9810998877', focus: 'Network & Wi-Fi', date: ahead(2), time: '11:00', mode: 'video', context: '38 stores, SD-WAN interest.' }),
    base('AS-2209', ago(1, 5), 'Confirmed', true, '/book-assessment', { name: 'Dr. Kavita Rao', company: 'Speciality Clinic Group', email: 'kavita@scgroup.in', phone: '9899112233', focus: 'Security posture', date: ahead(1), time: '15:30', mode: 'onsite', context: '' }),
    base('AS-2208', ago(2, 1), 'Confirmed', true, '/book-assessment', { name: 'Sanjay Arora', company: 'Housing Finance Co.', email: 'sanjay@hfc.in', phone: '9717223344', focus: 'Backup & DR readiness', date: ahead(4), time: '10:00', mode: 'video', context: 'Audit next month.' }),
    base('AS-2207', ago(6, 3), 'Completed', true, '/book-assessment', { name: 'Ritu Saxena', company: 'BPO Services Ltd', email: 'ritu@bposervices.in', phone: '9811556677', focus: 'Cloud readiness', date: ahead(-3), time: '12:00', mode: 'video', context: '' }),
    base('AS-2206', ago(11, 2), 'Cancelled', true, '/book-assessment', { name: 'Manish Tiwari', company: 'Tiwari Logistics', email: 'manish@tiwarilogistics.in', phone: '9899334455', focus: 'Full infrastructure review', date: ahead(-8), time: '16:00', mode: 'onsite', context: '' }),
  ];

  const tickets = [
    base('TK-4822', ago(0, 0, 35), 'Open', false, '/portal/dashboard', { client: 'Auto Components Mfg.', subject: 'Printer queue stuck on 2nd floor', pri: 'P3', cat: 'Endpoint', desc: 'All jobs stuck since morning, restarted spooler once.' }),
    base('TK-4818', ago(0, 3), 'In progress', true, '/portal/dashboard', { client: 'Auto Components Mfg.', subject: 'Branch VPN drops every 40 minutes', pri: 'P1', cat: 'Network', desc: 'Plant 2 VPN tunnel flaps. Production MES affected.' }),
    base('TK-4815', ago(1, 2), 'In progress', true, '/portal/dashboard', { client: 'NBFC Group', subject: 'Exchange Online mail delay for finance team', pri: 'P2', cat: 'Cloud / M365', desc: 'Delays of 20–30 minutes on external mail.' }),
    base('TK-4809', ago(4, 1), 'Resolved', true, '/portal/dashboard', { client: 'Pharma Labs', subject: 'Backup job failed on FILESRV02', pri: 'P2', cat: 'Backup', desc: 'Veeam job failed with VSS error.' }),
    base('TK-4801', ago(6, 4), 'Closed', true, '/portal/dashboard', { client: 'Auto Components Mfg.', subject: 'Add 12 users to Intune compliance policy', pri: 'P4', cat: 'Endpoint', desc: 'New joiners in the sales team need the standard compliance policy and MFA.' }),
  ];

  const chat = (id, when, status, read, msgs) => base(id, when, status, read, '/', {
    updatedAt: when, firstMessage: msgs[0][1],
    messages: msgs.map(([from, text], i) => ({ from, text, at: new Date(new Date(when).getTime() + i * 30000).toISOString() })),
  });
  const chats = [
    chat('CH-0932', ago(0, 1, 50), 'Open', false, [
      ['me', 'What does a server AMC cost?'],
      ['bot', 'AMC comes in three tiers — Bronze at ₹15,000/mo (up to 25 endpoints), Silver at ₹40,000/mo (up to 100), and Gold on a custom quote.'],
      ['me', 'We have 60 laptops and 3 servers, which plan?'],
      ['bot', 'This is best discussed with an engineer. Book a free 30-minute assessment — no obligation.'],
    ]),
    chat('CH-0931', ago(1, 6), 'Handled', true, [
      ['me', 'We need ransomware protection'],
      ['bot', 'Ransomware needs three layers — EDR on the endpoint, an email security gateway, and immutable backup.'],
    ]),
    chat('CH-0930', ago(3, 2), 'Handled', true, [
      ['me', 'We want to migrate to Azure'],
      ['bot', 'We migrate in waves — dependency mapping, a pilot, then the bulk move, always with a rollback plan.'],
    ]),
  ];

  const downloads = [
    base('DL-3107', ago(0, 5), 'New', false, '/resources/whitepapers', { name: 'Arjun Reddy', email: 'arjun@finedge.io', company: 'Finedge Fintech', asset: 'Ransomware Recovery Playbook' }),
    base('DL-3106', ago(1, 3), 'New', true, '/resources/whitepapers', { name: 'Priya Menon', email: 'priya.menon@lotusdiag.com', company: 'Lotus Diagnostics', asset: 'DPDP Act IT Checklist' }),
    base('DL-3105', ago(2, 8), 'Followed up', true, '/resources/whitepapers', { name: 'Nitin Joshi', email: 'nitin@kaveriauto.in', company: 'Kaveri Auto Parts', asset: 'Server AMC Buyer Guide' }),
    base('DL-3104', ago(8, 1), 'Followed up', true, '/resources/whitepapers', { name: 'Shalini Das', email: 'shalini@aec.edu.in', company: 'Amity Engineering College', asset: 'Campus Wi-Fi Design Guide' }),
  ];

  const toolReports = [
    base('TR-5054', ago(0, 6), 'New', false, '/tools/security-health-score', { email: 'it@metroretail.in', tool: 'IT Security Health Score' }),
    base('TR-5053', ago(1, 1), 'New', true, '/tools/cloud-cost-calculator', { email: 'cfo@greenfieldpharma.in', tool: 'Cloud Cost Calculator' }),
    base('TR-5052', ago(4, 2), 'Followed up', true, '/tools/amc-plan-selector', { email: 'admin@chauhantex.in', tool: 'AMC Plan Selector' }),
  ];

  const subscribers = ['ops@kaveriauto.in', 'it.head@sunrisehf.in', 'sanjay@hfc.in', 'priya.menon@lotusdiag.com', 'admin@royalorchidncr.com', 'tech@finedge.io', 'shalini@aec.edu.in']
    .map((email, i) => base(`SB-${6100 - i}`, ago(i * 3, i), i === 5 ? 'Unsubscribed' : 'Active', true, '/', { email }));
  subscribers[0].read = false;

  const applications = [
    base('AP-7012', ago(0, 7), 'New', false, '/careers', { name: 'Aditya Kumar', email: 'aditya.k@gmail.com', phone: '9810776655', role: 'network-engineer', roleTitle: 'Network Engineer', resume: 'Aditya_Kumar_CV.pdf', message: 'CCNA certified, 3 years at an ISP NOC.' }),
    base('AP-7011', ago(2, 2), 'Shortlisted', true, '/careers', { name: 'Simran Kaur', email: 'simran.kaur@outlook.com', phone: '9899001122', role: 'cloud-engineer-azure', roleTitle: 'Cloud Engineer — Azure', resume: 'Simran_Kaur_Resume.pdf', message: 'AZ-104 and AZ-305.' }),
    base('AP-7010', ago(5, 5), 'Interview', true, '/careers', { name: 'Mohit Yadav', email: 'mohit.yadav@gmail.com', phone: '9717556644', role: 'system-engineer-l2', roleTitle: 'System Engineer (L2)', resume: 'MohitYadav.docx', message: '' }),
    base('AP-7009', ago(10, 1), 'Rejected', true, '/careers', { name: 'Rahul Singh', email: 'rahul.s@yahoo.com', phone: '9811223300', role: 'general', roleTitle: 'General / talent database', resume: 'Rahul_CV.pdf', message: '' }),
  ];

  const procurement = [
    base('PR-8804', ago(0, 9), 'New', false, '/procurement', { name: 'Vandana Pillai', company: 'National Housing Corp.', email: 'vandana.p@nhc.gov.in', purpose: 'Tender / RFP submission' }),
    base('PR-8803', ago(3, 4), 'Sent', true, '/procurement', { name: 'Gaurav Sethi', company: 'Tata Components', email: 'gaurav.sethi@tatacomp.com', purpose: 'Vendor registration' }),
    base('PR-8802', ago(13, 2), 'Closed', true, '/procurement', { name: 'Ankit Jain', company: 'Maxwell Pharma', email: 'ankit@maxwellpharma.in', purpose: 'Compliance audit' }),
  ];

  return { leads, assessments, tickets, chats, downloads, toolReports, subscribers, applications, procurement };
}
