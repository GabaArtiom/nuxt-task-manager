import { prisma } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'
import { broadcastToProject } from '~~/server/utils/broadcast'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const projectId = getRouterParam(event, 'id')!
  const body = await readBody(event)

  const member = await prisma.projectMember.findUnique({
    where: { project_id_user_id: { project_id: projectId, user_id: user.id } },
  })

  if (!member) {
    throw createError({ statusCode: 403, statusMessage: 'Not a project member' })
  }

  const updates = Array.isArray(body.updates) ? body.updates : []
  if (!updates.length) {
    throw createError({ statusCode: 400, statusMessage: 'updates are required' })
  }

  const taskIds = updates.map((item: any) => String(item.id))
  const existingTasks = await prisma.task.findMany({
    where: { id: { in: taskIds }, project_id: projectId },
    select: { id: true },
  })
  const existingIds = new Set(existingTasks.map((task) => task.id))

  if (existingIds.size !== taskIds.length) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid task reorder payload' })
  }

  await prisma.$transaction(
    updates.map((item: any) =>
      prisma.task.update({
        where: { id: String(item.id) },
        data: {
          column_id: String(item.column_id),
          order: Number(item.order),
        },
      })
    )
  )

  const columns = await prisma.column.findMany({
    where: { project_id: projectId },
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
  })

  broadcastToProject(projectId, 'tasks:reordered', { columns, triggered_by: user.id })

  return { columns }
})
