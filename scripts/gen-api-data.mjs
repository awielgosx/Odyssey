// Embeds the directions and rubrics into api/coach.ts so the serverless function has no relative imports
// (Vercel runs it as a Node ES module, which cannot resolve extensionless TypeScript imports).
import fs from 'node:fs'
import ts from 'typescript'

async function load(path) {
  const src = fs.readFileSync(path, 'utf8')
  const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
  return import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'))
}

const d = await load('src/content/directions.ts')
const r = await load('src/coach/rubrics.ts')
const data = {
  directions: d.DIRECTIONS.map(({ id, name, pillar, definition, questions }) => ({ id, name, pillar, definition, questions })),
  rubrics: r.RUBRICS,
  method: r.METHOD_SUMMARY,
}
const file = 'api/coach.ts'
const code = fs.readFileSync(file, 'utf8')
const out = code.replace(/\/\*DATA\*\/[\s\S]*?\/\*END\*\//, `/*DATA*/ ${JSON.stringify(data, null, 2)} /*END*/`)
fs.writeFileSync(file, out)
console.log('embedded', data.directions.length, 'directions')
