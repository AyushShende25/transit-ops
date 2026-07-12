import * as z from "zod";
import { EXPENSE_TYPES } from "../../constants";

export const createExpenseSchema = z.object({
  vehicleId: z.uuid(),
  tripId: z.uuid().optional(),
  type: z.enum(EXPENSE_TYPES),
  amount: z.number().positive(),
  description: z.string().trim().max(500).optional(),
  expenseDate: z.coerce.date(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export const expenseIdSchema = z.object({
  id: z.uuid(),
});

export const expenseQuerySchema = z.object({
  vehicleId: z.uuid().optional(),
  tripId: z.uuid().optional(),
  type: z.enum(EXPENSE_TYPES).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ExpenseQueryInput = z.infer<typeof expenseQuerySchema>;