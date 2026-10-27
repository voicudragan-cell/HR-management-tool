export type UserRole = 'admin' | 'manager' | 'employee';

export type Department = 
  | 'Engineering'
  | 'Product & Design'
  | 'People & HR'
  | 'Sales & Marketing'
  | 'Finance & Operations';

export interface LeaveBalance {
  annual: number; // e.g. 20 total
  annualUsed: number;
  sick: number; // e.g. 10 total
  sickUsed: number;
  personal: number; // e.g. 5 total
  personalUsed: number;
  remoteUsed: number;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: Department;
  jobTitle: string;
  level: string; // 'L1 - Associate' | 'L2 - Specialist' | 'L3 - Senior' | 'L4 - Staff/Lead' | 'L5 - Director'
  avatarUrl: string;
  hireDate: string;
  managerId?: string;
  managerName?: string;
  status: 'active' | 'onboarding' | 'probation' | 'offboarding';
  salary: number; // annual USD
  location: string;
  leaveBalance: LeaveBalance;
  phone?: string;
  updatedAt?: string;
}

export interface OnboardingTask {
  id: string;
  employeeId: string;
  employeeName: string;
  department: Department;
  title: string;
  category: 'documentation' | 'it_setup' | 'compliance' | 'meet_team';
  status: 'pending' | 'in_progress' | 'completed';
  dueDate: string;
  completedAt?: string;
  assignedTo: string; // e.g. 'HR Operations', 'IT Helpdesk', 'Manager'
  notes?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: Department;
  leaveType: 'annual' | 'sick' | 'personal' | 'parental' | 'remote';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  comments?: string;
  createdAt: string;
}

export interface CompetencyScore {
  name: string;
  score: number; // 1 to 5
  comments?: string;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  department: Department;
  jobTitle: string;
  reviewerId: string;
  reviewerName: string;
  cycle: string; // e.g. "Q1 2026 Quarterly", "Mid-Year 2026", "90-Day Probationary"
  overallRating: number; // 1 to 5
  competencies: {
    jobKnowledge: number;
    communication: number;
    collaboration: number;
    problemSolving: number;
    leadership: number;
  };
  strengths: string;
  growthAreas: string;
  goals: string;
  selfReview?: string;
  status: 'draft' | 'self_submitted' | 'manager_reviewed' | 'finalized';
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: Department;
  period: string; // e.g. "March 2026"
  baseSalary: number; // monthly
  bonus: number;
  allowances: number;
  deductions: number;
  tax: number;
  netSalary: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'paid';
  paidAt?: string;
  paymentMethod: string;
}

export interface MobilityRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  currentTitle: string;
  proposedTitle: string;
  currentDepartment: Department;
  targetDepartment: Department;
  type: 'promotion' | 'internal_transfer' | 'lateral_mobility';
  salaryAdjustmentPercent: number; // e.g. 12%
  status: 'nominated' | 'under_review' | 'approved' | 'rejected';
  justification: string;
  managerNotes?: string;
  approvedBy?: string;
  effectiveDate: string;
  createdAt: string;
}

export interface InternalJobOpening {
  id: string;
  title: string;
  department: Department;
  level: string;
  location: string;
  type: 'Full-time' | 'Internal Transfer';
  openings: number;
  description: string;
  requirements: string[];
  postedDate: string;
}

export interface AppNotification {
  id: string;
  targetRole: 'all' | 'admin' | 'manager' | 'employee';
  targetUserId?: string;
  title: string;
  message: string;
  type: 'approval' | 'deadline' | 'onboarding' | 'promotion' | 'payroll';
  relatedTab?: string;
  read: boolean;
  createdAt: string;
}
