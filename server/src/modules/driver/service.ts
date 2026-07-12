import { and, DrizzleQueryError, desc, eq, type SQL } from "drizzle-orm";
import { db } from "../../db";
import { driversTable } from "../../db/schema";
import { BadRequestError } from "../../errors/bad-request";
import { ConflictError } from "../../errors/conflict";
import { NotFoundError } from "../../errors/not-found";
import type {
	CreateDriverInput,
	DriverQueryInput,
	UpdateDriverInput,
} from "./schema";

export async function createDriver(input: CreateDriverInput) {
	try {
		const [driver] = await db.insert(driversTable).values(input).returning();

		return driver;
	} catch (error) {
		if (error instanceof DrizzleQueryError) {
			const pgError = error.cause as { code: string } | undefined;

			if (pgError?.code === "23505") {
				throw new ConflictError(
					`Driver with license number "${input.licenseNumber}" already exists`,
				);
			}
		}

		throw error;
	}
}

export async function getDrivers(query: DriverQueryInput) {
	const { status, licenseCategory, page = 1, limit = 10 } = query;

	const filters: SQL[] = [];

	if (status) {
		filters.push(eq(driversTable.status, status));
	}

	if (licenseCategory) {
		filters.push(eq(driversTable.licenseCategory, licenseCategory));
	}

	return db
		.select()
		.from(driversTable)
		.where(filters.length ? and(...filters) : undefined)
		.orderBy(desc(driversTable.createdAt))
		.limit(limit)
		.offset((page - 1) * limit);
}

export async function getDriverById(id: string) {
	const [driver] = await db
		.select()
		.from(driversTable)
		.where(eq(driversTable.id, id));

	if (!driver) {
		throw new NotFoundError(`Driver with id "${id}" not found`);
	}

	return driver;
}

export async function updateDriver(id: string, input: UpdateDriverInput) {
	await getDriverById(id);

	try {
		const [driver] = await db
			.update(driversTable)
			.set(input)
			.where(eq(driversTable.id, id))
			.returning();

		return driver;
	} catch (error) {
		if (error instanceof DrizzleQueryError) {
			const pgError = error.cause as { code: string } | undefined;

			if (pgError?.code === "23505") {
				throw new ConflictError(
					`Driver with license number "${input.licenseNumber}" already exists`,
				);
			}
		}

		throw error;
	}
}

export async function deleteDriver(id: string) {
	const driver = await getDriverById(id);

	if (driver.status === "ON_TRIP") {
		throw new BadRequestError("Cannot delete a driver currently on a trip");
	}

	await db.delete(driversTable).where(eq(driversTable.id, id));
}
