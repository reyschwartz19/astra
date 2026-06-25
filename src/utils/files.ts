import fs from 'fs/promises'
import path from 'path'

export async function createFolder(folderPath:string) {
    await fs.mkdir(folderPath, { recursive: true })
    
}

export async function createFile(filePath: string, content: string) {
   const dir =  path.dirname(filePath)
   await fs.mkdir(dir, {recursive: true})
   await fs.writeFile(filePath, content, 'utf-8')
}