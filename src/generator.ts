import * as clack from '@clack/prompts'
import path from 'path'
import { execa } from 'execa'
import fs from 'fs/promises'
import { ProjectOptions } from './plugins/types'
import { createBasePlugin } from './plugins/base'
import { createPrismaPlugin } from './plugins/prisma'
import { createDockerPlugin } from './plugins/docker'
import { createCiPlugin } from './plugins/ci'
import { createFile, createFolder } from './utils/files'
import { installPackages } from './utils/packages'
import { writeEnvFile } from './utils/env'

export async function generateProject(options: ProjectOptions) {
  if (options.language === 'node') {
    await generateNodeProject(options)
  } else {
    clack.outro('This language is coming soon. Want to contribute? github.com/you/create-astra')
    process.exit(0)
  }
}

async function generateNodeProject(options: ProjectOptions) {
  const { projectName, extras } = options
  const projectPath = path.join(process.cwd(), projectName)

  const spinner = clack.spinner()


  const plugins = [
    ...(options.language === 'node' ? [createBasePlugin(options)] : []),
    ...(extras.includes('prisma') ? [createPrismaPlugin(options)] : []),
    ...(extras.includes('docker') ? [createDockerPlugin(options)] : []),
    ...(extras.includes('ci') ? [createCiPlugin(options)] : []),
  ]


  const dependencies = plugins.flatMap(p => p.dependencies)
  const devDependencies = plugins.flatMap(p => p.devDependencies)
  const envVars = plugins.reduce((acc, p) => ({ ...acc, ...p.envVars }), {} as Record<string, string>)
  const packageScripts = plugins.reduce((acc, p) => ({ ...acc, ...p.packageScripts }), {} as Record<string, string>)
  const files = plugins.flatMap(p => p.files)

 
  spinner.start('Initialising project...')
  try {
    await createFolder(projectPath)
    await execa('npm', ['init', '-y'], { cwd: projectPath })
    spinner.stop('Project initialised!')
  } catch (err) {
    spinner.stop('Failed.')
    clack.log.error('Could not initialise project.')
    console.error(err)
    process.exit(1)
  }

  
  spinner.start('Creating files...')
  try {
    for (const file of files) {
      await createFile(file.path, file.content)
    }
    await writeGitignore(projectPath)
    spinner.stop('Files created!')
  } catch (err) {
    spinner.stop('Failed.')
    clack.log.error('Could not create files.')
    console.error(err)
    process.exit(1)
  }


  spinner.start('Writing environment variables...')
  try {
    await writeEnvFile(projectPath, envVars)
    spinner.stop('Environment variables written!')
  } catch (err) {
    spinner.stop('Failed.')
    clack.log.error('Could not write env files.')
    console.error(err)
    process.exit(1)
  }

  
  spinner.start('Installing dependencies...')
  try {
    await installPackages(dependencies, projectPath)
    await installPackages(devDependencies, projectPath, true)
    spinner.stop('Dependencies installed!')
  } catch (err) {
    spinner.stop('Failed.')
    clack.log.error('Could not install dependencies.')
    process.exit(1)
  }

  
  spinner.start('Configuring package.json...')
  try {
    await patchPackageJson(projectPath, packageScripts)
    spinner.stop('package.json configured!')
  } catch (err) {
    spinner.stop('Failed.')
    clack.log.error('Could not configure package.json.')
    process.exit(1)
  }

  clack.outro(`Your project is ready! cd ${projectName} and npm run dev to start.`)
}

async function writeGitignore(projectPath: string) {
  await createFile(
    path.join(projectPath, '.gitignore'),
    `node_modules\ndist\n.env\ngenerated\n`
  )
}

async function patchPackageJson(
  projectPath: string,
  scripts: Record<string, string>
) {
  const packageJsonPath = path.join(projectPath, 'package.json')
  const raw = await fs.readFile(packageJsonPath, 'utf-8')
  const packageJson = JSON.parse(raw)
  packageJson.scripts = { ...packageJson.scripts, ...scripts }
  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2))
}