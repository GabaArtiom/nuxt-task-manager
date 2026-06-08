import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import { PrismaClient } from '@prisma/client'

const sqlitePath = '/var/www/tasks.umervtilte.lol/prisma/prod.db'
const prisma = new PrismaClient()

const toDate = (value) => {
  if (value === null || value === undefined) return null
  if (value instanceof Date) return value
  if (typeof value === 'number') return new Date(value)
  return new Date(value)
}

const cleanUser = (user) => ({
  ...user,
  is_locked: Boolean(user.is_locked),
  reset_token_expires_at: toDate(user.reset_token_expires_at),
  created_at: toDate(user.created_at),
})

const cleanProject = (project) => ({
  ...project,
  created_at: toDate(project.created_at),
  updated_at: toDate(project.updated_at),
})

const cleanMember = (member) => ({
  ...member,
  joined_at: toDate(member.joined_at),
})

const cleanColumn = (column) => ({
  ...column,
  created_at: toDate(column.created_at),
})

const cleanTask = (task) => ({
  ...task,
  due_date: toDate(task.due_date),
  created_at: toDate(task.created_at),
  updated_at: toDate(task.updated_at),
})

const sqlite = await open({
  filename: sqlitePath,
  driver: sqlite3.Database,
})

const users = await sqlite.all('SELECT * FROM users')
const projects = await sqlite.all('SELECT * FROM projects')
const members = await sqlite.all('SELECT * FROM project_members')
const columns = await sqlite.all('SELECT * FROM columns')
const tasks = await sqlite.all('SELECT * FROM tasks')

await prisma.$transaction(async (tx) => {
  await tx.task.deleteMany()
  await tx.column.deleteMany()
  await tx.projectMember.deleteMany()
  await tx.project.deleteMany()
  await tx.user.deleteMany()

  for (const user of users) {
    await tx.user.create({ data: cleanUser(user) })
  }

  for (const project of projects) {
    await tx.project.create({ data: cleanProject(project) })
  }

  for (const member of members) {
    await tx.projectMember.create({ data: cleanMember(member) })
  }

  for (const column of columns) {
    await tx.column.create({ data: cleanColumn(column) })
  }

  for (const task of tasks) {
    await tx.task.create({ data: cleanTask(task) })
  }
})

console.log(`Imported ${users.length} users, ${projects.length} projects, ${columns.length} columns, ${tasks.length} tasks.`)

await sqlite.close()
await prisma.$disconnect()
