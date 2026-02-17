import { TrendingDown, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { complianceTrendData, severityBreakdown, topViolatedRules, sampleViolations } from '../data/mockData';

export function Dashboard() {
  const openViolations = sampleViolations.filter(v => v.status === 'open').length;
  const resolvedViolations = sampleViolations.filter(v => v.status === 'resolved').length;
  const totalViolations = sampleViolations.length;
  const complianceRate = Math.round(((247 - openViolations) / 247) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Compliance Dashboard</h1>
          <p className="text-gray-600">
            Real-time overview of your organization's compliance status
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Compliance Rate</p>
              <TrendingDown className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{complianceRate}%</p>
            <p className="text-xs text-green-600 mt-1">+2% from last week</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Open Violations</p>
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-orange-600">{openViolations}</p>
            <p className="text-xs text-gray-500 mt-1">Require review</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Resolved This Week</p>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600">{resolvedViolations}</p>
            <p className="text-xs text-gray-500 mt-1">93% resolution rate</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Active Policies</p>
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">6</p>
            <p className="text-xs text-gray-500 mt-1">Rules enforced</p>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Compliance Trend */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Compliance Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={complianceTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <Legend />
                <Line type="monotone" dataKey="violations" stroke="#f59e0b" name="Violations" strokeWidth={2} />
                <Line type="monotone" dataKey="resolved" stroke="#10b981" name="Resolved" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-sm text-gray-600 mt-4">
              Violations are trending down. Keep up the good work!
            </p>
          </Card>

          {/* Severity Breakdown */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Violations by Severity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={severityBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {severityBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-3 mt-4 justify-center">
              {severityBreakdown.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Top Violated Rules */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Most Violated Rules</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topViolatedRules} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="rule" width={150} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">New violation detected</p>
                  <p className="text-xs text-gray-600">Password expiration - EMP-1001</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Violation resolved</p>
                  <p className="text-xs text-gray-600">MFA requirement - EMP-1002</p>
                  <p className="text-xs text-gray-500">5 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Scan completed</p>
                  <p className="text-xs text-gray-600">Employee database - 247 records</p>
                  <p className="text-xs text-gray-500">8 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Policy updated</p>
                  <p className="text-xs text-gray-600">IT Security Policy 2026</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
            </div>
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
                  {sampleViolations.filter(v => v.status === 'open' && v.severity === 'critical').length > 0 && (
                    <span className="font-semibold"> Including {sampleViolations.filter(v => v.status === 'open' && v.severity === 'critical').length} critical issue{sampleViolations.filter(v => v.status === 'open' && v.severity === 'critical').length !== 1 ? 's' : ''}.</span>
                  )}
                </p>
                <a href="/review" className="text-sm text-red-700 underline hover:text-red-800">
                  Go to Review Queue →
                </a>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
