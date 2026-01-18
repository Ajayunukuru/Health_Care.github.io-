import { mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Generate synthetic hospital data for demo
export const generateSyntheticData = mutation({
  args: {},
  handler: async (ctx) => {
    const departments = ["Reception", "OPD", "Laboratory", "Radiology", "Pharmacy", "Billing"];
    const statuses = ["Registration", "Waiting", "Consultation", "Diagnostics", "Treatment", "Billing"];
    const priorities = ["Low", "Medium", "High", "Critical"];
    const symptoms = [
      "Fever", "Headache", "Chest Pain", "Shortness of Breath", "Abdominal Pain",
      "Back Pain", "Nausea", "Dizziness", "Fatigue", "Cough"
    ];

    // Clear existing data
    const existingPatients = await ctx.db.query("patients").collect();
    for (const patient of existingPatients) {
      await ctx.db.delete(patient._id);
    }

    const existingHistory = await ctx.db.query("patientStatusHistory").collect();
    for (const history of existingHistory) {
      await ctx.db.delete(history._id);
    }

    // Generate patients
    const patientCount = 25 + Math.floor(Math.random() * 15); // 25-40 patients
    const now = Date.now();

    for (let i = 0; i < patientCount; i++) {
      const patientId = `P${now}${i.toString().padStart(3, '0')}`;
      const registrationTime = now - Math.floor(Math.random() * 4 * 60 * 60 * 1000); // Last 4 hours
      const currentStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const currentDepartment = departments[Math.floor(Math.random() * departments.length)];
      
      await ctx.db.insert("patients", {
        patientId,
        name: `Patient ${i + 1}`,
        age: 20 + Math.floor(Math.random() * 60),
        currentStatus,
        currentDepartment,
        registrationTime,
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        symptoms: [symptoms[Math.floor(Math.random() * symptoms.length)]],
      });

      // Generate status history
      await ctx.db.insert("patientStatusHistory", {
        patientId,
        toStatus: "Registration",
        department: "Reception",
        timestamp: registrationTime,
      });

      if (currentStatus !== "Registration") {
        await ctx.db.insert("patientStatusHistory", {
          patientId,
          fromStatus: "Registration",
          toStatus: currentStatus,
          department: currentDepartment,
          timestamp: registrationTime + Math.floor(Math.random() * 60 * 60 * 1000),
          duration: Math.floor(Math.random() * 30 * 60 * 1000), // 0-30 minutes
        });
      }
    }

    // Generate staff data
    const existingStaff = await ctx.db.query("staff").collect();
    for (const staff of existingStaff) {
      await ctx.db.delete(staff._id);
    }

    const roles = ["Doctor", "Nurse", "Technician", "Admin"];
    const staffStatuses = ["Available", "Busy", "Overloaded", "Off-duty"];

    for (let i = 0; i < 20; i++) {
      await ctx.db.insert("staff", {
        staffId: `S${i.toString().padStart(3, '0')}`,
        name: `Staff Member ${i + 1}`,
        role: roles[Math.floor(Math.random() * roles.length)],
        department: departments[Math.floor(Math.random() * departments.length)],
        status: staffStatuses[Math.floor(Math.random() * staffStatuses.length)],
        currentPatientCount: Math.floor(Math.random() * 5),
        maxCapacity: 3 + Math.floor(Math.random() * 3),
        shiftStart: now - (8 * 60 * 60 * 1000),
        shiftEnd: now + (4 * 60 * 60 * 1000),
      });
    }

    // Generate resource data
    const existingResources = await ctx.db.query("resources").collect();
    for (const resource of existingResources) {
      await ctx.db.delete(resource._id);
    }

    const resourceTypes = ["OPD_Room", "Lab", "Bed", "Equipment"];
    const resourceStatuses = ["Available", "Occupied", "Maintenance", "Reserved"];

    for (let i = 0; i < 15; i++) {
      await ctx.db.insert("resources", {
        resourceId: `R${i.toString().padStart(3, '0')}`,
        name: `Resource ${i + 1}`,
        type: resourceTypes[Math.floor(Math.random() * resourceTypes.length)],
        department: departments[Math.floor(Math.random() * departments.length)],
        status: resourceStatuses[Math.floor(Math.random() * resourceStatuses.length)],
        capacity: 1 + Math.floor(Math.random() * 4),
        utilizationRate: Math.floor(Math.random() * 100),
      });
    }

    return { success: true, message: "Synthetic data generated successfully" };
  },
});

// Generate predictions and recommendations
export const generatePredictions = mutation({
  args: {},
  handler: async (ctx) => {
    const departments = ["Reception", "OPD", "Laboratory", "Radiology", "Pharmacy", "Billing"];
    const now = Date.now();

    // Clear existing predictions and recommendations
    const existingPredictions = await ctx.db.query("predictions").collect();
    for (const prediction of existingPredictions) {
      await ctx.db.delete(prediction._id);
    }

    const existingRecommendations = await ctx.db.query("recommendations").collect();
    for (const recommendation of existingRecommendations) {
      await ctx.db.delete(recommendation._id);
    }

    // Generate predictions for next 30 minutes
    for (const dept of departments) {
      const patients = await ctx.db
        .query("patients")
        .withIndex("by_department", (q) => q.eq("currentDepartment", dept))
        .collect();

      const currentLoad = patients.length;
      
      // Queue buildup prediction
      if (currentLoad > 5) {
        await ctx.db.insert("predictions", {
          department: dept,
          timestamp: now + (15 * 60 * 1000), // 15 minutes from now
          predictionType: "queue_buildup",
          predictedValue: currentLoad + Math.floor(Math.random() * 5),
          confidence: 0.7 + Math.random() * 0.2,
          timeHorizon: 15,
          factors: ["High patient volume", "Limited staff availability"],
        });

        // Generate recommendation
        const actions = [
          "Open additional consultation room",
          "Call backup staff",
          "Redirect non-urgent patients",
          "Implement fast-track for simple cases"
        ];

        await ctx.db.insert("recommendations", {
          department: dept,
          timestamp: now,
          type: "staff_allocation",
          priority: currentLoad > 8 ? "High" : "Medium",
          action: actions[Math.floor(Math.random() * actions.length)],
          description: `${dept} is experiencing high patient volume. Immediate action recommended.`,
          estimatedImpact: "Reduce wait time by 15-20 minutes",
          status: "Pending",
        });
      }

      // Staff overload prediction
      const staff = await ctx.db
        .query("staff")
        .withIndex("by_department", (q) => q.eq("department", dept))
        .collect();

      const overloadedStaff = staff.filter(s => s.status === "Overloaded").length;
      if (overloadedStaff > 0) {
        await ctx.db.insert("predictions", {
          department: dept,
          timestamp: now + (20 * 60 * 1000),
          predictionType: "staff_overload",
          predictedValue: overloadedStaff + 1,
          confidence: 0.8,
          timeHorizon: 20,
          factors: ["Current staff overload", "Increasing patient arrivals"],
        });
      }
    }

    // Generate some alerts
    const existingAlerts = await ctx.db.query("alerts").collect();
    for (const alert of existingAlerts) {
      await ctx.db.delete(alert._id);
    }

    const alertTypes = ["High Wait Time", "Staff Shortage", "Equipment Maintenance", "System Update"];
    const severities = ["Info", "Warning", "Critical"];

    for (let i = 0; i < 5; i++) {
      await ctx.db.insert("alerts", {
        department: departments[Math.floor(Math.random() * departments.length)],
        timestamp: now - Math.floor(Math.random() * 60 * 60 * 1000),
        severity: severities[Math.floor(Math.random() * severities.length)],
        type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
        message: `Alert ${i + 1}: System notification for operational awareness`,
        acknowledged: Math.random() > 0.5,
      });
    }

    return { success: true, message: "Predictions and recommendations generated" };
  },
});

// Simulate patient flow (for demo purposes)
export const simulatePatientFlow = action({
  args: {},
  handler: async (ctx) => {
    // This would run periodically to simulate real-time patient movement
    const patients = await ctx.runQuery(api.patients.getActivePatients);
    
    for (const patient of patients.slice(0, 3)) { // Update a few patients
      const statuses = ["Registration", "Waiting", "Consultation", "Diagnostics", "Treatment", "Billing", "Discharge"];
      const currentIndex = statuses.indexOf(patient.currentStatus);
      
      if (currentIndex < statuses.length - 1 && Math.random() > 0.7) {
        const nextStatus = statuses[currentIndex + 1];
        const departments = ["Reception", "OPD", "Laboratory", "Radiology", "Pharmacy", "Billing"];
        const newDepartment = departments[Math.floor(Math.random() * departments.length)];
        
        await ctx.runMutation(api.patients.updatePatientStatus, {
          patientId: patient.patientId,
          newStatus: nextStatus,
          newDepartment: newDepartment,
        });
      }
    }

    return { success: true };
  },
});
