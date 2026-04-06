import { prisma } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

const VALID_TYPES = ['Bug', 'Fixes', 'Improvement', 'Info', 'Typo', 'Other']

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)

  if (!body.customer_name?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Customer name is required' })
  }

  if (!body.type || !VALID_TYPES.includes(body.type)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid ticket type' })
  }

  const ticket = await prisma.ticket.create({
    data: {
      customer_name: body.customer_name.trim(),
      description: body.description?.trim() || null,
      type: body.type,
      is_urgent: Boolean(body.is_urgent),
      status: 'to_be_worked',
      assigned_to: (user.role === 'admin' && body.assigned_to) ? body.assigned_to : null,
      created_by: user.id,
    },
    include: {
      assignee: {
        select: { id: true, name: true, family_name: true, email: true, role: true, is_locked: true, created_at: true },
      },
      creator: {
        select: { id: true, name: true, family_name: true, email: true, role: true, is_locked: true, created_at: true },
      },
    },
  })

  return ticket
})
