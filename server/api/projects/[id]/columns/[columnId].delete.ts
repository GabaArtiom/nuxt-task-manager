import { prisma } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const projectId = getRouterParam(event, 'id')!
  const columnId = getRouterParam(event, 'columnId')!

  const member = await prisma.projectMember.findUnique({
    where: { project_id_user_id: { project_id: projectId, user_id: user.id } },
  })

  if (!member || member.role !== 'owner') {
    throw createError({ statusCode: 403, statusMessage: 'Only project owner can delete columns' })
  }

  await prisma.column.delete({ where: { id: columnId } })

  return { success: true }
})
