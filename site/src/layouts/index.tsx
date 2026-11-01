import { LocaleContext } from '@lemonade/ui'
import enUs from '@lemonade/ui/i18n/locales/en-US'
import ptBr from '@lemonade/ui/i18n/locales/pt-BR'
import { MDXProvider } from '@mdx-js/react'
import React from 'react'
import { Helmet } from 'react-helmet'

import * as MDXComponents from '../components/mdx'

export default function Layout({ children, pageContext }) {
  // The texts inside the components, such as "Loading...", follow the language of the page
  const locale = pageContext.intl.language === 'pt' ? ptBr : enUs

  return (
    <MDXProvider components={mdxComponents}>
      <Helmet
        htmlAttributes={{
          lang: pageContext.intl.language,
        }}
      >
        <meta name='viewport' content='minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no' />

        <title>Lemonade Design System</title>

        <link href='/image/favicon.png' rel='icon' />
        <link href='//fonts.googleapis.com/css?family=IBM+Plex+Sans:400,400i,700,700i' rel='stylesheet' />
        <link rel='stylesheet' href='//cdnjs.cloudflare.com/ajax/libs/prism/1.17.1/themes/prism-okaidia.min.css' />
      </Helmet>

      <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
    </MDXProvider>
  )
}

const mdxComponents = {
  p: MDXComponents.Paragraph,
  a: MDXComponents.Link,
  img: MDXComponents.Image,
  h1: MDXComponents.createHeading(1),
  h2: MDXComponents.createHeading(2),
  h3: MDXComponents.createHeading(3),
  h4: MDXComponents.createHeading(4),
  h5: MDXComponents.createHeading(5),
  h6: MDXComponents.createHeading(6),
  ul: MDXComponents.UnorderedList,
  ol: MDXComponents.OrderedList,
  blockquote: MDXComponents.Blockquote,
  table: MDXComponents.Table,
  pre: MDXComponents.Pre,
  code: MDXComponents.Code,
  inlineCode: MDXComponents.Code,
}
