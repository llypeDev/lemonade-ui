<div align="center">

<a href="https://lemonade-ui.llypedev.com.br">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/assets/logo-lemonade-dark.svg" />
    <img alt="Lemonade" src="site/static/image/logo-lemonade.svg" width="360" />
  </picture>
</a>

### React implementation of the Lemonade Design System

Accessible, themeable and fully typed React components for building consistent interfaces.

[![Build CI](https://github.com/llypeDev/lemonade-ui/actions/workflows/yarn.yml/badge.svg)](https://github.com/llypeDev/lemonade-ui/actions/workflows/yarn.yml)
[![Loki](https://github.com/llypeDev/lemonade-ui/actions/workflows/loki.yml/badge.svg)](https://github.com/llypeDev/lemonade-ui/actions/workflows/loki.yml)
[![codecov](https://codecov.io/gh/llypeDev/lemonade-ui/branch/main/graph/badge.svg)](https://codecov.io/gh/llypeDev/lemonade-ui)
[![License: MIT](https://img.shields.io/badge/license-MIT-5E7300?style=flat-square)](./LICENSE)

![React](https://img.shields.io/badge/React-%E2%89%A516.8-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Emotion](https://img.shields.io/badge/styled%20with-Emotion-D36AC2?style=flat-square)
![Storybook](https://img.shields.io/badge/Storybook-7.6-FF4785?style=flat-square&logo=storybook&logoColor=white)
![WCAG AA](https://img.shields.io/badge/a11y-WCAG%20AA-5E7300?style=flat-square)

[**Documentation**](https://lemonade-ui.llypedev.com.br) ·
[**Storybook**](https://lemonade-ui.llypedev.com.br/storybook) ·
[**Getting started**](https://lemonade-ui.llypedev.com.br/getting-started) ·
[**Contributing**](./CONTRIBUTING.md)

**English** · [Português](./README.pt-BR.md)

</div>

---

## Table of contents

- [Highlights](#-highlights)
- [Installation](#-installation)
- [Quick start](#-quick-start)
- [Theming](#-theming)
- [Internationalization](#-internationalization)
- [Icons](#-icons)
- [Components](#-components)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Highlights

<table>
  <tr>
    <td width="33%" valign="top">
      <b>🧩 50+ components</b><br />
      Buttons, forms, date pickers, tables, modals, toasts, tabs and layout primitives ready to use.
    </td>
    <td width="33%" valign="top">
      <b>♿ Accessible</b><br />
      Built against WCAG AA: keyboard navigation, visible focus, ARIA attributes and checked contrast.
    </td>
    <td width="33%" valign="top">
      <b>🎨 Themeable</b><br />
      Light and dark themes out of the box, plus <code>createTheme</code> to plug in your own color scales.
    </td>
  </tr>
  <tr>
    <td width="33%" valign="top">
      <b>🌍 i18n ready</b><br />
      Component strings come from a <code>LocaleContext</code>, with <code>en-US</code> and <code>pt-BR</code> included.
    </td>
    <td width="33%" valign="top">
      <b>💠 470 icons</b><br />
      A full SVG icon set exposed through a single <code>&lt;Icon /&gt;</code> component.
    </td>
    <td width="33%" valign="top">
      <b>🟦 TypeScript</b><br />
      Written in TypeScript and published with type declarations.
    </td>
  </tr>
</table>

## 📦 Installation

**Requirements:** React and React DOM `>= 16.8` (the library uses hooks).

```sh
# with npm
npm install @lemonade/ui --save

# with yarn
yarn add @lemonade/ui
```

### Font family: IBM Plex Sans

Lemonade is designed for [IBM Plex Sans](https://fonts.google.com/specimen/IBM+Plex+Sans), using its _regular_ and _bold_ styles. Add it to the `<head>` of your app:

```html
<link href="https://fonts.googleapis.com/css?family=IBM+Plex+Sans:400,400i,700,700i" rel="stylesheet" />
```

## 🚀 Quick start

Wrap your app with `ThemeProvider`. Besides providing the theme, it injects the global styles (font, colors, `box-sizing` and heading resets) that the components expect.

```jsx
import React from 'react'
import ReactDOM from 'react-dom'
import { Button, ThemeProvider } from '@lemonade/ui'

const App = () => (
  <ThemeProvider>
    <Button kind='primary'>Hello World</Button>
  </ThemeProvider>
)

ReactDOM.render(<App />, document.querySelector('#root'))
```

A slightly bigger example, combining layout, form and feedback components:

```jsx
import { Alert, Button, Cell, Grid, Icon, TextField, Tooltip } from '@lemonade/ui'

function SignUpForm() {
  return (
    <Grid>
      <Cell size={12}>
        <Alert type='info'>All fields marked with * are required.</Alert>
      </Cell>

      <Cell size={6}>
        <TextField name='name' label='Name' placeholder='Your full name' required />
      </Cell>

      <Cell size={6}>
        <TextField name='email' label='E-mail' error='Enter a valid e-mail address' required />
      </Cell>

      <Cell size={12}>
        <Tooltip text='Create your account'>
          <Button kind='primary' type='submit'>
            <Icon icon='plus' style={{ marginRight: '0.5rem' }} />
            Sign up
          </Button>
        </Tooltip>
      </Cell>
    </Grid>
  )
}
```

`Button` accepts `kind` (`normal` · `primary` · `danger`), `skin` (`default` · `outline` · `ghost`) and `size` (`small` · `medium` · `large`). See every prop of every component in the [Storybook](https://lemonade-ui.llypedev.com.br/storybook).

## 🎨 Theming

Lemonade exports two themes, `lightTheme` (the default) and `darkTheme`. The dark theme inverts every color scale, so components adapt without any extra code.

```jsx
import { darkTheme, ThemeProvider } from '@lemonade/ui'

const App = () => <ThemeProvider theme={darkTheme}>{/* ... */}</ThemeProvider>
```

The brand color is the **lemon** scale. `c40` (`#5E7300`) is `pallete.primary.main` and reaches 5.35:1 contrast on white:

<p align="center">
  <img alt="Lemon color scale: c10 #1C2200 to c100 #FFFFFF" src=".github/assets/palette-lemon.svg" width="100%" />
</p>

### Custom theme

Use `createTheme` to build a theme from any color scale. All scales are available under `colors` (`lemon`, `blue`, `gray`, `green`, `orange`, `pink`, `purple`, `red`, `turquoise` and `yellow`):

```jsx
import { Button, colors, createTheme, ThemeProvider } from '@lemonade/ui'

const myTheme = createTheme({
  pallete: {
    primaryScale: colors.pink,
  },
})

const App = () => (
  <ThemeProvider theme={myTheme}>
    <Button kind='primary'>My custom theme!</Button>
  </ThemeProvider>
)
```

Other scales you can override: `grayScale`, `successScale`, `dangerScale`, `alertScale`, `infoScale` and `highlightScale`.

### Styling your own components

`useStyles` gives you the current theme and returns Emotion class names, so your components follow the theme (including dark mode):

```jsx
import { useStyles } from '@lemonade/ui'

function Banner({ children }) {
  const { classes } = useStyles((theme) => ({
    banner: {
      padding: '1rem',
      background: theme.pallete.primary.c90,
      color: theme.pallete.primary.c10,
      borderRadius: theme.radius.paper,
    },
  }))

  return <div className={classes.banner}>{children}</div>
}
```

Most components also accept a `style` prop with an Emotion style object, for one-off adjustments. Use `useTheme()` when you only need to read theme values.

## 🌍 Internationalization

Component strings (pagination, calendar, form messages, etc.) come from `LocaleContext`. English (`en-US`) is the default; `pt-BR` ships with the package:

```jsx
import { LocaleContext, Paginator } from '@lemonade/ui'
import ptBR from '@lemonade/ui/lib/i18n/locales/pt-BR'

const App = () => (
  <LocaleContext.Provider value={ptBR}>
    <Paginator page={5} total={10} />
  </LocaleContext.Provider>
)
```

To support another language, create an object with the same shape as `LocaleConfiguration` and pass it to the provider. Read the current strings with the `useLocale()` hook.

## 💠 Icons

All icons are rendered through the `Icon` component. Names are the camelCase form of the SVG file names in [`icons/`](./icons) (for example `angle-down.svg` → `angleDown`):

```jsx
import { Icon } from '@lemonade/ui'

<Icon icon='lemonade' />
<Icon icon='checkCircleFilled' fill='success' size={2} />
```

| Prop    | Description                                                                                                                               |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `icon`  | Icon name, or any SVG React component.                                                                                                    |
| `fill`  | Theme color: `normal`, `primary`, `secondary`, `disabled`, `danger`, `success`, `info`, `alert` or `inherit`. Defaults to `currentColor`. |
| `size`  | Size in `rem`. Defaults to `1.5`.                                                                                                         |
| `style` | Extra Emotion styles.                                                                                                                     |

Browse the full icon set at [lemonade-ui.llypedev.com.br](https://lemonade-ui.llypedev.com.br).

## 🧩 Components

| Category          | Components                                                                                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Actions**       | `Button` · `ButtonGroup` · `Dropdown` · `Link`                                                                                                                     |
| **Forms**         | `TextField` · `TextArea` · `MaskedTextField` · `Select` · `SelectInline` · `Combobox` · `Checkbox` · `Radio` · `Switch` · `FileUploader` · `FormControl` · `Input` |
| **Date and time** | `Calendar` · `DateField` · `DateRangePicker` · `TimeField` · `MonthField` · `MonthPicker` · `MonthRangePicker` · `MonthPaginator`                                  |
| **Feedback**      | `Alert` · `ActionableToast` · `Modal` · `Tooltip` · `Spinner` · `Progress` · `Status` · `Tag` · `InfoLabel`                                                        |
| **Navigation**    | `Breadcrumb` · `Tabs` · `Paginator` · `Stepper`                                                                                                                    |
| **Data display**  | `Table` · `DataTable` · `PagedTable` · `Number` · `Currency` · `Highlight` · `Icon`                                                                                |
| **Layout**        | `Grid` · `Cell` · `Flow` · `HFlow` · `VFlow` · `Card` · `Paper` · `StickyContainer` · `Portal` · `RootRef`                                                         |
| **Typography**    | `Text` · `Heading` · `HeadingSection`                                                                                                                              |

Interactive examples and the full API of each component are in the [Storybook](https://lemonade-ui.llypedev.com.br/storybook). Usage guidelines are on [lemonade-ui.llypedev.com.br](https://lemonade-ui.llypedev.com.br).

<details>
<summary><b>🍋 Brand board</b></summary>
<br />

<p align="center">
  <img alt="Lemonade brand board: logo in light and dark themes, brand mark, components with the primary color and the lemon palette" src="brand-board.png" />
</p>

</details>

## 🛠 Development

**Requirements:** [Git](https://git-scm.com/), [Node.js 16+](https://nodejs.org/) and [Yarn](https://yarnpkg.com/).

```sh
git clone https://github.com/llypeDev/lemonade-ui.git
cd lemonade-ui
yarn install

# develop components in the Storybook (http://localhost:6006)
yarn storybook

# run the tests in watch mode
yarn test:watch
```

### Scripts

| Command                | What it does                                                                   |
| ---------------------- | ------------------------------------------------------------------------------ |
| `yarn storybook`       | Starts the Storybook dev server on port `6006`.                                |
| `yarn build`           | Compiles TypeScript and builds the UMD bundle into `lib/`.                     |
| `yarn start`           | Compiles TypeScript in watch mode.                                             |
| `yarn test`            | Runs ESLint and all Jest tests (snapshot tests included).                      |
| `yarn test:watch`      | Runs Jest in watch mode.                                                       |
| `yarn test:loki`       | Builds the Storybook and runs the Loki visual regression tests (needs Docker). |
| `yarn lint`            | Lints `src/` with ESLint.                                                      |
| `yarn icons`           | Regenerates the icon components from the SVGs in `icons/`.                     |
| `yarn build-storybook` | Builds a static Storybook into `storybook-static/`.                            |
| `yarn site:start`      | Starts the Gatsby documentation site (run `yarn build` first).                 |

### Project structure

```
lemonade-ui/
├── icons/              # Source SVGs of the icon set
├── site/               # Gatsby documentation website (lemonade-ui.llypedev.com.br)
├── src/
│   ├── components/     # One folder per component, with stories and tests
│   ├── hooks/          # Shared React hooks
│   ├── i18n/           # LocaleContext and locale strings (en-US, pt-BR)
│   ├── styles/         # Themes, color scales, global CSS, useStyles/useTheme
│   └── util/           # Helpers
├── tools/              # Icon generation scripts
└── .loki/              # Visual regression reference images
```

### Quality checks

- **Unit and snapshot tests:** [Jest](https://jestjs.io/) and [Testing Library](https://testing-library.com/), with coverage sent to [Codecov](https://codecov.io/gh/llypeDev/lemonade-ui).
- **Visual regression:** [Loki](https://loki.js.org/) takes a screenshot of every story and compares it with the references in `.loki/`. If a visual change is intentional, regenerate the references with the _Update Loki references_ workflow in GitHub Actions.
- **Accessibility:** the Storybook includes the [a11y addon](https://storybook.js.org/addons/@storybook/addon-a11y) to audit each story.
- **Formatting:** [Prettier](https://prettier.io/) runs on staged files before each commit.

More details, including how to release a new version, are in the [Contributing guide](./CONTRIBUTING.md).

## 🤝 Contributing

Contributions are welcome! Before opening an issue or pull request, please read the [Contributing guide](./CONTRIBUTING.md). Issues must be written in English, and there are templates for:

- 🐛 [Bug reports](https://github.com/llypeDev/lemonade-ui/issues/new?template=bug_report.md)
- ♿ [Accessibility issues](https://github.com/llypeDev/lemonade-ui/issues/new?template=accessibility-bug-report-.md)
- ⭐ [New components](https://github.com/llypeDev/lemonade-ui/issues/new?template=proposing-new-components.md)
- ✏️ [Changes to an existing component](https://github.com/llypeDev/lemonade-ui/issues/new?template=amend-to-an-existing-pattern.md)

## 📄 License

[MIT](./LICENSE) © Lemonade
