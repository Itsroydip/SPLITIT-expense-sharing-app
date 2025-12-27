import { pgTable, text, uuid, timestamp, decimal, boolean } from 'drizzle-orm/pg-core'
import { users } from './user.model.js'
import { groups } from './group.model.js'

export const expenses = pgTable('expenses', {
  id: uuid('id').primaryKey().defaultRandom(),
  groupId: uuid('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
  paidBy: uuid('paid_by').notNull().references(() => users.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  splitType: text('split_type').notNull(),
  createdAt: timestamp('created_at').defaultNow()
})

export const expenseSplits = pgTable('expense_splits', {
  id: uuid('id').primaryKey().defaultRandom(),
  expenseId: uuid('expense_id').notNull().references(() => expenses.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id),
  amountOwed: decimal('amount_owed', { precision: 10, scale: 2 }).notNull(),
  percentage: decimal('percentage', { precision: 5, scale: 2 }),
  isSettled: boolean('is_settled').default(false),
  settledAt: timestamp('settled_at'),
  settledWith: uuid('settled_with').references(() => users.id)
})