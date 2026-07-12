import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import {
  createExpenseSchema,
  expenseIdSchema,
  expenseQuerySchema,
  updateExpenseSchema,
} from "./schema";
import {
  createExpense,
  deleteExpense,
  getExpenseById,
  getExpenses,
  updateExpense,
} from "./service";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("FLEET_MANAGER", "FINANCIAL_ANALYST"),
  async (req, res) => {
    const input = createExpenseSchema.parse(req.body);

    const expense = await createExpense(input);

    res.status(201).json(expense);
  },
);

router.get(
  "/",
  authenticate,
  async (req, res) => {
    const query = expenseQuerySchema.parse(req.query);

    res.json(await getExpenses(query));
  },
);

router.get(
  "/:id",
  authenticate,
  async (req, res) => {
    const { id } = expenseIdSchema.parse(req.params);

    res.json(await getExpenseById(id));
  },
);

router.patch(
  "/:id",
  authenticate,
  authorize("FLEET_MANAGER", "FINANCIAL_ANALYST"),
  async (req, res) => {
    const { id } = expenseIdSchema.parse(req.params);

    const input = updateExpenseSchema.parse(req.body);

    res.json(await updateExpense(id, input));
  },
);

router.delete(
  "/:id",
  authenticate,
  authorize("FLEET_MANAGER"),
  async (req, res) => {
    const { id } = expenseIdSchema.parse(req.params);

    await deleteExpense(id);

    res.status(204).end();
  },
);

export default router;