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

export function broadcast(type: string, data: any, allowedUserIds: Set<string>) {
  const payload = JSON.stringify({ type, data })
  for (const client of clients) {
    try {
      if (client.role === 'super_admin' || allowedUserIds.has(client.userId)) {
        client.send(payload)
      }
    } catch {}
  }
}
