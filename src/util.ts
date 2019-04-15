export function argv(input: string): string[] {
  const args = []
  let inCombinedArg = ''
  let cursor = 0
  while (cursor < input.length) {
    const char = input[cursor]
    if (inCombinedArg) {
      if (char === inCombinedArg) {
        inCombinedArg = ''
      } else {
        args[args.length - 1] += char
      }
      cursor++
      continue
    }
    if (char === ' ' && !inCombinedArg) {
      cursor++
      continue
    }
    if (!inCombinedArg && (char === "'" || char === '"')) {
      args.push('')
      inCombinedArg = char
      cursor++
      continue
    }
    if (char !== ' ' && (cursor === 0 || input[cursor - 1] === ' ') && !inCombinedArg) {
      args.push(char)
      cursor++
      continue
    }
    
    args[args.length - 1] += char
    cursor++
  }
  return args
}