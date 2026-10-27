#!/usr/bin/env node
// Vendors a pinned release of @phosphor-icons/core (MIT) into vendor/phosphor:
//   - assets/<weight>/*.svg   raw SVGs for the 6 weights
//   - catalog.json            names, tags, categories and versions used by search/docs
//   - LICENSE                 upstream MIT license (must be kept with the assets)
//   - VERSION.json            package version + tarball integrity for reproducibility
//
// Usage:
//   yarn phosphor:sync                     # re-sync the version pinned in VERSION.json (default 2.1.1)
//   yarn phosphor:sync --version 2.1.1     # sync a specific version
//   yarn phosphor:sync --file ./core.tgz   # use a local tarball (integrity still checked when online)

const crypto = require('crypto')
const fs = require('fs')
const https = require('https')
const os = require('os')
const path = require('path')
const zlib = require('zlib')
const { pathToFileURL } = require('url')

const {
  ROOT,
  VENDOR_DIR,
  ASSETS_DIR,
  CATALOG_FILE,
  VERSION_FILE,
  WEIGHTS,
  assetFileName,
  readVersion,
  writeFile,
  removeDir,
} = require('./shared')

const PACKAGE = '@phosphor-icons/core'
const DEFAULT_VERSION = '2.1.1'

function parseArgs(argv) {
  const args = {}
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--version' || arg === '-v') args.version = argv[++i]
    else if (arg === '--file' || arg === '-f') args.file = argv[++i]
    else if (arg === '--help' || arg === '-h') args.help = true
    else throw new Error(`Unknown argument: ${arg}`)
  }
  return args
}

function get(url, redirects = 5) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'user-agent': 'lemonade-ui-phosphor-sync' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirects > 0) {
          res.resume()
          resolve(get(new URL(res.headers.location, url).toString(), redirects - 1))
          return
        }
        if (res.statusCode !== 200) {
          res.resume()
          reject(new Error(`GET ${url} -> HTTP ${res.statusCode}`))
          return
        }
        const chunks = []
        res.on('data', (chunk) => chunks.push(chunk))
        res.on('end', () => resolve(Buffer.concat(chunks)))
      })
      .on('error', reject)
  })
}

function verifyIntegrity(buffer, integrity) {
  const [algorithm, expected] = integrity.split('-')
  const actual = crypto.createHash(algorithm).update(buffer).digest('base64')
  if (actual !== expected) {
    throw new Error(`Integrity mismatch: expected ${integrity}, got ${algorithm}-${actual}`)
  }
}

/** Minimal ustar reader (with pax "path" support) — enough for npm tarballs, no dependencies required. */
function readTar(buffer) {
  const files = new Map()
  let offset = 0
  let paxPath = null

  const field = (start, length) =>
    buffer
      .toString('utf8', offset + start, offset + start + length)
      .replace(/\0.*$/s, '')
      .trim()

  while (offset + 512 <= buffer.length) {
    const name = field(0, 100)
    if (!name) break
    const size = parseInt(field(124, 12) || '0', 8)
    const type = field(156, 1) || '0'
    const prefix = field(345, 155)
    const dataStart = offset + 512
    const data = buffer.slice(dataStart, dataStart + size)

    if (type === 'x') {
      const match = data.toString('utf8').match(/\d+ path=([^\n]+)\n/)
      paxPath = match ? match[1] : null
    } else if (type === '0' || type === '\0') {
      const fullName = paxPath || (prefix ? `${prefix}/${name}` : name)
      files.set(fullName, data)
      paxPath = null
    } else {
      paxPath = null
    }

    offset = dataStart + Math.ceil(size / 512) * 512
  }
  return files
}

async function loadTarball(args, version) {
  let metadata = null
  try {
    metadata = JSON.parse((await get(`https://registry.npmjs.org/${PACKAGE}/${version}`)).toString('utf8'))
  } catch (error) {
    if (!args.file) throw error
    console.warn(`! Could not reach the npm registry (${error.message}); integrity will not be verified.`)
  }

  const buffer = args.file ? fs.readFileSync(path.resolve(args.file)) : await get(metadata.dist.tarball)
  if (metadata) {
    verifyIntegrity(buffer, metadata.dist.integrity)
  }
  return { buffer, metadata }
}

async function loadCatalog(indexSource) {
  const tmp = path.join(os.tmpdir(), `phosphor-core-${process.pid}-${Date.now()}.mjs`)
  fs.writeFileSync(tmp, indexSource)
  try {
    const mod = await import(pathToFileURL(tmp).href)
    return mod.icons
  } finally {
    fs.unlinkSync(tmp)
  }
}

function normalizeEntry(entry) {
  const result = {
    name: entry.name,
    pascal_name: entry.pascal_name,
    categories: [...entry.categories],
    tags: [...entry.tags],
    codepoint: entry.codepoint,
    published_in: entry.published_in,
    updated_in: entry.updated_in,
  }
  if (entry.alias) {
    result.alias = { name: entry.alias.name, pascal_name: entry.alias.pascal_name }
  }
  return result
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    console.log('Usage: yarn phosphor:sync [--version <x.y.z>] [--file <tarball.tgz>]')
    return
  }

  const pinned = readVersion()
  const version = args.version || (pinned && pinned.version) || DEFAULT_VERSION
  console.log(`> Syncing ${PACKAGE}@${version}`)

  const { buffer, metadata } = await loadTarball(args, version)
  const files = readTar(zlib.gunzipSync(buffer))

  const index = files.get('package/dist/index.mjs')
  const license = files.get('package/LICENSE')
  if (!index || !license) {
    throw new Error('Unexpected tarball layout: package/dist/index.mjs or package/LICENSE not found')
  }

  const catalog = (await loadCatalog(index.toString('utf8')))
    .map(normalizeEntry)
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))

  removeDir(ASSETS_DIR)
  let written = 0
  for (const entry of catalog) {
    for (const weight of WEIGHTS) {
      const fileName = assetFileName(entry.name, weight)
      const svg = files.get(`package/assets/${weight}/${fileName}`)
      if (!svg) {
        throw new Error(`Asset missing in tarball: assets/${weight}/${fileName}`)
      }
      writeFile(path.join(ASSETS_DIR, weight, fileName), svg.toString('utf8').trim() + '\n')
      written++
    }
  }

  // The license must travel with the icons: keep it next to the vendored assets and inside the published
  // `@lemonade/ui/phosphor` entry point.
  writeFile(path.join(VENDOR_DIR, 'LICENSE'), license.toString('utf8'))
  writeFile(path.join(ROOT, 'phosphor', 'LICENSE'), license.toString('utf8'))
  writeFile(CATALOG_FILE, '[\n' + catalog.map((entry) => '  ' + JSON.stringify(entry)).join(',\n') + '\n]\n')
  writeFile(
    VERSION_FILE,
    JSON.stringify(
      {
        package: PACKAGE,
        version,
        license: 'MIT',
        integrity: metadata ? metadata.dist.integrity : null,
        tarball: metadata ? metadata.dist.tarball : null,
        icons: catalog.length,
        weights: WEIGHTS,
        assets: written,
      },
      null,
      2
    ) + '\n'
  )

  console.log(`✓ ${catalog.length} icons × ${WEIGHTS.length} weights = ${written} SVGs`)
  console.log(`✓ Wrote ${path.relative(ROOT, VENDOR_DIR)} (assets, catalog.json, LICENSE, VERSION.json)`)
  console.log('Next: run "yarn phosphor:generate" to regenerate the React components.')
}

main().catch((error) => {
  console.error(`✗ ${error.message}`)
  process.exit(1)
})
