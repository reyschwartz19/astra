# Contributing to create-astra

Thank you for your interest in contributing. create-astra is designed to be easy to extend. The two main contribution surfaces are plugins and language generators. You don't need to touch the core CLI logic to add either.

---

## Project structure

```
create-astra/
├── src/
│   ├── index.ts              # entry point, starts the CLI
│   ├── prompts.ts            # interactive prompts
│   ├── generator.ts          # orchestrates plugin execution
│   ├── utils/
│   │   ├── files.ts          # createFile, createFolder helpers
│   │   ├── packages.ts       # installPackages helper
│   │   └── env.ts            # writeEnvFile helper
│   └── plugins/
│       ├── types.ts          # Plugin and ProjectOptions interfaces
│       ├── base/             # Express setup plugin
│       ├── prisma/           # Prisma plugin
│       ├── docker/           # Docker Compose plugin
│       └── ci/               # GitHub Actions plugin
```

---

## Adding a new plugin

A plugin is a folder inside `src/plugins/` with an `index.ts` that exports a function returning a `Plugin` object.

### 1. Create the plugin folder

```bash
mkdir src/plugins/redis
touch src/plugins/redis/index.ts
```

### 2. Implement the plugin

Every plugin follows the same contract defined in `src/plugins/types.ts`:

```ts
import { Plugin, ProjectOptions } from '../types'

export function createRedisPlugin(options: ProjectOptions): Plugin {
  const { projectName, useTypescript } = options
  const ext = useTypescript ? 'ts' : 'js'

  const redisClientContent = useTypescript
    ? `import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

export default redis`
    : `const Redis = require('ioredis')

const redis = new Redis(process.env.REDIS_URL)

module.exports = redis`

  return {
    name: 'redis',
    dependencies: ['ioredis'],
    devDependencies: [],
    files: [
      {
        path: \`\${projectName}/src/lib/redis.\${ext}\`,
        content: redisClientContent,
      }
    ],
    envVars: {
      REDIS_URL: 'redis://localhost:6379',
    },
    packageScripts: {},
  }
}
```

### 3. Register the plugin in the prompt

Open `src/prompts.ts` and add your plugin to the extras multiselect:

```ts
const extras = await clack.multiselect({
  message: 'Select extra features:',
  options: [
    { value: 'prisma', label: 'Prisma' },
    { value: 'redis', label: 'Redis' },      // add this
    { value: 'docker', label: 'Docker' },
    { value: 'ci', label: 'CI/CD' },
  ]
})
```

### 4. Register the plugin in the generator

Open `src/generator.ts` and import your plugin, then add it to the plugins array:

```ts
import { createRedisPlugin } from './plugins/redis'

const plugins = [
  ...(options.language === 'node' ? [createBasePlugin(options)] : []),
  ...(extras.includes('prisma') ? [createPrismaPlugin(options)] : []),
  ...(extras.includes('redis') ? [createRedisPlugin(options)] : []),   // add this
  ...(extras.includes('docker') ? [createDockerPlugin(options)] : []),
  ...(extras.includes('ci') ? [createCiPlugin(options)] : []),
]
```

That's it. The generator automatically picks up your plugin's dependencies, files, env vars, and scripts without any other changes.

### Plugin interface reference

```ts
export interface Plugin {
  name: string                           // plugin identifier
  dependencies: string[]                 // npm install
  devDependencies: string[]              // npm install --save-dev
  files: TemplateFile[]                  // files to generate
  envVars: Record<string, string>        // written to .env and .env.example
  packageScripts: Record<string, string> // added to package.json scripts
}

export interface TemplateFile {
  path: string      // relative to cwd, must include projectName as prefix
  content: string   // exact file content
}
```

### Tips for writing plugins

File paths must include the project name as a prefix:

```ts
// correct
path: `${projectName}/src/lib/redis.ts`

// wrong, will try to write to system root
path: `src/lib/redis.ts`
```

Check other selected plugins using `extras.includes()` to make your plugin context-aware. For example the Docker plugin adds a Redis service to `docker-compose.yml` if Redis is also selected:

```ts
const hasRedis = extras.includes('redis')
```

Always provide both TypeScript and JavaScript versions of generated code files using `useTypescript`:

```ts
const content = useTypescript
  ? `import Redis from 'ioredis'...`
  : `const Redis = require('ioredis')...`
```

---

## Adding a new language generator

If you want to add support for a new language like Python or Go:

### 1. Add the language to the prompt

Open `src/prompts.ts` and add to the language select:

```ts
options: [
  { value: 'node', label: 'Node.js' },
  { value: 'python', label: 'Python' },  // add this
]
```

### 2. Add framework options for that language

```ts
const frameworkOptions: Record<string, { value: string, label: string }[]> = {
  node: [...],
  python: [
    { value: 'fastapi', label: 'FastAPI' },
    { value: 'flask', label: 'Flask' },
  ],
}
```

### 3. Create a generator function

Create `src/generators/python.ts`:

```ts
import { ProjectOptions } from '../plugins/types'

export async function generatePythonProject(options: ProjectOptions) {
  // create requirements.txt
  // create main.py with FastAPI or Flask app
  // create Dockerfile configured for Python
  // tell user to run pip install -r requirements.txt
}
```

### 4. Wire it into the router

Open `src/generator.ts` and add:

```ts
import { generatePythonProject } from './generators/python'

export async function generateProject(options: ProjectOptions) {
  if (options.language === 'node') {
    await generateNodeProject(options)
  } else if (options.language === 'python') {
    await generatePythonProject(options)
  } else {
    clack.outro('This language is coming soon.')
    process.exit(0)
  }
}
```

You never touch the Node generator. Your work is entirely additive.

---

## Running locally

```bash
git clone https://github.com/your-username/create-astra
cd create-astra
npm install
npm run dev
```

---

## Pull request checklist

Before opening a PR, make sure:

- your plugin follows the `Plugin` interface in `src/plugins/types.ts`
- file paths include `projectName` as a prefix
- generated code has both TypeScript and JavaScript versions where applicable
- you tested the full flow with `npm run dev`
- you updated the supported stacks or plugins table in `README.md`

---

## Questions

Open an issue on GitHub and we'll help you get started.