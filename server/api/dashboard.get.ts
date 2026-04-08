import { prisma } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'
import type { DashboardStats } from '~/types'

export default defineEventHandler(async (event): Promise<DashboardStats> => {
  const user = await requireAuth(event)

  const isAdmin = user.role === 'admin'

  // Base filter for technician (only their tickets)
  const technicianFilter = isAdmin ? {} : { assigned_to: user.id }

  // Count total tickets
  const total = await prisma.ticket.count({
    where: isAdmin ? {} : { assigned_to: user.id }
  })

  // Count unassigned tickets (same for both admin and technician)
  const unassigned = await prisma.ticket.count({
    where: { assigned_to: null }
  })

  // Count by status
  const to_be_worked = await prisma.ticket.count({
    where: { status: 'to_be_worked', ...technicianFilter }
  })

  const in_progress = await prisma.ticket.count({
    where: { status: 'in_progress', ...technicianFilter }
  })

  const done = await prisma.ticket.count({
    where: { status: 'done', ...technicianFilter }
  })

  const canceled = await prisma.ticket.count({
    where: { status: 'canceled', ...technicianFilter }
  })

  const stats: DashboardStats = {
    total,
    unassigned,
    to_be_worked,
    in_progress,
    done,
    canceled
  }

  // For admin, add by_technician breakdown
  if (isAdmin) {
    const technicians = await prisma.user.findMany({
      where: { role: 'technician' },
      select: { id: true, name: true, family_name: true }
    })

    const by_technician = await Promise.all(
      technicians.map(async (tech) => {
        const [to_be_worked, in_progress, done, canceled] = await Promise.all([
          prisma.ticket.count({ where: { assigned_to: tech.id, status: 'to_be_worked' } }),
          prisma.ticket.count({ where: { assigned_to: tech.id, status: 'in_progress' } }),
          prisma.ticket.count({ where: { assigned_to: tech.id, status: 'done' } }),
          prisma.ticket.count({ where: { assigned_to: tech.id, status: 'canceled' } })
        ])

        return {
          user: tech,
          to_be_worked,
          in_progress,
          done,
          canceled
        }
      })
    )

    stats.by_technician = by_technician
  }

  return stats
})
