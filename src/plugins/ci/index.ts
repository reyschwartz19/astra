import { Plugin, ProjectOptions } from '../types'

export function createCiPlugin(options: ProjectOptions): Plugin {
  const { projectName, useTypescript, extras } = options
  const hasPrisma = extras.includes('prisma')

  const ciContent = `name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    ${hasPrisma ? `services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: user
          POSTGRES_PASSWORD: password
          POSTGRES_DB: mydb
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5` : ''}

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm install

      ${hasPrisma ? `- name: Generate Prisma client
        run: npm run db:generate
        env:
          DATABASE_URL: postgresql://user:password@localhost:5432/mydb` : ''}

      ${useTypescript ? `- name: Build
        run: npm run build` : ''}
`

  return {
    name: 'ci',
    dependencies: [],
    devDependencies: [],
    files: [
      {
        path: `${projectName}/.github/workflows/ci.yml`,
        content: ciContent,
      },
    ],
    envVars: {},
    packageScripts: {},
  }
}