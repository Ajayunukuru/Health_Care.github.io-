import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

export default function PatientFlow() {
  const activePatients = useQuery(api.patients.getActivePatients);
  const departmentFlow = useQuery(api.dashboard.getDepartmentFlow);
  const addPatient = useMutation(api.patients.addPatient);
  const updateStatus = useMutation(api.patients.updatePatientStatus);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [newPatient, setNewPatient] = useState({
    name: "",
    age: "",
    symptoms: "",
    priority: "Medium"
  });

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addPatient({
        name: newPatient.name,
        age: parseInt(newPatient.age),
        symptoms: newPatient.symptoms.split(",").map(s => s.trim()),
        priority: newPatient.priority,
      });
      setNewPatient({ name: "", age: "", symptoms: "", priority: "Medium" });
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding patient:", error);
    }
  };

  const handleStatusUpdate = async (patientId: string, newStatus: string) => {
    try {
      await updateStatus({
        patientId,
        newStatus,
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  if (!activePatients || !departmentFlow) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statuses = ["Registration", "Waiting", "Consultation", "Diagnostics", "Treatment", "Billing"];

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Stats */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <h2 className="text-2xl font-bold mb-2">Patient Flow Management</h2>
            <p className="text-blue-100">Real-time patient tracking and workflow optimization</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
              <div className="text-2xl font-bold">{activePatients.length}</div>
              <div className="text-sm text-blue-100">Active Patients</div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-medium transition-colors"
            >
              + Add New Patient
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Flow Visualization */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center">
          <span className="mr-2">🔄</span>
          Patient Flow Pipeline
        </h3>
        <div className="overflow-x-auto">
          <div className="flex items-center space-x-4 min-w-max pb-4">
            {statuses.map((status, index) => {
              const patientsInStatus = activePatients.filter(p => p.currentStatus === status);
              const isActive = patientsInStatus.length > 0;
              
              return (
                <div key={status} className="flex items-center">
                  <div className={`relative px-6 py-4 rounded-xl border-2 transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300 shadow-md' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="text-center">
                      <div className={`text-sm font-medium mb-1 ${
                        isActive ? 'text-blue-900' : 'text-gray-600'
                      }`}>
                        {status}
                      </div>
                      <div className={`text-2xl font-bold ${
                        isActive ? 'text-blue-700' : 'text-gray-400'
                      }`}>
                        {patientsInStatus.length}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {patientsInStatus.length === 1 ? 'patient' : 'patients'}
                      </div>
                    </div>
                    
                    {/* Progress indicator */}
                    {isActive && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  
                  {index < statuses.length - 1 && (
                    <div className="flex items-center mx-2">
                      <div className={`w-8 h-0.5 ${
                        isActive ? 'bg-blue-400' : 'bg-gray-300'
                      }`}></div>
                      <div className={`ml-1 text-lg ${
                        isActive ? 'text-blue-400' : 'text-gray-300'
                      }`}>
                        →
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Enhanced Department Status */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center">
          <span className="mr-2">🏥</span>
          Department Status Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departmentFlow.map((dept) => (
            <div key={dept.department} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-900">{dept.department}</h4>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  dept.congestionLevel === "High" ? "bg-red-100 text-red-800" :
                  dept.congestionLevel === "Medium" ? "bg-yellow-100 text-yellow-800" :
                  "bg-green-100 text-green-800"
                }`}>
                  {dept.congestionLevel}
                </span>
              </div>
              <div className="text-center mb-3">
                <div className="text-3xl font-bold text-gray-900">{dept.totalPatients}</div>
                <div className="text-sm text-gray-600">Total Patients</div>
              </div>
              
              {/* Mini status breakdown */}
              <div className="space-y-1">
                {dept.statusBreakdown.filter(s => s.count > 0).map(status => (
                  <div key={status.status} className="flex justify-between text-xs">
                    <span className="text-gray-600">{status.status}:</span>
                    <span className="font-medium">{status.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Patient Details Grid */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold flex items-center">
            <span className="mr-2">👥</span>
            Active Patients ({activePatients.length})
          </h3>
          <div className="flex space-x-2">
            <button 
              onClick={() => setSelectedPatient(null)}
              className={`px-3 py-1 text-sm rounded-lg ${
                !selectedPatient ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Grid View
            </button>
            <button 
              className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Table View
            </button>
          </div>
        </div>

        {/* Patient Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {activePatients.slice(0, 12).map((patient) => (
            <div 
              key={patient._id} 
              className="border rounded-xl p-4 hover:shadow-md transition-all cursor-pointer"
              onClick={() => setSelectedPatient(patient)}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{patient.name}</h4>
                  <p className="text-sm text-gray-600">Age: {patient.age}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  patient.priority === "Critical" ? "bg-red-100 text-red-800" :
                  patient.priority === "High" ? "bg-orange-100 text-orange-800" :
                  patient.priority === "Medium" ? "bg-yellow-100 text-yellow-800" :
                  "bg-green-100 text-green-800"
                }`}>
                  {patient.priority}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-blue-600">{patient.currentStatus}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Department:</span>
                  <span className="font-medium">{patient.currentDepartment}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Wait Time:</span>
                  <span className="font-medium">{Math.round(patient.waitTime / (1000 * 60))} min</span>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t">
                <div className="text-xs text-gray-600 mb-1">Symptoms:</div>
                <div className="flex flex-wrap gap-1">
                  {patient.symptoms.map((symptom: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-3 pt-3 border-t">
                <select
                  value={patient.currentStatus}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleStatusUpdate(patient.patientId, e.target.value);
                  }}
                  className="w-full text-xs border rounded px-2 py-1 bg-white"
                  onClick={(e) => e.stopPropagation()}
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                  <option value="Discharge">Discharge</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        {/* Show more button if there are more patients */}
        {activePatients.length > 12 && (
          <div className="text-center">
            <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium">
              Show {activePatients.length - 12} more patients
            </button>
          </div>
        )}
      </div>

      {/* Enhanced Add Patient Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Add New Patient</h3>
              <button 
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleAddPatient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Name *
                </label>
                <input
                  type="text"
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter patient name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age *
                </label>
                <input
                  type="number"
                  value={newPatient.age}
                  onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter age"
                  min="0"
                  max="120"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Symptoms *
                </label>
                <input
                  type="text"
                  value={newPatient.symptoms}
                  onChange={(e) => setNewPatient({ ...newPatient, symptoms: e.target.value })}
                  placeholder="e.g., Fever, Headache, Cough"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple symptoms with commas</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Level
                </label>
                <select
                  value={newPatient.priority}
                  onChange={(e) => setNewPatient({ ...newPatient, priority: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                  <option value="Critical">Critical Priority</option>
                </select>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  Add Patient
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Patient Details</h3>
              <button 
                onClick={() => setSelectedPatient(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Patient Name</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedPatient.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Patient ID</label>
                  <p className="font-mono text-sm text-gray-700">{selectedPatient.patientId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Age</label>
                  <p className="text-gray-900">{selectedPatient.age} years</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Priority</label>
                  <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                    selectedPatient.priority === "Critical" ? "bg-red-100 text-red-800" :
                    selectedPatient.priority === "High" ? "bg-orange-100 text-orange-800" :
                    selectedPatient.priority === "Medium" ? "bg-yellow-100 text-yellow-800" :
                    "bg-green-100 text-green-800"
                  }`}>
                    {selectedPatient.priority}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Current Status</label>
                  <p className="text-blue-600 font-medium">{selectedPatient.currentStatus}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Department</label>
                  <p className="text-gray-900">{selectedPatient.currentDepartment}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Wait Time</label>
                  <p className="text-gray-900">{Math.round(selectedPatient.waitTime / (1000 * 60))} minutes</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Registration Time</label>
                  <p className="text-gray-900">{new Date(selectedPatient.registrationTime).toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <label className="text-sm font-medium text-gray-600">Symptoms</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedPatient.symptoms.map((symptom: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {symptom}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <label className="text-sm font-medium text-gray-600 block mb-2">Update Status</label>
              <select
                value={selectedPatient.currentStatus}
                onChange={(e) => handleStatusUpdate(selectedPatient.patientId, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
                <option value="Discharge">Discharge</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
