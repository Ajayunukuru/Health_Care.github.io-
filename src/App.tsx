import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import Dashboard from "./components/Dashboard";
import PatientFlow from "./components/PatientFlow";
import Predictions from "./components/Predictions";
import { useState } from "react";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
        <h2 className="text-xl font-semibold text-blue-600">Healthcare Operations Intelligence</h2>
        <SignOutButton />
      </header>
      <main className="flex-1 p-4">
        <Content />
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const [activeTab, setActiveTab] = useState("dashboard");

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Authenticated>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hospital Operations Dashboard
          </h1>
          <p className="text-gray-600">
            Real-time patient flow tracking, resource utilization, and predictive analytics
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "dashboard", label: "Dashboard", icon: "📊" },
              { id: "flow", label: "Patient Flow", icon: "🏥" },
              { id: "predictions", label: "Predictions", icon: "🔮" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "dashboard" && <Dashboard />}
          {activeTab === "flow" && <PatientFlow />}
          {activeTab === "predictions" && <Predictions />}
        </div>
      </Authenticated>

      <Unauthenticated>
        {/* Enhanced Sign-in Page Design */}
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
          <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Side - Branding and Features */}
            <div className="text-center lg:text-left space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                  <span>🏥</span>
                  <span>Healthcare Innovation</span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  Healthcare Operations
                  <span className="text-blue-600 block">Intelligence</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-lg">
                  Transform your hospital operations with AI-powered patient flow tracking, 
                  predictive analytics, and real-time decision support.
                </p>
              </div>

              {/* Feature Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                <div className="bg-white/60 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-sm">
                  <div className="text-3xl mb-3">🔄</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Real-time Flow Tracking</h3>
                  <p className="text-sm text-gray-600">
                    Monitor patient journey from registration to discharge with live updates
                  </p>
                </div>
                <div className="bg-white/60 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-sm">
                  <div className="text-3xl mb-3">📈</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Predictive Analytics</h3>
                  <p className="text-sm text-gray-600">
                    AI-powered bottleneck prediction and resource optimization
                  </p>
                </div>
                <div className="bg-white/60 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-sm">
                  <div className="text-3xl mb-3">⚡</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Smart Recommendations</h3>
                  <p className="text-sm text-gray-600">
                    Automated decision support for staff allocation and workflow
                  </p>
                </div>
                <div className="bg-white/60 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-sm">
                  <div className="text-3xl mb-3">📊</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Live Dashboard</h3>
                  <p className="text-sm text-gray-600">
                    Comprehensive metrics and KPIs for operational excellence
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-8 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">40%</div>
                  <div className="text-sm text-gray-600">Reduced Wait Times</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">25%</div>
                  <div className="text-sm text-gray-600">Improved Efficiency</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">90%</div>
                  <div className="text-sm text-gray-600">Prediction Accuracy</div>
                </div>
              </div>
            </div>

            {/* Right Side - Enhanced Sign-in Form */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-md">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                      <span className="text-2xl">🏥</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                    <p className="text-gray-600">Sign in to access your healthcare dashboard</p>
                  </div>
                  <SignInForm />
                  
                  {/* Demo Notice */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start space-x-3">
                      <div className="text-blue-500 mt-0.5">ℹ️</div>
                      <div>
                        <h4 className="text-sm font-medium text-blue-900">Demo Mode</h4>
                        <p className="text-xs text-blue-700 mt-1">
                          This is a demonstration system with synthetic data. 
                          Sign in anonymously to explore all features.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Unauthenticated>
    </div>
  );
}
