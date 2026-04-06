import { prisma } from '~~/server/utils/db'
import { requireAdmin } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')

  const ticket = await prisma.ticket.findUnique({ where: { id } })
  if (!ticket) {
    throw createError({ statusCode: 404, statusMessage: 'Ticket not found' })
  }

  await prisma.ticket.delete({ where: { id } })

  return { ok: true }
})
