import * as z from "zod";
import { TRIP_STATUS } from "../../constants";

export const createTripSchema = z.object({
	source: z.string().trim().min(1).max(255),
	destination: z.string().trim().min(1).max(255),
	vehicleId: z.uuid(),
	driverId: z.uuid(),
	cargoWeightInKg: z.number().positive(),
	plannedDistanceInKm: z.number().positive(),
});

export const updateTripSchema = createTripSchema.partial();

export const completeTripSchema = z.object({
	endOdometer: z.number().int().nonnegative(),
	actualDistanceInKm: z.number().positive(),
	fuelConsumedInLiters: z.number().positive(),
	fuelCost: z.number().nonnegative(),
});

export const cancelTripSchema = z.object({
	reason: z.string().trim().max(500).optional(),
});

export const tripIdSchema = z.object({
	id: z.uuid(),
});

export const tripQuerySchema = z.object({
	status: z.enum(TRIP_STATUS).optional(),
	driverId: z.uuid().optional(),
	vehicleId: z.uuid().optional(),
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(10),
});

export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;
export type CompleteTripInput = z.infer<typeof completeTripSchema>;
export type TripQueryInput = z.infer<typeof tripQuerySchema>;
