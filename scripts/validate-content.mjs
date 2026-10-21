#!/usr/bin/env node
/**
 * Content integrity checks for quizzes, chapters, and terminal labs.
 * Run: node scripts/validate-content.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

const root = path.resolve(import.meta.dirname, '..')
const contentRoot = path.join(root, 'src/content')

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(p, files)
    else if (ent.name.endsWith('.ts')) files.push(p)
  }
  return files
}

function getString(node) {
  if (!node) return null
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text
  }
  if (ts.isTemplateExpression(node)) return node.getText().slice(1, -1)
  return null
}

const errors = []
const warnings = []
let quizCount = 0
let chapterCount = 0

for (const filePath of walk(contentRoot)) {
  const text = fs.readFileSync(filePath, 'utf8')
  const sf = ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true)

  function visit(node) {
    if (ts.isObjectLiteralExpression(node)) {
      const props = {}
      for (const p of node.properties) {
        if (ts.isPropertyAssignment(p) && ts.isIdentifier(p.name)) {
          props[p.name.text] = p.initializer
        }
      }

      if (props.question && props.answer) {
        quizCount++
        const line = sf.getLineAndCharacterOfPosition(node.getStart()).line + 1
        const answer = getString(props.answer) ?? ''
        const type = props.type ? getString(props.type) : null

        if (props.options && ts.isArrayLiteralExpression(props.options)) {
          const options = props.options.elements.map((el) => getString(el))
          if (options.some((o) => !o || !o.trim())) {
            errors.push(`${filePath}:${line} blank quiz option`)
          }
          if (!type || type === 'single' || type === 'spot-error') {
            if (answer && !options.includes(answer)) {
              errors.push(
                `${filePath}:${line} answer not in options: ${JSON.stringify(answer.slice(0, 80))}`,
              )
            }
          }
          if (type === 'multi' && props.answers && ts.isArrayLiteralExpression(props.answers)) {
            for (const el of props.answers.elements) {
              const a = getString(el)
              if (a && !options.includes(a)) {
                errors.push(`${filePath}:${line} multi answer missing from options: ${a}`)
              }
            }
          }
          if (
            type === 'order' &&
            props.correctOrder &&
            ts.isArrayLiteralExpression(props.correctOrder)
          ) {
            const order = props.correctOrder.elements.map((el) => getString(el))
            const sortedOpts = [...options].sort().join('|')
            const sortedOrder = [...order].sort().join('|')
            if (sortedOpts !== sortedOrder) {
              errors.push(`${filePath}:${line} order items must match options set`)
            }
          }
        } else if (!props.options) {
          warnings.push(`${filePath}:${line} quiz without options (open-ended)`)
        }
      }

      if (props.slug && props.sections && props.title) {
        chapterCount++
        const slug = getString(props.slug)
        if (props.practice && ts.isArrayLiteralExpression(props.practice)) {
          if (props.practice.elements.length === 0) {
            warnings.push(`${filePath} chapter ${slug} has empty practice`)
          }
        }
      }
    }
    ts.forEachChild(node, visit)
  }

  visit(sf)
}

// EN terminal labs must cover every RU lab slug except linux/git
// (those embed EN labs in their chapter translations).
const labsRuPath = path.join(contentRoot, 'terminal-labs.ts')
const labsEnPath = path.join(contentRoot, 'en', 'terminal-labs.ts')
const chapterEmbeddedEnLabs = new Set(['linux', 'git'])

function extractTopLevelObjectKeys(filePath) {
  const text = fs.readFileSync(filePath, 'utf8')
  const sf = ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true)
  const keys = []
  function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      /LabsBySlug|terminalLabs/.test(node.name.getText()) &&
      node.initializer &&
      ts.isObjectLiteralExpression(node.initializer)
    ) {
      for (const p of node.initializer.properties) {
        if (ts.isPropertyAssignment(p)) {
          const key = ts.isStringLiteral(p.name)
            ? p.name.text
            : ts.isIdentifier(p.name)
              ? p.name.text
              : null
          if (key) keys.push(key)
        }
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)
  return keys
}

if (fs.existsSync(labsRuPath) && fs.existsSync(labsEnPath)) {
  const ruLabKeys = new Set(extractTopLevelObjectKeys(labsRuPath))
  const enLabKeys = new Set(extractTopLevelObjectKeys(labsEnPath))
  for (const key of ruLabKeys) {
    if (chapterEmbeddedEnLabs.has(key)) continue
    if (!enLabKeys.has(key)) {
      errors.push(
        `${labsEnPath} missing EN terminal lab for slug "${key}" (present in RU terminal-labs.ts)`,
      )
    }
  }
}

console.log(`Chapters (approx): ${chapterCount}`)
console.log(`Quiz questions: ${quizCount}`)
console.log(`Warnings: ${warnings.length}`)
console.log(`Errors: ${errors.length}`)

for (const w of warnings.slice(0, 30)) console.warn('WARN', w)
for (const e of errors) console.error('ERR', e)

if (errors.length > 0) {
  process.exit(1)
}

console.log('Content validation passed.')
