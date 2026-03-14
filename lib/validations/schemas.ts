import { z } from "zod";

const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => (typeof value === "string" && value.trim() === "" ? undefined : value), schema.optional());

export const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export const signupSchema = authSchema.and(
  z
    .object({
      role: z.enum(["admin", "manager", "technician", "operator"]),
      facilityCode: emptyToUndefined(z.string().min(2).max(40)),
      facilityName: emptyToUndefined(z.string().min(2).max(120)),
      facilityLocation: emptyToUndefined(z.string().min(2).max(120))
    })
    .superRefine((value, ctx) => {
      if (value.role === "admin") {
        if (!value.facilityName) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["facilityName"], message: "Facility name is required for admin." });
        }
        if (!value.facilityCode) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["facilityCode"], message: "Facility code is required for admin." });
        }
        if (!value.facilityLocation) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["facilityLocation"], message: "Facility location is required for admin." });
        }
      } else if (!value.facilityCode) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["facilityCode"], message: "Facility code is required." });
      }
    })
);

export const workOrderSchema = z.object({
  equipmentId: z.string().uuid(),
  title: z.string().min(3).max(120),
  priority: z.enum(["low", "medium", "high", "critical"]),
  dueDate: z.string().datetime().optional()
});

export const simulatorSchema = z.object({
  equipmentId: z.string().uuid().optional(),
  count: z.number().int().min(1).max(200).default(20)
});

export const equipmentSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2).max(80),
  equipmentType: z.string().min(2).max(80),
  serialNumber: z.string().min(3).max(80),
  status: z.enum(["online", "offline", "maintenance", "fault"])
});

export const maintenanceScheduleSchema = z.object({
  equipmentId: z.string().uuid(),
  title: z.string().min(3).max(120),
  cadenceDays: z.number().int().min(1).max(365),
  nextDueAt: z.string().min(10)
});

export const workOrderLifecycleSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["open", "assigned", "in_progress", "completed", "cancelled"]),
  assignedTo: z.string().uuid().nullable().optional(),
  completionNotes: z.string().max(500).optional()
});

export const downtimeStartSchema = z.object({
  equipmentId: z.string().uuid(),
  cause: z.string().min(3).max(200)
});

export const downtimeEndSchema = z.object({
  downtimeId: z.string().uuid()
});

export const adminUserRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["admin", "manager", "technician", "operator"])
});

export const facilityUpdateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(120),
  code: z.string().min(2).max(40),
  location: z.string().min(2).max(120)
});
