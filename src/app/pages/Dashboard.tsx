import { useState, useEffect } from 'react';
import { TrendingDown, TrendingUp, AlertTriangle, FileText, Activity, Loader2, RefreshCw } from 'lucide-react';
import { Card } from '../components/ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { api, type ComplianceSummary, type ActivityResponse } from '../services/api';

const SEVERITY_COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#f59e0b',
  low: '#10b981'
};

export function Dashboard() {
  const [data, setData] = useState<ComplianceSummary | null>(null);
  const [activity, setActivity] = useState<ActivityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [summaryData, activityData] = await Promise.all([
        api.getComplianceSummary(),
        api.getComplianceActivity(10)
      ]);
      setData(summaryData);
      setActivity(activityData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading compliance dashboard...</p>
        </div>
      </div>
    );
  }

  // Empty state: no dataset connected
  if (!data?.dataset_connected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Dataset Connected</h2>
          <p className="text-gray-600 mb-6">
            Connect a transaction dataset to start compliance monitoring.
          </p>
          <a
            href="/data-connection"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Connect Dataset
          </a>
        </Card>
      </div>
    );
  }

  // Empty state: no scans performed
  if (data.compliance_rate === null || data.total_scanned === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Compliance Dashboard</h1>
            <p className="text-gray-600">Real-time overview of your organization's compliance status</p>
          </div>
          <Card className="p-8 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Scans Performed Yet</h2>
            <p className="text-gray-600 mb-6">
              Run your first compliance scan to analyze {data.total_transactions} transactions.
            </p>
            <a
              href="/compliance-scan"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Run Compliance Scan
            </a>
          </Card>
        </div>
      </div>
    );
  }

  const complianceRate = data.compliance_rate;
  const openViolations = data.open_violations;
  const totalSeverityViolations = Object.values(data.severity_breakdown).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Compliance Dashboard</h1>
            <p className="text-gray-600">
              Real-time overview of your organization's compliance status
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Transactions Scanned</p>
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{data.total_scanned.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">IBM AML dataset</p>
          </Card>

          <Card className={`p-6 ${complianceRate >= 95 ? 'bg-green-50 border-green-200' : complianceRate >= 80 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Compliance Rate</p>
              {complianceRate >= 95 ? (
                <TrendingUp className="w-5 h-5 text-green-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-600" />
              )}
            </div>
            <p className={`text-3xl font-bold ${complianceRate >= 95 ? 'text-green-900' : complianceRate >= 80 ? 'text-yellow-900' : 'text-red-900'}`}>
              {complianceRate.toFixed(2)}%
            </p>
            <p className={`text-xs mt-1 ${complianceRate >= 95 ? 'text-green-600' : 'text-gray-500'}`}>
              Target: &gt;95%
            </p>
          </Card>

          <Card className={`p-6 ${openViolations > 0 ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Open Violations</p>
              <AlertTriangle className={`w-5 h-5 ${openViolations > 0 ? 'text-orange-600' : 'text-green-600'}`} />
            </div>
            <p className={`text-3xl font-bold ${openViolations > 0 ? 'text-orange-600' : 'text-green-600'}`}>
              {openViolations}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {openViolations > 0 ? 'Require review' : 'All clear'}
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Active AML Rules</p>
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{data.active_rules}</p>
            <p className="text-xs text-gray-500 mt-1">Approved rules applied</p>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Compliance Trend */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Compliance Trend</h3>
            {data.trend_data.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.trend_data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="violations" stroke="#f59e0b" name="Violations" strokeWidth={2} />
                  <Line type="monotone" dataKey="compliance_rate" stroke="#10b981" name="Compliance Rate (%)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <p>No scan history available</p>
              </div>
            )}
          </Card>

          {/* Severity Breakdown */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Violations by Severity</h3>
            {totalSeverityViolations > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(data.severity_breakdown)
                      .filter(([_, value]) => value > 0)
                      .map(([name, value]) => ({
                        name: name.charAt(0).toUpperCase() + name.slice(1),
                        value,
                        color: SEVERITY_COLORS[name as keyof typeof SEVERITY_COLORS]
                      }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {Object.entries(data.severity_breakdown)
                      .filter(([_, value]) => value > 0)
                      .map(([name], index) => (
                        <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[name as keyof typeof SEVERITY_COLORS]} />
                      ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <p className="text-green-600 font-semibold mb-2">No Open Violations</p>
                  <p className="text-sm">All transactions are compliant</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Top Violated Rules & Recent Activity */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Most Violated Rules</h3>
            {data.most_violated_rules.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.most_violated_rules} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="rule_name" width={200} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="violation_count" fill="#3b82f6" name="Violations" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <p>No violations detected</p>
              </div>
            )}
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            {activity && activity.items.length > 0 ? (
              <div className="space-y-4 max-h-[300px] overflow-y-auto">
                {activity.items.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 flex-shrink-0`}
                      style={{
                        backgroundColor: item.type === 'violation_detected'
                          ? SEVERITY_COLORS[item.severity]
                          : item.status === 'resolved'
                          ? '#10b981'
                          : '#6b7280'
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.type === 'violation_detected' ? `${item.severity.charAt(0).toUpperCase() + item.severity.slice(1)} violation detected` : 'Violation reviewed'}
                      </p>
                      <p className="text-xs text-gray-600 truncate" title={`${item.transaction_id}: ${item.rule_name}`}>
                        {item.transaction_id}: {item.rule_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(item.timestamp).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <p>No recent compliance activity</p>
              </div>
            )}
          </Card>
        </div>

        {/* Critical Alerts */}
        {openViolations > 0 && (
          <Card className="p-6 mt-6 bg-red-50 border-red-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-1">Action Required</h3>
                <p className="text-sm text-red-800 mb-3">
                  You have {openViolations} open violation{openViolations !== 1 ? 's' : ''} requiring immediate attention.
                  {data.severity_breakdown.critical > 0 && (
                    <span className="font-semibold"> Including {data.severity_breakdown.critical} critical issue{data.severity_breakdown.critical !== 1 ? 's' : ''}.</span>
                  )}
                </p>
                <a href="/review" className="text-sm text-red-700 underline hover:text-red-800">
                  Go to Review Queue →
                </a>
              </div>
            </div>
          </Card>
        )}

        {/* Last Scan Info */}
        {data.last_scan_time && (
          <div className="mt-4 text-center text-sm text-gray-500">
            Last scan: {new Date(data.last_scan_time).toLocaleString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            })}
          </div>
        )}
      </div>
    </div>
  );
}
