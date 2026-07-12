import * as z from "zod";
import { VEHICLE_STATUS } from "../../constants";

export const createVehicleSchema = z.object({
	registrationNumber: z.string().min(1).max(50),
	name: z.string().min(1).max(255),
	model: z.string().min(1).max(255),
	type: z.string().min(1).max(255),
	maxLoadInKg: z.number().positive(),
	currentOdometer: z.number().nonnegative().default(0),
	acquisitionCost: z.number().nonnegative(),
	acquisitionDate: z.string(),
	region: z.string().min(1).max(255),
	status: z.enum(VEHICLE_STATUS).default("AVAILABLE"),
});

export const vehicleQuerySchema = z.object({
	status: z.enum(VEHICLE_STATUS).optional(),
	type: z.string().trim().optional(),
	region: z.string().trim().optional(),
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(10),
});

export const updateVehicleSchema = createVehicleSchema.partial();

export const vehicleIdSchema = z.object({
	id: z.uuid(),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type VehicleQueryInput = z.infer<typeof vehicleQuerySchema>;
