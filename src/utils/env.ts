import path from 'path'
import {createFile} from './files'

export const writeEnvFile = async (projectPath: string, vars: Record<string, string>) => {
    const lines = Object.entries(vars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')

    await createFile(path.join(projectPath, '.env'), lines)
    await createFile(path.join(projectPath, '.env.example'),
      Object.entries(vars)
        .map(([key]) => `${key}=`)
        .join('\n')
    )
}