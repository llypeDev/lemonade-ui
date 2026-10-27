// Shared helpers for the Phosphor Icons pipeline (sync, component generation and site data).
// Phosphor Icons are distributed under the MIT License — see vendor/phosphor/LICENSE.

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '../..')
const VENDOR_DIR = path.join(ROOT, 'vendor', 'phosphor')
const ASSETS_DIR = path.join(VENDOR_DIR, 'assets')
const CATALOG_FILE = path.join(VENDOR_DIR, 'catalog.json')
const VERSION_FILE = path.join(VENDOR_DIR, 'VERSION.json')

const WEIGHTS = ['thin', 'light', 'regular', 'bold', 'fill', 'duotone']

/** File name used by @phosphor-icons/core for a given icon/weight pair. */
function assetFileName(name, weight) {
  return weight === 'regular' ? `${name}.svg` : `${name}-${weight}.svg`
}

function assetPath(name, weight) {
  return path.join(ASSETS_DIR, weight, assetFileName(name, weight))
}

/** Component identifier exported by @lemonade/ui/phosphor, e.g. "airplane-tilt" -> "PhAirplaneTilt". */
function componentName(entry) {
  return `Ph${entry.pascal_name}`
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function readCatalog() {
  if (!fs.existsSync(CATALOG_FILE)) {
    throw new Error(`Missing ${path.relative(ROOT, CATALOG_FILE)}. Run "yarn phosphor:sync" first.`)
  }
  return readJson(CATALOG_FILE)
}

function readVersion() {
  return fs.existsSync(VERSION_FILE) ? readJson(VERSION_FILE) : null
}

const PATH_RE = /<path\b([^>]*?)\/?>/g
const ATTR_RE = /([a-zA-Z:-]+)="([^"]*)"/g

function parseAttributes(source) {
  const attrs = {}
  let match
  ATTR_RE.lastIndex = 0
  while ((match = ATTR_RE.exec(source))) {
    attrs[match[1]] = match[2]
  }
  return attrs
}

/**
 * Parses a Phosphor SVG asset into a list of shapes.
 * Every Phosphor asset is a 256x256 viewBox made only of <path> elements; duotone background layers carry an
 * opacity attribute. A shape is either the path data string or a [pathData, opacity] tuple.
 */
function parseSvg(svg, file) {
  const root = svg.match(/<svg\b([^>]*)>/)
  if (!root) {
    throw new Error(`Invalid SVG (no root element): ${file}`)
  }
  const rootAttrs = parseAttributes(root[1])
  if (rootAttrs.viewBox !== '0 0 256 256') {
    throw new Error(`Unexpected viewBox "${rootAttrs.viewBox}" in ${file}`)
  }

  const body = svg.slice(root.index + root[0].length).replace(/<\/svg>\s*$/, '')
  const withoutPaths = body.replace(PATH_RE, '').trim()
  if (withoutPaths.length) {
    throw new Error(`Unsupported SVG content in ${file}: ${withoutPaths.slice(0, 80)}`)
  }

  const shapes = []
  let match
  PATH_RE.lastIndex = 0
  while ((match = PATH_RE.exec(body))) {
    const attrs = parseAttributes(match[1])
    const unknown = Object.keys(attrs).filter((key) => key !== 'd' && key !== 'opacity')
    if (!attrs.d || unknown.length) {
      throw new Error(`Unsupported <path> attributes (${unknown.join(', ') || 'missing d'}) in ${file}`)
    }
    shapes.push(attrs.opacity !== undefined ? [attrs.d, Number(attrs.opacity)] : attrs.d)
  }

  if (!shapes.length) {
    throw new Error(`No paths found in ${file}`)
  }
  return shapes
}

/** Reads every weight of an icon and returns { thin: Shape[], light: Shape[], ... }. */
function readIconShapes(entry) {
  const result = {}
  for (const weight of WEIGHTS) {
    const file = assetPath(entry.name, weight)
    if (!fs.existsSync(file)) {
      throw new Error(`Missing asset ${path.relative(ROOT, file)}`)
    }
    result[weight] = parseSvg(fs.readFileSync(file, 'utf8'), path.relative(ROOT, file))
  }
  return result
}

/** Writes a text file with LF line endings, creating parent folders as needed. */
function writeFile(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, content.replace(/\r\n/g, '\n'), 'utf8')
}

function removeDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync ? fs.rmSync(dir, { recursive: true, force: true }) : fs.rmdirSync(dir, { recursive: true })
  }
}

module.exports = {
  ROOT,
  VENDOR_DIR,
  ASSETS_DIR,
  CATALOG_FILE,
  VERSION_FILE,
  WEIGHTS,
  assetFileName,
  assetPath,
  componentName,
  readCatalog,
  readVersion,
  readIconShapes,
  parseSvg,
  writeFile,
  removeDir,
}
