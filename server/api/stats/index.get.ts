import { prisma } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const query = getQuery(event)

  const isAdmin = user.role === 'admin'
  const where: any = {}

  // Status filter (done/canceled or both)
  if (query.status === 'done' || query.status === 'canceled') {
    where.status = query.status
  } else {
    where.status = { in: ['done', 'canceled'] }
  }

  // User filter
  if (!isAdmin) {
    where.assigned_to = user.id
  } else if (query.technician_id) {
    where.assigned_to = query.technician_id as string
  }

  // Date filter
  if (query.from || query.to) {
    where.updated_at = {}
    if (query.from) {
      where.updated_at.gte = new Date(query.from as string)
    }
    if (query.to) {
      const toDate = new Date(query.to as string)
      toDate.setHours(23, 59, 59, 999)
      where.updated_at.lte = toDate
    }
  }

  // Pagination
  const page = Math.max(1, Number(query.page) || 1)
  const perPage = 20
  const skip = (page - 1) * perPage

  // Base where without status filter for counting both done & canceled
  const baseWhere = { ...where }
  delete baseWhere.status

  const [tickets, total, doneCount, canceledCount] = await Promise.all([
    prisma.ticket.findMany({
      where,
      include: {
        assignee: {
          select: { id: true, name: true, family_name: true, email: true, role: true, is_locked: true, created_at: true },
        },
        creator: {
          select: { id: true, name: true, family_name: true, email: true, role: true, is_locked: true, created_at: true },
        },
      },
      orderBy: { updated_at: 'desc' },
      skip,
      take: perPage,
    }),
    prisma.ticket.count({ where }),
    prisma.ticket.count({ where: { ...baseWhere, status: 'done' } }),
    prisma.ticket.count({ where: { ...baseWhere, status: 'canceled' } }),
  ])

  return {
    tickets,
    counts: { done: doneCount, canceled: canceledCount, total },
    pagination: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
  }
})
