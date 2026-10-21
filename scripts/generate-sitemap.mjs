#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

const root = path.resolve(import.meta.dirname, '..')
const base = 'https://zirvey.github.io/DevOps-Learn'
const chaptersDir = path.join(root, 'src/content/chapters')

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(p, files)
    else if (ent.name.endsWith('.ts') && ent.name !== 'index.ts') files.push(p)
  }
  return files
}

const slugs = new Set()
for (const filePath of walk(chaptersDir)) {
  const text = fs.readFileSync(filePath, 'utf8')
  const sf = ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true)
  function visit(node) {
    if (ts.isObjectLiteralExpression(node)) {
      for (const p of node.properties) {
        if (
          ts.isPropertyAssignment(p) &&
          ts.isIdentifier(p.name) &&
          p.name.text === 'slug' &&
          (ts.isStringLiteral(p.initializer) ||
            ts.isNoSubstitutionTemplateLiteral(p.initializer))
        ) {
          slugs.add(p.initializer.text)
        }
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)
}

const urls = [
  `${base}/`,
  `${base}/glossary`,
  ...[...slugs].sort().map((s) => `${base}/chapter/${s}`),
]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (loc) => `  <url>
    <loc>${loc}</loc>
    <changefreq>weekly</changefreq>
  </url>`,
  )
  .join('\n')}
</urlset>
`

const out = path.join(root, 'public/sitemap.xml')
fs.writeFileSync(out, xml)
console.log(`Wrote ${out} with ${urls.length} URLs`)
