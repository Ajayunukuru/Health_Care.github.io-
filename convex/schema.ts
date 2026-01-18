import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // Patient flow tracking
  patients: defineTable({
    patientId: v.string(),
    name: v.string(),
    age: v.number(),
    currentStatus: v.string(), // Registration, Waiting, Consultation, Diagnostics, Treatment, Billing, Discharge
    currentDepartment: v.string(),
    registrationTime: v.number(),
    estimatedDischargeTime: v.optional(v.number()),
    priority: v.string(), // Low, Medium, High, Critical
    symptoms: v.array(v.string()),
  })
    .index("by_status", ["currentStatus"])
    .index("by_department", ["currentDepartment"])
    .index("by_registration_time", ["registrationTime"]),

  // Patient status history for flow tracking
  patientStatusHistory: defineTable({
    patientId: v.string(),
    fromStatus: v.optional(v.string()),
    toStatus: v.string(),
    department: v.string(),
    timestamp: v.number(),
    duration: v.optional(v.number()), // Time spent in previous status
    staffId: v.optional(v.string()),
  })
    .index("by_patient", ["patientId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_department", ["department"]),

  // Staff and resource tracking
  staff: defineTable({
    staffId: v.string(),
    name: v.string(),
    role: v.string(), // Doctor, Nurse, Technician, Admin
    department: v.string(),
    status: v.string(), // Available, Busy, Overloaded, Off-duty
    currentPatientCount: v.number(),
    maxCapacity: v.number(),
    shiftStart: v.number(),
    shiftEnd: v.number(),
  })
    .index("by_department", ["department"])
    .index("by_status", ["status"]),

  // Room and resource utilization
  resources: defineTable({
    resourceId: v.string(),
    name: v.string(),
    type: v.string(), // OPD_Room, Lab, Bed, Equipment
    department: v.string(),
    status: v.string(), // Available, Occupied, Maintenance, Reserved
    currentPatientId: v.optional(v.string()),
    capacity: v.number(),
    utilizationRate: v.number(), // 0-100%
  })
    .index("by_department", ["department"])
    .index("by_type", ["type"])
    .index("by_status", ["status"]),

  // Department metrics and KPIs
  departmentMetrics: defineTable({
    department: v.string(),
    timestamp: v.number(),
    patientsWaiting: v.number(),
    averageWaitTime: v.number(),
    patientsServedPerHour: v.number(),
    occupancyRate: v.number(),
    staffUtilization: v.number(),
    congestionLevel: v.string(), // Low, Medium, High, Critical
  })
    .index("by_department", ["department"])
    .index("by_timestamp", ["timestamp"]),

  // Bottleneck predictions
  predictions: defineTable({
    department: v.string(),
    timestamp: v.number(),
    predictionType: v.string(), // queue_buildup, staff_overload, resource_saturation
    predictedValue: v.number(),
    confidence: v.number(),
    timeHorizon: v.number(), // Minutes ahead
    factors: v.array(v.string()),
  })
    .index("by_department", ["department"])
    .index("by_timestamp", ["timestamp"]),

  // Decision recommendations
  recommendations: defineTable({
    department: v.string(),
    timestamp: v.number(),
    type: v.string(), // staff_allocation, resource_reallocation, patient_redirect
    priority: v.string(), // Low, Medium, High, Critical
    action: v.string(),
    description: v.string(),
    estimatedImpact: v.string(),
    status: v.string(), // Pending, Implemented, Dismissed
    implementedAt: v.optional(v.number()),
  })
    .index("by_department", ["department"])
    .index("by_timestamp", ["timestamp"])
    .index("by_status", ["status"]),

  // System alerts and notifications
  alerts: defineTable({
    department: v.string(),
    timestamp: v.number(),
    severity: v.string(), // Info, Warning, Critical
    type: v.string(),
    message: v.string(),
    acknowledged: v.boolean(),
    acknowledgedBy: v.optional(v.string()),
    acknowledgedAt: v.optional(v.number()),
  })
    .index("by_department", ["department"])
    .index("by_timestamp", ["timestamp"])
    .index("by_severity", ["severity"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
