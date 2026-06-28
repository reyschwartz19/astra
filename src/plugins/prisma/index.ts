import { Plugin, ProjectOptions } from "../types";

export const createPrismaPlugin = (options: ProjectOptions): Plugin => {
    const {projectName, useTypescript} = options
    const prismaConfig = `prisma.config.ts`
    const schemaContent = `generator client {
    provider = "prisma-client-js"
    output = "../generated/prisma"
    }
    datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
    }

    `

    const prismaConfigContent = `import path from "path"
    import {defineConfig} from "prisma/config"

    export default defineConfig({
    earlyAccess: true,
    schema: path.join('prisma', 'schema.prisma'),
    })`

    const prismaClientContent = useTypescript ? 
    `import { PrismaClient } from "../generated/prisma"
    const prisma = new PrismaClient()
    export default prisma`
    :
    `const { PrismaClient } = require("../generated/prisma")
    const prisma = new PrismaClient()
    module.exports = prisma`

    return {
            name: 'prisma',
            dependencies: ['@prisma/client'],
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
         