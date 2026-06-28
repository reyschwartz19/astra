import { Plugin, ProjectOptions } from '../types'

export function createDockerPlugin(options: ProjectOptions): Plugin {
  const { projectName, extras } = options
  const hasPrisma = extras.includes('prisma')

  const dockerComposeContent = `services:
  app:
    build: .
    ports:
      - "\${PORT}:3000"
    env_file:
      - .env
    depends_on:
      ${hasPrisma ? '- postgres' : ''}

${hasPrisma ? `  postgres:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: mydb
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data` : ''}

${hasPrisma ? `volumes:
  postgres_data:` : ''}
`

  const dockerfileContent = `FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

${options.useTypescript ? 'RUN npm run build\nCMD ["node", "dist/index.js"]' : 'CMD ["node", "src/index.js"]'}
`

  const dockerignoreContent = `node_modules
dist
.env
generated
`

  return {
    name: 'docker',
    dependencies: [],
    devDependencies: [],
    files: [
      {
        path: `${projectName}/docker-compose.yml`,
        content: dockerComposeContent,
      },
      {
        path: `${projectName}/Dockerfile`,
        content: dockerfileContent,
      },
      {
        path: `${projectName}/.dockerignore`,
        content: dockerignoreContent,
      },
    ],
    envVars: {},
    packageScripts: {},
  }
}