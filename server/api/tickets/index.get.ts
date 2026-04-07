import { prisma } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const query = getQuery(event)

  const where: any = {}

  // Filter: unassigned only
  if (query.unassigned === 'true') {
    where.assigned_to = null
  }

  // Technicians see: unassigned tickets OR tickets assigned to them
  if (user.role === 'technician' && query.unassigned !== 'true' && query.my !== 'true') {
    where.OR = [
      { assigned_to: null },
      { assigned_to: user.id }
    ]
  }

  // Filter: assigned to current user (my tickets)
  if (query.my === 'true') {
    if (query.technician_id) {
      where.assigned_to = query.technician_id as string
    } else {
      where.assigned_to = user.id
    }
  }

  // Filter: status
  if (query.status) {
    const statuses = (query.status as string).split(',')
    where.status = { in: statuses }
  }

  // Filter: type
  if (query.type) {
    where.type = query.type as string
  }

  // Filter: urgent
  if (query.urgent === 'true') {
    where.is_urgent = true
  } else if (query.urgent === 'false') {
    where.is_urgent = false
  }

  // Filter: exclude done/canceled for "my" view
  if (query.active === 'true') {
    where.status = { notIn: ['done', 'canceled'] }
  }

  // Pagination
  const page = Math.max(1, Number(query.page) || 1)
  const perPage = [10, 15, 20].includes(Number(query.limit)) ? Number(query.limit) : 10
  const skip = (page - 1) * perPage

  const [tickets, total] = await Promise.all([
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
      orderBy: [
        { is_urgent: 'desc' },
        { created_at: 'desc' },
      ],
      skip,
      take: perPage,
    }),
    prisma.ticket.count({ where }),
  ])

  return {
    tickets,
    pagination: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
  }
})
