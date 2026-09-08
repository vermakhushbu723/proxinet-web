export const posts = [
  {
    slug: 'server-amc-7-questions', title: 'Seven questions to ask before you sign a server AMC',
    cat: 'Managed Services', date: '2026-08-22', read: '6 min', author: 'ProXinet Service Desk',
    excerpt: 'Comparing AMC quotations is hard because every vendor includes something different. These seven questions turn it into an apples-to-apples comparison.',
    body: [
      { h: 'Is the response time SLA in writing?', p: 'Most quotations say "prompt support", which means nothing contractually. Separate response and resolution times for P1, P2 and P3 should appear in the contract — in hours, not adjectives.' },
      { h: 'Is it comprehensive or non-comprehensive?', p: 'A non-comprehensive AMC covers labour only. If a motherboard fails, you get a separate bill. Comprehensive includes spares — it costs more, but the cost is predictable.' },
      { h: 'How often is preventive maintenance?', p: 'Breakdown-only support is a reactive model. A quarterly preventive visit — firmware, logs, thermal checks, backup verification — catches problems before they become failures.' },
      { h: 'Are onsite visits included or chargeable?', p: 'The number of included visits per month should be stated clearly, along with the per-visit rate beyond that.' },
      { h: 'Who is on the escalation matrix?', p: 'Names, designations and numbers for L1, L2, L3 and management. Without it, you will be stuck on a helpline the moment something goes wrong.' },
      { h: 'What is in the monthly report?', p: 'Tickets raised and closed, SLA compliance percentage, uptime and open risks. No report means you are operating blind.' },
      { h: 'What is the exit clause?', p: 'Agree upfront whether documentation, passwords and configurations will be handed over when the contract ends.' },
    ],
  },
  {
    slug: 'ransomware-recovery-timeline', title: 'Ransomware recovery: what the first 72 hours actually look like',
    cat: 'Security', date: '2026-08-08', read: '8 min', author: 'ProXinet Security Practice',
    excerpt: 'A realistic hour-by-hour view of an attack response — and the preparation that turns that timeline from days into hours.',
    body: [
      { h: 'Hour 0–2: Detection and isolation', p: 'The first signal is usually a user complaint that files will not open. The immediate priority is isolating affected machines from the network and disconnecting the backup repository so encryption cannot reach it.' },
      { h: 'Hour 2–8: Scope assessment', p: 'Which systems are affected, which are clean, and what the entry point was. This is where having — or not having — centralised logging makes the entire difference.' },
      { h: 'Hour 8–24: Clean-room restore', p: 'Restoring from immutable backup into an isolated network. If the backup was not immutable and got encrypted too, this is the point at which organisations start considering paying the ransom.' },
      { h: 'Day 2–3: Phased return to production', p: 'Critical systems first, in a patched and hardened state. All credentials reset. Monitoring elevated.' },
      { h: 'The preparation that shortens the timeline', p: 'An immutable or air-gapped backup copy, a tested restore procedure, a documented asset inventory and a written incident response playbook. Without all four, recovery stretches into weeks.' },
    ],
  },
  {
    slug: 'azure-vs-onprem-tco', title: 'Azure vs on-premise: comparing three-year TCO honestly',
    cat: 'Cloud', date: '2026-07-19', read: '7 min', author: 'ProXinet Cloud Practice',
    excerpt: 'Cloud is not always cheaper. Here is the full list of costs you should be counting on both sides.',
    body: [
      { h: 'What people forget on-premise', p: 'The server price is easy to remember. Power, cooling, rack space, UPS replacement, OS and hypervisor licences, warranty renewal (which gets expensive in years four and five) and administrator time all belong in the TCO too.' },
      { h: 'What people forget in the cloud', p: 'Egress bandwidth charges, backup storage, snapshot retention and — the biggest one — idle resources nobody shuts down. Without governance, a cloud bill grows every quarter.' },
      { h: 'When on-premise wins', p: 'A steady, predictable workload running at full capacity around the clock. And whenever there is a hard data residency or validated environment requirement.' },
      { h: 'When cloud clearly wins', p: 'Variable load, DR sites, dev and test environments, and any situation where the capex simply is not available. Also when the team is small and managing a hardware lifecycle is a burden.' },
      { h: 'The practical approach', p: 'Hybrid. Predictable production on-premise, DR and burst capacity in the cloud. Decide workload by workload rather than by blanket policy.' },
    ],
  },
  {
    slug: 'dpdp-act-it-checklist', title: 'DPDP Act 2023: a practical checklist for IT teams',
    cat: 'Compliance', date: '2026-07-02', read: '9 min', author: 'ProXinet Consulting',
    excerpt: 'The legal language translated into infrastructure-level actions your IT team can actually carry out.',
    body: [
      { h: 'Build a data inventory', p: 'Map where personal data lives — HR system, CRM, email, file shares, backups. You cannot protect what you have not located.' },
      { h: 'Move access to least-privilege', p: 'Every user should hold only the access their role requires. Put a quarterly access review on the calendar.' },
      { h: 'Define a retention policy', p: 'How long data is kept and how it is deleted afterwards — including from backups. Indefinite retention can no longer be the default.' },
      { h: 'Breach detection and reporting', p: 'Logging and alerting must exist so a breach can be detected, and a documented notification process should be ready to run.' },
      { h: 'Update vendor agreements', p: 'Any third party that processes your data needs data protection obligations written into its contract.' },
      { h: 'Encryption and backup security', p: 'Encryption at rest and in transit, and the same controls on backups that you apply to production.' },
    ],
  },
  {
    slug: 'wifi-survey-why-it-matters', title: 'What happens when you skip the Wi-Fi survey',
    cat: 'Network', date: '2026-06-14', read: '5 min', author: 'ProXinet Network Practice',
    excerpt: 'Guessing the AP count is the most expensive shortcut available. A survey always costs less than a redeployment.',
    body: [
      { h: 'What guess-based deployment produces', p: 'Some areas end up with very strong signal and others with none. Co-channel interference then drags throughput down even where the signal bars look full.' },
      { h: 'What a predictive survey gives you', p: 'AP placement and a channel plan derived from the floor plan and wall materials — before anything is installed.' },
      { h: 'Why post-install validation matters', p: 'An actual heatmap proves the design was delivered. It is also the document you show management.' },
      { h: 'The high-density special case', p: 'Classrooms, auditoriums and cafeterias need capacity design, not coverage design. The calculation is different.' },
    ],
  },
  {
    slug: 'backup-321-rule', title: 'The 3-2-1 backup rule and its modern update',
    cat: 'Backup', date: '2026-05-28', read: '5 min', author: 'ProXinet Service Desk',
    excerpt: 'The classic rule still holds — but ransomware added one essential requirement to it.',
    body: [
      { h: 'The classic 3-2-1', p: 'Three copies of the data, on two different media, with one held offsite. That has been the standard for decades.' },
      { h: 'What ransomware changed', p: 'Attackers now target backups first. So one copy must be immutable or air-gapped — something that cannot be deleted or encrypted at all.' },
      { h: '3-2-1-1-0', p: 'Three copies, two media, one offsite, one immutable, and zero errors on a verified restore. That final zero matters most.' },
      { h: 'A schedule for restore testing', p: 'A quarterly test restore and one full DR drill each year. Without testing, a backup is an assumption rather than a guarantee.' },
    ],
  },
];

export const glossary = [
  { term: 'AMC', full: 'Annual Maintenance Contract', def: 'A one-year support agreement covering preventive maintenance and breakdown support. A comprehensive AMC also covers spare parts.' },
  { term: 'DLP', full: 'Data Loss Prevention', def: 'Technology that stops sensitive data from leaving the organisation via USB, email or cloud upload.' },
  { term: 'DRaaS', full: 'Disaster Recovery as a Service', def: 'A cloud-hosted failover environment where workloads can run during a disaster.' },
  { term: 'EDR', full: 'Endpoint Detection and Response', def: 'A step beyond traditional antivirus — it monitors behaviour, detects threats and takes automated action.' },
  { term: 'EOL / EOSL', full: 'End of Life / End of Service Life', def: 'After EOL a product is no longer sold; after EOSL the OEM no longer provides support or spares. Running on EOSL hardware is a business risk.' },
  { term: 'HCI', full: 'Hyperconverged Infrastructure', def: 'Compute, storage and networking in one software-defined stack — no separate SAN required.' },
  { term: 'IAM', full: 'Identity and Access Management', def: 'Central control over who can do what in which system, with SSO and MFA.' },
  { term: 'MDM', full: 'Mobile Device Management', def: 'Policy enforcement, app distribution and remote wipe across corporate and BYOD devices.' },
  { term: 'NAS', full: 'Network Attached Storage', def: 'File-level storage accessed over the network as shares — suited to documents and shared folders.' },
  { term: 'NGFW', full: 'Next Generation Firewall', def: 'A traditional firewall plus application awareness, IPS and SSL inspection in one device.' },
  { term: 'NOC', full: 'Network Operations Center', def: 'The team and setup that monitors infrastructure 24/7 and acts on incidents.' },
  { term: 'RPO', full: 'Recovery Point Objective', def: 'How much data loss is acceptable — that is, how old the backup may be. A four-hour RPO means at most four hours of data can be lost.' },
  { term: 'RTO', full: 'Recovery Time Objective', def: 'How quickly a system must be back up after a disaster. It is a separate figure from RPO and both need defining.' },
  { term: 'SAN', full: 'Storage Area Network', def: 'A block-level storage network for databases and virtualization, delivering high IOPS.' },
  { term: 'SD-WAN', full: 'Software Defined WAN', def: 'Uses multiple internet links intelligently — lower cost, higher uptime and central policy control.' },
  { term: 'SIEM', full: 'Security Information and Event Management', def: 'Logs from all systems in one place with correlation rules, so attack patterns can be detected.' },
  { term: 'SLA', full: 'Service Level Agreement', def: 'A written commitment on response time, resolution time and uptime percentage. Without numbers, an SLA is just a word.' },
  { term: 'VAPT', full: 'Vulnerability Assessment & Penetration Testing', def: 'VA lists the gaps; PT exploits them to prove the risk is real.' },
  { term: 'XDR', full: 'Extended Detection and Response', def: 'An expanded EDR that correlates email, network and cloud signals alongside endpoint data.' },
  { term: 'Zero Trust', full: 'Zero Trust Architecture', def: 'A security model where being inside the network grants no trust — every request is verified.' },
];

export const faqs = [
  { cat: 'Engagement', q: 'Do you work with smaller companies?', a: 'Yes. The Bronze AMC plan is designed for offices with up to 25 endpoints. Many of our clients started with us at 20 users and have since grown past 300.' },
  { cat: 'Engagement', q: 'What does the free assessment actually include?', a: 'A structured 30-minute review covering current infrastructure, EOL exposure, backup readiness and your top three risks. You receive a written summary whether or not you engage us afterwards.' },
  { cat: 'Engagement', q: 'Do you only supply, or do you implement as well?', a: 'Both. For most clients we handle the full lifecycle — design, supply, implementation and ongoing management.' },
  { cat: 'Support', q: 'How do we raise support requests?', a: 'Through the client portal, email, phone or WhatsApp. All four channels create a ticket in the same queue with an SLA timer attached.' },
  { cat: 'Support', q: 'What is the response time for a P1 issue?', a: 'It depends on the plan — four hours on Bronze, one hour on Silver and 15 minutes on Gold. The figure is written into the contract.' },
  { cat: 'Support', q: 'How does escalation work?', a: 'Every account receives a published escalation matrix covering L1, L2, L3 and management, with names and numbers.' },
  { cat: 'Commercial', q: 'How is pricing decided?', a: 'On the number of endpoints, locations, coverage hours and scope. Indicative starting prices are published on this site; the final quote follows the assessment.' },
  { cat: 'Commercial', q: 'How long is the contract?', a: 'Twelve months as standard. A three-month pilot is available for new clients.' },
  { cat: 'Commercial', q: 'What are the payment terms?', a: 'Monthly, quarterly or annual — annual carries a discount. Payment can also be made through the online portal.' },
  { cat: 'Security', q: 'Are your engineers background verified?', a: 'Yes, every deployed engineer goes through background verification. The policy document is included in the procurement pack.' },
  { cat: 'Security', q: 'How is our data protected?', a: 'Through NDAs, role-based access, activity logging and a data handling policy aligned to the DPDP Act 2023 — all documented and available for audit.' },
  { cat: 'Security', q: 'Are you ISO 27001 certified?', a: 'Current status and validity dates are listed on the certifications page, and the certificates themselves are available for download in the procurement pack.' },
];

export const whitepapers = [
  { title: 'Cloud Migration Playbook for SMEs', pages: 24, cat: 'Cloud', desc: 'A step-by-step framework from discovery to cutover, including wave and rollback planning.' },
  { title: 'DPDP Act 2023 — IT Compliance Checklist', pages: 16, cat: 'Compliance', desc: 'A working checklist that translates the legal requirements into infrastructure actions.' },
  { title: 'Ransomware Readiness Assessment', pages: 18, cat: 'Security', desc: 'A 32-point self-assessment and an incident response playbook template.' },
  { title: 'Server Refresh Buyer Guide 2026', pages: 20, cat: 'Data Center', desc: 'Sizing methodology, OEM comparison and a TCO calculation worksheet.' },
  { title: 'Enterprise Wi-Fi Design Guide', pages: 22, cat: 'Network', desc: 'Coverage versus capacity design, high-density planning and validation criteria.' },
  { title: 'Backup & DR Policy Template', pages: 14, cat: 'Backup', desc: 'A ready-to-adapt policy document with RPO and RTO tiers and a test schedule included.' },
];

export const findPost = (slug) => posts.find((p) => p.slug === slug);
