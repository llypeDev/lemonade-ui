import { Button, TabItem, Tabs, Theme, Tooltip, useStyles } from '@lemonade/ui'
import { PhArrowSquareOut } from '@lemonade/ui/phosphor/generated/PhArrowSquareOut'
import { PhCheckCircle } from '@lemonade/ui/phosphor/generated/PhCheckCircle'
import { PhCopy } from '@lemonade/ui/phosphor/generated/PhCopy'
import { PhDownloadSimple } from '@lemonade/ui/phosphor/generated/PhDownloadSimple'
import { PhX } from '@lemonade/ui/phosphor/generated/PhX'
import { useIntl } from 'gatsby-plugin-intl'
import React, { CSSProperties, useEffect, useState } from 'react'

import { SIDE_NAV_WIDTH } from '../SideNav'

import {
  fileName,
  formatCodepoint,
  innerMarkup,
  isMarkerTag,
  PhosphorEntry,
  PhosphorShape,
  PhosphorWeight,
  svgDataUrl,
  svgMarkup,
} from './data'
import { canCopyImages, copyPng, copyText, downloadBlob, svgBlob, svgToPng } from './exporters'

type SnippetType = 'react' | 'icon' | 'svg' | 'dataUrl'
const SNIPPETS: SnippetType[] = ['react', 'icon', 'svg', 'dataUrl']
type Tab = 'tags' | SnippetType

export interface PhosphorPanelProps {
  entry: PhosphorEntry
  shapes?: PhosphorShape[]
  weight: PhosphorWeight
  size: number
  /** hex color chosen by the user, or '' to follow the text color */
  color: string
  /** resolved color used when exporting files (never `currentColor`) */
  exportColor: string
  inverted: boolean
  onClose(): void
  onSearchTag(tag: string): void
  onAnnounce(message: string): void
}

export function buildSnippet(
  type: SnippetType,
  entry: PhosphorEntry,
  weight: PhosphorWeight,
  size: number,
  color: string,
  shapes?: PhosphorShape[]
) {
  const props = [
    weight !== 'regular' ? `weight='${weight}'` : null,
    `size={${size}}`,
    color ? `color='${color}'` : null,
  ]
    .filter(Boolean)
    .join(' ')

  switch (type) {
    case 'react':
      return `import { ${entry.component} } from '@lemonade/ui/phosphor'\n\n<${entry.component} ${props} />`
    case 'icon': {
      const rem = Math.round((size / 16) * 100) / 100
      const icon = `<Icon icon={${entry.component}} size={${rem}}${color ? '' : " fill='normal'"} />`
      const body =
        weight === 'regular' ? icon : `<PhosphorIconProvider weight='${weight}'>\n  ${icon}\n</PhosphorIconProvider>`
      const imports = weight === 'regular' ? entry.component : `${entry.component}, PhosphorIconProvider`
      return `import { Icon } from '@lemonade/ui'\nimport { ${imports} } from '@lemonade/ui/phosphor'\n\n${body}`
    }
    case 'svg':
      return shapes ? svgMarkup(shapes, size, color || 'currentColor') : ''
    case 'dataUrl':
      return shapes ? svgDataUrl(svgMarkup(shapes, size, color || 'currentColor')) : ''
  }
}

export function PhosphorPanel(props: PhosphorPanelProps) {
  const { entry, shapes, weight, size, color, exportColor, inverted, onClose, onSearchTag, onAnnounce } = props
  const { classes, css, theme } = useStyles(createStyles, inverted)
  const intl = useIntl()
  const t = (id: string, values?: Record<string, string | number>) => intl.formatMessage({ id }, values)

  const [tab, setTab] = useState<Tab>('react')
  const [copied, setCopied] = useState<string | null>(null)
  const imageClipboard = canCopyImages()

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(null), 1800)
    return () => clearTimeout(timer)
  }, [copied])

  const exportSvg = () => (shapes ? svgMarkup(shapes, size, exportColor) : '')

  const run = (key: string, label: string, action: () => Promise<void> | void) => async () => {
    try {
      await action()
      setCopied(key)
      onAnnounce(t('phosphor-done', { what: label }))
    } catch {
      onAnnounce(t('phosphor-copy-failed'))
    }
  }

  const tags = Array.from(new Set(entry.tags.filter((tag) => !isMarkerTag(tag))))
  const isNew = entry.tags.includes('*new*')
  const isUpdated = entry.tags.includes('*updated*')
  const snippet = tab !== 'tags' ? buildSnippet(tab, entry, weight, size, color, shapes) : ''
  const previewSize = Math.min(Math.max(size, 64), 128)

  const ActionIcon = ({ id, download }: { id: string; download?: boolean }) =>
    copied === id ? (
      <PhCheckCircle weight='fill' size={18} color={theme.pallete.status.success.main} />
    ) : download ? (
      <PhDownloadSimple weight='bold' size={18} />
    ) : (
      <PhCopy weight='bold' size={18} />
    )

  return (
    <aside className={classes.panel} aria-label={t('phosphor-details', { name: entry.name })}>
      <div className={classes.preview}>
        <div className={classes.previewBox}>
          {shapes && (
            <svg
              width={previewSize}
              height={previewSize}
              viewBox='0 0 256 256'
              fill={color || 'currentColor'}
              role='img'
              aria-label={entry.name}
              dangerouslySetInnerHTML={{ __html: innerMarkup(shapes) }}
            />
          )}
        </div>
        <div className={classes.meta}>
          <h3 className={classes.title}>{entry.name}</h3>
          <code className={classes.component}>{entry.component}</code>
          <span className={classes.small}>
            {formatCodepoint(entry.codepoint)} · {t('phosphor-since', { version: entry.published.toFixed(1) })}
            {entry.updated !== entry.published &&
              ` · ${t('phosphor-updated-in', { version: entry.updated.toFixed(1) })}`}
          </span>
          {(isNew || isUpdated) && (
            <span className={classes.badges}>
              {isNew && <span className={classes.badge}>{t('phosphor-new')}</span>}
              {isUpdated && <span className={classes.badge}>{t('phosphor-updated')}</span>}
            </span>
          )}
          {entry.alias && <span className={classes.small}>{t('phosphor-alias', { alias: entry.alias })}</span>}
          <a
            className={classes.upstream}
            href={`https://phosphoricons.com/?q=${encodeURIComponent(entry.name)}`}
            target='_blank'
            rel='noopener noreferrer'
          >
            {t('phosphor-view-upstream')} <PhArrowSquareOut size={14} />
          </a>
        </div>
      </div>

      <div className={classes.actions}>
        <span className={classes.actionGroup}>{t('phosphor-download')}</span>
        <div className={classes.actionRow}>
          <Button
            size='small'
            skin='outline'
            disabled={!shapes}
            onClick={run('download-svg', 'SVG', () =>
              downloadBlob(svgBlob(exportSvg()), fileName(entry, weight, 'svg'))
            )}
          >
            <ActionIcon id='download-svg' download />
            <span className={classes.actionLabel}>SVG</span>
          </Button>
          <Button
            size='small'
            skin='outline'
            disabled={!shapes}
            onClick={run('download-png', 'PNG', async () =>
              downloadBlob(await svgToPng(exportSvg(), size), fileName(entry, weight, 'png'))
            )}
          >
            <ActionIcon id='download-png' download />
            <span className={classes.actionLabel}>PNG</span>
          </Button>
        </div>
        <span className={classes.actionGroup}>{t('phosphor-copy')}</span>
        <div className={classes.actionRow}>
          <Button
            size='small'
            skin='outline'
            disabled={!shapes}
            onClick={run('copy-svg', 'SVG', () => copyText(exportSvg()))}
          >
            <ActionIcon id='copy-svg' />
            <span className={classes.actionLabel}>SVG</span>
          </Button>
          {imageClipboard && (
            <Button
              size='small'
              skin='outline'
              disabled={!shapes}
              onClick={run('copy-png', 'PNG', () => copyPng(exportSvg(), size))}
            >
              <ActionIcon id='copy-png' />
              <span className={classes.actionLabel}>PNG</span>
            </Button>
          )}
          <Button
            size='small'
            skin='outline'
            disabled={!shapes}
            onClick={run('copy-data', 'Data URL', () => copyText(svgDataUrl(exportSvg())))}
          >
            <ActionIcon id='copy-data' />
            <span className={classes.actionLabel}>Data URL</span>
          </Button>
          <Button
            size='small'
            skin='outline'
            onClick={run('copy-name', entry.component, () => copyText(entry.component))}
          >
            <ActionIcon id='copy-name' />
            <span className={classes.actionLabel}>{t('phosphor-copy-name')}</span>
          </Button>
        </div>
      </div>

      <div className={classes.code}>
        <Tabs>
          <TabItem component='button' type='button' active={tab === 'tags'} onClick={() => setTab('tags')}>
            {t('phosphor-tags')}
          </TabItem>
          {SNIPPETS.map((type) => (
            <TabItem key={type} component='button' type='button' active={tab === type} onClick={() => setTab(type)}>
              {t(`phosphor-snippet-${type}`)}
            </TabItem>
          ))}
        </Tabs>
        <div className={classes.tabContent} role='tabpanel'>
          {tab === 'tags' ? (
            <div className={classes.tags}>
              {[...entry.categories, ...tags].map((tag) => (
                <button key={tag} type='button' className={classes.tag} onClick={() => onSearchTag(tag)}>
                  {tag}
                </button>
              ))}
            </div>
          ) : (
            <div className={classes.snippet}>
              <pre className={classes.pre}>
                <code>{snippet}</code>
              </pre>
              <Tooltip text={t('phosphor-copy-snippet')}>
                <Button
                  size='small'
                  skin='ghost'
                  style={classes.snippetCopy}
                  aria-label={t('phosphor-copy-snippet')}
                  onClick={run(`snippet-${tab}`, t(`phosphor-snippet-${tab}`), () => copyText(snippet))}
                >
                  <ActionIcon id={`snippet-${tab}`} />
                </Button>
              </Tooltip>
            </div>
          )}
        </div>
      </div>

      <Tooltip text={t('phosphor-close')}>
        <button type='button' className={css(classes.close)} aria-label={t('phosphor-close')} onClick={onClose}>
          <PhX size={20} weight='bold' />
        </button>
      </Tooltip>
    </aside>
  )
}

const createStyles = (theme: Theme, inverted: boolean) => ({
  panel: {
    position: 'fixed',
    bottom: 0,
    left: SIDE_NAV_WIDTH,
    right: 0,
    zIndex: 15,
    display: 'grid',
    gridTemplateColumns: 'minmax(220px, 1.1fr) minmax(220px, 1fr) minmax(280px, 1.6fr)',
    gap: '1.5rem',
    padding: '1.25rem 3.5rem 1.25rem 2rem',
    maxHeight: '60vh',
    overflowY: 'auto',
    background: theme.pallete.surface.main,
    borderTop: `1px solid ${theme.pallete.divider}`,
    boxShadow: theme.shadows.outer[60],
    [theme.breakpoints.down('md')]: {
      left: 0,
      gridTemplateColumns: '1fr',
      gap: '1rem',
      padding: '1rem 3rem 1rem 1rem',
    },
  } as CSSProperties,
  preview: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start',
    minWidth: 0,
  } as CSSProperties,
  previewBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 144,
    height: 144,
    flexShrink: 0,
    borderRadius: theme.radius.paper,
    border: `1px solid ${theme.pallete.divider}`,
    background: inverted ? theme.pallete.gray.c10 : theme.pallete.surface.background,
    color: inverted ? theme.pallete.gray.c100 : theme.pallete.text.main,
  } as CSSProperties,
  meta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    minWidth: 0,
  } as CSSProperties,
  title: {
    margin: 0,
    fontSize: '1.125rem',
    wordBreak: 'break-word',
  } as CSSProperties,
  component: {
    fontSize: '0.8125rem',
    color: theme.pallete.primary.main,
  } as CSSProperties,
  small: {
    fontSize: '0.75rem',
    color: theme.pallete.text.secondary,
  } as CSSProperties,
  badges: {
    display: 'flex',
    gap: '0.25rem',
  } as CSSProperties,
  badge: {
    fontSize: '0.6875rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    padding: '0.125rem 0.375rem',
    borderRadius: 999,
    color: theme.pallete.primary.c30,
    background: theme.pallete.primary.c90,
  } as CSSProperties,
  upstream: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    marginTop: '0.25rem',
    fontSize: '0.75rem',
    whiteSpace: 'nowrap',
    color: theme.pallete.text.secondary,
  } as CSSProperties,
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  } as CSSProperties,
  actionGroup: {
    fontSize: '0.6875rem',
    fontWeight: 'bold',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: theme.pallete.text.secondary,
  } as CSSProperties,
  actionRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  } as CSSProperties,
  actionLabel: {
    marginLeft: '0.375rem',
  } as CSSProperties,
  code: {
    minWidth: 0,
  } as CSSProperties,
  tabContent: {
    border: `1px solid ${theme.pallete.divider}`,
    borderRadius: '0 4px 4px 4px',
    marginTop: -1,
    minHeight: 112,
  } as CSSProperties,
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.375rem',
    padding: '0.75rem',
  } as CSSProperties,
  tag: {
    border: `1px solid ${theme.pallete.divider}`,
    borderRadius: 999,
    padding: '0.125rem 0.625rem',
    fontFamily: theme.typography.fontFamily,
    fontSize: '0.75rem',
    color: theme.pallete.text.main,
    background: theme.pallete.surface.main,
    cursor: 'pointer',
    '&:hover': { borderColor: theme.pallete.primary.main, color: theme.pallete.primary.main },
    '&:focus': { outline: 'none', boxShadow: `0 0 0 2px ${theme.pallete.primary.main}` },
  } as CSSProperties,
  snippet: {
    position: 'relative',
  } as CSSProperties,
  pre: {
    margin: 0,
    padding: '0.75rem 3rem 0.75rem 0.75rem',
    fontSize: '0.8125rem',
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    maxHeight: 180,
    overflowY: 'auto',
    background: theme.pallete.surface.background,
    color: theme.pallete.text.main,
    borderRadius: '0 4px 4px 4px',
  } as CSSProperties,
  snippetCopy: {
    position: 'absolute',
    top: '0.375rem',
    right: '0.375rem',
  } as CSSProperties,
  close: {
    position: 'absolute',
    top: '0.75rem',
    right: '0.75rem',
    display: 'flex',
    padding: '0.375rem',
    border: 'none',
    borderRadius: '50%',
    background: 'transparent',
    color: theme.pallete.text.main,
    cursor: 'pointer',
    '&:hover': { background: theme.pallete.surface.background },
    '&:focus': { outline: 'none', boxShadow: `0 0 0 2px ${theme.pallete.primary.main}` },
  } as CSSProperties,
})
