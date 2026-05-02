import { prisma } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'
import { broadcastToProject } from '~~/server/utils/broadcast'
import { randomUUID } from 'node:crypto'

function normalizeChecklist(value: unknown) {
  if (!Array.isArray(value)) return []
  return value
    .filter((item) => item && typeof item === 'object')
    .map((item: any) => ({
      id: String(item.id || randomUUID()),
      title: String(item.title || '').trim(),
      checked: Boolean(item.checked),
    }))
    .filter((item) => item.title.length > 0)
}

function normalizeAttachments(value: unknown) {
  if (!Array.isArray(value)) return []
  return value
    .filter((item) => item && typeof item === 'object')
    .map((item: any) => ({
      id: String(item.id || randomUUID()),
      name: String(item.name || '').trim(),
      url: String(item.url || ''),
      size: Number(item.size || 0),
      type: String(item.type || ''),
      uploaded_at: String(item.uploaded_at || new Date().toISOString()),
    }))
    .filter((item) => item.name && item.url)
}

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const projectId = getRouterParam(event, 'id')!
  const taskId = getRouterParam(event, 'taskId')!
  const body = await readBody(event)

  const member = await prisma.projectMember.findUnique({
    where: { project_id_user_id: { project_id: projectId, user_id: user.id } },
  })

  if (!member) {
    throw createError({ statusCode: 403, statusMessage: 'Not a project member' })
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(body.title !== undefined && { title: body.title.trim() }),
      ...(body.description !== undefined && { description: body.description?.trim() || null }),
      ...(body.priority !== undefined && { priority: body.priority }),
      ...(body.column_id !== undefined && { column_id: body.column_id }),
      ...(body.assigned_to !== undefined && { assigned_to: body.assigned_to || null }),
      ...(body.due_date !== undefined && { due_date: body.due_date ? new Date(body.due_date) : null }),
      ...(body.checklist !== undefined && { checklist: normalizeChecklist(body.checklist) }),
      ...(body.attachments !== undefined && { attachments: normalizeAttachments(body.attachments) }),
      ...(body.order !== undefined && { order: body.order }),
    },
    include: {
      assignee: { select: { id: true, name: true, family_name: true } },
      creator: { select: { id: true, name: true, family_name: true } },
    },
  })

  broadcastToProject(projectId, 'task:updated', { task, triggered_by: user.id })

  return task
})
