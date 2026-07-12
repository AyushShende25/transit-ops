import { and, desc, eq, SQL } from "drizzle-orm";
import { db } from "../../db";
import { expensesTable } from "../../db/schema";
import { NotFoundError } from "../../errors/not-found";
import type {
  CreateExpenseInput,
  ExpenseQueryInput,
  UpdateExpenseInput,
} from "./schema";

export async function createExpense(input: CreateExpenseInput) {
  const [expense] = await db
    .insert(expensesTable)
    .values(input)
    .returning();

  return expense;
}

export async function getExpenses(query: ExpenseQueryInput) {
  const {
    vehicleId,
    tripId,
    type,
    page = 1,
    limit = 10,
  } = query;

  const filters: SQL[] = [];

  if (vehicleId) {
    filters.push(eq(expensesTable.vehicleId, vehicleId));
  }

  if (tripId) {
    filters.push(eq(expensesTable.tripId, tripId));
  }

  if (type) {
    filters.push(eq(expensesTable.type, type));
  }

  return db
    .select()
    .from(expensesTable)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(expensesTable.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);
}

export async function getExpenseById(id: string) {
  const [expense] = await db
    .select()
    .from(expensesTable)
    .where(eq(expensesTable.id, id));

  if (!expense) {
    throw new NotFoundError("Expense not found");
  }

  return expense;
}

export async function updateExpense(
  id: string,
  input: UpdateExpenseInput,
) {
  await getExpenseById(id);

  const [expense] = await db
    .update(expensesTable)
    .set(input)
    .where(eq(expensesTable.id, id))
    .returning();

  return expense;
}

export async function deleteExpense(id: string) {
  await getExpenseById(id);

  await db
    .delete(expensesTable)
    .where(eq(expensesTable.id, id));
}