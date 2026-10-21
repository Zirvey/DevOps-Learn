export function normalizeCommand(input: string): string {
  let value = input.trim().replace(/\s+/g, ' ')
  if (value.endsWith(';')) {
    value = value.slice(0, -1).trimEnd()
  }
  return value
}
