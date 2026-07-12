import {
	date,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { ROLES, VEHICLE_STATUS } from "../constants";

// Entities: Users, Roles, Vehicles, Drivers, Trips, Maintenance Logs, Fuel Logs, Expenses
// Roles: Fleet Manager, Driver, Safety Officer, Financial Analyst

const timestamps = {
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
};

export const roleEnum = pgEnum("role", ROLES);

export const usersTable = pgTable("users", {
	id: uuid("id").primaryKey().defaultRandom(),
	email: varchar("email", { length: 255 }).notNull().unique(),
	passwordHash: varchar("password_hash", { length: 255 }),
	name: varchar({ length: 255 }).notNull(),
	role: roleEnum().notNull(),
	...timestamps,
});

export const vehicleStatusEnum = pgEnum("vehicle_status", VEHICLE_STATUS);

export const vehiclesTable = pgTable("vehicles", {
	id: uuid("id").primaryKey().defaultRandom(),
	registrationNumber: varchar("registration_number", { length: 50 })
		.notNull()
		.unique(),
	name: varchar({ length: 255 }).notNull(),
	model: varchar({ length: 255 }).notNull(),
	type: varchar({ length: 255 }).notNull(),
	maxLoadInKg: integer("max_load_in_kg").notNull(),
	currentOdometer: integer("current_odometer").notNull(),
	acquisitionCost: integer("acquisition_cost").notNull(),
	acquisitionDate: date("acquisition_date").notNull(),
	region: varchar({ length: 255 }).notNull(),
	status: vehicleStatusEnum().notNull(),
	...timestamps,
});

export const driverStatusEnum = pgEnum("driver_status", [
	"AVAILABLE",
	"ON_TRIP",
	"OFF_DUTY",
	"SUSPENDED",
]);

export const driversTable = pgTable("drivers", {
	id: uuid("id").primaryKey().defaultRandom(),
	licenseNumber: varchar("license_number", { length: 255 }).notNull().unique(),
	licenseCategory: varchar("license_category", { length: 255 }).notNull(),
	licenseExpiry: date("license_expiry").notNull(),
	contactNumber: varchar("contact_number", { length: 255 }).notNull(),
	safetyScore: integer("safety_score").notNull(),
	status: driverStatusEnum().notNull(),
	userId: uuid("user_id").references(() => usersTable.id, {
		onDelete: "cascade",
	}),
	...timestamps,
});

export const tripStatusEnum = pgEnum("trip_status", [
	"DRAFT",
	"DISPATCHED",
	"COMPLETED",
	"CANCELLED",
]);

export const tripsTable = pgTable("trips", {
	id: uuid("id").primaryKey().defaultRandom(),
	source: varchar({ length: 255 }).notNull(),
	destination: varchar({ length: 255 }).notNull(),
	cargoWeightInKg: integer("cargo_weight_in_kg").notNull(),
	plannedDistanceInKm: integer("planned_distance_in_km").notNull(),
	actualDistanceInKm: integer("actual_distance_in_km").notNull(),
	startOdometer: integer("start_odometer").notNull(),
	endOdometer: integer("end_odometer").notNull(),
	status: tripStatusEnum(),
	vehicleId: uuid("vehicle_id")
		.notNull()
		.references(() => vehiclesTable.id, {
			onDelete: "cascade",
		}),
	driverId: uuid("driver_id")
		.notNull()
		.references(() => driversTable.id, { onDelete: "cascade" }),
	...timestamps,
});

export const maintainanceStatusEnum = pgEnum("maintainence_status", [
	"ACTIVE",
	"COMPLETED",
]);

export const maintainanceLogsTable = pgTable("maintainence_logs", {
	id: uuid("id").primaryKey().defaultRandom(),
	vehicleId: uuid("vehicle_id")
		.notNull()
		.references(() => vehiclesTable.id, {
			onDelete: "cascade",
		}),
	cost: integer().notNull(),
	description: text(),
	status: maintainanceStatusEnum(),
	...timestamps,
});

export const fuelLogsTable = pgTable("fuel_logs", {
	id: uuid("id").primaryKey().defaultRandom(),
	vehicleId: uuid("vehicle_id")
		.notNull()
		.references(() => vehiclesTable.id, {
			onDelete: "cascade",
		}),
	tripId: uuid("trip_id").references(() => tripsTable.id, {
		onDelete: "cascade",
	}),
	litres: integer().notNull(),
	cost: integer().notNull(),
	fuelDate: date("fuel_date").notNull(),
	odometer: integer("odometer").notNull(),
	...timestamps,
});

export const expensesTable = pgTable("expenses", {
	id: uuid("id").primaryKey().defaultRandom(),
	vehicleId: uuid("vehicle_id")
		.notNull()
		.references(() => vehiclesTable.id, {
			onDelete: "cascade",
		}),
	tripId: uuid("trip_id").references(() => tripsTable.id, {
		onDelete: "cascade",
	}),
	amount: integer().notNull(),
	description: text(),
	expenseDate: date("fuel_date").notNull(),
	...timestamps,
});
