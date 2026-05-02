import { prisma } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'
import { broadcastToProject, broadcastToUsers } from '~~/server/utils/broadcast'

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

  broadcastToProject(projectId, 'member:removed', { user_id: targetUserId, triggered_by: user.id })
  broadcastToUsers([targetUserId], 'project:list:remove', { project_id: projectId, triggered_by: user.id })

  return { success: true }
})
