import { and, DrizzleQueryError, desc, eq } from "drizzle-orm";
import { db } from "../../db";
import { vehiclesTable } from "../../db/schema";
import { BadRequestError } from "../../errors/bad-request";
import { ConflictError } from "../../errors/conflict";
import { NotFoundError } from "../../errors/not-found";
import type {
	CreateVehicleInput,
	UpdateVehicleInput,
	VehicleQueryInput,
} from "./schema";

export async function createVehicle(input: CreateVehicleInput) {
	try {
		const [vehicle] = await db.insert(vehiclesTable).values(input).returning();

		return vehicle;
	} catch (error) {
		if (error instanceof DrizzleQueryError) {
			const pgError = error.cause as { code: string } | undefined;
			if (pgError?.code === "23505") {
				throw new ConflictError(
					`Vehicle with registration number "${input.registrationNumber}" already exists`,
				);
			}
		}

		throw error;
	}
}

export async function getVehicles(query: VehicleQueryInput) {
	const { status, type, region, page = 1, limit = 10 } = query;

	const filters = [];

	if (status) {
		filters.push(eq(vehiclesTable.status, status));
	}

	if (type) {
		filters.push(eq(vehiclesTable.type, type));
	}

	if (region) {
		filters.push(eq(vehiclesTable.region, region));
	}
	return db
		.select()
		.from(vehiclesTable)
		.where(filters.length ? and(...filters) : undefined)
		.limit(limit)
		.offset((page - 1) * limit)
		.orderBy(desc(vehiclesTable.createdAt));
}

export async function getVehicleById(id: string) {
	const [vehicle] = await db
		.select()
		.from(vehiclesTable)
		.where(eq(vehiclesTable.id, id));

	if (!vehicle) {
		throw new NotFoundError(`Vehicle with id "${id}" not found`);
	}

	return vehicle;
}

export async function updateVehicle(id: string, input: UpdateVehicleInput) {
	const vehicle = await getVehicleById(id);

	if (vehicle.status === "RETIRED") {
		throw new BadRequestError("Retired vehicles cannot be modified");
	}

	try {
		const [updated] = await db
			.update(vehiclesTable)
			.set(input)
			.where(eq(vehiclesTable.id, id))
			.returning();

		return updated;
	} catch (error) {
		if (error instanceof DrizzleQueryError) {
			const pgError = error.cause as { code: string } | undefined;

			if (pgError?.code === "23505") {
				throw new ConflictError(
					`Vehicle with registration number "${input.registrationNumber}" already exists`,
				);
			}
		}

		throw error;
	}
}

export async function deleteVehicle(id: string) {
	const vehicle = await getVehicleById(id);

	if (vehicle.status === "ON_TRIP") {
		throw new BadRequestError(
			"Vehicle currently assigned to a trip cannot be deleted",
		);
	}

	if (vehicle.status === "IN_SHOP") {
		throw new BadRequestError(
			"Vehicle currently under maintenance cannot be deleted",
		);
	}

	await db.delete(vehiclesTable).where(eq(vehiclesTable.id, id));
}
