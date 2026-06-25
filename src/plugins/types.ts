export interface Plugin {
    name: string
    dependencies: string[]
    devDependencies: string[]
    files: TemplateFile[]
    envVars: Record<string, string>
    packageScripts: Record<string, string>
}

export interface TemplateFile {
    path: string
    content: string
}

export interface ProjectOptions {
  projectName: string
  framework: string
  language: string
  useTypescript: boolean
  extras: string[]
}