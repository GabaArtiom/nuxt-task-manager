import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const userCount = await prisma.user.count()
  if (userCount > 0) {
    console.log('Database already has data, skipping seed.')
    return
  }

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
      family_name: 'Smith',
      email: 'bob@example.com',
      password: await bcrypt.hash('Member1234!', 10),
      role: 'member',
    },
  })

  const carol = await prisma.user.create({
    data: {
      name: 'Carol',
      family_name: 'Jones',
      email: 'carol@example.com',
      password: await bcrypt.hash('Member1234!', 10),
      role: 'member',
    },
  })

  // Create a project
  const project = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Full redesign of the company website',
      created_by: admin.id,
    },
  })

  // Add members to project
  await prisma.projectMember.createMany({
    data: [
      { project_id: project.id, user_id: admin.id, role: 'owner' },
      { project_id: project.id, user_id: bob.id, role: 'member' },
      { project_id: project.id, user_id: carol.id, role: 'member' },
    ],
  })

  // Create columns
  const [todo, inProgress, review, done] = await Promise.all([
    prisma.column.create({ data: { project_id: project.id, name: 'To Do', order: 0 } }),
    prisma.column.create({ data: { project_id: project.id, name: 'In Progress', order: 1 } }),
    prisma.column.create({ data: { project_id: project.id, name: 'Review', order: 2 } }),
    prisma.column.create({ data: { project_id: project.id, name: 'Done', order: 3 } }),
  ])

  // Create tasks
  await prisma.task.createMany({
    data: [
      { project_id: project.id, column_id: todo.id, title: 'Design new homepage', priority: 'high', created_by: admin.id, order: 0 },
      { project_id: project.id, column_id: todo.id, title: 'Write content for About page', priority: 'medium', created_by: admin.id, order: 1 },
      { project_id: project.id, column_id: todo.id, title: 'Set up analytics', priority: 'low', created_by: bob.id, order: 2 },
      { project_id: project.id, column_id: inProgress.id, title: 'Build navigation component', priority: 'high', assigned_to: bob.id, created_by: admin.id, order: 0 },
      { project_id: project.id, column_id: inProgress.id, title: 'Implement mobile responsiveness', priority: 'urgent', assigned_to: carol.id, created_by: admin.id, order: 1 },
      { project_id: project.id, column_id: review.id, title: 'Color palette selection', priority: 'medium', assigned_to: carol.id, created_by: admin.id, order: 0 },
      { project_id: project.id, column_id: done.id, title: 'Project kickoff meeting', priority: 'medium', created_by: admin.id, order: 0 },
      { project_id: project.id, column_id: done.id, title: 'Competitor analysis', priority: 'low', assigned_to: bob.id, created_by: admin.id, order: 1 },
    ],
  })

  console.log('Seed data created successfully!')
  console.log('  - 3 users: admin@example.com / Admin1234!, bob@example.com / Member1234!, carol@example.com / Member1234!')
  console.log('  - 1 project with 4 columns and 8 tasks')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
