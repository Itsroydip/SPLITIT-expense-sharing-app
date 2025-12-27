import { pgTable, text, uuid, timestamp, unique } from 'drizzle-orm/pg-core'
import { users } from './user.model.js'

export const groups = pgTable('groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow()
})

export const groupMembers = pgTable('group_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  groupId: uuid('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id),
  joinedAt: timestamp('joined_at').defaultNow()
}, (table) => ([
  unique().on(table.groupId, table.userId)
]))