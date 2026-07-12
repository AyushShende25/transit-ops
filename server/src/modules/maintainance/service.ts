import { and, desc, DrizzleQueryError, eq, SQL } from "drizzle-orm";
import { db } from "../../db";
import {
  maintainanceLogsTable,
  vehiclesTable,
} from "../../db/schema";
import { BadRequestError } from "../../errors/bad-request";
import { NotFoundError } from "../../errors/not-found";
import type {
  CreateMaintenanceInput,
  MaintenanceQueryInput,
  UpdateMaintenanceInput,
} from "./schema";

export async function createMaintenance(
  input: CreateMaintenanceInput,
) {
  const [vehicle] = await db
    .select()
    .from(vehiclesTable)
    .where(eq(vehiclesTable.id, input.vehicleId));

  if (!vehicle) {
    throw new NotFoundError("Vehicle not found");
  }

  if (vehicle.status === "RETIRED") {
    throw new BadRequestError(
      "Retired vehicles cannot be sent for maintenance",
    );
  }

  if (vehicle.status === "ON_TRIP") {
    throw new BadRequestError(
      "Vehicle currently on trip cannot be sent for maintenance",
    );
  }

  if (vehicle.status === "IN_SHOP") {
    throw new BadRequestError(
      "Vehicle is already under maintenance",
    );
  }

  await db.transaction(async (tx) => {
    await tx.insert(maintainanceLogsTable).values({
      ...input,
      status: "ACTIVE",
    });

    await tx
      .update(vehiclesTable)
      .set({
        status: "IN_SHOP",
      })
      .where(eq(vehiclesTable.id, input.vehicleId));
  });

  return getActiveMaintenanceByVehicle(input.vehicleId);
}

export async function getMaintenances(
  query: MaintenanceQueryInput,
) {
  const {
    status,
    vehicleId,
    page = 1,
    limit = 10,
  } = query;

  const filters: SQL[] = [];

  if (status) {
    filters.push(eq(maintainanceLogsTable.status, status));
  }

  if (vehicleId) {
    filters.push(eq(maintainanceLogsTable.vehicleId, vehicleId));
  }

  return db
    .select()
    .from(maintainanceLogsTable)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(maintainanceLogsTable.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);
}

export async function getMaintenanceById(id: string) {
  const [maintenance] = await db
    .select()
    .from(maintainanceLogsTable)
    .where(eq(maintainanceLogsTable.id, id));

  if (!maintenance) {
    throw new NotFoundError("Maintenance record not found");
  }

  return maintenance;
}

export async function updateMaintenance(
  id: string,
  input: UpdateMaintenanceInput,
) {
  const maintenance = await getMaintenanceById(id);

  if (
    input.status === "COMPLETED" &&
    maintenance.status !== "COMPLETED"
  ) {
    await db.transaction(async (tx) => {
      await tx
        .update(maintainanceLogsTable)
        .set({
          ...input,
          completedAt: new Date(),
        })
        .where(eq(maintainanceLogsTable.id, id));

      const [vehicle] = await tx
        .select()
        .from(vehiclesTable)
        .where(eq(vehiclesTable.id, maintenance.vehicleId));

      if (
        vehicle &&
        vehicle.status !== "RETIRED"
      ) {
        await tx
          .update(vehiclesTable)
          .set({
            status: "AVAILABLE",
          })
          .where(
            eq(
              vehiclesTable.id,
              maintenance.vehicleId,
            ),
          );
      }
    });

    return getMaintenanceById(id);
  }

  const [updated] = await db
    .update(maintainanceLogsTable)
    .set(input)
    .where(eq(maintainanceLogsTable.id, id))
    .returning();

  return updated;
}

export async function deleteMaintenance(id: string) {
  const maintenance = await getMaintenanceById(id);

  if (maintenance.status === "ACTIVE") {
    throw new BadRequestError(
      "Cannot delete an active maintenance record",
    );
  }

  await db
    .delete(maintainanceLogsTable)
    .where(eq(maintainanceLogsTable.id, id));
}

async function getActiveMaintenanceByVehicle(
  vehicleId: string,
) {
  const [maintenance] = await db
    .select()
    .from(maintainanceLogsTable)
    .where(
      and(
        eq(
          maintainanceLogsTable.vehicleId,
          vehicleId,
        ),
        eq(
          maintainanceLogsTable.status,
          "ACTIVE",
        ),
      ),
    );

  return maintenance;
}