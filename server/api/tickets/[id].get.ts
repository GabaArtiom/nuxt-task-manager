import { prisma } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const id = getRouterParam(event, 'id')

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      assignee: {
        select: { id: true, name: true, family_name: true, email: true, role: true, is_locked: true, created_at: true },
      },
      creator: {
        select: { id: true, name: true, family_name: true, email: true, role: true, is_locked: true, created_at: true },
      },
    },
  })

  if (!ticket) {
    throw createError({ statusCode: 404, statusMessage: 'Ticket not found' })
  }

  return ticket
})
