import {
  Employee,
  OnboardingTask,
  OnboardingCategory,
  LeaveRequest,
  PerformanceReview,
  PayrollRecord,
  MobilityRecord,
  CareerLevel,
  InternalJobOpening,
  AppNotification
} from '../types/hr';

// Clean slate: Only current real employee/admin (Voicu Dragan), no old or example employees
export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-voicu',
    name: 'Voicu Dragan',
    email: 'voicu.dragan@interqas.com',
    role: 'admin',
    department: 'People & HR',
    jobTitle: 'Chief People Officer & HR Director',
    level: 'L5 - Director',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    hireDate: '2024-01-15',
    status: 'active',
    salary: 165000,
    location: 'San Francisco, CA (HQ)',
    phone: '+1 (415) 555-0192',
    leaveBalance: {
      annual: 25,
      annualUsed: 0,
      sick: 12,
      sickUsed: 0,
      personal: 5,
      personalUsed: 0,
      remoteUsed: 0,
    },
  },
];

// Dynamic Onboarding Categories with attached policy & agreement documents
export const INITIAL_ONBOARDING_CATEGORIES: OnboardingCategory[] = [
  {
    id: 'cat-doc',
    name: 'Documentation & Agreements',
    description: 'Employment contracts, tax compliance forms, and confidentiality agreements.',
    color: 'blue',
    icon: 'FileCheck',
    createdAt: '2026-01-01',
    attachedDocuments: [
      {
        id: 'doc-nda-01',
        title: 'NexusHR Proprietary Information & Confidentiality Agreement',
        fileName: 'Confidentiality_Agreement_v2.pdf',
        description: 'Mandatory non-disclosure agreement governing company proprietary assets and client data.',
        requiredComprehension: true,
        content: `NEXUSHR ENTERPRISE CONFIDENTIALITY & PROPRIETARY INFORMATION AGREEMENT

1. PURPOSE & SCOPE
As an employee of NexusHR, you will have access to confidential, proprietary, and trade secret information relating to company operations, technical codebases, employee personal data, and business strategies. This agreement protects all such proprietary assets.

2. DEFINITION OF CONFIDENTIAL INFORMATION
Confidential Information includes, without limitation:
- All source code, product roadmaps, architectural diagrams, and algorithmic implementations.
- Employee personally identifiable information (PII), compensation structures, and personnel records.
- Financial metrics, customer lists, pricing proposals, and contract negotiations.

3. OBLIGATIONS & NON-DISCLOSURE
You agree to maintain the strictest confidentiality regarding all company assets during and after your employment. You shall not copy, disclose, or distribute any proprietary materials to unauthorized third parties without prior written consent from Executive Leadership.

4. RETURN OF ASSETS
Upon conclusion of employment, all corporate computing equipment, credentials, cryptographic keys, and internal documents must be returned immediately to IT Helpdesk.

By checking "I confirm comprehension" below, you acknowledge having thoroughly read, understood, and agreed to be legally bound by this agreement.`,
      },
      {
        id: 'doc-deposit-02',
        title: 'Payroll Direct Deposit & Tax Withholding Declaration',
        fileName: 'Direct_Deposit_Authorization.pdf',
        description: 'Instructions and verification protocol for automated bank wage disbursement.',
        requiredComprehension: true,
        content: `DIRECT DEPOSIT WAGE AUTHORIZATION PROTOCOL

1. DIRECT DEPOSIT ENROLLMENT
All staff salaries and discretionary bonuses are disbursed electronically on the final business day of each calendar month. 

2. VERIFICATION REQUIREMENTS
Employees must verify:
- Routing Transit Number (ABA 9-digit code)
- Account Number & Bank Name
- Tax Withholding Allowances (IRS W-4 standard)

3. SECURITY NOTICE
NexusHR will never request password verification for your personal financial institutions. All bank data in Firestore is secured with Attribute-Based Access Control (ABAC).`,
      },
    ],
  },
  {
    id: 'cat-it',
    name: 'IT & Hardware Setup',
    description: 'Workstation provisioning, multi-factor authentication, and developer credential keys.',
    color: 'purple',
    icon: 'Laptop',
    createdAt: '2026-01-01',
    attachedDocuments: [
      {
        id: 'doc-it-sec',
        title: 'IT Hardware & Acceptable Computing Use Policy',
        fileName: 'IT_Hardware_Policy_2026.pdf',
        description: 'Protocols for corporate laptops, YubiKey multi-factor tokens, and VPN tunnels.',
        requiredComprehension: true,
        content: `IT INFRASTRUCTURE & HARDWARE SECURITY PROTOCOLS

1. HARDWARE PROVISIONING
All staff are equipped with encrypted workstations (FileVault/BitLocker enforced) and hardware 2FA keys.

2. SECURITY REQUIREMENTS
- Password complexity: Minimum 16 characters or passkey credentials.
- Automatic screen lock after 5 minutes of inactivity.
- Public Wi-Fi access requires active WireGuard / Corporate VPN tunneling.
- Storing unencrypted client data on local drives is strictly prohibited.

3. LOST OR COMPROMISED DEVICES
Any misplaced or compromised corporate device must be reported immediately to security@nexushr.corp within 2 hours for remote wipe initiation.`,
      },
    ],
  },
  {
    id: 'cat-comp',
    name: 'Compliance & SOC2 Security',
    description: 'SOC2 Type II protocols, GDPR data rights, and annual ethics training.',
    color: 'emerald',
    icon: 'ShieldCheck',
    createdAt: '2026-01-01',
    attachedDocuments: [
      {
        id: 'doc-soc2-gdpr',
        title: 'SOC2 Type II & GDPR Data Privacy Standard Operating Procedures',
        fileName: 'SOC2_GDPR_Compliance_Manual.pdf',
        description: 'Mandatory guidelines for handling personal data and maintaining SOC2 certification.',
        requiredComprehension: true,
        content: `SOC2 TYPE II & DATA PRIVACY COMPLIANCE CODE

1. PRINCIPLE OF LEAST PRIVILEGE
Access to production databases, cloud environments, and sensitive HR records is strictly restricted based on verified business necessity.

2. PRIVACY REGULATIONS (GDPR & CCPA)
NexusHR processes personal data strictly in accordance with global data protection laws:
- Right of Access: Data subjects may request copies of their stored information.
- Right of Erasure: Automated deletion workflows must be respected.
- Breach Notification: Any unauthorized data exposure triggers mandatory 72-hour reporting.

3. ANNUAL RECERTIFICATION
All team members must complete annual refresher modules in anti-phishing defense and secure coding practices.`,
      },
    ],
  },
  {
    id: 'cat-team',
    name: 'Team Orientation & Culture',
    description: 'Buddy introductions, executive 1:1 sessions, and company handbook.',
    color: 'amber',
    icon: 'Users2',
    createdAt: '2026-01-01',
    attachedDocuments: [
      {
        id: 'doc-handbook',
        title: 'NexusHR Team Culture & Employee Playbook',
        fileName: 'NexusHR_Employee_Handbook_2026.pdf',
        description: 'Core values, flexible remote work policies, and professional development support.',
        requiredComprehension: true,
        content: `WELCOME TO NEXUSHR — THE TEAM PLAYBOOK

1. OUR CORE VALUES
- Transparency First: Default to open communication across squads and departments.
- Ownership & Velocity: Empowering every contributor to make high-impact decisions.
- Psychological Safety: Fostering curiosity, constructive feedback, and continuous learning.

2. TIME-OFF & RECHARGE
We believe sustainable high performance requires rest. Our generous leave policies include:
- Annual Vacation: 20–25 days depending on tenure.
- Unlimited Sick & Medical recovery time.
- Flexible Remote Work from any authorized jurisdiction.

3. PROFESSIONAL GROWTH
Every team member has an annual €2,500 learning stipend for conferences, books, and technical certifications.`,
      },
    ],
  },
];

export const INITIAL_CAREER_LEVELS: CareerLevel[] = [
  {
    id: 'lvl-l1',
    level: 'L1',
    title: 'Associate / Entry',
    scope: 'Individual contributor executing defined deliverables under mentorship with high attention to quality standards.',
    promotionCriteria: 'Consistent delivery, adherence to team standards, and solid domain basics.',
    salaryBand: '€45,000 - €60,000',
    currency: 'EUR',
  },
  {
    id: 'lvl-l2',
    level: 'L2',
    title: 'Specialist / Intermediate',
    scope: 'Autonomous execution of complex functional deliverables, independently scoping features and testing.',
    promotionCriteria: 'Delivering end-to-end projects without continuous supervision, participating in peer reviews.',
    salaryBand: '€60,000 - €80,000',
    currency: 'EUR',
  },
  {
    id: 'lvl-l3',
    level: 'L3',
    title: 'Senior Practitioner',
    scope: 'Subject matter expert driving architecture, unblocking junior peers, and collaborating cross-squad.',
    promotionCriteria: 'Cross-functional technical influence, proven mentorship of team members, flawless production quality.',
    salaryBand: '€80,000 - €105,000',
    currency: 'EUR',
  },
  {
    id: 'lvl-l4',
    level: 'L4',
    title: 'Staff / Practice Lead',
    scope: 'Strategic organizational pillar leading design systems, high-scale infrastructure, or department revenue targets.',
    promotionCriteria: 'Organizational-wide impact, executive alignment, driving standards adopted across entire organization.',
    salaryBand: '€105,000 - €140,000',
    currency: 'EUR',
  },
  {
    id: 'lvl-l5',
    level: 'L5',
    title: 'Director / Executive',
    scope: 'Strategic leadership, talent development, organizational budgets, and executive OKR accountability.',
    promotionCriteria: 'Demonstrated business growth, organizational culture leadership, and executive consensus building.',
    salaryBand: '€140,000 - €210,000+',
    currency: 'EUR',
  },
];

// Blank start: No open items, no old items
export const INITIAL_ONBOARDING_TASKS: OnboardingTask[] = [];
export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [];
export const INITIAL_PERFORMANCE_REVIEWS: PerformanceReview[] = [];
export const INITIAL_PAYROLL_RECORDS: PayrollRecord[] = [];
export const INITIAL_MOBILITY_RECORDS: MobilityRecord[] = [];
export const INITIAL_JOB_OPENINGS: InternalJobOpening[] = [];
export const INITIAL_NOTIFICATIONS: AppNotification[] = [];

