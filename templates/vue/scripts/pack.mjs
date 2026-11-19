// Zips dist/ (files at the zip root) into <name>.zip, ready to upload in My apps on dg.run.
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { zipSync } from 'fflate'

const name = JSON.parse(readFileSync('package.json', 'utf8')).name.replace(/^@[^/]+\//, '')
const walk = (dir) => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]))
const files = {}
for (const f of walk('dist')) files[relative('dist', f).split('\\').join('/')] = readFileSync(f)
if (!files['index.html']) throw new Error('dist/index.html is missing: run `npm run build` first')
const zip = zipSync(files, { level: 9 })
writeFileSync(`${name}.zip`, zip)
console.log(`${name}.zip: ${Object.keys(files).length} files, ${(zip.length / 1024).toFixed(0)} KB`)
