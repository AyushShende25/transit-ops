import { and, desc, eq, type SQL } from "drizzle-orm";
import { db } from "../../db";
import {
	driversTable,
	fuelLogsTable,
	tripsTable,
	vehiclesTable,
} from "../../db/schema";
import { BadRequestError } from "../../errors/bad-request";
import { NotFoundError } from "../../errors/not-found";
import type {
	CompleteTripInput,
	CreateTripInput,
	TripQueryInput,
	UpdateTripInput,
} from "./schema";

export async function createTrip(input: CreateTripInput) {
	const [vehicle] = await db
		.select()
		.from(vehiclesTable)
		.where(eq(vehiclesTable.id, input.vehicleId));

	if (!vehicle) {
		throw new NotFoundError("Vehicle not found");
	}

	const [driver] = await db
		.select()
		.from(driversTable)
		.where(eq(driversTable.id, input.driverId));

	if (!driver) {
		throw new NotFoundError("Driver not found");
	}

	if (vehicle.status !== "AVAILABLE") {
		throw new BadRequestError("Vehicle is not available");
	}

	if (driver.status !== "AVAILABLE") {
		throw new BadRequestError("Driver is not available");
	}

	if (driver.licenseExpiry < new Date().toISOString().split("T")[0]) {
		throw new BadRequestError("Driver license has expired");
	}

	if (input.cargoWeightInKg > vehicle.maxLoadInKg) {
		throw new BadRequestError("Cargo exceeds vehicle capacity");
	}

	const [trip] = await db
		.insert(tripsTable)
		.values({
			...input,
			startOdometer: vehicle.currentOdometer,
			status: "DRAFT",
		})
		.returning();

	return trip;
}

export async function getTrips(query: TripQueryInput) {
	const { status, driverId, vehicleId, page = 1, limit = 10 } = query;

	const filters: SQL[] = [];

	if (status) {
		filters.push(eq(tripsTable.status, status));
	}

	if (driverId) {
		filters.push(eq(tripsTable.driverId, driverId));
	}

	if (vehicleId) {
		filters.push(eq(tripsTable.vehicleId, vehicleId));
	}

	return db
		.select()
		.from(tripsTable)
		.where(filters.length ? and(...filters) : undefined)
		.orderBy(desc(tripsTable.createdAt))
		.limit(limit)
		.offset((page - 1) * limit);
}

export async function getTripById(id: string) {
	const [trip] = await db
		.select()
		.from(tripsTable)
		.where(eq(tripsTable.id, id));

	if (!trip) {
		throw new NotFoundError("Trip not found");
	}

	return trip;
}

export async function updateTrip(id: string, input: UpdateTripInput) {
	const trip = await getTripById(id);

	if (trip.status !== "DRAFT") {
		throw new BadRequestError("Only draft trips can be updated");
	}

	const [updated] = await db
		.update(tripsTable)
		.set(input)
		.where(eq(tripsTable.id, id))
		.returning();

	return updated;
}

export async function dispatchTrip(id: string) {
	const trip = await getTripById(id);

	if (trip.status !== "DRAFT") {
		throw new BadRequestError("Only draft trips can be dispatched");
	}

	await db.transaction(async (tx) => {
		await tx
			.update(tripsTable)
			.set({
				status: "DISPATCHED",
			})
			.where(eq(tripsTable.id, id));

		await tx
			.update(vehiclesTable)
			.set({
				status: "ON_TRIP",
			})
			.where(eq(vehiclesTable.id, trip.vehicleId));

		await tx
			.update(driversTable)
			.set({
				status: "ON_TRIP",
			})
			.where(eq(driversTable.id, trip.driverId));
	});

	return getTripById(id);
}

export async function completeTrip(id: string, input: CompleteTripInput) {
	const trip = await getTripById(id);

	if (trip.status !== "DISPATCHED") {
		throw new BadRequestError("Only dispatched trips can be completed");
	}

	await db.transaction(async (tx) => {
		await tx
			.update(tripsTable)
			.set({
				status: "COMPLETED",
				actualDistanceInKm: input.actualDistanceInKm,
				endOdometer: input.endOdometer,
			})
			.where(eq(tripsTable.id, id));

		await tx
			.update(vehiclesTable)
			.set({
				status: "AVAILABLE",
				currentOdometer: input.endOdometer,
			})
			.where(eq(vehiclesTable.id, trip.vehicleId));

		await tx
			.update(driversTable)
			.set({
				status: "AVAILABLE",
			})
			.where(eq(driversTable.id, trip.driverId));

		await tx.insert(fuelLogsTable).values({
			vehicleId: trip.vehicleId,
			tripId: trip.id,
			litres: input.fuelConsumedInLiters,
			cost: input.fuelCost,
			fuelDate: new Date().toISOString().split("T")[0],
			odometer: input.endOdometer,
		});
	});

	return getTripById(id);
}

export async function cancelTrip(id: string) {
	const trip = await getTripById(id);

	if (trip.status === "COMPLETED") {
		throw new BadRequestError("Completed trips cannot be cancelled");
	}

	await db.transaction(async (tx) => {
		await tx
			.update(tripsTable)
			.set({
				status: "CANCELLED",
			})
			.where(eq(tripsTable.id, id));

		if (trip.status === "DISPATCHED") {
			await tx
				.update(vehiclesTable)
				.set({
					status: "AVAILABLE",
				})
				.where(eq(vehiclesTable.id, trip.vehicleId));

			await tx
				.update(driversTable)
				.set({
					status: "AVAILABLE",
				})
				.where(eq(driversTable.id, trip.driverId));
		}
	});

	return getTripById(id);
}

export async function deleteTrip(id: string) {
	const trip = await getTripById(id);

	if (trip.status === "DISPATCHED") {
		throw new BadRequestError("Cannot delete a dispatched trip");
	}

	await db.delete(tripsTable).where(eq(tripsTable.id, id));
}
