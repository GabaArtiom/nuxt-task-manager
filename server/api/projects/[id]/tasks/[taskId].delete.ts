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

  await prisma.task.delete({ where: { id: taskId } })

  return { success: true }
})
