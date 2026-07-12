import * as z from "zod";
import { DRIVER_STATUS } from "../../constants";

export const createDriverSchema = z.object({
	name: z.string().trim().min(3).max(255),
	licenseNumber: z.string().trim().min(3).max(100),
	licenseCategory: z.string().trim().min(1).max(100),
	licenseExpiry: z.string(),
	contactNumber: z.string().trim().min(10).max(20),
	safetyScore: z.number().int().min(0).max(100).default(100),
	status: z.enum(DRIVER_STATUS).default("AVAILABLE"),
	userId: z.uuid().optional(),
});

export const updateDriverSchema = createDriverSchema.partial();

export const driverIdSchema = z.object({
	id: z.uuid(),
});

export const driverQuerySchema = z.object({
	status: z.enum(DRIVER_STATUS).optional(),
	licenseCategory: z.string().trim().optional(),
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(10),
});

export type CreateDriverInput = z.infer<typeof createDriverSchema>;
export type UpdateDriverInput = z.infer<typeof updateDriverSchema>;
export type DriverQueryInput = z.infer<typeof driverQuerySchema>;
