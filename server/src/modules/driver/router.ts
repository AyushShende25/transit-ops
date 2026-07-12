import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import {
	createDriverSchema,
	driverIdSchema,
	driverQuerySchema,
	updateDriverSchema,
} from "./schema";
import {
	createDriver,
	deleteDriver,
	getDriverById,
	getDrivers,
	updateDriver,
} from "./service";

const router = Router();

router.post(
	"/",
	authenticate,
	authorize("FLEET_MANAGER", "SAFETY_OFFICER"),
	async (req, res) => {
		const input = createDriverSchema.parse(req.body);

		const driver = await createDriver(input);

		res.status(201).json(driver);
	},
);

router.get("/", authenticate, async (req, res) => {
	const query = driverQuerySchema.parse(req.query);

	const drivers = await getDrivers(query);

	res.status(200).json(drivers);
});

router.get("/:id", authenticate, async (req, res) => {
	const { id } = driverIdSchema.parse(req.params);

	const driver = await getDriverById(id);

	res.status(200).json(driver);
});

router.patch(
	"/:id",
	authenticate,
	authorize("FLEET_MANAGER", "SAFETY_OFFICER"),
	async (req, res) => {
		const { id } = driverIdSchema.parse(req.params);

		const input = updateDriverSchema.parse(req.body);

		const driver = await updateDriver(id, input);

		res.status(200).json(driver);
	},
);

router.delete(
	"/:id",
	authenticate,
	authorize("FLEET_MANAGER"),
	async (req, res) => {
		const { id } = driverIdSchema.parse(req.params);

		await deleteDriver(id);

		res.status(204).end();
	},
);

export default router;
