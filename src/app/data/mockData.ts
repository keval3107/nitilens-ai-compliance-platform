// Mock data for NitiLens application

export interface PolicyRule {
  id: string;
  description: string;
  condition: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  sourceReference: string;
  category: string;
  approved: boolean;
}

export interface Violation {
  id: string;
  recordId: string;
  ruleId: string;
  ruleName: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  explanation: string;
  evidence: Record<string, any>;
  status: 'open' | 'reviewed' | 'resolved' | 'false_positive';
  reviewerComment?: string;
  detectedAt: string;
  reviewedAt?: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  lastPasswordChange: string;
  accessLevel: string;
  lastLogin: string;
}

export const samplePolicies = [
  {
    id: 'pol-001',
    name: 'IT Security Policy 2026',
    uploadedAt: '2026-02-15T10:30:00Z',
    pages: 24,
    fileSize: '2.3 MB'
  },
  {
    id: 'pol-002',
    name: 'Data Privacy & Protection Policy',
    uploadedAt: '2026-01-20T14:15:00Z',
    pages: 18,
    fileSize: '1.8 MB'
  }
];

export const extractedRules: PolicyRule[] = [
  {
    id: 'rule-001',
    description: 'Password must be changed every 90 days',
    condition: 'days_since_password_change <= 90',
    severity: 'high',
    sourceReference: 'IT Security Policy, Section 3.2, Page 8',
    category: 'Access Control',
    approved: true
  },
  {
    id: 'rule-002',
    description: 'Admin access requires multi-factor authentication (MFA)',
    condition: 'access_level == "admin" AND mfa_enabled == true',
    severity: 'critical',
    sourceReference: 'IT Security Policy, Section 4.1, Page 12',
    category: 'Authentication',
    approved: true
  },
  {
    id: 'rule-003',
    description: 'Employees must complete security training within 30 days of hire',
    condition: 'days_since_hire <= 30 OR training_completed == true',
    severity: 'medium',
    sourceReference: 'IT Security Policy, Section 2.5, Page 6',
    category: 'Training & Awareness',
    approved: true
  },
  {
    id: 'rule-004',
    description: 'Access logs must be retained for at least 365 days',
    condition: 'log_retention_days >= 365',
    severity: 'high',
    sourceReference: 'Data Privacy Policy, Section 6.3, Page 14',
    category: 'Data Retention',
    approved: true
  },
  {
    id: 'rule-005',
    description: 'Inactive accounts must be disabled after 60 days of no activity',
    condition: 'days_since_last_login <= 60 OR account_status == "disabled"',
    severity: 'medium',
    sourceReference: 'IT Security Policy, Section 3.7, Page 10',
    category: 'Access Control',
    approved: true
  },
  {
    id: 'rule-006',
    description: 'Personal data access requires documented business justification',
    condition: 'accessing_pii == true AND justification_documented == true',
    severity: 'critical',
    sourceReference: 'Data Privacy Policy, Section 4.2, Page 9',
    category: 'Data Privacy',
    approved: true
  }
];

export const sampleEmployees: Employee[] = [
  {
    id: 'EMP-1001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    department: 'Engineering',
    lastPasswordChange: '2025-09-15',
    accessLevel: 'standard',
    lastLogin: '2026-02-16'
  },
  {
    id: 'EMP-1002',
    name: 'Michael Chen',
    email: 'michael.chen@company.com',
    department: 'IT Security',
    lastPasswordChange: '2026-01-20',
    accessLevel: 'admin',
    lastLogin: '2026-02-17'
  },
  {
    id: 'EMP-1003',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@company.com',
    department: 'Finance',
    lastPasswordChange: '2025-10-30',
    accessLevel: 'standard',
    lastLogin: '2026-02-15'
  },
  {
    id: 'EMP-1004',
    name: 'David Park',
    email: 'david.park@company.com',
    department: 'HR',
    lastPasswordChange: '2025-08-22',
    accessLevel: 'standard',
    lastLogin: '2025-12-10'
  },
  {
    id: 'EMP-1005',
    name: 'Lisa Thompson',
    email: 'lisa.thompson@company.com',
    department: 'Marketing',
    lastPasswordChange: '2026-02-01',
    accessLevel: 'standard',
    lastLogin: '2026-02-16'
  }
];

export const sampleViolations: Violation[] = [
  {
    id: 'viol-001',
    recordId: 'EMP-1001',
    ruleId: 'rule-001',
    ruleName: 'Password must be changed every 90 days',
    severity: 'high',
    explanation: "Sarah Johnson's password was last changed 155 days ago, exceeding the policy limit of 90 days.",
    evidence: {
      employeeName: 'Sarah Johnson',
      lastPasswordChange: '2025-09-15',
      daysSinceChange: 155,
      policyLimit: 90
    },
    status: 'open',
    detectedAt: '2026-02-17T08:30:00Z'
  },
  {
    id: 'viol-002',
    recordId: 'EMP-1003',
    ruleId: 'rule-001',
    ruleName: 'Password must be changed every 90 days',
    severity: 'high',
    explanation: "Emily Rodriguez's password was last changed 110 days ago, exceeding the policy limit of 90 days.",
    evidence: {
      employeeName: 'Emily Rodriguez',
      lastPasswordChange: '2025-10-30',
      daysSinceChange: 110,
      policyLimit: 90
    },
    status: 'reviewed',
    reviewerComment: 'User notified. Password reset scheduled.',
    detectedAt: '2026-02-17T08:30:00Z',
    reviewedAt: '2026-02-17T10:15:00Z'
  },
  {
    id: 'viol-003',
    recordId: 'EMP-1004',
    ruleId: 'rule-001',
    ruleName: 'Password must be changed every 90 days',
    severity: 'high',
    explanation: "David Park's password was last changed 179 days ago, exceeding the policy limit of 90 days.",
    evidence: {
      employeeName: 'David Park',
      lastPasswordChange: '2025-08-22',
      daysSinceChange: 179,
      policyLimit: 90
    },
    status: 'open',
    detectedAt: '2026-02-17T08:30:00Z'
  },
  {
    id: 'viol-004',
    recordId: 'EMP-1004',
    ruleId: 'rule-005',
    ruleName: 'Inactive accounts must be disabled after 60 days',
    severity: 'medium',
    explanation: "David Park's account has been inactive for 69 days, exceeding the policy limit of 60 days.",
    evidence: {
      employeeName: 'David Park',
      lastLogin: '2025-12-10',
      daysSinceLogin: 69,
      policyLimit: 60,
      accountStatus: 'active'
    },
    status: 'open',
    detectedAt: '2026-02-17T08:30:00Z'
  },
  {
    id: 'viol-005',
    recordId: 'EMP-1002',
    ruleId: 'rule-002',
    ruleName: 'Admin access requires multi-factor authentication',
    severity: 'critical',
    explanation: "Michael Chen has admin access level but MFA is not enabled on the account.",
    evidence: {
      employeeName: 'Michael Chen',
      accessLevel: 'admin',
      mfaEnabled: false,
      department: 'IT Security'
    },
    status: 'resolved',
    reviewerComment: 'MFA enabled. Compliance restored.',
    detectedAt: '2026-02-15T14:20:00Z',
    reviewedAt: '2026-02-16T09:30:00Z'
  }
];

// Compliance trend data for dashboard charts
export const complianceTrendData = [
  { date: '2026-01-01', violations: 12, resolved: 8 },
  { date: '2026-01-08', violations: 15, resolved: 10 },
  { date: '2026-01-15', violations: 18, resolved: 14 },
  { date: '2026-01-22', violations: 14, resolved: 11 },
  { date: '2026-01-29', violations: 10, resolved: 8 },
  { date: '2026-02-05', violations: 8, resolved: 6 },
  { date: '2026-02-12', violations: 6, resolved: 5 },
  { date: '2026-02-17', violations: 4, resolved: 1 }
];

export const severityBreakdown = [
  { name: 'Critical', value: 1, color: '#dc2626' },
  { name: 'High', value: 3, color: '#ea580c' },
  { name: 'Medium', value: 1, color: '#f59e0b' },
  { name: 'Low', value: 0, color: '#84cc16' }
];

export const topViolatedRules = [
  { rule: 'Password expiration', count: 8, trend: -2 },
  { rule: 'Inactive accounts', count: 5, trend: -1 },
  { rule: 'MFA requirement', count: 3, trend: -3 },
  { rule: 'Training completion', count: 2, trend: 0 },
  { rule: 'Access logging', count: 1, trend: 0 }
];
