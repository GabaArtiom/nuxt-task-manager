import { prisma } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'
import { broadcastToProject, broadcastToUsers } from '~~/server/utils/broadcast'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const projectId = getRouterParam(event, 'id')!
  const body = await readBody(event)

  if (user.role !== 'super_admin') {
    const member = await prisma.projectMember.findUnique({
      where: { project_id_user_id: { project_id: projectId, user_id: user.id } },
    })

    if (!member || member.role !== 'owner') {
      throw createError({ statusCode: 403, statusMessage: 'Only project owner can add members' })
    }
  }

  if (!body.user_id && !body.email) {
    throw createError({ statusCode: 400, statusMessage: 'user_id or email is required' })
  }

  const invitedUser = body.user_id
    ? await prisma.user.findUnique({ where: { id: body.user_id } })
    : await prisma.user.findUnique({ where: { email: body.email } })

  if (!invitedUser) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  const existing = await prisma.projectMember.findUnique({
    where: { project_id_user_id: { project_id: projectId, user_id: invitedUser.id } },
  })

  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'User is already a member' })
  }

  const newMember = await prisma.projectMember.create({
    data: { project_id: projectId, user_id: invitedUser.id, role: 'member' },
    include: { user: { select: { id: true, name: true, family_name: true, email: true } } },
  })

  broadcastToProject(projectId, 'member:added', { member: newMember, triggered_by: user.id })

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      creator: { select: { id: true, name: true, family_name: true } },
      members: {
        include: { user: { select: { id: true, name: true, family_name: true, email: true } } },
      },
      _count: { select: { tasks: true, columns: true } },
    },
  })

  if (project) {
    broadcastToUsers([invitedUser.id], 'project:list:upsert', { project, triggered_by: user.id })
  }

  return newMember
})
