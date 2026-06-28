#!/usr/bin/env node

import { getProjectOptions } from './prompts'
import { generateProject } from './generator'

async function main() {
  const options = await getProjectOptions()
  await generateProject(options)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})