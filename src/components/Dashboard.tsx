import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const metrics = useQuery(api.dashboard.getDashboardMetrics);
  const alerts = useQuery(api.dashboard.getRecentAlerts);
  const recommendations = useQuery(api.dashboard.getActiveRecommendations);
  const generateData = useMutation(api.simulation.generateSyntheticData);
  const generatePredictions = useMutation(api.simulation.generatePredictions);
  
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateData = async () => {
    setIsGenerating(true);
    try {
      await generateData();
      await generatePredictions();
    } catch (error) {
      console.error("Error generating data:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!metrics) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Demo Data Generator */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-blue-900">Demo Mode</h3>
            <p className="text-sm text-blue-700">
              Generate synthetic hospital data for demonstration
            </p>
          </div>
          <button
            onClick={handleGenerateData}
            disabled={isGenerating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isGenerating ? "Generating..." : "Generate Demo Data"}
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Patients"
          value={metrics.totalActivePatients}
          icon="👥"
          color="blue"
        />
        <MetricCard
          title="Avg Wait Time"
          value={`${metrics.averageWaitTime} min`}
          icon="⏱️"
          color="orange"
        />
        <MetricCard
          title="Patients/Hour"
          value={metrics.patientsServedPerHour}
          icon="🏃"
          color="green"
        />
        <MetricCard
          title="Staff Utilization"
          value={`${metrics.staffUtilization}%`}
          icon="👨‍⚕️"
          color="purple"
        />
      </div>

      {/* Department Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Department Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.departmentBreakdown.map((dept) => (
            <div key={dept.department} className="border rounded-lg p-4">
              <h4 className="font-medium text-gray-900">{dept.department}</h4>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Patients:</span>
                  <span className="font-medium">{dept.patientCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Avg Wait:</span>
                  <span className="font-medium">{dept.avgWaitTime} min</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Alerts</h3>
          <div className="space-y-3">
            {alerts && alerts.length > 0 ? (
              alerts.slice(0, 5).map((alert) => (
                <div
                  key={alert._id}
                  className={`p-3 rounded-lg border-l-4 ${
                    alert.severity === "Critical"
                      ? "bg-red-50 border-red-400"
                      : alert.severity === "Warning"
                      ? "bg-yellow-50 border-yellow-400"
                      : "bg-blue-50 border-blue-400"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{alert.type}</p>
                      <p className="text-sm text-gray-600">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {alert.department} • {new Date(alert.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        alert.severity === "Critical"
                          ? "bg-red-100 text-red-800"
                          : alert.severity === "Warning"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No recent alerts</p>
            )}
          </div>
        </div>

        {/* Active Recommendations */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Active Recommendations</h3>
          <div className="space-y-3">
            {recommendations && recommendations.length > 0 ? (
              recommendations.map((rec) => (
                <div key={rec._id} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm text-green-900">{rec.action}</p>
                      <p className="text-sm text-green-700">{rec.description}</p>
                      <p className="text-xs text-green-600 mt-1">
                        Impact: {rec.estimatedImpact}
                      </p>
                    </div>
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      {rec.priority}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No active recommendations</p>
            )}
          </div>
        </div>
      </div>

      {/* Resource Utilization */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Resource Utilization</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Staff Utilization</span>
              <span className="text-sm text-gray-600">{metrics.staffUtilization}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${metrics.staffUtilization}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Resource Utilization</span>
              <span className="text-sm text-gray-600">{metrics.resourceUtilization}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${metrics.resourceUtilization}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, color }: {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
    green: "bg-green-50 text-green-600 border-green-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
  };

  return (
    <div className={`p-6 rounded-lg border ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  );
}
