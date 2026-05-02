import { prisma } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'
import { broadcastToProject } from '~~/server/utils/broadcast'
import { randomUUID } from 'node:crypto'

function normalizeChecklist(value: unknown) {
  if (!Array.isArray(value)) return undefined
  return value
    .filter((item) => item && typeof item === 'object')
    .map((item: any) => ({
      id: String(item.id || randomUUID()),
      title: String(item.title || '').trim(),
      checked: Boolean(item.checked),
    }))
    .filter((item) => item.title.length > 0)
}

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

  if (!body.title?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Task title is required' })
  }

  if (!body.column_id) {
    throw createError({ statusCode: 400, statusMessage: 'column_id is required' })
  }

  const lastTask = await prisma.task.findFirst({
    where: { column_id: body.column_id },
    orderBy: { order: 'desc' },
  })

  const task = await prisma.task.create({
    data: {
      project_id: projectId,
      column_id: body.column_id,
      title: body.title.trim(),
      description: body.description?.trim() || null,
      priority: body.priority || 'medium',
      assigned_to: body.assigned_to || null,
      due_date: body.due_date ? new Date(body.due_date) : null,
      checklist: normalizeChecklist(body.checklist) ?? undefined,
      created_by: user.id,
      order: (lastTask?.order ?? -1) + 1,
    },
    include: {
      assignee: { select: { id: true, name: true, family_name: true } },
      creator: { select: { id: true, name: true, family_name: true } },
    },
  })

  broadcastToProject(projectId, 'task:created', { task, triggered_by: user.id })

  return task
})
