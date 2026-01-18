import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all active patients
export const getActivePatients = query({
  args: {},
  handler: async (ctx) => {
    const patients = await ctx.db
      .query("patients")
      .filter((q) => q.neq(q.field("currentStatus"), "Discharge"))
      .collect();
    
    return patients.map(patient => ({
      ...patient,
      waitTime: Date.now() - patient.registrationTime,
    }));
  },
});

// Get patients by department
export const getPatientsByDepartment = query({
  args: { department: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("patients")
      .withIndex("by_department", (q) => q.eq("currentDepartment", args.department))
      .filter((q) => q.neq(q.field("currentStatus"), "Discharge"))
      .collect();
  },
});

// Get patient flow data for visualization
export const getPatientFlow = query({
  args: {},
  handler: async (ctx) => {
    const statusCounts = await ctx.db
      .query("patients")
      .filter((q) => q.neq(q.field("currentStatus"), "Discharge"))
      .collect();

    const flowData = statusCounts.reduce((acc, patient) => {
      const status = patient.currentStatus;
      const dept = patient.currentDepartment;
      const key = `${dept}-${status}`;
      
      if (!acc[key]) {
        acc[key] = {
          department: dept,
          status: status,
          count: 0,
          avgWaitTime: 0,
          patients: []
        };
      }
      
      acc[key].count++;
      acc[key].patients.push(patient);
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(flowData);
  },
});

// Update patient status
export const updatePatientStatus = mutation({
  args: {
    patientId: v.string(),
    newStatus: v.string(),
    newDepartment: v.optional(v.string()),
    staffId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const patient = await ctx.db
      .query("patients")
      .filter((q) => q.eq(q.field("patientId"), args.patientId))
      .first();

    if (!patient) {
      throw new Error("Patient not found");
    }

    const now = Date.now();
    const previousStatus = patient.currentStatus;
    const duration = now - patient._creationTime;

    // Record status history
    await ctx.db.insert("patientStatusHistory", {
      patientId: args.patientId,
      fromStatus: previousStatus,
      toStatus: args.newStatus,
      department: args.newDepartment || patient.currentDepartment,
      timestamp: now,
      duration: duration,
      staffId: args.staffId,
    });

    // Update patient record
    await ctx.db.patch(patient._id, {
      currentStatus: args.newStatus,
      ...(args.newDepartment && { currentDepartment: args.newDepartment }),
    });

    return { success: true };
  },
});

// Add new patient
export const addPatient = mutation({
  args: {
    name: v.string(),
    age: v.number(),
    symptoms: v.array(v.string()),
    priority: v.string(),
  },
  handler: async (ctx, args) => {
    const patientId = `P${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    const patient = await ctx.db.insert("patients", {
      patientId,
      name: args.name,
      age: args.age,
      currentStatus: "Registration",
      currentDepartment: "Reception",
      registrationTime: Date.now(),
      priority: args.priority,
      symptoms: args.symptoms,
    });

    // Record initial status
    await ctx.db.insert("patientStatusHistory", {
      patientId,
      toStatus: "Registration",
      department: "Reception",
      timestamp: Date.now(),
    });

    return { patientId, id: patient };
  },
});

// Get patient journey/history
export const getPatientJourney = query({
  args: { patientId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("patientStatusHistory")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .order("asc")
      .collect();
  },
});
