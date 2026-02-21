const API_BASE = 'http://localhost:8000/api';

export interface Dataset {
    id: string;
    name: string;
    description: string;
    license: string;
    source: string;
    columns: string[];
    connected: boolean;
}

export interface AMLStats {
    total_transactions: number;
    confirmed_laundering: number;
    laundering_percentage: number;
    avg_amount_paid: number;
    max_amount_paid: number;
    top_currencies: Record<string, number>;
    payment_formats: Record<string, number>;
    source: string;
}

export interface ComplianceSummary {
    total_transactions: number;
    total_scanned: number;
    total_violations: number;
    open_violations: number;
    resolved_violations: number;
    reviewed_violations: number;
    false_positives: number;
    compliance_rate: number | null;
    active_rules: number;
    severity_breakdown: {
        critical: number;
        high: number;
        medium: number;
        low: number;
    };
    most_violated_rules: Array<{
        rule_id: string;
        rule_name: string;
        violation_count: number;
    }>;
    trend_data: Array<{
        date: string;
        violations: number;
        compliance_rate: number;
    }>;
    last_scan_time: string | null;
    dataset_connected: boolean;
    dataset_laundering_rate: number;
}

export interface ActivityItem {
    type: 'violation_detected' | 'violation_reviewed';
    severity: 'critical' | 'high' | 'medium' | 'low';
    transaction_id: string;
    rule_name: string;
    timestamp: string;
    status: string;
    comment?: string;
}

export interface ActivityResponse {
    total: number;
    items: ActivityItem[];
}

export const api = {
    // Datasets
    async listDatasets(): Promise<Dataset[]> {
        const res = await fetch(`${API_BASE}/datasets`);
        return res.json();
    },

    async getAMLStats(): Promise<AMLStats> {
        const res = await fetch(`${API_BASE}/datasets/aml/stats`);
        if (!res.ok) throw new Error('Failed to fetch AML stats');
        return res.json();
    },

    async getAMLPreview(limit = 50): Promise<{ rows: any[]; count: number }> {
        const res = await fetch(`${API_BASE}/datasets/aml/preview?limit=${limit}`);
        return res.json();
    },

    // Compliance
    async triggerScan(): Promise<any> {
        const res = await fetch(`${API_BASE}/compliance/scan`, { method: 'POST' });
        return res.json();
    },

    async getComplianceSummary(): Promise<ComplianceSummary> {
        const res = await fetch(`${API_BASE}/compliance/summary`);
        if (!res.ok) throw new Error('Failed to fetch compliance summary');
        return res.json();
    },

    async getComplianceActivity(limit = 10): Promise<ActivityResponse> {
        const res = await fetch(`${API_BASE}/compliance/activity?limit=${limit}`);
        if (!res.ok) throw new Error('Failed to fetch compliance activity');
        return res.json();
    },

    async listViolations(status?: string): Promise<any> {
        const url = status
            ? `${API_BASE}/compliance/violations?status=${status}`
            : `${API_BASE}/compliance/violations`;
        const res = await fetch(url);
        return res.json();
    },

    // Reviews
    async submitReviewAction(violationId: string, action: 'resolve' | 'dismiss', comment: string): Promise<any> {
        const res = await fetch(`${API_BASE}/reviews/${violationId}/action`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, comment }),
        });
        return res.json();
    }
};
