import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import {
	cancelTripSchema,
	completeTripSchema,
	createTripSchema,
	tripIdSchema,
	tripQuerySchema,
	updateTripSchema,
} from "./schema";
import {
	cancelTrip,
	completeTrip,
	createTrip,
	deleteTrip,
	dispatchTrip,
	getTripById,
	getTrips,
	updateTrip,
} from "./service";

const router = Router();

router.post("/", authenticate, authorize("FLEET_MANAGER"), async (req, res) => {
	const input = createTripSchema.parse(req.body);

	const trip = await createTrip(input);

	res.status(201).json(trip);
});

router.get("/", authenticate, async (req, res) => {
	const query = tripQuerySchema.parse(req.query);

	const trips = await getTrips(query);

	res.status(200).json(trips);
});

router.get("/:id", authenticate, async (req, res) => {
	const { id } = tripIdSchema.parse(req.params);

	const trip = await getTripById(id);

	res.status(200).json(trip);
});

router.patch(
	"/:id",
	authenticate,
	authorize("FLEET_MANAGER"),
	async (req, res) => {
		const { id } = tripIdSchema.parse(req.params);

		const input = updateTripSchema.parse(req.body);

		const trip = await updateTrip(id, input);

		res.status(200).json(trip);
	},
);

router.patch(
	"/:id/dispatch",
	authenticate,
	authorize("FLEET_MANAGER"),
	async (req, res) => {
		const { id } = tripIdSchema.parse(req.params);

		const trip = await dispatchTrip(id);

		res.status(200).json(trip);
	},
);

router.patch(
	"/:id/complete",
	authenticate,
	authorize("FLEET_MANAGER"),
	async (req, res) => {
		const { id } = tripIdSchema.parse(req.params);

		const input = completeTripSchema.parse(req.body);

		const trip = await completeTrip(id, input);

		res.status(200).json(trip);
	},
);

router.patch(
	"/:id/cancel",
	authenticate,
	authorize("FLEET_MANAGER"),
	async (req, res) => {
		const { id } = tripIdSchema.parse(req.params);

		cancelTripSchema.parse(req.body);

		const trip = await cancelTrip(id);

		res.status(200).json(trip);
	},
);

router.delete(
	"/:id",
	authenticate,
	authorize("FLEET_MANAGER"),
	async (req, res) => {
		const { id } = tripIdSchema.parse(req.params);

		await deleteTrip(id);

		res.status(204).end();
	},
);

export default router;
