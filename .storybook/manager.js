import { addons } from '@storybook/addons'
import { create } from '@storybook/theming/create'

const theme = create({
  base: 'light',
  brandTitle: 'Lemonade Design System',
  brandUrl: 'https://lemonade.dev',
})

addons.setConfig({
  panelPosition: 'right',
  theme,
})
