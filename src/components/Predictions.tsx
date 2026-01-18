import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

export default function Predictions() {
  const predictions = useQuery(api.dashboard.getBottleneckPredictions);
  const recommendations = useQuery(api.dashboard.getActiveRecommendations);
  const metrics = useQuery(api.dashboard.getDashboardMetrics);
  const [selectedTimeframe, setSelectedTimeframe] = useState("30");

  if (!predictions || !recommendations || !metrics) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center">
              <span className="mr-3">🔮</span>
              Predictive Analytics & Decision Support
            </h2>
            <p className="text-purple-100">AI-powered insights for proactive healthcare management</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <div className="text-sm text-purple-100">Prediction Accuracy</div>
              <div className="text-xl font-bold">87%</div>
            </div>
            <select 
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-3 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg border border-white/30"
            >
              <option value="15" className="text-gray-900">Next 15 min</option>
              <option value="30" className="text-gray-900">Next 30 min</option>
              <option value="60" className="text-gray-900">Next 1 hour</option>
            </select>
          </div>
        </div>
      </div>

      {/* Enhanced Prediction Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200 rounded-full -mr-10 -mt-10 opacity-50"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">📈</div>
              <div className="text-2xl font-bold text-blue-700">
                {predictions.filter(p => p.predictionType === "queue_buildup").length}
              </div>
            </div>
            <h3 className="text-lg font-semibold text-blue-900 mb-1">Queue Predictions</h3>
            <p className="text-sm text-blue-600">Active bottleneck alerts</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-200 rounded-full -mr-10 -mt-10 opacity-50"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">⚠️</div>
              <div className="text-2xl font-bold text-orange-700">
                {predictions.filter(p => p.predictionType === "staff_overload").length}
              </div>
            </div>
            <h3 className="text-lg font-semibold text-orange-900 mb-1">Staff Overload Risk</h3>
            <p className="text-sm text-orange-600">Departments at risk</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-200 rounded-full -mr-10 -mt-10 opacity-50"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">💡</div>
              <div className="text-2xl font-bold text-green-700">{recommendations.length}</div>
            </div>
            <h3 className="text-lg font-semibold text-green-900 mb-1">AI Recommendations</h3>
            <p className="text-sm text-green-600">Active suggestions</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-200 rounded-full -mr-10 -mt-10 opacity-50"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">🎯</div>
              <div className="text-2xl font-bold text-purple-700">
                {Math.round((predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length) * 100) || 0}%
              </div>
            </div>
            <h3 className="text-lg font-semibold text-purple-900 mb-1">Avg Confidence</h3>
            <p className="text-sm text-purple-600">Model reliability</p>
          </div>
        </div>
      </div>

      {/* Enhanced Predictions Timeline */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold flex items-center">
            <span className="mr-2">⏰</span>
            Bottleneck Predictions Timeline
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>High Risk</span>
            <div className="w-3 h-3 bg-yellow-500 rounded-full ml-4"></div>
            <span>Medium Risk</span>
            <div className="w-3 h-3 bg-green-500 rounded-full ml-4"></div>
            <span>Low Risk</span>
          </div>
        </div>
        
        {predictions.length > 0 ? (
          <div className="space-y-4">
            {predictions.map((prediction) => (
              <div key={prediction._id} className="relative">
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  {/* Timeline indicator */}
                  <div className="flex flex-col items-center">
                    <div className={`w-4 h-4 rounded-full ${
                      prediction.confidence > 0.8 ? "bg-red-500" :
                      prediction.confidence > 0.6 ? "bg-yellow-500" :
                      "bg-green-500"
                    }`}></div>
                    <div className="w-0.5 h-8 bg-gray-300 mt-2"></div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-semibold text-gray-900">{prediction.department}</h4>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          prediction.predictionType === "queue_buildup" ? "bg-blue-100 text-blue-800" :
                          prediction.predictionType === "staff_overload" ? "bg-red-100 text-red-800" :
                          "bg-yellow-100 text-yellow-800"
                        }`}>
                          {prediction.predictionType.replace("_", " ").toUpperCase()}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">in {prediction.timeHorizon} min</div>
                        <div className={`text-xs font-medium ${
                          prediction.confidence > 0.8 ? "text-red-600" :
                          prediction.confidence > 0.6 ? "text-yellow-600" :
                          "text-green-600"
                        }`}>
                          {Math.round(prediction.confidence * 100)}% confidence
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div className="bg-white p-3 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">Predicted Value</div>
                        <div className="text-lg font-bold text-gray-900">{prediction.predictedValue}</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">Time Horizon</div>
                        <div className="text-lg font-bold text-gray-900">{prediction.timeHorizon} min</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">Risk Level</div>
                        <div className={`text-lg font-bold ${
                          prediction.confidence > 0.8 ? "text-red-600" :
                          prediction.confidence > 0.6 ? "text-yellow-600" :
                          "text-green-600"
                        }`}>
                          {prediction.confidence > 0.8 ? "High" :
                           prediction.confidence > 0.6 ? "Medium" : "Low"}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-gray-600 mb-2">Contributing Factors:</div>
                      <div className="flex flex-wrap gap-2">
                        {prediction.factors.map((factor, index) => (
                          <span key={index} className="px-3 py-1 bg-white text-gray-700 text-xs rounded-full border">
                            {factor}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">All Clear!</h4>
            <p className="text-gray-600">No bottlenecks predicted in the next {selectedTimeframe} minutes</p>
            <p className="text-sm text-gray-500 mt-2">System is operating smoothly</p>
          </div>
        )}
      </div>

      {/* Enhanced AI Recommendations */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center">
          <span className="mr-2">🤖</span>
          AI-Powered Recommendations
        </h3>
        
        {recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div key={rec._id} className="border-l-4 border-green-400 bg-gradient-to-r from-green-50 to-transparent p-6 rounded-r-xl">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-sm">💡</span>
                      </div>
                      <h4 className="font-semibold text-green-900 text-lg">{rec.action}</h4>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        rec.priority === "Critical" ? "bg-red-100 text-red-800" :
                        rec.priority === "High" ? "bg-orange-100 text-orange-800" :
                        rec.priority === "Medium" ? "bg-yellow-100 text-yellow-800" :
                        "bg-green-100 text-green-800"
                      }`}>
                        {rec.priority} Priority
                      </span>
                    </div>
                    
                    <p className="text-green-800 mb-4 text-base">{rec.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-white/70 p-3 rounded-lg">
                        <div className="text-xs text-green-600 font-medium mb-1">Expected Impact</div>
                        <div className="text-sm text-green-800">{rec.estimatedImpact}</div>
                      </div>
                      <div className="bg-white/70 p-3 rounded-lg">
                        <div className="text-xs text-green-600 font-medium mb-1">Department</div>
                        <div className="text-sm text-green-800">{rec.department}</div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-green-600">
                      Type: {rec.type.replace("_", " ")} • Generated: {new Date(rec.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  
                  <div className="ml-6 flex flex-col space-y-2">
                    <button className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors font-medium">
                      Implement
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors">
                      Dismiss
                    </button>
                    <button className="px-4 py-2 bg-blue-100 text-blue-700 text-sm rounded-lg hover:bg-blue-200 transition-colors">
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">Optimal Performance</h4>
            <p className="text-gray-600">No immediate recommendations needed</p>
            <p className="text-sm text-gray-500 mt-2">All systems operating efficiently</p>
          </div>
        )}
      </div>

      {/* Enhanced What-If Simulation */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center">
          <span className="mr-2">🧪</span>
          What-If Scenario Analysis
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-lg">👨‍⚕️</span>
              </div>
              <h4 className="font-semibold text-blue-900">Add 2 Staff to OPD</h4>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white/70 rounded-lg">
                <span className="text-sm text-blue-800">Current Wait Time:</span>
                <span className="font-bold text-blue-900">{metrics.averageWaitTime} min</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/70 rounded-lg">
                <span className="text-sm text-blue-800">Predicted Wait Time:</span>
                <span className="font-bold text-green-600">{Math.max(5, metrics.averageWaitTime - 15)} min</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg">
                <span className="text-sm text-green-800">Improvement:</span>
                <span className="font-bold text-green-600">-{Math.min(15, metrics.averageWaitTime - 5)} min</span>
              </div>
            </div>
            
            <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Simulate Scenario
            </button>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-lg">🔬</span>
              </div>
              <h4 className="font-semibold text-purple-900">Open Additional Lab</h4>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white/70 rounded-lg">
                <span className="text-sm text-purple-800">Current Throughput:</span>
                <span className="font-bold text-purple-900">{metrics.patientsServedPerHour} patients/hr</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/70 rounded-lg">
                <span className="text-sm text-purple-800">Predicted Throughput:</span>
                <span className="font-bold text-green-600">{metrics.patientsServedPerHour + 8} patients/hr</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg">
                <span className="text-sm text-green-800">Improvement:</span>
                <span className="font-bold text-green-600">+8 patients/hr</span>
              </div>
            </div>
            
            <button className="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Simulate Scenario
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Model Performance Dashboard */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center">
          <span className="mr-2">📊</span>
          AI Model Performance Metrics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
            <div className="text-3xl font-bold text-blue-600 mb-2">87%</div>
            <div className="text-sm font-medium text-blue-800 mb-1">Overall Accuracy</div>
            <div className="text-xs text-blue-600">Last 30 days</div>
            <div className="mt-3 w-full bg-blue-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '87%' }}></div>
            </div>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
            <div className="text-3xl font-bold text-green-600 mb-2">92%</div>
            <div className="text-sm font-medium text-green-800 mb-1">Queue Prediction</div>
            <div className="text-xs text-green-600">Bottleneck detection</div>
            <div className="mt-3 w-full bg-green-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
            </div>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
            <div className="text-3xl font-bold text-orange-600 mb-2">84%</div>
            <div className="text-sm font-medium text-orange-800 mb-1">Staff Overload</div>
            <div className="text-xs text-orange-600">Resource prediction</div>
            <div className="mt-3 w-full bg-orange-200 rounded-full h-2">
              <div className="bg-orange-600 h-2 rounded-full" style={{ width: '84%' }}></div>
            </div>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
            <div className="text-3xl font-bold text-purple-600 mb-2">89%</div>
            <div className="text-sm font-medium text-purple-800 mb-1">Resource Utilization</div>
            <div className="text-xs text-purple-600">Efficiency optimization</div>
            <div className="mt-3 w-full bg-purple-200 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '89%' }}></div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Model last updated:</span>
            <span className="font-medium text-gray-900">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-600">Training data points:</span>
            <span className="font-medium text-gray-900">1.2M patient records</span>
          </div>
        </div>
      </div>
    </div>
  );
}
