import { normalizeCommand } from './normalizeCommand'
import type { SimpleCommandMatchStrategy, TerminalStep } from '../../types'

export type ValidateCommandResult =
  | { ok: true; normalized: string }
  | { ok: false; reason: string }

function matchesCandidate(
  normalizedInput: string,
  rawInput: string,
  candidate: string,
  match: SimpleCommandMatchStrategy,
): boolean {
  const normalizedCandidate = normalizeCommand(candidate)

  switch (match.kind) {
    case 'exact':
      return rawInput === candidate
    case 'normalized':
      return normalizedInput === normalizedCandidate
    case 'prefix':
      return normalizedInput.startsWith(normalizedCandidate)
    case 'regex':
      try {
        return new RegExp(candidate, 'i').test(normalizedInput)
      } catch {
        return false
      }
    default:
      return false
  }
}

function validateWithStrategy(
  normalizedInput: string,
  rawInput: string,
  match: SimpleCommandMatchStrategy,
  accept: string[],
): boolean {
  return accept.some((candidate) =>
    matchesCandidate(normalizedInput, rawInput, candidate, match),
  )
}

export function validateCommand(input: string, step: TerminalStep): ValidateCommandResult {
  const trimmed = input.trim()
  if (!trimmed) {
    return { ok: false, reason: 'empty' }
  }

  const normalized = normalizeCommand(input)
  const { match } = step

  if (match.kind === 'anyOf') {
    const ok = match.items.some((item) =>
      validateWithStrategy(normalized, trimmed, item.match, item.accept),
    )
    if (ok) {
      return { ok: true, normalized }
    }
    return { ok: false, reason: 'mismatch' }
  }

  const accept = step.accept
  if (accept.length === 0) {
    return { ok: false, reason: 'no-accept' }
  }

  if (validateWithStrategy(normalized, trimmed, match, accept)) {
    return { ok: true, normalized }
  }

  return { ok: false, reason: 'mismatch' }
}
