import { prisma } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

const VALID_STATUSES = ['to_be_worked', 'in_progress', 'done', 'canceled']
const VALID_TYPES = ['Bug', 'Fixes', 'Improvement', 'Info', 'Typo', 'Other']

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const ticket = await prisma.ticket.findUnique({ where: { id } })
  if (!ticket) {
    throw createError({ statusCode: 404, statusMessage: 'Ticket not found' })
  }

  const data: any = {}

  if (user.role === 'admin') {
    // Admin can update everything
    if (body.customer_name !== undefined) data.customer_name = body.customer_name.trim()
    if (body.description !== undefined) data.description = body.description?.trim() || null
    if (body.type !== undefined) {
      if (!VALID_TYPES.includes(body.type)) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid ticket type' })
      }
      data.type = body.type
    }
    if (body.is_urgent !== undefined) data.is_urgent = Boolean(body.is_urgent)
    if (body.status !== undefined) {
      if (!VALID_STATUSES.includes(body.status)) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid status' })
      }
      data.status = body.status
    }
    if (body.assigned_to !== undefined) data.assigned_to = body.assigned_to || null
  } else {
    // Technician: can only update status of their own tickets or assign to self
    if (body.assigned_to === user.id && !ticket.assigned_to) {
      // Assign to self
      data.assigned_to = user.id
      data.status = 'to_be_worked'
    } else if (ticket.assigned_to === user.id) {
      // Update status of own ticket
      if (body.status !== undefined) {
        if (!VALID_STATUSES.includes(body.status)) {
          throw createError({ statusCode: 400, statusMessage: 'Invalid status' })
        }
        data.status = body.status
      }
    } else {
      throw createError({ statusCode: 403, statusMessage: 'You can only update your own tickets' })
    }
  }

  const updated = await prisma.ticket.update({
    where: { id },
    data,
    include: {
      assignee: {
        select: { id: true, name: true, family_name: true, email: true, role: true, is_locked: true, created_at: true },
      },
      creator: {
        select: { id: true, name: true, family_name: true, email: true, role: true, is_locked: true, created_at: true },
      },
    },
  })

  return updated
})
