#!/usr/bin/env node
// Builds the data consumed by the Phosphor explorer in the documentation site:
//   site/src/generated/phosphor-catalog.json   search metadata (bundled with the explorer page)
//   site/static/phosphor/<weight>.json          SVG shapes per weight (fetched on demand by the browser)
//
// The outputs are git-ignored and regenerated automatically before `gatsby develop` / `gatsby build`.

const path = require('path')

const { ROOT, WEIGHTS, componentName, readCatalog, readVersion, readIconShapes, writeFile } = require('./shared')

const CATALOG_OUT = path.join(ROOT, 'site', 'src', 'generated', 'phosphor-catalog.json')
const WEIGHTS_OUT = path.join(ROOT, 'site', 'static', 'phosphor')

function main() {
  const catalog = readCatalog()
  const versionInfo = readVersion()
  const version = versionInfo ? versionInfo.version : 'unknown'

  const shapesByWeight = {}
  WEIGHTS.forEach((weight) => (shapesByWeight[weight] = {}))

  const entries = catalog.map((entry) => {
    const shapes = readIconShapes(entry)
    WEIGHTS.forEach((weight) => (shapesByWeight[weight][entry.name] = shapes[weight]))

    return {
      name: entry.name,
      component: componentName(entry),
      categories: entry.categories,
      tags: entry.tags,
      codepoint: entry.codepoint,
      published: entry.published_in,
      updated: entry.updated_in,
      alias: entry.alias ? entry.alias.name : undefined,
    }
  })

  writeFile(CATALOG_OUT, JSON.stringify({ version, weights: WEIGHTS, icons: entries }))
  WEIGHTS.forEach((weight) => {
    writeFile(
      path.join(WEIGHTS_OUT, `${weight}.json`),
      JSON.stringify({ version, weight, icons: shapesByWeight[weight] })
    )
  })

  console.log(`✓ Phosphor site data: ${entries.length} icons, ${WEIGHTS.length} weights (Phosphor ${version})`)
}

main()
