import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Database, CheckCircle, ArrowRight, Table } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { sampleEmployees } from '../data/mockData';

export function DataConnection() {
  const navigate = useNavigate();
  const [selectedDataset, setSelectedDataset] = useState<string>('');
  const [mappingComplete, setMappingComplete] = useState(false);

  const datasets = [
    { id: 'employees', name: 'Employee Database', records: 247, tables: 3 },
    { id: 'access-logs', name: 'Access Logs', records: 15420, tables: 2 },
    { id: 'transactions', name: 'Transaction Records', records: 8934, tables: 4 }
  ];

  const handleSelectDataset = (datasetId: string) => {
    setSelectedDataset(datasetId);
    // Simulate field mapping
    setTimeout(() => {
      setMappingComplete(true);
    }, 1500);
  };

  const handleContinue = () => {
    navigate('/scan');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Connect Your Data</h1>
          <p className="text-gray-600">
            Select a dataset to scan for compliance violations
          </p>
        </div>

        {!selectedDataset && (
          <div className="grid md:grid-cols-3 gap-6">
            {datasets.map((dataset) => (
              <Card 
                key={dataset.id}
                className="p-6 cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all"
                onClick={() => handleSelectDataset(dataset.id)}
              >
                <Database className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{dataset.name}</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>{dataset.records.toLocaleString()} records</p>
                  <p>{dataset.tables} tables</p>
                </div>
                <Button className="w-full mt-4">
                  Select Dataset
                </Button>
              </Card>
            ))}
          </div>
        )}

        {selectedDataset && !mappingComplete && (
          <Card className="p-8">
            <div className="text-center">
              <Database className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-pulse" />
              <h2 className="text-2xl font-bold mb-2">Connecting to Employee Database...</h2>
              <p className="text-gray-600">Mapping policy fields to database columns</p>
            </div>
          </Card>
        )}

        {selectedDataset && mappingComplete && (
          <div className="space-y-6">
            <Card className="p-6 bg-green-50 border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">Connection Successful</h3>
                  <p className="text-sm text-green-700">
                    Connected to Employee Database with {sampleEmployees.length} active records
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Field Mapping Preview</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Policy Field</p>
                  <div className="space-y-2">
                    <div className="p-2 bg-blue-50 rounded text-sm">employee_id</div>
                    <div className="p-2 bg-blue-50 rounded text-sm">last_password_change</div>
                    <div className="p-2 bg-blue-50 rounded text-sm">access_level</div>
                    <div className="p-2 bg-blue-50 rounded text-sm">last_login</div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Database Column</p>
                  <div className="space-y-2">
                    <div className="p-2 bg-green-50 border border-green-200 rounded text-sm flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" /> employees.id
                    </div>
                    <div className="p-2 bg-green-50 border border-green-200 rounded text-sm flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" /> employees.lastPasswordChange
                    </div>
                    <div className="p-2 bg-green-50 border border-green-200 rounded text-sm flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" /> employees.accessLevel
                    </div>
                    <div className="p-2 bg-green-50 border border-green-200 rounded text-sm flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" /> employees.lastLogin
                    </div>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <h4 className="font-medium flex items-center gap-2">
                    <Table className="w-4 h-4" />
                    Data Preview
                  </h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left">ID</th>
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Department</th>
                        <th className="px-4 py-2 text-left">Access Level</th>
                        <th className="px-4 py-2 text-left">Last Login</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sampleEmployees.slice(0, 3).map((emp) => (
                        <tr key={emp.id} className="border-t">
                          <td className="px-4 py-2">{emp.id}</td>
                          <td className="px-4 py-2">{emp.name}</td>
                          <td className="px-4 py-2">{emp.department}</td>
                          <td className="px-4 py-2">{emp.accessLevel}</td>
                          <td className="px-4 py-2">{emp.lastLogin}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={handleContinue} size="lg">
                  Continue to Scan
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
