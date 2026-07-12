import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import {
	createVehicleSchema,
	updateVehicleSchema,
	vehicleIdSchema,
	vehicleQuerySchema,
} from "./schema";
import {
	createVehicle,
	deleteVehicle,
	getVehicleById,
	getVehicles,
	updateVehicle,
} from "./service";

const router = Router();
router.post("/", authenticate, authorize("FLEET_MANAGER"), async (req, res) => {
	const input = createVehicleSchema.parse(req.body);
	const vehicle = await createVehicle(input);
	res.status(201).json(vehicle);
});

router.get("/", authenticate, async (req, res) => {
	const query = vehicleQuerySchema.parse(req.query);
	const vehicles = await getVehicles(query);
	res.status(200).json(vehicles);
});

router.get("/:id", authenticate, async (req, res) => {
	const { id } = vehicleIdSchema.parse(req.params);
	const vehicle = await getVehicleById(id);
	res.status(200).json(vehicle);
});

router.patch(
	"/:id",
	authenticate,
	authorize("FLEET_MANAGER"),
	async (req, res) => {
		const input = updateVehicleSchema.parse(req.body);
		const { id } = vehicleIdSchema.parse(req.params);
		const vehicle = await updateVehicle(id, input);
		res.status(200).json(vehicle);
	},
);

router.delete(
	"/:id",
	authenticate,
	authorize("FLEET_MANAGER"),
	async (req, res) => {
		const { id } = vehicleIdSchema.parse(req.params);
		const result = await deleteVehicle(id);
		res.status(200).json(result);
	},
);

export default router;
