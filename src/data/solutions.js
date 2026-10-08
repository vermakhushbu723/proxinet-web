// Each solution family and its children. Routes are data-driven:
// /solutions/:family  and  /solutions/:family/:slug
export const solutionFamilies = [
  {
    slug: 'cloud',
    name: 'Cloud Solutions',
    icon: 'cloud',
    tag: 'Azure · AWS · M365 · GCP',
    blurb: 'Public, private and hybrid cloud — from assessment through migration and cost optimisation.',
    hero: 'The growing demand for 24/7 technology services is placing extra workload on companies and cloud services help to attain and manage these services well in advance.',
    pains: ['No capex left for an on-prem hardware refresh', 'The cloud bill grows every month', 'Performance dropped after migration'],
    children: [
      { slug: 'microsoft-azure', name: 'Microsoft Azure', blurb: 'Virtual Machines, Blob Storage, Managed Disks, Azure Backup and landing zone design.',
        bullets: ['Server consolidation to improve hardware utilisation', 'Blob storage, tiered for unstructured data', 'Managed Disks — block-level virtualised storage', 'Azure Backup for files, folders, system state and configuration'],
        // Content from the matching proxinet.in page
        deliver: {
          title: "Microsoft Azure",
          intro: "A cloud based solution refers to on-demand services, computer networks, storage, applications or resources accessed via the Internet. Cloud-based solutions enable companies to focus on revenue-driving initiatives rather than time-consuming, non-core business tasks.",
          items: [
            { t: "Virtual Machine", d: "Server consolidation is a top reason to use VMs. By virtualizing your servers, you can place many virtual servers onto each physical server to improve hardware utilization and reduce cost — with easy maintenance, reduced downtime and simple migration." },
            { t: "Blob Storage", d: "Microsoft’s object storage solution for the cloud, optimized for massive amounts of unstructured data — serving images and documents, streaming video and audio, log files, backup, disaster recovery and archiving." },
            { t: "Managed Disk", d: "Block-level storage volumes managed by Azure and used with Azure Virtual Machines. Specify the disk size and type, provision the disk, and Azure handles the rest." },
            { t: "Azure Backup", d: "Simple, secure and cost-effective backup and recovery from the Microsoft Azure cloud for files, folders, system states, app-specific data, file shares and machine configurations." },
          ],
        } },
      { slug: 'aws', name: 'Amazon Web Services', blurb: 'EC2, S3, RDS and VPC design, plus a Well-Architected review.',
        bullets: ['Landing zone and multi-account structure', 'EC2 right-sizing and reserved instance planning', 'S3 lifecycle policies', 'VPC segmentation and security groups'],
        // Content from the matching proxinet.in page
        deliver: {
          title: "Amazon Web Services (AWS)",
          intro: "Amazon Web Services (AWS) is Amazon’s cloud platform that offers flexible, reliable, scalable, easy-to-use and cost-effective solutions — a low-cost infrastructure platform in the cloud that powers businesses in 190 countries around the world.",
          items: [
            { t: "Amazon EC2", d: "Run application programs in the AWS public cloud and spin up virtual machines on demand — faster server boot, auto-scaling, complete control of servers, flexible operating systems, built-in security and pay-as-you-go pricing." },
            { t: "Amazon S3", d: "Scalable, high-speed, low-cost storage for online backup and archiving of data and applications — files up to 5 TB, SSL transfer with automatic encryption, and integration with Amazon CloudFront and other AWS services." },
            { t: "AWS Backup", d: "A fully managed service to centralize and automate backup across AWS services such as EBS volumes, EC2 instances, RDS databases, DynamoDB tables and EFS file systems — with policy-based schedules and retention." },
          ],
        } },
      { slug: 'microsoft-365', name: 'Microsoft 365', blurb: 'Exchange Online, Teams, SharePoint, Intune and licensing optimisation.',
        bullets: ['Tenant setup and mail migration', 'Teams and SharePoint governance', 'Device compliance through Intune', 'Licence right-sizing — E3 vs E5 vs Business Premium'],
        // Content from the matching proxinet.in page
        deliver: {
          title: "Microsoft 365",
          intro: "Proxinet has demonstrated its consistent capability, expertise and commitment in the design and deployment of Microsoft solutions and gained a Silver partner accreditation. Microsoft 365 is the productivity cloud that brings together best-in-class apps with powerful cloud services, device management and advanced security in one connected experience.",
          items: [
            { t: "Email & calendaring", d: "Professional email and calendaring to reach customers and co-workers wherever work takes you." },
            { t: "OneDrive storage", d: "Store, access and share files from anywhere with 1 TB of online storage per user — synced to your desktop and available on Windows, Mac and mobile." },
            { t: "Microsoft Teams", d: "Group chat, online meetings and calling — the hub for teamwork." },
            { t: "SharePoint", d: "Share and manage content, knowledge and applications to empower teamwork, quickly find information and collaborate across the organization." },
            { t: "Security & device management", d: "Help protect your employees, your data and your customer information with advanced security and device management." },
            { t: "99.9% uptime", d: "All Microsoft 365 services come with a financially backed 99.9% uptime guarantee, in Business and Enterprise plans." },
          ],
          links: [
            { label: "Business plans", href: "https://www.microsoft.com/en-in/microsoft-365/business/compare-all-microsoft-365-business-products" },
            { label: "Enterprise plans", href: "https://www.microsoft.com/en-in/microsoft-365/compare-microsoft-365-enterprise-plans" },
          ],
        } },
      { slug: 'google-cloud', name: 'Google Cloud Platform', blurb: 'Compute Engine, Cloud Storage, BigQuery and Workspace integration.',
        bullets: ['Compute Engine sizing', 'Cloud Storage classes and lifecycle rules', 'Identity integration with Workspace', 'Cost dashboards and budgets'],
        // Content from the matching proxinet.in page
        deliver: {
          title: "G Suite",
          intro: "Chosen by millions of businesses, from small companies to the Fortune 500. Do your best work, all in one suite.",
          items: [
            { t: "Work faster, work smarter", d: "Collaborate on documents, spreadsheets and slides in real time across your devices, with or without internet — see edits as others type, chat and comment, and every change is saved automatically." },
            { t: "Store and share files in the cloud", d: "Keep all your work in one place with secure access from your computer, phone or tablet, and invite others to view and collaborate — no email attachment needed." },
            { t: "Secure your data and devices", d: "Protect company data with 2-step verification, single sign-on and endpoint management, archive email and chats, and manage security from one admin console with 24/7 support." },
          ],
          links: [
            { label: "Learn more", href: "https://gsuite.google.com/intl/en_in/" },
            { label: "Pricing", href: "https://gsuite.google.com/intl/en_in/pricing.html" },
          ],
        } },
      { slug: 'hybrid-cloud', name: 'Hybrid Cloud', blurb: 'Seamless workload placement across on-prem and cloud.',
        bullets: ['Site-to-site VPN or ExpressRoute', 'Identity federation', 'Hybrid backup topology', 'Workload placement matrix'],
        deliver: {
          title: "Hybrid Cloud",
          intro: "Hybrid cloud combines your on-premise infrastructure with public cloud platforms such as Microsoft Azure and AWS — so each workload runs where it performs best, with one secure, centrally managed environment.",
          items: [
            { t: "Workload placement", d: "Keep sensitive or latency-critical systems on-premise and move flexible workloads to the cloud." },
            { t: "Seamless connectivity", d: "Secure site-to-cloud networking with VPN or dedicated links between your data center and the cloud." },
            { t: "Unified identity & security", d: "One identity, access and security policy across on-premise and cloud resources." },
            { t: "Backup & disaster recovery", d: "Use the cloud as an offsite copy and failover site for your on-premise servers." },
            { t: "Cost control", d: "Pay for cloud capacity only when you need it, while getting full value from existing hardware." },
          ],
        } },
      { slug: 'cloud-migration', name: 'Cloud Migration', blurb: 'Discovery, wave planning, migration and optimisation — with a rollback plan.',
        bullets: ['Application dependency mapping', 'Migration waves and cutover windows', 'Pilot and UAT before the bulk move', 'Post-migration optimisation review'],
        deliver: {
          title: "Cloud Migration",
          intro: "We move your servers, applications and data to the cloud in planned, low-risk phases — from assessment and design through migration and optimisation, with a rollback plan at every step.",
          items: [
            { t: "Discovery & assessment", d: "Inventory of your current environment, dependencies and cloud readiness." },
            { t: "Migration planning", d: "Wave-by-wave plan with downtime windows agreed in advance." },
            { t: "Secure migration", d: "Servers, applications, databases, email and files moved with data integrity checks." },
            { t: "Testing & handover", d: "User acceptance testing after every phase and full documentation." },
            { t: "Optimisation", d: "Right-sizing and cost optimisation after go-live, with ongoing support." },
          ],
        } },
      { slug: 'cloud-cost-optimization', name: 'Cloud Cost Optimization', blurb: 'FinOps practices that typically cut the monthly bill by 20 to 40 percent.',
        bullets: ['Cleanup of idle and orphaned resources', 'Right-sizing recommendations', 'Reserved and savings plan strategy', 'Tagging and showback reports'] },
      { slug: 'virtual-desktop-avd', name: 'Virtual Desktop (AVD)', blurb: 'Azure Virtual Desktop — secure remote work from anywhere.',
        bullets: ['Host pool sizing', 'FSLogix profile containers', 'Conditional access policies', 'Session host image management'] },
    ],
  },
  {
    slug: 'cyber-security',
    name: 'Cyber Security',
    icon: 'shield',
    tag: 'Endpoint · Email · DLP · MDM · Firewall',
    blurb: 'Layered defence from perimeter to endpoint — detect, prevent and respond.',
    hero: 'Endpoints are a primary target for cyber attackers.',
    pains: ['Legacy antivirus in place, no EDR', 'Phishing emails arrive regularly', 'An audit surfaced compliance gaps'],
    children: [
      { slug: 'endpoint-security', name: 'Endpoint Security (EDR/XDR)', blurb: 'Next-gen AV, behavioural detection and automated response.',
        bullets: ['Ransomware rollback capability', 'Device control and application whitelisting', 'Centralised policy management', 'Threat hunting dashboards'],
        // Content from the matching proxinet.in page
        deliver: {
          title: "Our End Point Solutions",
          intro: "Endpoints are a primary target for cyber attackers. As the consequences and resulting damage of successful attacks grow, many companies try to bolster their overall defense by adding multiple endpoint protection products — but this approach weakens an organization’s security posture. We help you protect every endpoint with the right, consolidated solution. For a demo, please contact us.",
          items: [

          ],
        } },
      { slug: 'email-security', name: 'Email Security', blurb: 'Multi-layer filtering against phishing, spoofing and BEC.',
        bullets: ['Anti-phishing and impersonation protection', 'SPF, DKIM and DMARC implementation', 'Attachment sandboxing', 'Email continuity during an outage'],
        // Content from the matching proxinet.in page
        deliver: {
          title: "Email Security",
          intro: "More than 90 percent of targeted attacks begin with a spear-phishing email, which means your mail server security is more important than ever. Most built-in protections rely on pattern file updates that only detect traditional malware — not the malicious URLs or document exploits used in targeted attacks.",
          items: [
            { t: "Protect your email servers 24/7", d: "Check email and attachments for viruses, worms, trojans and other malware, with real-time, cloud-based file and sender reputation against known and emerging threats." },
            { t: "Enforce compliance", d: "Filter messages by size, content or attachment, and block or quarantine messages containing specific words or phrases." },
            { t: "Data leak prevention & content scanning", d: "Use prebuilt dictionaries for enterprise and country-specific compliance rules, or customize filters to prevent data leaks." },
            { t: "Robust quarantine management", d: "Users can manage quarantined messages themselves, and administrators get regular summary reports and can release or delete messages from a central quarantine." },
          ],
        } },
      { slug: 'data-loss-prevention', name: 'Data Loss Prevention', blurb: 'Stop sensitive data from leaving the organisation.',
        bullets: ['Content classification and policies', 'USB and cloud upload control', 'Endpoint, network and email DLP', 'Incident reporting workflow'],
        // Content from the matching proxinet.in page
        deliver: {
          title: "Data Loss Prevention",
          intro: "Data Loss Prevention (DLP) is the practice of detecting and preventing data breaches, exfiltration or unwanted destruction of sensitive data. Organizations use DLP to protect and secure their data and comply with regulations. DLP gives you complete visibility and control over your information — wherever it lives and travels.",
          items: [
            { t: "Intellectual property", d: "Source code, product design documents, process documentation and internal price lists." },
            { t: "Corporate data", d: "Financial documents, strategic planning documents, M&A research and employee information." },
            { t: "Customer data", d: "Identity numbers, credit card numbers, medical records and financial statements." },
            { t: "Continuous monitoring", d: "Monitors for policy violations and risky user behaviour across control points at all times." },
            { t: "Real-time prevention", d: "Prevents and deters end users from leaking data with real-time blocking, quarantining and alerts." },
            { t: "Fast incident response", d: "Automated incident remediation workflows, with policies you can fine-tune to balance security and productivity." },
          ],
        } },
      { slug: 'mobile-device-management', name: 'Mobile Device Management', blurb: 'Central control over BYOD and corporate devices.',
        bullets: ['Enrolment and compliance policies', 'Remote wipe and lock', 'App distribution', 'Containerisation — work vs personal'],
        // Content from the matching proxinet.in page
        deliver: {
          title: "Mobile Device Management",
          intro: "Mobile device management (MDM) is security software used by an IT department to monitor, manage and secure employees’ mobile devices across multiple mobile service providers and operating systems — often combined with mobile application management for a complete enterprise mobility solution.",
          items: [
            { t: "Microsoft Intune", d: "Simplify modern workplace management — enrol company-owned or BYOD devices on Windows, Mac, iOS or Android, apply your rules through policies, and keep an inventory of every device accessing organisation resources." },
            { t: "Benefits of Intune", d: "Support a diverse mobile ecosystem from the cloud, protect data with or without device enrolment, and get cutting-edge information protection in Office 365." },
            { t: "Citrix Endpoint Management", d: "Adopt and manage Android devices in a consistent, secure manner with Android Enterprise — for BYOD and corporate-owned devices alike." },
            { t: "Enhanced security & better experience", d: "Layered Android security plus advanced device and app controls, with fast enrolment via zero-touch, NFC or QR code and seamless access to business apps." },
          ],
          links: [
            { label: "Microsoft Intune", href: "https://www.microsoft.com/en-in/microsoft-365/enterprise-mobility-security/microsoft-intune" },
            { label: "Intune pricing", href: "https://www.microsoft.com/en-in/microsoft-365/enterprise-mobility-security/compare-plans-and-pricing" },
            { label: "Citrix Endpoint Management", href: "https://www.citrix.com/en-in/products/citrix-endpoint-management/" },
          ],
        } },
      { slug: 'ssl-vpn', name: 'SSL VPN & Remote Access', blurb: 'Secure remote access, enforced with MFA.',
        bullets: ['Client and clientless VPN', 'MFA enforcement', 'Split tunnelling policy', 'Session logging and audit'],
        // Content from the matching proxinet.in page
        deliver: {
          title: "SSL VPN",
          intro: "An SSL VPN uses the SSL / TLS protocol in standard web browsers to provide secure, remote-access VPN capability. Devices with an internet connection can establish a secure connection through a web browser, with end-to-end encryption protecting all data between the device and the SSL VPN server.",
          items: [
            { t: "Secure remote access", d: "Allow remote employees, contractors and partners to reach internal corporate resources safely, from virtually any computer or device." },
            { t: "Safe web sessions", d: "Safeguard the web sessions of users connecting to the internet from outside the corporate network." },
            { t: "Easy to implement", d: "No specific client software to install or maintain — just a modern browser, with reliable connections and wide platform compatibility." },
            { t: "Granular access control", d: "Tunnels are built to specific applications rather than the entire network, so users reach only the applications they have been granted." },
          ],
        } },
      { slug: 'web-proxy-filtering', name: 'Web Proxy & Content Filtering', blurb: 'Category-based browsing control and bandwidth management.',
        bullets: ['URL categorisation', 'SSL inspection', 'Bandwidth quotas per group', 'Usage reporting'],
        // Content from the matching proxinet.in page
        deliver: {
          title: "Proxy and Content Filters",
          intro: "A proxy server acts as a gateway between you and the internet — an intermediary server separating end users from the websites they browse. Content filters restrict access to inappropriate or harmful sites while allowing access to the sites you want, and help stop sensitive data from leaving the organization.",
          items: [
            { t: "Control internet usage", d: "Decide what employees can see and what is blocked, including social media, torrents and hacker websites." },
            { t: "Bandwidth savings", d: "Save bandwidth and improve browsing speeds across the network." },
            { t: "Privacy & security", d: "Improved privacy and security by filtering out harmful or malicious content." },
            { t: "Higher productivity", d: "Increase productivity and prevent liability issues from objectionable content." },
          ],
          links: [
            { label: "Barracuda Web Security Gateway", href: "https://www.barracuda.com/products/websecuritygateway" },
          ],
        } },
      { slug: 'firewall-utm', name: 'Firewall & UTM', blurb: 'Next-gen firewall — IPS, application control and SD-WAN ready.',
        bullets: ['NGFW deployment and rule hardening', 'IPS and IDS tuning', 'Application-aware policies', 'HA pair configuration'] },
      { slug: 'xdr-siem-soc', name: 'XDR, SIEM & SOC', blurb: 'Central log correlation and 24/7 monitoring.',
        bullets: ['Log source onboarding', 'Correlation rules and alerting', 'Incident response playbooks', 'Compliance reporting'] },
      { slug: 'zero-trust', name: 'Zero Trust Architecture', blurb: 'Never trust, always verify — an identity-first security model.',
        bullets: ['Micro-segmentation', 'Conditional access', 'Least-privilege access review', 'Continuous verification'] },
      { slug: 'identity-access-management', name: 'Identity & Access Management', blurb: 'SSO, MFA and privileged access control.',
        bullets: ['Entra ID and Active Directory design', 'SSO for SaaS apps', 'MFA rollout', 'Privileged access management'] },
    ],
  },
  {
    slug: 'data-center',
    name: 'Data Center Solutions',
    icon: 'server',
    tag: 'Virtualization · Servers · SAN · NAS · HCI',
    blurb: 'Compute, storage and virtualization — from sizing to lifecycle management.',
    hero: 'Proxinet team is well versed & experienced at deploying Data center servers with operational efficiency, high availability and redundancy along with reliable and fast storage systems.',
    pains: ['Hardware has reached EOL or EOSL', 'Storage capacity is exhausted', 'Virtualization licensing costs have climbed'],
    children: [
      { slug: 'server-virtualization', name: 'Server Virtualization', blurb: 'VMware, Hyper-V and Proxmox — consolidation and high availability.',
        bullets: ['Cluster design with HA and DRS', 'P2V and V2V migration', 'Resource pool planning', 'Licensing optimisation'],
        // Detail page box — replaces "What gets delivered" + bullets
        deliver: {
          title: 'Our Data Center Solutions Include',
          items: [
            { t: 'Server Infrastructure', d: 'Enterprise rack, tower and blade servers for business-critical workloads.' },
            { t: 'Server Virtualization', d: 'VMware vSphere, Microsoft Hyper-V, Proxmox VE and other virtualization platforms for efficient resource utilization and simplified IT management.' },
            { t: 'Storage Solutions', d: 'SAN, NAS, DAS and enterprise storage solutions with high availability and scalability.' },
            { t: 'Data Center Networking', d: 'Core, distribution and access switching, routing, high-speed connectivity and network architecture.' },
            { t: 'Backup & Data Protection', d: 'Veeam and other enterprise backup solutions for reliable data protection and fast recovery.' },
            { t: 'Disaster Recovery (DR)', d: 'On-premises, cloud and hybrid DR solutions with defined RPO/RTO objectives.' },
            { t: 'Cybersecurity', d: 'Next-generation firewalls, endpoint security, network security and data protection.' },
            { t: 'High Availability & Business Continuity', d: 'Infrastructure designed to minimize downtime and maintain critical business operations.' },
            { t: 'Cloud Integration', d: 'Microsoft Azure, AWS and hybrid-cloud solutions for workload migration, backup and disaster recovery.' },
            { t: 'Data Center Assessment & Modernization', d: 'Infrastructure assessment, consolidation, migration and technology refresh.' },
            { t: 'Monitoring & Infrastructure Management', d: 'Proactive monitoring, performance management and IT infrastructure support.' },
            { t: 'Data Center Migration', d: 'Server, storage, virtualization and application migration with minimum business disruption.' },
          ],
        } },
      { slug: 'servers', name: 'Servers', blurb: 'Rack, tower and blade servers — sizing, supply and commissioning.',
        bullets: ['Workload-based sizing', 'OEM supply — Dell, HPE, Lenovo', 'Firmware baseline and hardening', 'Warranty and AMC coverage'],
        // Content from the matching proxinet.in page
        deliver: {
          title: "Server",
          intro: "Proxinet, with the help of our partners, identifies the needs of our customers and provides feasible, powerful and cost-effective solutions. Servers are an important part of IT infrastructure, and their reliability is an important factor in the daily operation of a business and its services.",
          items: [
            { t: "Why IT infrastructure modernization matters", d: "Building and maintaining up-to-date infrastructure is becoming ever more critical for next-generation applications and digital transformation — regular server upgrades help organizations achieve higher levels of efficiency and agility." },
          ],
        } },
      { slug: 'san-storage', name: 'SAN Storage', blurb: 'Block storage for high-IOPS workloads.',
        bullets: ['FC and iSCSI fabric design', 'Tiering and thin provisioning', 'Replication for DR', 'Performance baselining'],
        // Content from the matching proxinet.in page
        deliver: {
          title: "SAN",
          intro: "Storage is no longer an afterthought. Companies are searching for more ways to efficiently manage expanding volumes of data and make it accessible throughout the enterprise. With data growing around 60% each year, a storage area network (SAN) is the leading storage infrastructure for today’s economy.",
          items: [
            { t: "Simplified storage management", d: "Manage large numbers of storage devices and vast amounts of data from one place." },
            { t: "Scalability & flexibility", d: "Grow capacity as your data grows, without disruption." },
            { t: "High availability", d: "Keep business-critical data available across the enterprise." },
            { t: "Improved data access & backup", d: "Faster data access, movement and backup over the network." },
          ],
          links: [
            { label: "NetApp SAN", href: "https://www.netapp.com/us/products/storage-systems/storage-area-network.aspx" },
            { label: "IBM SAN", href: "https://www.ibm.com/in-en/it-infrastructure/storage/san" },
            { label: "Dell storage", href: "https://www.delltechnologies.com/en-in/storage/data-storage.htm" },
          ],
        } },
      { slug: 'nas-storage', name: 'NAS Storage', blurb: 'File storage — shares, quotas and snapshots.',
        bullets: ['Share and permission design', 'Snapshot schedules', 'Quota management', 'Backup integration'],
        // Content from the matching proxinet.in page
        deliver: {
          title: "NAS",
          intro: "Network-attached storage (NAS) is an IP-based file-sharing device attached to a local area network. A NAS device uses its own operating system and integrated hardware and software to meet a variety of file service needs.",
          items: [
            { t: "Data access & file sharing", d: "Provide comprehensive data access and file sharing for clients and servers." },
            { t: "Centralized storage", d: "Increase efficiency with centralized storage and simplified management." },
            { t: "Flexibility", d: "Support both UNIX and Windows clients." },
            { t: "Scale & availability", d: "Scale capacity and performance, with efficient data replication and recovery options." },
            { t: "Secure data", d: "Protect data with user authentication and file locking." },
          ],
        } },
      { slug: 'hyperconverged-hci', name: 'Hyperconverged (HCI)', blurb: 'Compute, storage and networking in a single stack.',
        bullets: ['Node sizing and scaling plan', 'Built-in resilience', 'Simplified management plane', 'Lower rack footprint'] },
      { slug: 'colocation', name: 'Colocation & DC Hosting', blurb: 'Rack space, power and connectivity in Tier-III facilities.',
        bullets: ['Rack and power planning', 'Remote hands support', 'Cross-connect provisioning', 'Physical access control'] },
    ],
  },
  {
    slug: 'backup-dr',
    name: 'Backup & Disaster Recovery',
    icon: 'backup',
    tag: 'Veeam · Cloud Backup · DRaaS',
    blurb: 'Backup that actually restores — with tested RPO and RTO.',
    hero: 'Taking a backup is easy. Guaranteeing the restore is the real work.',
    pains: ['The restore has never been tested', 'RPO and RTO are undefined', 'Ransomware can encrypt the backups too'],
    children: [
      { slug: 'veeam-backup', name: 'Veeam Backup & Replication', blurb: 'Unified backup for VM, physical and cloud workloads.',
        bullets: ['Backup job design and retention', 'Instant VM recovery', 'SureBackup — automated restore verification', 'Immutable repository'],
        // Content from the matching proxinet.in page
        deliver: {
          title: "Modern Data Protection Built for Modern Business Challenges",
          intro: "Backup and recovery is a dynamic challenge with ever-changing needs. We deliver data availability, visibility, automation and governance across data centers, at the edge and in the cloud.",
          items: [
            { t: "Veeam", d: "A single, software-defined and hardware-agnostic platform for modernizing backup, accelerating hybrid cloud and securing your data — simple, flexible and reliable." },
            { t: "Commvault", d: "Hybrid IT control, service delivery automation, recovery confidence, risk reduction and complete enterprise protection." },
            { t: "Veritas NetBackup", d: "Unified, reliable and scalable protection with rapid recovery across physical, virtual and multi-cloud environments." },
            { t: "Resilience from ransomware", d: "Protect, detect and recover — ensure data integrity, monitor your environment and recover at scale." },
            { t: "Virtual & cloud environments", d: "Protect VMware, Hyper-V, Nutanix AHV and more, with cloud data protection, snapshot orchestration and disaster recovery." },
          ],
        } },
      { slug: 'cloud-backup', name: 'Cloud Backup', blurb: 'An offsite copy to complete the 3-2-1 rule.',
        bullets: ['Azure, AWS and S3-compatible targets', 'Bandwidth-aware scheduling', 'Encryption in transit and at rest', 'Cost-tiered retention'] },
      { slug: 'disaster-recovery-draas', name: 'Disaster Recovery (DRaaS)', blurb: 'A failover site with an RTO in minutes, not hours.',
        bullets: ['Replication topology design', 'Runbook and failover orchestration', 'Annual DR drill', 'RPO and RTO tier definition'],
        deliver: {
          title: "Disaster Recovery",
          intro: "Disaster recovery keeps your business running when systems fail. We design on-premise, cloud and hybrid DR solutions with defined RPO and RTO objectives, so critical applications can be restored quickly after any outage, cyber attack or disaster.",
          items: [
            { t: "Replication", d: "Continuous replication of servers and data to a secondary site or the cloud." },
            { t: "Defined RPO / RTO", d: "Recovery point and recovery time objectives set for every critical application." },
            { t: "Failover orchestration", d: "Documented runbooks and automated failover and failback." },
            { t: "Ransomware resilience", d: "Immutable, isolated copies so data can be recovered after an attack." },
            { t: "Regular DR drills", d: "Scheduled recovery testing so the plan works when you need it." },
          ],
        } },
      { slug: 'ransomware-recovery', name: 'Ransomware Recovery', blurb: 'Immutable backups and a tested recovery playbook.',
        bullets: ['Air-gapped and immutable copies', 'Clean-room restore process', 'Forensic snapshot retention', 'Incident communication plan'] },
    ],
  },
  {
    slug: 'network',
    name: 'Network Infrastructure',
    icon: 'wifi',
    tag: 'Cabling · Switching · Wi-Fi 6E · SD-WAN',
    blurb: 'From structured cabling to SD-WAN — a network built to scale.',
    hero: 'A reliable network — no dead zones, no drop-outs, no guesswork.',
    pains: ['The Wi-Fi has dead zones', 'Multi-branch links are expensive and unreliable', 'There is no network visibility'],
    children: [
      { slug: 'structured-cabling', name: 'Structured Cabling', blurb: 'Cat6/6A and fibre backbone — certified and labelled.',
        bullets: ['Site survey and cable route planning', 'Cat6, Cat6A and OM4 fibre', 'Rack dressing and labelling', 'Link certification reports'],
        // Content from the matching proxinet.in page
        deliver: {
          title: "Wired",
          intro: "Meet the demands of high-performance networking with resilient, high-density, full-featured solutions. Networking has had a profound impact on modern business — and with it come security threats which, when mitigated, let the benefits of communication outweigh the risks of theft, intrusion and destruction of digital property.",
          items: [
            { t: "Routers", d: "Enterprise routing for reliable, secure connectivity between sites and the internet." },
            { t: "Switches", d: "High-density, full-featured switching for resilient, high-performance wired networks." },
          ],
          links: [
            { label: "Cisco routers", href: "https://www.cisco.com/c/en_in/products/routers/index.html" },
            { label: "Cisco switches", href: "https://www.cisco.com/c/en/us/products/switches/index.html" },
            { label: "Dell switches", href: "https://www.dell.com/en-in/work/shop/networking/sc/networking-products/switches" },
            { label: "Aruba switches", href: "https://www.arubanetworks.com/products/networking/switches/" },
            { label: "Netgear switches", href: "https://www.netgear.com/business/products/switches/managed/" },
          ],
        } },
      { slug: 'switching-routing', name: 'Switching & Routing', blurb: 'Core, distribution and access layer design.',
        bullets: ['VLAN and subnetting plan', 'Stacking and redundancy', 'QoS for voice and video', 'Config backup automation'] },
      { slug: 'enterprise-wifi', name: 'Enterprise Wi-Fi (6E / 7)', blurb: 'From predictive survey through post-install validation.',
        bullets: ['Predictive and on-site RF survey', 'AP placement and channel plan', 'Guest and corporate SSID separation', 'Heatmap validation report'],
        deliver: {
          title: "Wireless",
          intro: "Reliable, secure wireless networking for offices, campuses and warehouses — designed from a site survey so every user and device gets fast, consistent coverage.",
          items: [
            { t: "Site survey & design", d: "Predictive and on-site surveys to plan access point placement and coverage." },
            { t: "Enterprise access points", d: "High-density Wi-Fi 6 / 6E access points from leading vendors." },
            { t: "Secure access", d: "Separate SSIDs and VLANs for staff, guests and IoT, with WPA3 and enterprise authentication." },
            { t: "Central management", d: "Cloud or controller-based management with monitoring and reporting." },
            { t: "Seamless roaming", d: "Users move across the floor or campus without dropped connections." },
          ],
          links: [
            { label: "Juniper access points", href: "https://www.juniper.net/us/en/products-services/access-points/" },
            { label: "Cisco wireless", href: "https://www.cisco.com/c/en_in/products/wireless/index.html" },
            { label: "Netgear wireless", href: "https://www.netgear.com/business/products/wireless/" },
          ],
        } },
      { slug: 'sd-wan', name: 'SD-WAN', blurb: 'Multi-branch connectivity — lower cost, higher uptime.',
        bullets: ['Link aggregation — broadband plus MPLS', 'Application-aware path selection', 'Central policy management', 'Branch zero-touch provisioning'] },
      { slug: 'network-monitoring', name: 'Network Monitoring', blurb: 'Zabbix or PRTG based visibility and proactive alerting.',
        bullets: ['Device and link monitoring', 'Bandwidth trend reports', 'Threshold alerts to the NOC', 'Capacity planning data'] },
    ],
  },
  {
    slug: 'collaboration',
    name: 'Collaboration & Voice',
    icon: 'team',
    tag: 'Teams · VoIP · Video Conferencing',
    blurb: 'Meeting rooms, IP telephony and unified communication.',
    hero: 'Let the team work from anywhere without compromising call quality.',
    pains: ['Meeting room AV equipment is outdated', 'The phone system still runs on a legacy EPABX', 'Remote calls suffer quality issues'],
    children: [
      { slug: 'microsoft-teams', name: 'Microsoft Teams & Rooms', blurb: 'Teams voice, rooms and governance.',
        bullets: ['Teams Phone and direct routing', 'Meeting room device deployment', 'Governance and retention policies', 'Adoption training'] },
      { slug: 'ip-telephony', name: 'IP Telephony / VoIP', blurb: 'IP PBX, SIP trunks and call analytics.',
        bullets: ['IP PBX deployment', 'SIP trunk provisioning', 'Call recording and analytics', 'Legacy EPABX migration'] },
      { slug: 'video-conferencing', name: 'Video Conferencing', blurb: 'Boardroom and huddle room AV.',
        bullets: ['Camera and audio design matched to room size', 'Display and control systems', 'Cable management', 'Support and AMC'] },
    ],
  },
  {
    slug: 'physical-security',
    name: 'Surveillance',
    icon: 'camera',
    tag: 'CCTV · Access Control · Attendance',
    blurb: 'IP surveillance, access control and attendance in one integrated system.',
    hero: 'Physical and digital security from a single partner.',
    pains: ['CCTV footage retention is too short', 'Access control still runs on a paper register', 'Multiple vendors with no integration'],
    children: [
      { slug: 'ip-cctv', name: 'IP CCTV Surveillance', blurb: 'IP cameras, NVR and remote viewing.',
        bullets: ['Camera placement and coverage plan', 'NVR sizing for the required retention', 'Remote and mobile viewing', 'Video analytics options'] },
      { slug: 'access-control', name: 'Access Control', blurb: 'Card, biometric and mobile-based door access.',
        bullets: ['Door controller design', 'Biometric and RFID readers', 'Visitor management', 'Audit trail reporting'] },
      { slug: 'attendance-systems', name: 'Time & Attendance', blurb: 'Biometric attendance with HR and payroll integration.',
        bullets: ['Multi-location device sync', 'Shift and roster rules', 'Payroll export', 'Exception reports'] },
    ],
  },
];

export const findFamily = (slug) => solutionFamilies.find((f) => f.slug === slug);
export const findChild = (fam, slug) => findFamily(fam)?.children.find((c) => c.slug === slug);
export const allSolutionPages = solutionFamilies.flatMap((f) =>
  f.children.map((c) => ({ ...c, family: f.slug, familyName: f.name }))
);


/** Families shown in the Home hero orbit and solution card grids (Cyber Security is reached from the navbar menu). */
export const featuredFamilies = solutionFamilies.filter((f) => f.slug !== 'cyber-security');
