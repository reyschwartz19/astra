# create-astra

A CLI tool that scaffolds production-ready backend projects with everything wired up automatically. No more manually editing config files, no more copy-pasting boilerplate.

```bash
npx create-astra
```

---

## The problem

Every time you start a backend project you repeat the same steps. Install dependencies, write a tsconfig, connect Prisma to a database adapter, write a docker-compose, set up a CI pipeline. It works but it's tedious and easy to get wrong.

create-astra does all of that in one command.

---

## What it sets up

Depending on your selections, create-astra generates a fully wired project with:

- Express app with a working entry point
- TypeScript configured correctly for Node.js
- Prisma with schema, config, adapter, and generated client
- Docker Compose with a postgres service wired to your env vars
- GitHub Actions CI pipeline that matches your stack
- `.env` and `.env.example` with all required variables
- `.gitignore` with sensible defaults
- `package.json` with all scripts ready to use

---

## Usage

```bash
npx create-astra
```

Follow the interactive prompts:

```
What is your project name? my-app
Select a language: Node.js
Select a framework: Express (TypeScript)
Select extra features: Prisma, Docker, CI/CD
```

Then:

```bash
cd my-app
npm run dev
```

---

## Generated scripts

| Script | What it does |
|---|---|
| `npm run dev` | starts the dev server |
| `npm run build` | compiles TypeScript |
| `npm run start` | runs the compiled app |
| `npm run db:generate` | generates the Prisma client |
| `npm run db:migrate` | runs database migrations |
| `npm run db:studio` | opens Prisma Studio |

---

## After setup

If you selected Prisma, you need to:

1. Set up a postgres database
2. Update `DATABASE_URL` in your `.env` with real credentials
3. Run `npm run db:migrate` to create your tables

The Prisma client is already generated during setup so TypeScript types resolve immediately.

---

## Supported stacks

| Language | Framework | Status |
|---|---|---|
| Node.js | Express (JavaScript) | available |
| Node.js | Express (TypeScript) | available |


Want to add support for a new language or framework? See [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## Supported plugins

| Plugin | What it adds |
|---|---|
| Prisma | schema, config, adapter, client, db scripts |
| Docker | Dockerfile, docker-compose, .dockerignore |
| CI/CD | GitHub Actions pipeline |

Want to add a new plugin? See [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## Local development

```bash
git clone https://github.com/your-username/create-astra
cd create-astra
npm install
npm run dev
```

---

## License

MIT