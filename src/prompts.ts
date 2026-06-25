import * as clack from "@clack/prompts";

export const getProjectOptions = async () => {
    clack.intro('Welcome to create-astra!')

    const projectName = await clack.text({
        message: 'What is your project name?',
        placeholder: 'my-app',
    }) 

    if (clack.isCancel(projectName)) {
        clack.cancel('Operation cancelled.')
        process.exit(0)
    }

    const language = await clack.select({
        message: 'Select a language:',
        options: [
            {value: 'node', label: 'Js(node)'}
        ]
    })

    if (clack.isCancel(language)) {
        clack.cancel('Operation cancelled.')
        process.exit(0)
    }

    const frameworkOptions: Record<string, {value: string, label: string}[]> = {
     node: [
      { value: 'express', label: 'Express (JavaScript)' },
      { value: 'express-ts', label: 'Express (TypeScript)' },
      { value: 'fastify', label: 'Fastify (coming soon)' },
    ],
     python: [
      { value: 'fastapi', label: 'FastAPI' },
      { value: 'flask', label: 'Flask' },
    ],
     go: [
      { value: 'gin', label: 'Gin' },
      { value: 'fiber', label: 'Fiber' },
    ],
    }

    const framework = await clack.select({
        message: 'Select a framework:',
        options: frameworkOptions[language as string] 
    })

    if (clack.isCancel(framework)) {
        clack.cancel('Operation cancelled.')
        process.exit(0)
    }

    const extras = await clack.multiselect({
        message: 'Select extra features:',
        options: [
            {value: 'prisma', label: 'Prisma'},
            {value: 'docker', label: 'Docker'},
            {value: 'ci', label: 'CI/CD'},
        ]
    })

    if (clack.isCancel(extras)) {
        clack.cancel('Operation cancelled.')
        process.exit(0)
    }

    return {
        projectName: projectName as string,
        language: language as string,
        framework: framework as string,
        extras: extras as string[],
        useTypescript: (framework as string) === 'express-ts'
    }
}