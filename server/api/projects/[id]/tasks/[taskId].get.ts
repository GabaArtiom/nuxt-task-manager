import { prisma } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const projectId = getRouterParam(event, 'id')!
  const taskId = getRouterParam(event, 'taskId')!

  const member = await prisma.projectMember.findUnique({
    where: { project_id_user_id: { project_id: projectId, user_id: user.id } },
  })

  if (!member) {
    throw createError({ statusCode: 403, statusMessage: 'Not a project member' })
  }

  const task = await prisma.task.findFirst({
    where: { id: taskId, project_id: projectId },
    include: {
      assignee: { select: { id: true, name: true, family_name: true, email: true } },
      creator: { select: { id: true, name: true, family_name: true } },
      column: true,
    },
  })

  if (!task) {
    throw createError({ statusCode: 404, statusMessage: 'Task not found' })
  }

  return task
})
