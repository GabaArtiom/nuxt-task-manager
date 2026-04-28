import { prisma } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')!

  const project = await prisma.project.findFirst({
    where: user.role === 'super_admin' ? { id } : {
      id,
      members: { some: { user_id: user.id } },
    },
    include: {
      creator: { select: { id: true, name: true, family_name: true } },
      members: {
        include: { user: { select: { id: true, name: true, family_name: true, email: true } } },
      },
      columns: {
        orderBy: { order: 'asc' },
        include: {
          tasks: {
            orderBy: { order: 'asc' },
            include: {
              assignee: { select: { id: true, name: true, family_name: true } },
              creator: { select: { id: true, name: true, family_name: true } },
            },
          },
        },
      },
    },
  })

  if (!project) {
    throw createError({ statusCode: 404, statusMessage: 'Project not found' })
  }

  return project
})
