type SSEClient = {
  send: (data: string) => void
  userId: string
  role: string
}

const clients = new Set<SSEClient>()

export function addSSEClient(client: SSEClient) {
  clients.add(client)
  return () => clients.delete(client)
}

export function broadcast(type: string, data: any) {
  const payload = JSON.stringify({ type, data })

  for (const client of clients) {
    try {
      // Filter broadcasts based on user role and ticket assignment
      if (shouldReceiveBroadcast(client, type, data)) {
        client.send(payload)
      }
    } catch {}
  }
}

function shouldReceiveBroadcast(client: SSEClient, type: string, data: any): boolean {
  // Admins see everything
  if (client.role === 'admin') return true

  // For ticket events, technicians only see:
  // 1. Unassigned tickets (assigned_to is null)
  // 2. Tickets assigned to them
  // 3. Tickets they created
  if (type.startsWith('ticket:')) {
    const isUnassigned = !data.assigned_to
    const isAssignedToMe = data.assigned_to === client.userId
    const isCreatedByMe = data.created_by === client.userId

    return isUnassigned || isAssignedToMe || isCreatedByMe
  }

  // Default: don't broadcast
  return false
}
