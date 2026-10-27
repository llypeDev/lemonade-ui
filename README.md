# Lemonade

React implementation of the **Lemonade Design System**.

![Build Status](https://github.com/llypeDev/lemonade/actions/workflows/yarn.yml/badge.svg)
[![codecov](https://codecov.io/gh/llypeDev/lemonade/branch/main/graph/badge.svg)](https://codecov.io/gh/llypeDev/lemonade)

https://lemonade.dev

## Getting started

```sh
# with npm
npm install @lemonade/ui --save

# with yarn
yarn add @lemonade/ui
```

### Font family: IBM Plex Sans

```html
<link href="https://fonts.googleapis.com/css?family=IBM+Plex+Sans:400,400i,700,700i" rel="stylesheet" />
```

Visit https://lemonade.dev/getting-started for more information.

## Usage

Quick demonstration of the library usage:

```jsx
import React from 'react'
import ReactDOM from 'react-dom'
import { Button } from '@lemonade/ui'

const App = () => {
  return <Button kind='primary'>Hello World</Button>
}

ReactDOM.render(<App />, document.querySelector('#root'))
```

## Storybook

https://lemonade.dev/storybook

## Contributing

See our [Contributing guide](./CONTRIBUTING.md).
