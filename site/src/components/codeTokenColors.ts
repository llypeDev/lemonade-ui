// Two colors of the Prism okaidia theme, loaded in site/src/layouts/index.tsx, are below 4.5:1 on the gray.c10
// background of the code blocks. These lighter shades, applied inside the blocks, reach 5:1.
export const codeTokenColors = {
  '.token.comment, .token.prolog, .token.doctype, .token.cdata': {
    color: '#8a99a8',
  },
  '.token.property, .token.tag, .token.constant, .token.symbol, .token.deleted': {
    color: '#fb5a92',
  },
}
