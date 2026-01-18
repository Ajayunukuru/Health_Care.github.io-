import { query } from "./_generated/server";
import { v } from "convex/values";

// Get real-time dashboard metrics
export const getDashboardMetrics = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);

    // Get active patients
    const activePatients = await ctx.db
      .query("patients")
      .filter((q) => q.neq(q.field("currentStatus"), "Discharge"))
      .collect();

    // Calculate average wait time
    const totalWaitTime = activePatients.reduce((sum, patient) => {
      return sum + (now - patient.registrationTime);
    }, 0);
    const avgWaitTime = activePatients.length > 0 ? totalWaitTime / activePatients.length : 0;

    // Get patients served in last hour
    const recentDischarges = await ctx.db
      .query("patientStatusHistory")
      .withIndex("by_timestamp", (q) => q.gte("timestamp", oneHourAgo))
      .filter((q) => q.eq(q.field("toStatus"), "Discharge"))
      .collect();

    // Get department congestion
    const departmentStats = activePatients.reduce((acc, patient) => {
      const dept = patient.currentDepartment;
      if (!acc[dept]) {
        acc[dept] = { count: 0, waitTime: 0 };
      }
      acc[dept].count++;
      acc[dept].waitTime += (now - patient.registrationTime);
      return acc;
    }, {} as Record<string, any>);

    const mostCongestedDept = Object.entries(departmentStats)
      .sort(([,a], [,b]) => (b as any).count - (a as any).count)[0];

    // Get staff utilization
    const staff = await ctx.db.query("staff").collect();
    const busyStaff = staff.filter(s => s.status === "Busy" || s.status === "Overloaded");
    const staffUtilization = staff.length > 0 ? (busyStaff.length / staff.length) * 100 : 0;

    // Get resource utilization
    const resources = await ctx.db.query("resources").collect();
    const occupiedResources = resources.filter(r => r.status === "Occupied");
    const resourceUtilization = resources.length > 0 ? (occupiedResources.length / resources.length) * 100 : 0;

    return {
      totalActivePatients: activePatients.length,
      averageWaitTime: Math.round(avgWaitTime / (1000 * 60)), // Convert to minutes
      patientsServedPerHour: recentDischarges.length,
      mostCongestedDepartment: mostCongestedDept ? mostCongestedDept[0] : "None",
      staffUtilization: Math.round(staffUtilization),
      resourceUtilization: Math.round(resourceUtilization),
      departmentBreakdown: Object.entries(departmentStats).map(([dept, stats]) => ({
        department: dept,
        patientCount: (stats as any).count,
        avgWaitTime: Math.round((stats as any).waitTime / (stats as any).count / (1000 * 60)),
      })),
    };
  },
});

// Get department-wise flow data
export const getDepartmentFlow = query({
  args: {},
  handler: async (ctx) => {
    const departments = ["Reception", "OPD", "Laboratory", "Radiology", "Pharmacy", "Billing"];
    const statuses = ["Registration", "Waiting", "Consultation", "Diagnostics", "Treatment", "Billing"];

    const flowData = [];
    
    for (const dept of departments) {
      const patients = await ctx.db
        .query("patients")
        .withIndex("by_department", (q) => q.eq("currentDepartment", dept))
        .filter((q) => q.neq(q.field("currentStatus"), "Discharge"))
        .collect();

      const statusBreakdown = statuses.map(status => ({
        status,
        count: patients.filter(p => p.currentStatus === status).length,
      }));

      flowData.push({
        department: dept,
        totalPatients: patients.length,
        statusBreakdown,
        congestionLevel: patients.length > 10 ? "High" : patients.length > 5 ? "Medium" : "Low",
      });
    }

    return flowData;
  },
});

// Get recent alerts
export const getRecentAlerts = query({
  args: {},
  handler: async (ctx) => {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    return await ctx.db
      .query("alerts")
      .withIndex("by_timestamp", (q) => q.gte("timestamp", oneHourAgo))
      .order("desc")
      .take(10);
  },
});

// Get active recommendations
export const getActiveRecommendations = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("recommendations")
      .withIndex("by_status", (q) => q.eq("status", "Pending"))
      .order("desc")
      .take(5);
  },
});

// Get bottleneck predictions
export const getBottleneckPredictions = query({
  args: {},
  handler: async (ctx) => {
    const thirtyMinutesFromNow = Date.now() + (30 * 60 * 1000);
    
    return await ctx.db
      .query("predictions")
      .withIndex("by_timestamp", (q) => q.gte("timestamp", Date.now()))
      .filter((q) => q.lte(q.field("timestamp"), thirtyMinutesFromNow))
      .order("desc")
      .take(10);
  },
});
