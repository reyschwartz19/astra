import { Plugin, ProjectOptions } from "../types";

export const createPrismaPlugin = (options: ProjectOptions): Plugin => {
    const {projectName, useTypescript} = options
    const prismaConfig = `prisma.config.ts`
    const schemaContent = `generator client {
    provider = "prisma-client"
    output   = "../generated/prisma"
    }

    datasource db {
    provider = "postgresql"
    }`  

    const prismaConfigContent = `import path from 'path'
  import { defineConfig } from 'prisma/config'

  export default defineConfig({
  earlyAccess: true,
  schema: path.join('prisma', 'schema.prisma'),
  migrate: {
    async adapter() {
      const { PrismaPg } = await import('@prisma/adapter-pg')
      return new PrismaPg({ connectionString: process.env.DATABASE_URL })
    }
  }
})`

    const prismaClientContent = useTypescript
  ? `import { PrismaClient } from '../../generated/prisma'
  import { PrismaPg } from '@prisma/adapter-pg'

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  const prisma = new PrismaClient({ adapter })

  export default prisma`
  : `const { PrismaClient } = require('../../generated/prisma')
  const { PrismaPg } = require('@prisma/adapter-pg')

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

  module.exports = prisma`  

    return {
            name: 'prisma',
            dependencies: ['@prisma/client', '@prisma/adapter-pg', 'pg'],
            devDependencies: ['prisma'],
            files: [
                {
                    path: `${projectName}/prisma/schema.prisma`,
                    content: schemaContent
                },
                {
                    path: `${projectName}/${prismaConfig}`,
                    content: prismaConfigContent
                },
                {
                    path: `${projectName}/src/lib/prisma.${useTypescript ? 'ts' : 'js'}`,
                    content: prismaClientContent

                }
            ],
            envVars: {
                DATABASE_URL: 'postgresql://user:password@localhost:5432/mydb'
            },
            packageScripts: {
                'db:generate': 'prisma generate',
                'db:migrate': 'prisma migrate dev',
                'db:studio': 'prisma studio'
            }
        }
}
         