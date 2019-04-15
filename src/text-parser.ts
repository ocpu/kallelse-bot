type Token = { type: string; data: any }

const tokenize = (text: string): Token[] => {
  let i = 0,
    li = 0
  const tokens: Token[] = [],
    str = text.replace(/(.)%[^\n]*/g, (match, token) => token === '\\' ? match : ''),
    l = str.length
  while (i < l) {
    if (str[i] === '\\') {
      const skippedText = str.slice(li, i).replace(/\n/g, '')
      if (skippedText && /[ \w\d_\-]/.test(skippedText))
        tokens.push({ type: 'text', data: skippedText })
      let wordLength = 0
      while (!/[{\s\\]/.test(str[i + wordLength + 1]) && i + wordLength + 1 < l)
        wordLength++
      tokens.push({
        type: 'variable',
        data: str.slice(i + 1, i + wordLength + 1)
      })
      li = i + wordLength + 1
    } else if (str[i] === '{' && str[i] !== '\\') {
      const skippedText = str.slice(li, i).replace(/\n/g, '')
      if (skippedText && /\S/.test(skippedText))
        tokens.push({ type: 'text', data: skippedText })
      tokens.push({ type: 'arg-begin', data: void 0 })
      li = i + 1
    } else if (str[i] === '}' && str[i] !== '\\') {
      const skippedText = str.slice(li, i).replace(/\n/g, '')
      if (skippedText && /\S/.test(skippedText))
        tokens.push({ type: 'text', data: skippedText })
      tokens.push({ type: 'arg-end', data: void 0 })
      li = i + 1
    }
    i++
  }
  const skippedText = str.slice(li, i).replace(/\n/g, '')
  if (skippedText && /[ \w\d_\-]/.test(skippedText))
    tokens.push({ type: 'text', data: skippedText })
  return tokens
}

function parser(
  tokens: Token[],
  context: { [name: string]: any },
  parserArgs: any[]
) {
  let text = ''
  for (let i = 0, l = tokens.length; i < l; i++) {
    const token = tokens[i]
    if (token.type === 'text') {
      text += token.data
    } else if (token.type === 'variable') {
      if (tokens[i + 1] && tokens[i + 1].type === 'arg-begin') {
        const args = []
        let level = 0,
          k = 1,
          lk = 1
        while (
          i + k < l &&
          tokens[i + k] &&
          tokens[i + k].type === 'arg-begin'
        ) {
          do {
            if (tokens[i + k].type === 'arg-begin') {
              level++
              k++
              continue
            } else if (tokens[i + k].type === 'arg-end') {
              level--
              k++
              continue
            }
            k++
          } while (i + k < l && level !== 0)
          args.push(tokens.slice(i + lk + 1, i + k - 1))
          lk = k
        }
        //console.log('context', token.data, args, context)
        text += context[token.data](
          ...args.map(arg => (...argArgs: any) =>
            parser(arg, context, argArgs.concat(parserArgs))
          )
        )
        i += k - 1
      } else {
        //console.log('context', token.data, context)
        text += context[token.data]()
      }
    }
  }
  return text.replace(/(\\?)#(\d+)/g, (match, escaped, index) =>
    escaped ? '' : parserArgs[index - 1]()
  )
}

const globalContextHTML: { [name: string]: any } = {
  set: function(name: () => string, action: any) {
    this[name()] = action
    return ''
  },
  newline: () => '<br>',
  nl: () => '<br>',
  space: () => '&nbsp;',
  h1: (title: () => string) => '<h1>' + title() + '</h1>',
  p: (text: () => string) => '<p>' + text() + '</p>'
}

export function parseHTML(src: string) {
  return parser(tokenize(src), Object.assign({}, globalContextHTML), [])
}

const globalContextText: { [name: string]: any } = {
  set: function(name: () => string, action: any) {
    this[name()] = action
    return ''
  },
  newline: () => '\n',
  nl: () => '\n',
  space: () => ' ',
  h1: (title: () => string) => '# ' + title(),
  p: (text: () => string) => '\n' + text()
}

export function parseText(src: string) {
  return parser(tokenize(src), Object.assign({}, globalContextText), [])
}
