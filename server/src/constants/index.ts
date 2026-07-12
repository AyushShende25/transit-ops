import type { CookieOptions } from "express";
import { config } from "../config/env";

export const ROLES = [
	"FLEET_MANAGER",
	"DRIVER",
	"SAFETY_OFFICER",
	"FINANCIAL_ANALYST",
] as const;

export type Role = (typeof ROLES)[number];

export const VEHICLE_STATUS = [
	"AVAILABLE",
	"ON_TRIP",
	"IN_SHOP",
	"RETIRED",
] as const;

export type VehicleStatus = (typeof VEHICLE_STATUS)[number];

export const cookieOptions: CookieOptions = {
	httpOnly: true,
	secure: config.NODE_ENV === "production",
	sameSite: "lax" as const,
	maxAge: config.JWT_ACCESS_TOKEN_TTL_SECONDS * 1000,
};
