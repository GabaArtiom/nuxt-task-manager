import { prisma } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'
import { broadcastToUsers } from '~~/server/utils/broadcast'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)

  if (!body.name?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Project name is required' })
  }

  const project = await prisma.project.create({
    data: {
      name: body.name.trim(),
      description: body.description?.trim() || null,
      created_by: user.id,
      members: {
        create: { user_id: user.id, role: 'owner' },
      },
      columns: {
        createMany: {
          data: [
            { name: 'To Do', order: 0 },
            { name: 'In Progress', order: 1 },
            { name: 'Done', order: 2 },
          ],
        },
      },
    },
    include: {
      members: { include: { user: { select: { id: true, name: true, family_name: true, email: true } } } },
      columns: true,
      _count: { select: { tasks: true } },
    },
  })

  broadcastToUsers([user.id], 'project:list:upsert', { project, triggered_by: user.id })

  return project
})
