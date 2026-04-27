import { prisma } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const projectId = getRouterParam(event, 'id')!
  const body = await readBody(event)

  const member = await prisma.projectMember.findUnique({
    where: { project_id_user_id: { project_id: projectId, user_id: user.id } },
  })

  if (!member || member.role !== 'owner') {
    throw createError({ statusCode: 403, statusMessage: 'Only project owner can add members' })
  }

  if (!body.email) {
    throw createError({ statusCode: 400, statusMessage: 'Email is required' })
  }

  const invitedUser = await prisma.user.findUnique({ where: { email: body.email } })
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

  return newMember
})
