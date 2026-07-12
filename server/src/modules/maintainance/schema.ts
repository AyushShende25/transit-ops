import * as z from "zod";

export const createMaintenanceSchema = z.object({
  vehicleId: z.uuid(),
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(1000).optional(),
  cost: z.number().nonnegative().default(0),
});

export const updateMaintenanceSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().max(1000).optional(),
  cost: z.number().nonnegative().optional(),
  status: z.enum(["ACTIVE", "COMPLETED"]).optional(),
});

export const maintenanceIdSchema = z.object({
  id: z.uuid(),
});

export const maintenanceQuerySchema = z.object({
  status: z.enum(["ACTIVE", "COMPLETED"]).optional(),
  vehicleId: z.uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type CreateMaintenanceInput = z.infer<
  typeof createMaintenanceSchema
>;

export type UpdateMaintenanceInput = z.infer<
  typeof updateMaintenanceSchema
>;

export type MaintenanceQueryInput = z.infer<
  typeof maintenanceQuerySchema
>;