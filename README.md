# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

# BubbleToolbar Dynamic Positioning

## Features
- Floating toolbar that dynamically positions itself above, below, left, right, or centered on the text selection.
- Prevents overflow on both left and right edges of the viewport.
- Submenus are always visible and not clipped.

## Usage

1. **Import and Use the Toolbar**
   ```tsx
   import { BubbleToolbar, BubbleToolbarButton } from './BubbleToolbar/BubbleToolbar';
   // ...
   <BubbleToolbar buttons={yourButtonsArray} />
   ```

2. **Dynamic Positioning**
   - The toolbar automatically anchors to the selection:
     - Centered if there is enough space.
     - Left-aligned if near the left edge.
     - Right-aligned if near the right edge.
   - The toolbar never overflows the viewport.

3. **Submenus**
   - Submenus are supported via the `submenu` property on a button.
   - Submenus are always visible and not clipped by the toolbar.

4. **Styling**
   - The toolbar uses CSS data attributes:
     - `data-position-mode="center" | "left" | "right"`
     - You can style these in your CSS for custom alignment effects.

## Example Button Array
```ts
const buttons: BubbleToolbarButton[] = [
  {
    label: 'B',
    command: (editor) => editor.chain().focus().toggleBold().run(),
    isActive: (editor) => editor.isActive('bold'),
    tooltip: 'Bold',
  },
  // ... more buttons ...
];
```

## Troubleshooting
- If the toolbar or submenus are clipped, ensure no parent container has `overflow: hidden` or `overflow: auto` that would cut off absolutely positioned children.
- The toolbar is measured after first render for perfect positioning.

