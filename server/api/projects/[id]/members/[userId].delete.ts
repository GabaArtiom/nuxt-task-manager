import { prisma } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const projectId = getRouterParam(event, 'id')!
  const targetUserId = getRouterParam(event, 'userId')!

  const member = await prisma.projectMember.findUnique({
    where: { project_id_user_id: { project_id: projectId, user_id: user.id } },
  })

  if (!member || member.role !== 'owner') {
    throw createError({ statusCode: 403, statusMessage: 'Only project owner can remove members' })
  }

  if (targetUserId === user.id) {
    throw createError({ statusCode: 400, statusMessage: 'Cannot remove yourself as owner' })
  }

  await prisma.projectMember.delete({
    where: { project_id_user_id: { project_id: projectId, user_id: targetUserId } },
  })

  return { success: true }
})
