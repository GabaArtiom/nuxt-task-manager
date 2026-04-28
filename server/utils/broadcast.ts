import { prisma } from './db'
import { broadcast } from './sse'

export async function broadcastToProject(projectId: string, type: string, data: object) {
  const members = await prisma.projectMember.findMany({
    where: { project_id: projectId },
    select: { user_id: true },
  })
  const memberIds = new Set(members.map((m) => m.user_id))
  broadcast(type, { project_id: projectId, ...data }, memberIds)
}
