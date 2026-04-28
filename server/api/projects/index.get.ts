import { prisma } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const projects = await prisma.project.findMany({
    where: user.role === 'super_admin' ? {} : {
      members: { some: { user_id: user.id } },
    },
    include: {
      creator: { select: { id: true, name: true, family_name: true } },
      members: {
        include: { user: { select: { id: true, name: true, family_name: true, email: true } } },
      },
      _count: { select: { tasks: true, columns: true } },
    },
    orderBy: { created_at: 'desc' },
  })

  return projects
})
