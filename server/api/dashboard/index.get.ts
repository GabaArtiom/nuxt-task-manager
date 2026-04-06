import { prisma } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const isAdmin = user.role === 'admin'
  const userFilter = isAdmin ? {} : { assigned_to: user.id }

  const [unassigned, todo, inProgress] = await Promise.all([
    prisma.ticket.count({ where: { assigned_to: null, status: 'to_be_worked' } }),
    prisma.ticket.count({ where: { ...userFilter, status: 'to_be_worked' } }),
    prisma.ticket.count({ where: { ...userFilter, status: 'in_progress' } }),
  ])

  const result: any = { unassigned, todo, in_progress: inProgress }

  if (isAdmin) {
    const technicians = await prisma.user.findMany({
      where: { role: 'technician' },
      select: { id: true, name: true, family_name: true },
    })

    result.by_technician = await Promise.all(
      technicians.map(async (tech) => {
        const [tbw, inp, done, canceled] = await Promise.all([
          prisma.ticket.count({ where: { assigned_to: tech.id, status: 'to_be_worked' } }),
          prisma.ticket.count({ where: { assigned_to: tech.id, status: 'in_progress' } }),
          prisma.ticket.count({ where: { assigned_to: tech.id, status: 'done' } }),
          prisma.ticket.count({ where: { assigned_to: tech.id, status: 'canceled' } }),
        ])
        return { user: tech, to_be_worked: tbw, in_progress: inp, done, canceled }
      })
    )
  }

  return result
})
