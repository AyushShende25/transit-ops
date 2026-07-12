import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import {
  createMaintenanceSchema,
  maintenanceIdSchema,
  maintenanceQuerySchema,
  updateMaintenanceSchema,
} from "./schema";
import {
  createMaintenance,
  deleteMaintenance,
  getMaintenanceById,
  getMaintenances,
  updateMaintenance,
} from "./service";

const router = Router();


router.post(
  "/",
  authenticate,
  authorize("FLEET_MANAGER"),
  async (req, res) => {
    const input = createMaintenanceSchema.parse(req.body);

    const maintenance = await createMaintenance(input);

    res.status(201).json(maintenance);
  },
);


router.get(
  "/",
  authenticate,
  async (req, res) => {
    const query = maintenanceQuerySchema.parse(req.query);

    const maintenances = await getMaintenances(query);

    res.status(200).json(maintenances);
  },
);


router.get(
  "/:id",
  authenticate,
  async (req, res) => {
    const { id } = maintenanceIdSchema.parse(req.params);

    const maintenance = await getMaintenanceById(id);

    res.status(200).json(maintenance);
  },
);


router.patch(
  "/:id",
  authenticate,
  authorize("FLEET_MANAGER"),
  async (req, res) => {
    const { id } = maintenanceIdSchema.parse(req.params);

    const input = updateMaintenanceSchema.parse(req.body);

    const maintenance = await updateMaintenance(id, input);

    res.status(200).json(maintenance);
  },
);


router.delete(
  "/:id",
  authenticate,
  authorize("FLEET_MANAGER"),
  async (req, res) => {
    const { id } = maintenanceIdSchema.parse(req.params);

    await deleteMaintenance(id);

    res.status(204).end();
  },
);

export default router;