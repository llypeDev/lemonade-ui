export interface InteractionState {
  /**
   * How the element got the focus, if it has it. A focus from the keyboard also matches `:focus-visible`, as the
   * browser does; a focus from a click does not.
   */
  focus?: 'keyboard' | 'pointer'
  hover?: boolean
  active?: boolean
}

export interface ResolveStyleOptions {
  /**
   * Element in the state, when it is not the element read, such as the hidden input before the box of a checkbox
   * or the item around the row of a tree. Defaults to the element read.
   */
  on?: Element

  /**
   * Pseudo-element of the element to read, such as `::after`
   */
  pseudoElement?: string
}

const initialValues: Record<string, string> = {
  'box-shadow': 'none',
}

const pseudoElementPattern = /::?(after|before|placeholder|selection|first-line|first-letter|marker|backdrop)\b/

/**
 * The value a browser gives to a property of an element in an interaction state that jsdom does not have, such
 * as a focus from the keyboard or from a click, the hover and the press. jsdom matches none of `:focus-visible`,
 * `:hover` and `:active`, and does not weigh specificity, so this reads the rules on the page and applies them as
 * a browser does: of the rules that match, the most specific one wins, and the later one of two equal ones.
 */
export function resolveStyle(
  element: Element,
  property: string,
  state: InteractionState = {},
  options: ResolveStyleOptions = {}
): string {
  const { on = element, pseudoElement } = options
  const document = element.ownerDocument
  const marked = markState(on, state)
  const hasMarks: Element[] = []

  try {
    // The rules come in the order of the page, so a later rule of the same weight takes the place of an earlier one
    let winner: { weight: number[]; value: string } = null

    Array.from(document.styleSheets).forEach((sheet: CSSStyleSheet) => {
      Array.from(sheet.cssRules).forEach((cssRule) => {
        // Rules in media queries are left out
        if (cssRule.type !== 1) {
          return
        }

        const rule = cssRule as CSSStyleRule
        const value = rule.style.getPropertyValue(property)
        if (!value) {
          return
        }

        splitTopLevel(rule.selectorText).forEach((selector) => {
          const target = forPseudoElement(selector, pseudoElement)
          if (target === null || !matches(element, target, hasMarks)) {
            return
          }

          const weight = specificity(selector)
          if (!winner || compare(weight, winner.weight) >= 0) {
            winner = { weight, value }
          }
        })
      })
    })

    return winner ? winner.value.trim() : initialValues[property] ?? ''
  } finally {
    marked.forEach(([node, attribute]) => node.removeAttribute(attribute))
    hasMarks.forEach((node) => Array.from(node.attributes).forEach(removeHasMark(node)))
  }
}

/**
 * The look of an element focused from the keyboard and from a click, against its look without the focus, for a
 * check that the focus ring shows for the keyboard only. A click leaves the pointer over the element, and the
 * press of a click focuses it first.
 */
export function focusRingStates(element: Element, options: ResolveStyleOptions & { property?: string } = {}) {
  const { property = 'box-shadow', ...rest } = options
  const style = (state: InteractionState) => resolveStyle(element, property, state, rest)

  const blurred = style({})
  const keyboard = style({ focus: 'keyboard' })

  return {
    received: {
      keyboardShowsRing: keyboard !== blurred,
      click: style({ focus: 'pointer' }),
      clickHovered: style({ focus: 'pointer', hover: true }),
      clickPressed: style({ focus: 'pointer', hover: true, active: true }),
    },
    expected: {
      keyboardShowsRing: true,
      click: blurred,
      clickHovered: style({ hover: true }),
      clickPressed: style({ hover: true, active: true }),
    },
    keyboard,
  }
}

const markState = (on: Element, state: InteractionState) => {
  const marked: Array<[Element, string]> = []
  const mark = (node: Element, attribute: string) => {
    if (!node.hasAttribute(attribute)) {
      node.setAttribute(attribute, '')
      marked.push([node, attribute])
    }
  }
  const markWithAncestors = (attribute: string) => {
    for (let node = on; node; node = node.parentElement) {
      mark(node, attribute)
    }
  }

  if (state.focus) {
    mark(on, 'data-state-focus')
    markWithAncestors('data-state-focus-within')
  }
  if (state.focus === 'keyboard') {
    mark(on, 'data-state-focus-visible')
  }
  if (state.hover) {
    markWithAncestors('data-state-hover')
  }
  if (state.active) {
    markWithAncestors('data-state-active')
  }

  return marked
}

const removeHasMark = (node: Element) => (attribute: Attr) => {
  if (attribute.name.startsWith('data-state-has-')) {
    node.removeAttribute(attribute.name)
  }
}

// Turns the pseudo-classes of the state into the attributes that mark it
const toStateSelector = (selector: string) =>
  selector
    .replace(/:focus-visible/g, '[data-state-focus-visible]')
    .replace(/:focus-within/g, '[data-state-focus-within]')
    .replace(/:focus(?![\w-])/g, '[data-state-focus]')
    .replace(/:hover/g, '[data-state-hover]')
    .replace(/:active/g, '[data-state-active]')

let hasCount = 0

// jsdom has no :has(), so every element with a match inside gets an attribute that stands for it
const replaceHas = (selector: string, document: Document, hasMarks: Element[]): string => {
  const start = selector.indexOf(':has(')
  if (start === -1) {
    return selector
  }

  const close = matchingParen(selector, start + 4)
  const inner = toStateSelector(selector.slice(start + 5, close))
  const attribute = `data-state-has-${++hasCount}`

  Array.from(document.querySelectorAll('*')).forEach((node) => {
    if (node.querySelector(inner)) {
      node.setAttribute(attribute, '')
      hasMarks.push(node)
    }
  })

  return replaceHas(`${selector.slice(0, start)}[${attribute}]${selector.slice(close + 1)}`, document, hasMarks)
}

const matches = (element: Element, selector: string, hasMarks: Element[]) => {
  try {
    return element.matches(replaceHas(toStateSelector(selector), element.ownerDocument, hasMarks))
  } catch (error) {
    return false
  }
}

// The selector for the element itself, without the pseudo-element read, or null when it styles something else
const forPseudoElement = (selector: string, pseudoElement: string) => {
  const found = selector.match(pseudoElementPattern)
  if (!pseudoElement) {
    return found ? null : selector
  }

  return found && found[1] === pseudoElement.replace(/^:+/, '') ? selector.replace(pseudoElementPattern, '') : null
}

const compare = (a: number[], b: number[]) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]

const matchingParen = (text: string, open: number) => {
  let depth = 0
  for (let i = open; i < text.length; i++) {
    if (text[i] === '(') {
      depth++
    } else if (text[i] === ')') {
      depth--
      if (depth === 0) {
        return i
      }
    }
  }
  return text.length
}

const splitTopLevel = (text: string) => {
  const parts: string[] = []
  let depth = 0
  let start = 0
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '(' || text[i] === '[') {
      depth++
    } else if (text[i] === ')' || text[i] === ']') {
      depth--
    } else if (text[i] === ',' && depth === 0) {
      parts.push(text.slice(start, i).trim())
      start = i + 1
    }
  }
  parts.push(text.slice(start).trim())
  return parts.filter(Boolean)
}

const skipName = (text: string, from: number) => {
  let i = from
  while (i < text.length && /[\w-]/.test(text[i])) {
    i++
  }
  return i
}

/**
 * Specificity of a selector as [ids, classes, types]: attributes and pseudo-classes weigh as classes, and :not(),
 * :is() and :has() as their most specific argument
 */
export function specificity(selector: string): number[] {
  const weight = [0, 0, 0]
  const add = (other: number[]) => other.forEach((value, index) => (weight[index] += value))

  let i = 0
  while (i < selector.length) {
    const char = selector[i]

    if (char === '#') {
      weight[0]++
      i = skipName(selector, i + 1)
    } else if (char === '.') {
      weight[1]++
      i = skipName(selector, i + 1)
    } else if (char === '[') {
      weight[1]++
      i = selector.indexOf(']', i) + 1
    } else if (char === ':' && selector[i + 1] === ':') {
      weight[2]++
      i = skipName(selector, i + 2)
    } else if (char === ':') {
      const end = skipName(selector, i + 1)
      const name = selector.slice(i + 1, end)

      if (selector[end] === '(') {
        const close = matchingParen(selector, end)
        const args = splitTopLevel(selector.slice(end + 1, close))
        if (['not', 'is', 'has', 'matches'].includes(name)) {
          add(args.map(specificity).reduce((max, next) => (compare(next, max) > 0 ? next : max), [0, 0, 0]))
        } else if (name !== 'where') {
          weight[1]++
        }
        i = close + 1
      } else {
        weight[['before', 'after', 'first-line', 'first-letter'].includes(name) ? 2 : 1]++
        i = end
      }
    } else if (/[a-zA-Z]/.test(char)) {
      weight[2]++
      i = skipName(selector, i)
    } else {
      i++
    }
  }

  return weight
}
