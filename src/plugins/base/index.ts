import { Plugin, ProjectOptions } from '../types'

export const createBasePlugin = (options: ProjectOptions): Plugin => {
    const { projectName, useTypescript} = options
    const ext = useTypescript ? 'ts' : 'js'
    const srcEntry = useTypescript ? 
`import express from 'express'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

app.get('/', (req,res) => {
res.json({message: 'Hello from ${projectName}'})

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`)
})
`
 :
  `const express = require('express')
   const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'Hello from ${projectName}!' })
})

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`)
})
  `
  return{
    name: 'base',
    dependencies: ['express'],
    devDependencies: useTypescript 
      ? ['typescript', 'ts-node', '@types/node', '@types/express']
      : [],
    files: [
        {
            path: `${projectName}/src/index.${ext}`,
            content: srcEntry
        },
    ...(useTypescript ? [{
        path: `${projectName}/tsconfig.json`,
        content: JSON.stringify({
          compilerOptions: {
            target: 'es2020',
            module: 'commonjs',
            rootDir: 'src',
            outDir: 'dist',
            strict: true,
            esModuleInterop: true,
            types: ['node']
          },
          include: ['src/**/*']
        }, null, 2)
      }] : []),    
    ],
     envVars: {
      PORT: '3000',
      NODE_ENV: 'development',
    },
    packageScripts: useTypescript ? {
      dev: 'ts-node src/index.ts',
      build: 'tsc',
      start: 'node dist/index.js',
    } : {
      dev: 'node src/index.js',
      start: 'node src/index.js',
    }
  }
}