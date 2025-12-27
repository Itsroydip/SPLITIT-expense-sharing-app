import { pgTable, text, uuid, timestamp, decimal } from 'drizzle-orm/pg-core'
import { users } from './user.model.js'
import { groups } from './group.model.js'

export const settlements = pgTable('settlements', {
  id: uuid('id').primaryKey().defaultRandom(),
  groupId: uuid('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
  fromUser: uuid('from_user').notNull().references(() => users.id),
  toUser: uuid('to_user').notNull().references(() => users.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  notes: text('notes'),
  settledAt: timestamp('settled_at').defaultNow()
})