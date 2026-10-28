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
[![Deploy](https://github.com/llypeDev/lemonade-ui/actions/workflows/pages.yml/badge.svg)](https://github.com/llypeDev/lemonade-ui/actions/workflows/pages.yml)

![React](https://img.shields.io/badge/React-%E2%89%A516.8-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Emotion](https://img.shields.io/badge/styled%20with-Emotion-D36AC2?style=flat-square)
![Storybook](https://img.shields.io/badge/Storybook-7.6-FF4785?style=flat-square&logo=storybook&logoColor=white)
![WCAG AA](https://img.shields.io/badge/a11y-WCAG%20AA-5E7300?style=flat-square)
![Phosphor Icons](https://img.shields.io/badge/icons-Phosphor-5E7300?style=flat-square)
[![Site](https://img.shields.io/website?url=https%3A%2F%2Flemonade-ui.llypedev.com.br&style=flat-square&label=site&up_message=online&down_message=offline)](https://lemonade-ui.llypedev.com.br)

🌐 **[lemonade-ui.llypedev.com.br](https://lemonade-ui.llypedev.com.br)**

[**Documentation**](https://lemonade-ui.llypedev.com.br) ·
[**Storybook**](https://lemonade-ui.llypedev.com.br/storybook) ·
[**Getting started**](https://lemonade-ui.llypedev.com.br/getting-started) ·
[**Contributing**](./CONTRIBUTING.md)

**English** · [Português](./README.pt-BR.md)

</div>

---

## Table of contents

- [Highlights](#-highlights)
- [Live site](#-live-site)
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
      <b>🧩 60+ components</b><br />
      Buttons, forms, date pickers, tables, modals, drawers, popovers, toasts, tabs and layout primitives ready to use.
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
      <b>💠 1,982 icons</b><br />
      470 system icons plus the full Phosphor family: 1,512 icons in 6 weights, imported one by one.
    </td>
    <td width="33%" valign="top">
      <b>🟦 TypeScript</b><br />
      Written in TypeScript and published with type declarations.
    </td>
  </tr>
</table>

## 🌐 Live site

The documentation and the Storybook are published at **[lemonade-ui.llypedev.com.br](https://lemonade-ui.llypedev.com.br)**, in English and Portuguese.

<p align="center">
  <a href="https://lemonade-ui.llypedev.com.br">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset=".github/assets/site-preview-dark.png" />
      <img alt="Home page of the Lemonade documentation site" src=".github/assets/site-preview.png" width="100%" />
    </picture>
  </a>
</p>

| Page                 | Link                                                                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Documentation        | [English](https://lemonade-ui.llypedev.com.br/en/) · [Português](https://lemonade-ui.llypedev.com.br/pt/)                                        |
| Getting started      | [lemonade-ui.llypedev.com.br/getting-started](https://lemonade-ui.llypedev.com.br/getting-started)                                               |
| Storybook            | [lemonade-ui.llypedev.com.br/storybook](https://lemonade-ui.llypedev.com.br/storybook)                                                           |
| Theme                | [lemonade-ui.llypedev.com.br/usage/theme](https://lemonade-ui.llypedev.com.br/usage/theme)                                                       |
| Internationalization | [lemonade-ui.llypedev.com.br/usage/i18n](https://lemonade-ui.llypedev.com.br/usage/i18n)                                                         |
| Components overview  | [lemonade-ui.llypedev.com.br/components/overview](https://lemonade-ui.llypedev.com.br/components/overview)                                       |
| Phosphor explorer    | [lemonade-ui.llypedev.com.br/design-guidelines/iconography/phosphor](https://lemonade-ui.llypedev.com.br/design-guidelines/iconography/phosphor) |

The site is rebuilt and published to GitHub Pages on every push to `main` by the [Deploy site to GitHub Pages](https://github.com/llypeDev/lemonade-ui/actions/workflows/pages.yml) workflow.

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

Other scales you can override: `grayScale`, `successScale`, `dangerScale`, `alertScale`, `infoScale` and `highlightScale`. Live examples are in the [Theme guide](https://lemonade-ui.llypedev.com.br/usage/theme).

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

To support another language, create an object with the same shape as `LocaleConfiguration` and pass it to the provider. Read the current strings with the `useLocale()` hook. More in the [i18n guide](https://lemonade-ui.llypedev.com.br/usage/i18n).

## 💠 Icons

Lemonade ships two icon families that work together:

|                | Lemonade system icons                          | Phosphor icons                                                         |
| -------------- | ---------------------------------------------- | ---------------------------------------------------------------------- |
| **How many**   | 470                                            | 1,512, each in 6 weights                                               |
| **Import**     | `Icon` from `@lemonade/ui`                     | `Ph*` components from `@lemonade/ui/phosphor`                          |
| **Use it for** | Core interface actions (24px grid, 2px stroke) | Subjects the system set does not cover, or when you need other weights |

### Lemonade system icons

All system icons are rendered through the `Icon` component. Names are the camelCase form of the SVG file names in [`icons/`](./icons) (for example `angle-down.svg` → `angleDown`):

```jsx
import { Icon } from '@lemonade/ui'

<Icon icon='lemonade' />
<Icon icon='checkCircleFilled' fill='success' size={2} />
```

| Prop    | Description                                                                                                                               |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `icon`  | Icon name, or any SVG React component (Phosphor icons included).                                                                          |
| `fill`  | Theme color: `normal`, `primary`, `secondary`, `disabled`, `danger`, `success`, `info`, `alert` or `inherit`. Defaults to `currentColor`. |
| `size`  | Size in `rem`. Defaults to `1.5`.                                                                                                         |
| `style` | Extra Emotion styles.                                                                                                                     |

Browse the full set at [lemonade-ui.llypedev.com.br](https://lemonade-ui.llypedev.com.br).

### Phosphor icons

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/assets/phosphor-weights-dark.svg" />
    <img alt="Ten Phosphor icons (orange slice, heart, airplane, bell, gear, leaf, rocket, star, smiley and lightning) in the six weights: thin, light, regular, bold, fill and duotone" src=".github/assets/phosphor-weights.svg" width="100%" />
  </picture>
</p>

The complete [Phosphor](https://phosphoricons.com) family (v2.1.1) is vendored in this repository and published with the package, so it works offline and only changes when we update it on purpose.

Each icon is a React component named `Ph` + the icon name in PascalCase (`arrow-circle-up` → `PhArrowCircleUp`). The prefix avoids clashes with Lemonade components: `PhLink` is the icon, `Link` is the component. Use named imports, so bundlers only include the icons you use:

```jsx
import { PhAirplane, PhHeart } from '@lemonade/ui/phosphor'

<PhAirplane />
<PhHeart weight='fill' size={32} color='#5E7300' />
```

| Prop             | Type                                                              | Default        |
| ---------------- | ----------------------------------------------------------------- | -------------- |
| `weight`         | `'thin' \| 'light' \| 'regular' \| 'bold' \| 'fill' \| 'duotone'` | `'regular'`    |
| `size`           | `number \| string`                                                | `'1em'`        |
| `color`          | `string`                                                          | `currentColor` |
| `mirrored`       | `boolean` (flips the icon, useful for RTL)                        | `false`        |
| `duotoneColor`   | `string`                                                          | icon color     |
| `duotoneOpacity` | `number`                                                          | `0.2`          |
| `title`          | `string` (accessible name)                                        | —              |

Any other SVG attribute (`className`, `style`, `onClick`, `aria-*`…) is forwarded to the `<svg>`, and refs point to it as well. By default icons follow the surrounding font size and text color, so they adapt to the light and dark themes.

**Defaults for a whole section.** Wrap part of the interface with `PhosphorIconProvider`. Providers can be nested, and props on a single icon always win:

```jsx
import { PhBell, PhGear, PhHouse, PhosphorIconProvider } from '@lemonade/ui/phosphor'

const Toolbar = () => (
  <PhosphorIconProvider weight='duotone' size={24}>
    <PhHouse />
    <PhBell />
    <PhGear weight='bold' />
  </PhosphorIconProvider>
)
```

**With the `Icon` component.** Pass a Phosphor icon to `Icon` to get the same `rem` sizing and theme colors as the system icons:

```jsx
import { Icon } from '@lemonade/ui'
import { PhRocketLaunch } from '@lemonade/ui/phosphor'

const Example = () => <Icon icon={PhRocketLaunch} size={2} fill='primary' />
```

**Accessibility.** Icons are decorative by default (`aria-hidden`). When an icon carries meaning on its own, for example in an icon-only button, give it a name with `title` or `aria-label`, or label the button instead:

```jsx
<PhTrash title='Delete file' />
```

**Mixing families.** Avoid placing both families side by side in the same group of controls. If you have to, use the `regular` weight, which is the closest to the system icons.

Search, preview, copy and download every icon in the [Phosphor explorer](https://lemonade-ui.llypedev.com.br/design-guidelines/iconography/phosphor). Phosphor Icons are MIT licensed; see [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).

## 🧩 Components

| Category          | Components                                                                                                                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Actions**       | `Button` · `ButtonGroup` · `Dropdown` · `Link`                                                                                                                                                         |
| **Forms**         | `TextField` · `TextArea` · `MaskedTextField` · `Select` (deprecated) · `SelectInline` · `Combobox` · `Checkbox` · `Radio` · `Switch` · `FileUploader` · `FormControl` · `Input`                        |
| **Date and time** | `Calendar` · `DateField` · `DateRangePicker` · `TimeField` · `MonthField` · `MonthPicker` · `MonthRangePicker` · `MonthPaginator`                                                                      |
| **Feedback**      | `Alert` · `Toast` · `ActionableToast` (deprecated) · `Modal` · `Drawer` · `Popover` · `Tooltip` · `Spinner` · `Skeleton` · `Progress` · `Status` · `Tag` · `Badge` · `InfoLabel`                       |
| **Navigation**    | `Breadcrumb` · `Tabs` · `Paginator` · `Stepper`                                                                                                                                                        |
| **Data display**  | `Table` · `DataTable` · `PagedTable` · `Avatar` · `Number` · `Currency` · `Highlight`                                                                                                                  |
| **Icons**         | `Icon` · `PhosphorIconProvider` · 1,512 `Ph*` icons from `@lemonade/ui/phosphor`                                                                                                                       |
| **Layout**        | `Grid` · `Cell` · `Flow` · `HFlow` (deprecated) · `VFlow` (deprecated) · `Accordion` · `Card` · `ClickableCard` · `ToggleCard` · `ExpandableCard` · `Paper` · `StickyContainer` · `Portal` · `RootRef` |
| **Typography**    | `Text` · `Heading` · `HeadingSection`                                                                                                                                                                  |

Charts (`Chart`, `BarChart`, `PieChart` and their parts) come from a separate entry point, `@lemonade/ui/lib/components/Chart`, so apps that don't draw charts don't load their dependencies. Components marked as deprecated still work; their documentation points to the replacement.

Interactive examples and the full API of each component are in the [Storybook](https://lemonade-ui.llypedev.com.br/storybook). Usage guidelines for each one are in the [components overview](https://lemonade-ui.llypedev.com.br/components/overview).

### ✨ Recently added

Components added since version 1.4.0, each with live demos and accessibility notes on the site:

| Component                              | What it is for                                                                           | Docs                                                             |
| -------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `Popover`                              | Floating panel attached to a button, for filters, short forms or details                 | [Docs](https://lemonade-ui.llypedev.com.br/components/popover)   |
| `Drawer`                               | Panel that slides in from an edge of the screen, for filters, details or navigation      | [Docs](https://lemonade-ui.llypedev.com.br/components/drawer)    |
| `Avatar`                               | A person as a picture, initials or a generic icon                                        | [Docs](https://lemonade-ui.llypedev.com.br/components/avatar)    |
| `Badge`                                | Count or dot on the corner of an element, such as unread notifications                   | [Docs](https://lemonade-ui.llypedev.com.br/components/badge)     |
| `Skeleton`                             | Placeholder with the shape of content that is still loading                              | [Docs](https://lemonade-ui.llypedev.com.br/components/skeleton)  |
| `Toast` · `ToastProvider` · `useToast` | Messages at the bottom left that close by themselves and are announced by screen readers | [Docs](https://lemonade-ui.llypedev.com.br/components/toast)     |
| `Accordion`                            | Sections that expand and collapse, with keyboard navigation                              | [Docs](https://lemonade-ui.llypedev.com.br/components/accordion) |
| `ToggleCard` · `ExpandableCard`        | Cards that work as a checkbox or expand to show more                                     | [Docs](https://lemonade-ui.llypedev.com.br/components/cards)     |

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

| Command                   | What it does                                                                   |
| ------------------------- | ------------------------------------------------------------------------------ |
| `yarn storybook`          | Starts the Storybook dev server on port `6006`.                                |
| `yarn build`              | Compiles TypeScript and builds the UMD bundle into `lib/`.                     |
| `yarn start`              | Compiles TypeScript in watch mode.                                             |
| `yarn test`               | Runs ESLint and all Jest tests (snapshot tests included).                      |
| `yarn test:watch`         | Runs Jest in watch mode.                                                       |
| `yarn test:loki`          | Builds the Storybook and runs the Loki visual regression tests (needs Docker). |
| `yarn lint`               | Lints `src/` with ESLint.                                                      |
| `yarn icons`              | Regenerates the icon components from the SVGs in `icons/`.                     |
| `yarn phosphor:sync`      | Downloads and verifies a Phosphor release into `vendor/phosphor/`.             |
| `yarn phosphor:generate`  | Regenerates the Phosphor components in `src/phosphor/generated/`.              |
| `yarn phosphor:check`     | Fails if the generated Phosphor components are out of date (runs in CI).       |
| `yarn phosphor:site-data` | Builds the Phosphor explorer data (runs before `site:start` and `site:build`). |
| `yarn build-storybook`    | Builds a static Storybook into `storybook-static/`.                            |
| `yarn site:start`         | Starts the Gatsby documentation site (run `yarn build` first).                 |

### Project structure

```
lemonade-ui/
├── icons/              # Source SVGs of the icon set
├── site/               # Gatsby documentation website (lemonade-ui.llypedev.com.br)
├── src/
│   ├── components/     # One folder per component, with stories and tests
│   ├── hooks/          # Shared React hooks
│   ├── i18n/           # LocaleContext and locale strings (en-US, pt-BR)
│   ├── phosphor/       # Phosphor icon components (@lemonade/ui/phosphor)
│   ├── styles/         # Themes, color scales, global CSS, useStyles/useTheme
│   └── util/           # Helpers
├── tools/              # Icon generation scripts (incl. tools/phosphor)
├── vendor/phosphor/    # Vendored Phosphor SVGs, catalog and MIT license
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
