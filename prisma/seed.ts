import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Only seed if DB is empty — never delete existing data
  const userCount = await prisma.user.count()
  if (userCount > 0) {
    console.log('Database already has data, skipping seed.')
    return
  }

  // Create users
  const admin = await prisma.user.create({
    data: {
      name: 'Alice',
      family_name: 'Admin',
      email: 'admin@example.com',
      password: await bcrypt.hash('Admin1234!', 10),
      role: 'admin',
    },
  })

  const bob = await prisma.user.create({
    data: {
      name: 'Bob',
      family_name: 'Tech',
      email: 'bob@example.com',
      password: await bcrypt.hash('Tech1234!', 10),
      role: 'technician',
    },
  })

  const carol = await prisma.user.create({
    data: {
      name: 'Carol',
      family_name: 'Tech',
      email: 'carol@example.com',
      password: await bcrypt.hash('Tech1234!', 10),
      role: 'technician',
    },
  })

  // Create tickets
  const ticketData = [
    { customer_name: 'Acme Corp', description: 'Login page crashes on mobile devices when using Chrome.', type: 'Bug', is_urgent: true, status: 'to_be_worked', assigned_to: null, created_by: admin.id },
    { customer_name: 'Globex Inc', description: 'Add dark mode support to the dashboard.', type: 'Improvement', is_urgent: false, status: 'to_be_worked', assigned_to: null, created_by: admin.id },
    { customer_name: 'Initech', description: 'Fix broken CSV export in reports section.', type: 'Fixes', is_urgent: true, status: 'in_progress', assigned_to: bob.id, created_by: admin.id },
    { customer_name: 'Umbrella Corp', description: 'Customer requesting info about API rate limits.', type: 'Info', is_urgent: false, status: 'to_be_worked', assigned_to: bob.id, created_by: admin.id },
    { customer_name: 'Stark Industries', description: 'Payment processing fails for orders above $10k.', type: 'Bug', is_urgent: true, status: 'in_progress', assigned_to: carol.id, created_by: admin.id },
    { customer_name: 'Wayne Enterprises', description: 'Typo in the Terms of Service footer link.', type: 'Typo', is_urgent: false, status: 'done', assigned_to: carol.id, created_by: admin.id },
    { customer_name: 'Cyberdyne Systems', description: 'Requested feature no longer needed after platform update.', type: 'Other', is_urgent: false, status: 'canceled', assigned_to: bob.id, created_by: admin.id },
    { customer_name: 'Oscorp', description: 'Search results return duplicates when filtering by date.', type: 'Bug', is_urgent: false, status: 'to_be_worked', assigned_to: null, created_by: bob.id },
    { customer_name: 'Weyland-Yutani', description: 'Improve loading speed of the analytics page.', type: 'Improvement', is_urgent: true, status: 'to_be_worked', assigned_to: carol.id, created_by: carol.id },
    { customer_name: 'Soylent Corp', description: 'Apply hotfix for notification emails not sending.', type: 'Fixes', is_urgent: false, status: 'in_progress', assigned_to: bob.id, created_by: admin.id },
  ]

  for (const ticket of ticketData) {
    await prisma.ticket.create({ data: ticket })
  }

  console.log('Seed data created successfully!')
  console.log(`  - 3 users (admin@example.com / Admin1234!, bob@example.com / Tech1234!, carol@example.com / Tech1234!)`)
  console.log(`  - 10 tickets`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
